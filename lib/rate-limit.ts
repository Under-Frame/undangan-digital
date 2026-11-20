import "server-only";

/**
 * Rate limit sederhana in-memory (cukup untuk MVP): maks `limit` request per `windowMs` per kunci.
 * Catatan: di serverless, tiap instance punya hitungan sendiri.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    const retryAfter = Math.ceil((windowMs - (now - hits[0])) / 1000);
    return { ok: false as const, retryAfter };
  }
  hits.push(now);
  buckets.set(key, hits);

  // Bersihkan kunci lama sesekali agar Map tidak membengkak.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
  }
  return { ok: true as const };
}

export function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}
