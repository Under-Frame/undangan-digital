# Undangan Pernikahan Digital — Modern Editorial

Website undangan pernikahan satu halaman bergaya majalah editorial: foto full-screen, tipografi besar, animasi halus, tanpa ornamen bunga. Dibuka dari link WhatsApp di HP, lengkap dengan RSVP, ucapan & doa, amplop digital, dan dashboard admin untuk pasangan.

Semua konten undangan berasal dari **satu file config**, jadi undangan pasangan baru bisa dibuat tanpa mengedit kode.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Zod · Supabase · lucide-react

| Lighthouse (mobile, build produksi) | Skor |
| --- | --- |
| Performance | 85–95 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

## Fitur

**Undangan** (`/rina-dimas?to=Nama%20Tamu`)

- Cover full-screen dengan nama tamu dari `?to=`, scroll terkunci sampai **Buka Undangan** ditekan
- Musik latar (mulai saat undangan dibuka, bukan autoplay)
- Mempelai, hitung mundur, detail acara + **Simpan ke Kalender** (Google Calendar & `.ics`)
- Lokasi (Google Maps), love story ala Instagram Stories, galeri bento + lightbox (swipe & keyboard)
- **RSVP** dengan validasi, toast, dan konfeti
- **Ucapan & Doa** dengan pagination, waktu relatif, dan filter kata kasar
- **Amplop digital** bergaya kartu debit, tombol salin nomor, QRIS, alamat kado
- Bottom nav kaca buram, mode gelap otomatis, menghormati `prefers-reduced-motion`
- Gambar preview link WhatsApp (Open Graph 1200×630) dibuat otomatis

**Dashboard admin** (`/rina-dimas/admin`)

- Login password (sesi cookie httpOnly 7 hari)
- Ringkasan: total RSVP, hadir, tidak hadir, ragu, **total orang hadir**
- Tabel RSVP (cari & filter) + **Export CSV**
- Moderasi ucapan (sembunyikan/tampilkan)
- **Generator link tamu**: tempel daftar nama → link per tamu + teks undangan WhatsApp siap kirim + tombol **Kirim via WA**

## Menjalankan secara lokal

Butuh Node.js 20+.

```bash
npm install
cp .env.example .env.local   # lalu isi, minimal ADMIN_PASSWORD_RINA_DIMAS
npm run dev
```

- Undangan: <http://localhost:3000/rina-dimas?to=Pak%20Hadi>
- Admin: <http://localhost:3000/rina-dimas/admin>

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan |
| `npm run lint` | ESLint |
| `npm run build` | Build produksi |
| `npm run placeholders [slug]` | Membuat foto placeholder (gradien WebP) di `public/img/<slug>/` |

Tanpa Supabase, aplikasi berjalan dalam **Mode demo**: RSVP & ucapan disimpan sementara di memori server (hilang saat server restart).

### Environment variables

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Tidak* | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tidak* | Anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Tidak* | Service role / secret key — **rahasia, hanya di server** |
| `ADMIN_PASSWORD_<SLUG>` | Ya | Password dashboard admin, mis. `ADMIN_PASSWORD_RINA_DIMAS` |
| `NEXT_PUBLIC_SITE_URL` | Disarankan | URL publik, mis. `https://undangan.vercel.app` |
| `ADMIN_SESSION_SECRET` | Opsional | Tambahan kunci tanda tangan sesi admin |

\* Kosongkan ketiganya untuk Mode demo.

## Membuat undangan pasangan baru

Contoh untuk pasangan **Sari & Andi** dengan slug `sari-andi`:

1. **Salin config contoh**

   ```bash
   cp data/rina-dimas.config.json data/sari-andi.config.json
   ```

2. **Edit `data/sari-andi.config.json`**
   - `"slug": "sari-andi"` — harus sama dengan nama file
   - `palette`: `sage` · `monokrom` · `terracotta` · `navy-gold`
   - Nama, orang tua, Instagram (tanpa `@`), acara (tanggal ISO dengan zona waktu, mis. `2027-03-20T09:00:00+07:00`), love story, rekening, quote, kalimat penutup
   - `mapsEmbed`: dari Google Maps → **Bagikan → Sematkan peta** → salin URL di dalam `src="..."`
   - Field opsional (`loveStory`, `qrisImage`, `giftAddress`, `liveStreamUrl`, `closingImage`) boleh `null` — section-nya otomatis tidak tampil
   - `"adminPassword": "ENV:ADMIN_PASSWORD_SARI_ANDI"` — **jangan tulis password asli di sini**

3. **Siapkan foto** di `public/img/sari-andi/` dalam format WebP (cover, bride, groom, galeri). Ukuran yang disarankan: cover ±1440×1800, potret 900×1200 (3:4), galeri ≤1600 px sisi terpanjang. Butuh placeholder dulu? `npm run placeholders sari-andi`.

