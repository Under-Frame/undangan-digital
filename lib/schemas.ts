import { z } from "zod";

/** Schema form yang dipakai bersama di client (validasi langsung) dan server (API). */

export const ATTENDANCE = ["hadir", "tidak", "ragu"] as const;
export type Attendance = (typeof ATTENDANCE)[number];

export const ATTENDANCE_LABEL: Record<Attendance, string> = {
  hadir: "Hadir",
  tidak: "Tidak Hadir",
  ragu: "Masih Ragu",
};

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Undangan tidak valid.");

const guestName = z
  .string({ error: "Nama wajib diisi." })
  .trim()
  .min(1, "Nama wajib diisi.")
  .max(50, "Nama maksimal 50 karakter.");

export const rsvpSchema = z
  .object({
    slug,
    name: guestName,
    attendance: z.enum(ATTENDANCE, { error: "Pilih status kehadiran." }),
    guestCount: z
      .number({ error: "Pilih jumlah tamu." })
      .int()
      .min(0)
      .max(5, "Maksimal 5 orang.")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.attendance !== "tidak" && !(data.guestCount && data.guestCount >= 1)) {
      ctx.addIssue({ code: "custom", path: ["guestCount"], message: "Pilih jumlah tamu (1–5 orang)." });
    }
  })
  // Jika tidak hadir, jumlah tamu disimpan 0.
  .transform((data) => ({ ...data, guestCount: data.attendance === "tidak" ? 0 : (data.guestCount ?? 1) }));

export type RsvpInput = z.input<typeof rsvpSchema>;

export const WISH_MAX = 500;
export const WISHES_PAGE_SIZE = 10;

export const wishSchema = z.object({
  slug,
  name: guestName,
  message: z
    .string({ error: "Ucapan wajib diisi." })
    .trim()
    .min(1, "Ucapan wajib diisi.")
    .max(WISH_MAX, `Ucapan maksimal ${WISH_MAX} karakter.`),
});

export type WishInput = z.input<typeof wishSchema>;

export type Wish = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

/** Ubah error Zod menjadi { field: pesan pertama }. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
