# Undangan Pernikahan Digital — Modern Editorial

Website undangan pernikahan satu halaman bergaya majalah editorial: foto full-screen, tipografi besar, animasi halus, tanpa ornamen bunga. Semua konten undangan diambil dari satu file config, jadi undangan pasangan baru bisa dibuat tanpa mengedit kode.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Zod · Supabase · lucide-react

## Status

| Fase | Isi | Status |
| --- | --- | --- |
| 1 | Setup, palet & font, config + validasi Zod, route `/[slug]`, komponen motion | ✅ Selesai |
| 2 | Section statis (Cover, Musik, Mempelai, Countdown, Acara + kalender, Lokasi, Love Story, Galeri + lightbox, Penutup, Bottom Nav) | ✅ Selesai |
| 3 | RSVP, Ucapan, Amplop Digital (Supabase) | ⏳ |
| 4 | Dashboard admin, Open Graph, Lighthouse, dokumentasi lengkap | ⏳ |

Spesifikasi lengkap ada di [`PRD.md`](PRD.md).

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka <http://localhost:3000/rina-dimas?to=Pak%20Hadi>.

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan |
| `npm run lint` | ESLint |
| `npm run build` | Build produksi |
| `npm run placeholders [slug]` | Membuat foto placeholder (gradien WebP) di `public/img/<slug>/` |

## Struktur singkat

```
app/[slug]/page.tsx        halaman undangan (membaca data/<slug>.config.json)
lib/config.ts              Zod schema + loader config (error jelas jika config salah)
data/rina-dimas.config.json  data contoh (dummy)
components/motion/         Reveal, SplitText, Parallax (menghormati prefers-reduced-motion)
app/globals.css            token palet: sage, monokrom, terracotta, navy-gold + mode gelap
```

Foto di `public/img/rina-dimas/` hanya placeholder gradien, bukan foto orang asli.

**Musik:** file lagu tidak disertakan di repo (hak cipta). Taruh MP3 bebas royalti (maks 3 MB) di `public/music/lagu.mp3`. Jika file tidak ada, tombol musik otomatis disembunyikan.
