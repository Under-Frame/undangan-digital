import "server-only";

import { NextResponse } from "next/server";

import { getWeddingConfig } from "@/lib/config";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/** Baca body JSON dengan aman (maks ~8 KB). */
export async function readJson(request: Request): Promise<unknown> {
  const text = await request.text();
  if (text.length > 8_000) throw new Error("too-large");
  return JSON.parse(text);
}

/** Cek rate limit per IP + nama route. Mengembalikan response 429 jika terlampaui. */
export function checkRateLimit(request: Request, route: string) {
  const result = rateLimit(`${route}:${clientIp(request.headers)}`);
  if (result.ok) return null;
  return NextResponse.json(
    { error: "Terlalu banyak percobaan. Silakan coba lagi sebentar lagi." },
    { status: 429, headers: { "Retry-After": String(result.retryAfter) } },
  );
}

export async function weddingExists(slug: string) {
  return (await getWeddingConfig(slug)) !== null;
}
