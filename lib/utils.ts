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

/* ------------------------------------------------------------------ */
/* Filter kata kasar (sederhana)                                       */
/* ------------------------------------------------------------------ */

/** Daftar kata kasar. Tambahkan sesuai kebutuhan (huruf kecil). */
export const BAD_WORDS = [
  "anjing",
  "anjir",
  "asu",
  "babi",
  "bajingan",
  "bangsat",
  "bego",
  "brengsek",
  "goblok",
  "jancok",
  "jancuk",
  "kampret",
  "keparat",
  "kontol",
  "memek",
  "ngentot",
  "tolol",
  "bitch",
  "fuck",
  "shit",
];

const BAD_WORD_PATTERN = new RegExp(`(?<![\\p{L}\\p{N}])(${BAD_WORDS.join("|")})(?![\\p{L}\\p{N}])`, "giu");

/** Ganti kata kasar (utuh, bukan potongan kata) dengan bintang: "anjing" → "a*****". */
export function filterProfanity(text: string) {
  return text.replace(BAD_WORD_PATTERN, (word) => word[0] + "*".repeat(word.length - 1));
}

/* ------------------------------------------------------------------ */
/* Teks & waktu                                                        */
/* ------------------------------------------------------------------ */

/** "Rina Amelia" → "RA" */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

/** Waktu relatif singkat: "baru saja", "5 menit lalu", "2 jam lalu", "3 hari lalu", lalu tanggal. */
export function timeAgo(iso: string, now = Date.now()) {
  const sec = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  if (sec < 60) return "baru saja";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} menit lalu`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} jam lalu`;
  const day = Math.floor(hour / 24);
  if (day < 7) return `${day} hari lalu`;
  if (day < 30) return `${Math.floor(day / 7)} minggu lalu`;
  return new Intl.DateTimeFormat("id-ID", { timeZone: WEDDING_TIME_ZONE, day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso),
  );
}

/** "1234567890" → "1234 5678 90" */
export function groupDigits(value: string) {
  return value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");
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

/** "14 Feb 2027, 08.00" */
export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: WEDDING_TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
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
