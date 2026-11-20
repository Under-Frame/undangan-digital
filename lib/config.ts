import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Schema                                                              */
/* ------------------------------------------------------------------ */

export const PALETTES = ["sage", "monokrom", "terracotta", "navy-gold"] as const;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const text = (max = 200) => z.string().trim().min(1, "tidak boleh kosong").max(max);

/** Path file di folder `public`, harus diawali "/" (mis. "/img/rina-dimas/cover.webp"). */
const publicPath = z
  .string()
  .regex(/^\/[^\s]+$/, 'harus path dari folder public, diawali "/" (mis. "/img/slug/foto.webp")');

const isoDateTime = z.iso.datetime({
  offset: true,
  error: 'harus tanggal ISO dengan zona waktu, mis. "2027-02-14T08:00:00+07:00"',
});

const personSchema = z.object({
  name: text(80),
  nickname: text(30),
  parents: text(200),
  instagram: z
    .string()
    .regex(/^[A-Za-z0-9._]{1,30}$/, "username Instagram tanpa @ dan tanpa link")
    .nullish(),
  photo: publicPath,
});

const eventSchema = z
  .object({
    type: text(50),
    start: isoDateTime,
    end: isoDateTime,
    venue: text(120),
    address: text(250),
    mapsUrl: z.url(),
    mapsEmbed: z.url().nullish(),
  })
  .refine((e) => new Date(e.end) > new Date(e.start), {
    message: "waktu selesai harus setelah waktu mulai",
    path: ["end"],
  });

const giftSchema = z.object({
  type: z.enum(["bank", "ewallet"]),
  provider: text(40),
  number: z.string().regex(/^[0-9 -]{4,30}$/, "hanya angka, spasi, atau tanda -"),
  holder: text(80),
});

export const weddingConfigSchema = z.object({
  slug: z.string().regex(SLUG_PATTERN, "huruf kecil, angka, dan tanda - saja"),
  palette: z.enum(PALETTES).default("sage"),
  coverImage: publicPath,
  bride: personSchema,
  groom: personSchema,
  events: z.array(eventSchema).min(1, "minimal satu acara"),
  loveStory: z
    .array(z.object({ year: text(10), title: text(60), text: text(400) }))
    .nullish(),
  gallery: z.array(publicPath).default([]),
  music: publicPath.nullish(),
  gifts: z.array(giftSchema).default([]),
  qrisImage: publicPath.nullish(),
  giftAddress: text(250).nullish(),
  liveStreamUrl: z.url().nullish(),
  quote: z.object({ text: text(600), source: text(80) }).nullish(),
  closing: text(400),
  /** Password tidak boleh ditulis langsung di config; tulis nama env var-nya. */
  adminPassword: z
    .string()
    .regex(/^ENV:[A-Z][A-Z0-9_]*$/, 'harus berformat "ENV:NAMA_ENV_VAR", jangan tulis password asli'),
});

export type WeddingConfig = z.infer<typeof weddingConfigSchema>;
export type WeddingEvent = WeddingConfig["events"][number];
export type Palette = (typeof PALETTES)[number];

/* ------------------------------------------------------------------ */
/* Loader                                                              */
/* ------------------------------------------------------------------ */

export class WeddingConfigError extends Error {
  constructor(slug: string, detail: string) {
    super(`Config undangan "${slug}" tidak valid (data/${slug}.config.json):\n${detail}`);
    this.name = "WeddingConfigError";
  }
}

const DATA_DIR = path.join(process.cwd(), "data");

/**
 * Membaca & memvalidasi `data/<slug>.config.json`.
 * - Slug tidak ada / formatnya aneh → `null` (tampilkan 404).
 * - File ada tapi isinya salah → lempar `WeddingConfigError` dengan detail field yang salah.
 */
export const getWeddingConfig = cache(async (slug: string): Promise<WeddingConfig | null> => {
  if (!SLUG_PATTERN.test(slug)) return null;

  let raw: string;
  try {
    raw = await readFile(path.join(DATA_DIR, `${slug}.config.json`), "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    throw new WeddingConfigError(slug, `✖ JSON tidak valid: ${(err as Error).message}`);
  }

  const result = weddingConfigSchema.safeParse(json);
  if (!result.success) {
    throw new WeddingConfigError(slug, z.prettifyError(result.error));
  }
  if (result.data.slug !== slug) {
    throw new WeddingConfigError(
      slug,
      `✖ field "slug" bernilai "${result.data.slug}", harus sama dengan nama file ("${slug}")`,
    );
  }
  return result.data;
});
