/** Gabungkan className, abaikan nilai falsy. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
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
