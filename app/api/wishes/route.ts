import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { checkRateLimit, jsonError, readJson, weddingExists } from "@/lib/api";
import { fieldErrors, WISHES_PAGE_SIZE, wishSchema } from "@/lib/schemas";
import { addWish, listWishes } from "@/lib/store";
import { isDemoMode } from "@/lib/supabase";
import { filterProfanity } from "@/lib/utils";

const listQuery = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  offset: z.coerce.number().int().min(0).max(10_000).default(0),
});

/** GET /api/wishes?slug=rina-dimas&offset=0 — 10 ucapan terbaru yang tidak disembunyikan. */
export async function GET(request: NextRequest) {
  const parsed = listQuery.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return jsonError("Parameter tidak valid.", 400);
  const { slug, offset } = parsed.data;
  if (!(await weddingExists(slug))) return jsonError("Undangan tidak ditemukan.", 404);

  try {
    const page = await listWishes(slug, offset, WISHES_PAGE_SIZE);
    return NextResponse.json({ ...page, demo: isDemoMode() }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error(err);
    return jsonError("Ucapan gagal dimuat.", 500);
  }
}

/** POST /api/wishes — kirim ucapan (kata kasar disensor). */
export async function POST(request: Request) {
  const limited = checkRateLimit(request, "wishes");
  if (limited) return limited;

  let body: unknown;
  try {
    body = await readJson(request);
  } catch {
    return jsonError("Data tidak valid.", 400);
  }

  const parsed = wishSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Periksa kembali isian Anda.", 422, { fields: fieldErrors(parsed.error) });
  }
  const { slug, name, message } = parsed.data;
  if (!(await weddingExists(slug))) return jsonError("Undangan tidak ditemukan.", 404);

  try {
    const wish = await addWish({ slug, name: filterProfanity(name), message: filterProfanity(message) });
    return NextResponse.json({ wish, demo: isDemoMode() }, { status: 201 });
  } catch (err) {
    console.error(err);
    return jsonError("Maaf, ucapan gagal dikirim. Silakan coba lagi.", 500);
  }
}
