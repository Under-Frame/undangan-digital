/**
 * Info developer untuk kredit kecil di bagian Penutup.
 * Ini milik pembuat template, bukan data pasangan, jadi tidak ada di config undangan.
 */
export const DEVELOPER = {
  name: "Under-Frame",
  url: "https://github.com/Under-Frame",
} as const;

/** URL publik situs: NEXT_PUBLIC_SITE_URL → domain produksi Vercel → localhost. */
export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
