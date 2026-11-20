import { NextResponse } from "next/server";

import { checkRateLimit, jsonError, readJson, weddingExists } from "@/lib/api";
import { fieldErrors, rsvpSchema } from "@/lib/schemas";
import { addRsvp } from "@/lib/store";
import { isDemoMode } from "@/lib/supabase";
import { filterProfanity } from "@/lib/utils";

/** POST /api/rsvp — simpan konfirmasi kehadiran. Data RSVP tidak bisa dibaca publik. */
export async function POST(request: Request) {
  const limited = checkRateLimit(request, "rsvp");
  if (limited) return limited;

  let body: unknown;
  try {
    body = await readJson(request);
  } catch {
    return jsonError("Data tidak valid.", 400);
  }

  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Periksa kembali isian Anda.", 422, { fields: fieldErrors(parsed.error) });
  }
  const { slug, name, attendance, guestCount } = parsed.data;
  if (!(await weddingExists(slug))) return jsonError("Undangan tidak ditemukan.", 404);

  try {
    await addRsvp({ slug, name: filterProfanity(name), attendance, guestCount });
  } catch (err) {
    console.error(err);
    return jsonError("Maaf, konfirmasi gagal disimpan. Silakan coba lagi.", 500);
  }

  return NextResponse.json({ ok: true, demo: isDemoMode() }, { status: 201 });
}
