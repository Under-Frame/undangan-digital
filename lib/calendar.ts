/** Generate link Google Calendar & isi file .ics untuk satu acara. */

export type CalendarEvent = {
  uid: string;
  title: string;
  start: string; // ISO
  end: string; // ISO
  location: string;
  description?: string;
  url?: string;
};

/** "2027-02-14T08:00:00+07:00" → "20270214T010000Z" */
function toUtcStamp(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function googleCalendarUrl(event: CalendarEvent) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toUtcStamp(event.start)}/${toUtcStamp(event.end)}`,
    location: event.location,
    details: [event.description, event.url].filter(Boolean).join("\n\n"),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeIcs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Baris .ics maksimal 75 oktet; lanjutan diawali spasi (RFC 5545). */
function foldLine(line: string) {
  const encoder = new TextEncoder();
  const out: string[] = [];
  let current = "";
  for (const char of line) {
    const limit = out.length === 0 ? 75 : 74;
    if (encoder.encode(current + char).length > limit) {
      out.push(current);
      current = char;
    } else {
      current += char;
    }
  }
  out.push(current);
  return out.join("\r\n ");
}

export function buildIcs(event: CalendarEvent) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Undangan Digital//ID",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${toUtcStamp(new Date().toISOString())}`,
    `DTSTART:${toUtcStamp(event.start)}`,
    `DTEND:${toUtcStamp(event.end)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `LOCATION:${escapeIcs(event.location)}`,
    event.description ? `DESCRIPTION:${escapeIcs(event.description)}` : null,
    event.url ? `URL:${event.url}` : null,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcs(event.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter((l): l is string => l !== null);

  return lines.map(foldLine).join("\r\n") + "\r\n";
}
