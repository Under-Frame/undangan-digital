// Membuat foto placeholder WebP (gradien warna palet, tanpa foto orang).
// Jalankan: npm run placeholders [slug]
// Ganti file hasil script ini dengan foto asli pasangan saat membuat undangan baru.
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const slug = process.argv[2] ?? "rina-dimas";
const outDir = path.join(process.cwd(), "public", "img", slug);

// Nada warna diambil dari palet sage & netral agar cocok dengan konsep editorial.
const tones = [
  ["#8A9A82", "#2F3A2C"],
  ["#D9D3C7", "#6B6B6B"],
  ["#B7C2AF", "#4E5B49"],
  ["#E2DED6", "#8A9A82"],
  ["#6B6B6B", "#111111"],
  ["#C9C2B4", "#5E6A57"],
];

const files = [
  { name: "cover", w: 1440, h: 1800 },
  { name: "bride", w: 900, h: 1200 },
  { name: "groom", w: 900, h: 1200 },
  { name: "1", w: 1200, h: 1600 },
  { name: "2", w: 1600, h: 1200 },
  { name: "3", w: 1200, h: 1200 },
  { name: "4", w: 1200, h: 1600 },
  { name: "5", w: 1600, h: 1200 },
  { name: "6", w: 1200, h: 1200 },
];

function svg({ w, h }, [from, to], angle) {
  const rad = (angle * Math.PI) / 180;
  const x2 = 50 + Math.cos(rad) * 50;
  const y2 = 50 + Math.sin(rad) * 50;
  const inset = Math.round(Math.min(w, h) * 0.06);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <linearGradient id="g" x1="${100 - x2}%" y1="${100 - y2}%" x2="${x2}%" y2="${y2}%">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
    <radialGradient id="r" cx="30%" cy="25%" r="70%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect width="100%" height="100%" fill="url(#r)"/>
  <rect x="${inset}" y="${inset}" width="${w - inset * 2}" height="${h - inset * 2}"
    fill="none" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="1"/>
</svg>`;
}

await mkdir(outDir, { recursive: true });
await Promise.all(
  files.map((file, i) =>
    sharp(Buffer.from(svg(file, tones[i % tones.length], 35 + i * 40)))
      .webp({ quality: 70 })
      .toFile(path.join(outDir, `${file.name}.webp`)),
  ),
);
console.log(`Placeholder dibuat di ${path.relative(process.cwd(), outDir)}/`);
