import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  createSessionValue,
  getAdminPassword,
  isAdmin,
  passwordMatches,
  SESSION_MAX_AGE,
  sessionCookieName,
  sessionCookieOptions,
} from "@/lib/admin-auth";
import { checkRateLimit, jsonError, readJson } from "@/lib/api";
import { getWeddingConfig } from "@/lib/config";
import { listAllWishes, listRsvp, setWishHidden } from "@/lib/store";
import { isDemoMode } from "@/lib/supabase";

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const postSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("login"), slug: slugSchema, password: z.string().min(1).max(200) }),
  z.object({ action: z.literal("logout"), slug: slugSchema }),
]);

const patchSchema = z.object({ slug: slugSchema, wishId: z.string().min(1).max(64), hidden: z.boolean() });

/** POST /api/admin — login / logout. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await readJson(request);
  } catch {
    return jsonError("Data tidak valid.", 400);
  }
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return jsonError("Data tidak valid.", 400);

  const { slug } = parsed.data;
  const config = await getWeddingConfig(slug);
  if (!config) return jsonError("Undangan tidak ditemukan.", 404);

  if (parsed.data.action === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.set({ name: sessionCookieName(slug), value: "", ...sessionCookieOptions, maxAge: 0 });
    return res;
  }

  const limited = checkRateLimit(request, `admin-login:${slug}`);
  if (limited) return limited;

  const password = getAdminPassword(config);
  if (!password) return jsonError("Password admin belum diatur di server.", 503);
  if (!passwordMatches(parsed.data.password, password)) return jsonError("Password salah.", 401);

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: sessionCookieName(slug),
    value: createSessionValue(slug, password),
    ...sessionCookieOptions,
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}

/** GET /api/admin?slug=… — data dashboard (RSVP + semua ucapan). Wajib login. */
export async function GET(request: NextRequest) {
  const slug = slugSchema.safeParse(request.nextUrl.searchParams.get("slug"));
  if (!slug.success) return jsonError("Parameter tidak valid.", 400);
  const config = await getWeddingConfig(slug.data);
  if (!config) return jsonError("Undangan tidak ditemukan.", 404);
  if (!(await isAdmin(config))) return jsonError("Silakan login terlebih dahulu.", 401);

  try {
    const [rsvp, wishes] = await Promise.all([listRsvp(slug.data), listAllWishes(slug.data)]);
    return NextResponse.json({ rsvp, wishes, demo: isDemoMode() }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error(err);
    return jsonError("Data gagal dimuat.", 500);
  }
}

/** PATCH /api/admin — sembunyikan/tampilkan ucapan. Wajib login. */
export async function PATCH(request: Request) {
  let body: unknown;
  try {
    body = await readJson(request);
  } catch {
    return jsonError("Data tidak valid.", 400);
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError("Data tidak valid.", 400);

  const { slug, wishId, hidden } = parsed.data;
  const config = await getWeddingConfig(slug);
  if (!config) return jsonError("Undangan tidak ditemukan.", 404);
  if (!(await isAdmin(config))) return jsonError("Silakan login terlebih dahulu.", 401);

  try {
    const ok = await setWishHidden(slug, wishId, hidden);
    return ok ? NextResponse.json({ ok: true }) : jsonError("Ucapan tidak ditemukan.", 404);
  } catch (err) {
    console.error(err);
    return jsonError("Gagal mengubah ucapan.", 500);
  }
}
