/** Gabungkan className, abaikan nilai falsy. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const DEFAULT_GUEST_NAME = "Tamu Undangan";

/**
 * Nama tamu dari query `?to=`: buang karakter kontrol & tanda kurung sudut,
 * rapikan spasi, maks 50 karakter. Kosong → "Tamu Undangan".
 */
export function sanitizeGuestName(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return DEFAULT_GUEST_NAME;

  let decoded = value;
  try {
    // Jaga-jaga jika nama ter-encode dua kali (mis. "Pak%2520Hadi").
    if (/%[0-9A-Fa-f]{2}/.test(decoded)) decoded = decodeURIComponent(decoded);
  } catch {
    // biarkan apa adanya jika bukan encoding valid
  }

  const clean = decoded
    .replace(/[\u0000-\u001F\u007F<>{}`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 50)
    .trim();

  return clean || DEFAULT_GUEST_NAME;
}

/** Semua tanggal acara ditampilkan dalam zona waktu WIB. */
export const WEDDING_TIME_ZONE = "Asia/Jakarta";

function dateParts(iso: string) {
  const parts = new Intl.DateTimeFormat("id-ID", {
    timeZone: WEDDING_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { day: get("day"), month: get("month"), year: get("year") };
}

/** "14 · 02 · 2027" */
export function formatDateDots(iso: string) {
  const { day, month, year } = dateParts(iso);
  return `${day} · ${month} · ${year}`;
}

/** "Minggu, 14 Februari 2027" */
export function formatDateLong(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: WEDDING_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/** "08.00" */
export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: WEDDING_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}