4. **Musik (opsional):** MP3 bebas royalti ≤3 MB di `public/music/`, isi `"music": "/music/nama-file.mp3"` (atau `null`).

5. **Password admin:** tambahkan `ADMIN_PASSWORD_SARI_ANDI=...` di `.env.local` dan di Vercel.

6. Buka `http://localhost:3000/sari-andi`. Jika config salah, terminal menampilkan field mana yang perlu diperbaiki.

Satu deploy bisa menampung banyak pasangan sekaligus — tiap pasangan punya URL, data RSVP, dan password admin sendiri.

## Setup Supabase

1. Buat project di <https://supabase.com> — atau pakai project yang sudah ada: nama tabel diberi awalan `undangan_` sehingga tidak bentrok dengan tabel lain.
2. Buka **SQL Editor → New query**, tempel isi [`supabase/schema.sql`](supabase/schema.sql), klik **Run**. Script ini hanya membuat tabel `undangan_rsvp` & `undangan_wishes` (aman dijalankan ulang).
3. Ambil kunci dari **Project Settings → Data API** (Project URL) dan **API Keys** (anon & service_role), isi ke `.env.local`.
4. Restart `npm run dev`. Label "Mode demo" akan hilang.

Keamanan: Row Level Security aktif (data RSVP tidak bisa dibaca publik), semua penulisan lewat API route dengan validasi Zod + rate limit 5 request/menit per IP, service role key hanya dipakai di server.

## Deploy ke Vercel

1. Push repo ke GitHub.
2. Buka <https://vercel.com/new>, login dengan GitHub, **Import** repo ini. Framework terdeteksi otomatis (Next.js) — tidak perlu mengubah build settings.
3. Di **Environment Variables**, isi variabel dari tabel di atas (minimal `ADMIN_PASSWORD_RINA_DIMAS`; tambahkan tiga variabel Supabase agar data tersimpan permanen).
4. Klik **Deploy**. Setelah selesai, set `NEXT_PUBLIC_SITE_URL` ke domain Vercel Anda (mis. `https://undangan-digital.vercel.app`) lalu **Redeploy** agar link di generator & preview WhatsApp memakai domain yang benar.
5. Setiap `git push` ke `main` akan otomatis ter-deploy ulang.

> Tanpa Supabase, Mode demo di Vercel tidak andal (serverless bisa restart kapan saja), jadi sambungkan Supabase untuk demo publik.

Cek preview link WhatsApp setelah deploy dengan <https://www.opengraph.xyz> atau kirim link ke chat WhatsApp sendiri.

## Struktur

```
app/
  [slug]/page.tsx              halaman undangan
  [slug]/admin/page.tsx        dashboard pasangan
  [slug]/opengraph-image.tsx   gambar preview link 1200×630
  api/rsvp | wishes | admin | ics
components/
  sections/                    Cover, Couple, Countdown, Events, Location, LoveStory,
                               Gallery, Rsvp, Wishes, Gift, Closing
  ui/                          BottomNav, MusicToggle, Lightbox, Toast, Confetti, LazyMap, …
  motion/                      Reveal, SplitText, Parallax, MotionProvider
  admin/                       AdminLogin, AdminDashboard, StatCards, RsvpTable,
                               WishModeration, LinkGenerator
lib/
  config.ts                    Zod schema + loader config undangan
  schemas.ts                   schema form RSVP & ucapan (client + server)
  store.ts                     data RSVP & ucapan (Supabase / in-memory)
  admin-auth.ts                login & sesi admin
  calendar.ts                  link Google Calendar & file .ics
  utils.ts                     format tanggal, filter kata kasar, dll.
data/rina-dimas.config.json    data contoh (dummy)
supabase/schema.sql            skema database
```

## Catatan teknis

**Library di luar daftar awal PRD** (beserta alasannya):

- `sharp` — mengubah foto cover WebP menjadi JPEG untuk gambar Open Graph (generator gambar Next.js tidak bisa membaca WebP). Library ini sudah dipakai Next.js untuk optimasi gambar; dicantumkan eksplisit agar pasti tersedia saat deploy.
- `zod/mini` — bukan library baru, melainkan versi ringkas Zod yang dipakai untuk validasi form di browser agar JavaScript halaman lebih kecil.

**Performa:** animasi cover memakai CSS murni (tampil tanpa menunggu JavaScript), Framer Motion dimuat bertahap lewat `LazyMotion`, peta Google baru dimuat saat mendekati layar, dan semua foto memakai `next/image` dengan lazy-load.

**Konten:** foto di `public/img/rina-dimas/` hanya placeholder gradien, bukan foto orang asli. File musik tidak disertakan (hak cipta) — tanpa file, tombol musik otomatis disembunyikan.

---

Made by [Under-Frame](https://github.com/Under-Frame)
