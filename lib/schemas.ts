import * as z from "zod/mini";

/**
 * Schema form yang dipakai bersama di client (validasi langsung) dan server (API).
 * Memakai `zod/mini` (API Zod yang sama, bundle jauh lebih kecil) karena file ini ikut terkirim ke browser.
 */

export const ATTENDANCE = ["hadir", "tidak", "ragu"] as const;
export type Attendance = (typeof ATTENDANCE)[number];

export const ATTENDANCE_LABEL: Record<Attendance, string> = {
  hadir: "Hadir",
  tidak: "Tidak Hadir",
  ragu: "Masih Ragu",
};

const slug = z.string().check(z.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Undangan tidak valid."));

const guestName = z
  .string({ error: "Nama wajib diisi." })
  .check(z.trim(), z.minLength(1, "Nama wajib diisi."), z.maxLength(50, "Nama maksimal 50 karakter."));

const rsvpObject = z
  .object({
    slug,
    name: guestName,
    attendance: z.enum(ATTENDANCE, { error: "Pilih status kehadiran." }),
    guestCount: z.optional(
      z.int({ error: "Pilih jumlah tamu." }).check(z.minimum(0), z.maximum(5, "Maksimal 5 orang.")),
    ),
  })
  .check(
    z.superRefine((data, ctx) => {
      if (data.attendance !== "tidak" && !(data.guestCount && data.guestCount >= 1)) {
        ctx.addIssue({ code: "custom", path: ["guestCount"], message: "Pilih jumlah tamu (1–5 orang).", input: data });
      }
    }),
  );

// Jika tidak hadir, jumlah tamu disimpan 0.
export const rsvpSchema = z.pipe(
  rsvpObject,
  z.transform((data) => ({ ...data, guestCount: data.attendance === "tidak" ? 0 : (data.guestCount ?? 1) })),
);

export type RsvpInput = z.input<typeof rsvpSchema>;

export const WISH_MAX = 500;
export const WISHES_PAGE_SIZE = 10;

export const wishSchema = z.object({
  slug,
  name: guestName,
  message: z
    .string({ error: "Ucapan wajib diisi." })
    .check(z.trim(), z.minLength(1, "Ucapan wajib diisi."), z.maxLength(WISH_MAX, `Ucapan maksimal ${WISH_MAX} karakter.`)),
});

export type WishInput = z.input<typeof wishSchema>;

export type Wish = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

export type AdminRsvp = {
  id: string;
  name: string;
  attendance: Attendance;
  guestCount: number;
  createdAt: string;
};

export type AdminWish = Wish & { hidden: boolean };

/** Ubah error Zod menjadi { field: pesan pertama }. */
export function fieldErrors(error: { issues: ReadonlyArray<{ path: PropertyKey[]; message: string }> }): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
