import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";
import sharp from "sharp";

import { getWeddingConfig } from "@/lib/config";
import { formatDateDots } from "@/lib/utils";

export const alt = "Undangan pernikahan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

/** Ambil font TTF dari Google Fonts untuk Satori. Gagal → pakai font bawaan. */
async function loadFont(family: string, weight: number, text: string) {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`)
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

/** Satori tidak bisa membaca WebP → ubah cover ke JPEG 1200×630 dengan sharp. */
async function loadCover(src: string) {
  try {
    const file = await readFile(path.join(process.cwd(), "public", src));
    const jpeg = await sharp(file).resize(size.width, size.height, { fit: "cover" }).jpeg({ quality: 80 }).toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Gambar preview link (WhatsApp, Instagram, dll.) 1200×630. */
export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = await getWeddingConfig(slug);
  const couple = config ? `${config.bride.nickname} & ${config.groom.nickname}` : "Undangan Pernikahan";
  const date = config ? formatDateDots(config.events[0].start) : "";
  const label = "THE WEDDING OF";

  const [serif, sans, cover] = await Promise.all([
    loadFont("Fraunces", 400, couple),
    loadFont("Plus+Jakarta+Sans", 500, `${label}${date}`),
    config ? loadCover(config.coverImage) : null,
  ]);

  const fonts = [
    ...(serif ? [{ name: "Fraunces", data: serif, weight: 400 as const, style: "normal" as const }] : []),
    ...(sans ? [{ name: "Jakarta", data: sans, weight: 500 as const, style: "normal" as const }] : []),
  ];

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#2f3a2c",
          color: "#ffffff",
        }}
      >
        {cover ? (
          <img
            src={cover}
            alt=""
            width={1200}
            height={630}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : null}
        {/* Overlay 40% + gradasi gelap di kiri-bawah agar teks tetap terbaca di foto yang terang. */}
        <div
          style={{
            // Satori (generator gambar OG) tidak mendukung `inset`, jadi posisi ditulis eksplisit.
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            backgroundImage:
              "linear-gradient(to top right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.3) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "64px 80px",
          }}
        >
          <div style={{ display: "flex", fontFamily: "Jakarta", fontSize: 22, letterSpacing: "0.2em" }}>{label}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 132, lineHeight: 1, letterSpacing: "-0.02em" }}>
              {couple}
            </div>
            <div style={{ display: "flex", alignItems: "center", marginTop: 36, gap: 24 }}>
              <div style={{ display: "flex", width: 72, height: 1, backgroundColor: "rgba(255,255,255,0.7)" }} />
              <div style={{ display: "flex", fontFamily: "Jakarta", fontSize: 26, letterSpacing: "0.2em" }}>{date}</div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );

  // PNG foto ±900 KB terlalu besar untuk preview WhatsApp (batas aman ±300 KB) → kirim sebagai JPEG.
  const png = Buffer.from(await image.arrayBuffer());
  const jpeg = await sharp(png).jpeg({ quality: 78, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
