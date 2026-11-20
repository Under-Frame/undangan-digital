# Undangan Pernikahan Digital — Modern Editorial

Website undangan pernikahan satu halaman bergaya majalah editorial: foto full-screen, tipografi besar, animasi halus, tanpa ornamen bunga. Semua konten undangan diambil dari satu file config, jadi undangan pasangan baru bisa dibuat tanpa mengedit kode.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Zod · Supabase · lucide-react

## Status

| Fase | Isi | Status |
| --- | --- | --- |
| 1 | Setup, palet & font, config + validasi Zod, route `/[slug]`, komponen motion | ✅ Selesai |
| 2 | Section statis (Cover, Musik, Mempelai, Countdown, Acara + kalender, Lokasi, Love Story, Galeri + lightbox, Penutup, Bottom Nav) | ✅ Selesai |
| 3 | RSVP (toast + konfeti), Ucapan & Doa (pagination, filter kata kasar), Amplop Digital, Supabase + mode demo | ✅ Selesai |
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

## Database (opsional)

Tanpa konfigurasi apa pun, RSVP & ucapan disimpan **sementara di memori** dan muncul label "Mode demo". Untuk menyimpan permanen dengan Supabase:

1. Buat project di <https://supabase.com> (atau pakai project yang sudah ada — nama tabel diberi awalan `undangan_` agar tidak bentrok).
2. Buka **SQL Editor**, jalankan isi [`supabase/schema.sql`](supabase/schema.sql).
3. Salin `.env.example` menjadi `.env.local`, isi dari **Project Settings → API**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY` (rahasia, hanya dipakai di server).
4. Jalankan ulang `npm run dev`. Label "Mode demo" akan hilang.

Keamanan: Row Level Security aktif, data RSVP tidak bisa dibaca publik, semua penulisan lewat API route (validasi Zod + batas 5 request/menit per IP).

**Musik:** file lagu tidak disertakan di repo (hak cipta). Taruh MP3 bebas royalti (maks 3 MB) di `public/music/lagu.mp3`. Jika file tidak ada, tombol musik otomatis disembunyikan.
