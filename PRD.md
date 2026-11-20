# PRD — Website Undangan Pernikahan Digital (Modern Editorial)

> Dokumen ini ditulis untuk dikerjakan oleh Claude Code. Kerjakan per **Fase** (lihat bagian 11), satu fase per sesi, dan centang checklist acceptance criteria sebelum lanjut.

---

## 1. Ringkasan

Website undangan pernikahan **satu halaman**, dibuka dari link WhatsApp di HP, berisi info acara, galeri, RSVP, ucapan, dan amplop digital. Ditambah **dashboard admin** sederhana untuk pasangan.

Produk ini dipakai untuk:
1. Project portofolio web developer (harus terlihat premium dan bisa didemokan).
2. Dijual sebagai jasa per pasangan dan sebagai template (ganti data cukup lewat 1 file config).

**Konsep desain:** *Modern Editorial*. Tampilannya seperti majalah fashion digital: foto full-screen, tipografi besar, banyak ruang kosong, animasi halus, **tanpa ornamen bunga**.

## 2. Tujuan & Kriteria Sukses

- Tamu bisa buka undangan, lihat lokasi, dan RSVP dalam < 1 menit dari HP.
- Pasangan bisa lihat rekap RSVP & ucapan real-time.
- Undangan pasangan baru bisa dibuat < 2 jam hanya dengan mengganti file config + foto.
- Lighthouse mobile: Performance ≥ 85, Accessibility ≥ 90.

## 3. Pengguna

| Persona | Kebutuhan | Hindari |
| --- | --- | --- |
| Pasangan (klien) | Undangan cantik, cepat jadi, lihat siapa yang hadir | Revisi lama, desain murahan |
| Tamu senior (50+) | Tanggal, jam, cara ke lokasi | Halaman berat, teks kecil, musik tiba-tiba keras |
| Tamu muda | Lihat foto, kirim ucapan, transfer hadiah | Nomor rekening tidak bisa disalin |
| Reseller / WO | Template yang mudah diganti datanya | Harus edit kode |

## 4. Tech Stack (wajib)

| Bagian | Pilihan |
| --- | --- |
| Framework | **Next.js 15 (App Router) + TypeScript** |
| Styling | **Tailwind CSS** |
| Animasi | **Framer Motion** (GSAP hanya jika perlu parallax kompleks) |
| Database | **Supabase** (Postgres) untuk RSVP, ucapan, tamu |
| Validasi | **Zod** |
| Icon | **lucide-react** |
| Font | `next/font/google`: **Fraunces** (judul), **Plus Jakarta Sans** (isi) |
| Gambar | `next/image`, format WebP |
| Hosting | **Vercel** |
| Package manager | npm |

Jangan menambah library lain tanpa alasan kuat. Catat alasannya di `README.md` jika menambah.

## 5. Struktur Folder

```
undangan-digital/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # landing/demo -> redirect ke /rina-dimas
│   ├── [slug]/
│   │   ├── page.tsx                # halaman undangan
│   │   ├── opengraph-image.tsx     # preview link WhatsApp
│   │   └── admin/page.tsx          # dashboard pasangan
│   └── api/
│       ├── rsvp/route.ts
│       ├── wishes/route.ts
│       └── admin/route.ts
├── components/
│   ├── sections/                   # Cover, Couple, Countdown, Events, Location,
│   │                               # Gallery, LoveStory, Rsvp, Wishes, Gift, Closing
│   ├── ui/                         # Button, Card, Toast, Lightbox, MusicToggle, BottomNav
│   └── motion/                     # Reveal, SplitText, Parallax
├── lib/
│   ├── config.ts                   # loader + Zod schema untuk wedding config
│   ├── supabase.ts
│   ├── calendar.ts                 # generate link Google Calendar & file .ics
│   └── utils.ts
├── data/
│   └── rina-dimas.config.json      # data contoh (dummy)
├── public/
│   ├── img/rina-dimas/             # foto WebP
│   └── music/
├── supabase/schema.sql
├── .env.example
└── README.md
```

## 6. File Konfigurasi Pasangan

Semua konten undangan berasal dari `data/<slug>.config.json` dan divalidasi dengan Zod di `lib/config.ts`. **Tidak boleh ada teks pasangan yang di-hardcode di komponen.**

```json
{
  "slug": "rina-dimas",
  "palette": "sage",
  "coverImage": "/img/rina-dimas/cover.webp",
  "bride": {
    "name": "Rina Amelia",
    "nickname": "Rina",
    "parents": "Putri dari Bpk. Ahmad & Ibu Siti",
    "instagram": "rinaamelia",
    "photo": "/img/rina-dimas/bride.webp"
  },
  "groom": {
    "name": "Dimas Pratama",
    "nickname": "Dimas",
    "parents": "Putra dari Bpk. Budi & Ibu Ani",
    "instagram": "dimaspratama",
    "photo": "/img/rina-dimas/groom.webp"
  },
  "events": [
    {
      "type": "Akad Nikah",
      "start": "2027-02-14T08:00:00+07:00",
      "end": "2027-02-14T10:00:00+07:00",
      "venue": "Masjid Al-Ikhlas",
      "address": "Jl. Merdeka No. 10, Bandung",
      "mapsUrl": "https://maps.google.com/?q=Masjid+Al-Ikhlas+Bandung",
      "mapsEmbed": "https://www.google.com/maps/embed?pb=..."
    },
    {
      "type": "Resepsi",
      "start": "2027-02-14T11:00:00+07:00",
      "end": "2027-02-14T14:00:00+07:00",
      "venue": "Gedung Serbaguna Melati",
      "address": "Jl. Asia Afrika No. 5, Bandung",
      "mapsUrl": "https://maps.google.com/?q=Gedung+Melati+Bandung",
      "mapsEmbed": "https://www.google.com/maps/embed?pb=..."
    }
  ],
  "loveStory": [
    { "year": "2019", "title": "Pertama Bertemu", "text": "Bertemu di kampus..." },
    { "year": "2025", "title": "Lamaran", "text": "Dimas melamar Rina..." }
  ],
  "gallery": ["/img/rina-dimas/1.webp", "/img/rina-dimas/2.webp"],
  "music": "/music/lagu.mp3",
  "gifts": [
    { "type": "bank", "provider": "BCA", "number": "1234567890", "holder": "Rina Amelia" },
    { "type": "ewallet", "provider": "GoPay", "number": "081234567890", "holder": "Dimas Pratama" }
  ],
  "qrisImage": null,
  "giftAddress": "Jl. Melati No. 3, Bandung 40111",
  "liveStreamUrl": null,
  "quote": { "text": "Dan di antara tanda-tanda kekuasaan-Nya...", "source": "QS. Ar-Rum: 21" },
  "closing": "Merupakan suatu kehormatan apabila Bapak/Ibu/Saudara/i berkenan hadir.",
  "adminPassword": "ENV:ADMIN_PASSWORD_RINA_DIMAS"
}
```

Field opsional (`loveStory`, `qrisImage`, `giftAddress`, `liveStreamUrl`) → section-nya **tidak dirender** jika kosong/null.

## 7. Fitur & Spesifikasi Section

Urutan render di `app/[slug]/page.tsx` sesuai tabel. P0 = wajib MVP, P1 = sebaiknya ada.

| # | Section | Spesifikasi | Prioritas |
| --- | --- | --- | --- |
| 1 | **Cover** | Foto full-screen + overlay gelap 40%. Label kecil kapital `THE WEDDING OF`, nama panggilan besar (Fraunces 56–72 px), tanggal format `14 · 02 · 2027`. Teks `Kepada Yth.` + nama tamu dari query `?to=` (decode, sanitasi, maks 50 karakter; jika kosong tampilkan "Tamu Undangan"). Tombol pil **Buka Undangan**. Sebelum dibuka, scroll halaman dikunci. | P0 |
| 2 | **Musik** | Mulai diputar saat tombol Buka Undangan ditekan (bukan autoplay). Tombol play/pause bulat melayang di kanan bawah, ikon berputar saat musik jalan. | P0 |
| 3 | **Mempelai** | Foto potret (rasio 3:4), nama lengkap, nama orang tua, link Instagram. Layout asimetris (foto kiri-kanan bergantian di desktop, bertumpuk di mobile). | P0 |
| 4 | **Countdown** | Hari / Jam / Menit / Detik ke acara pertama. Angka besar tanpa kotak berwarna, dipisah garis tipis. Setelah lewat tanggal: tampil "Acara telah berlangsung". | P0 |
| 5 | **Detail Acara** | Kartu per event: jenis, tanggal (format Indonesia, mis. "Minggu, 14 Februari 2027"), jam + "WIB", venue, alamat. Tombol **Simpan ke Kalender** (Google Calendar link + unduh .ics). | P0 |
| 6 | **Lokasi** | Embed Google Maps (lazy-load, iframe `loading="lazy"`) + tombol **Buka di Google Maps**. | P0 |
| 7 | **Love Story** | Kartu horizontal-scroll dengan scroll-snap, mirip Instagram Stories. | P1 |
| 8 | **Galeri** | Bento grid (ukuran foto bervariasi). Klik → lightbox fullscreen yang bisa di-swipe, tombol tutup, keyboard ←/→/Esc. Lazy-load. | P0 |
| 9 | **RSVP** | Form: nama (prefill dari `?to=`), kehadiran (Hadir / Tidak Hadir / Masih Ragu), jumlah tamu 1–5 (sembunyikan jika tidak hadir). Validasi Zod di client + server. Setelah sukses: toast + konfeti kecil, tombol berubah "Terima kasih!". | P0 |
| 10 | **Ucapan & Doa** | Form nama + pesan (maks 500 karakter). Daftar ucapan terbaru di atas, avatar inisial, waktu relatif ("2 jam lalu"). Pagination "Muat lebih banyak" per 10. Filter kata kasar sederhana (daftar kata di `lib/utils.ts`). | P0 |
| 11 | **Amplop Digital** | Tombol **Kirim Hadiah** membuka daftar. Tiap rekening tampil sebagai kartu bergaya kartu debit (gradien halus, nama bank, nomor, pemilik). Tombol **Salin** → toast "Nomor disalin". QRIS dan alamat kado jika ada. | P0 |
| 12 | **Live Streaming** | Tombol ke `liveStreamUrl` jika ada. | P1 |
| 13 | **Penutup** | Quote/ayat, kalimat penutup, nama kedua mempelai, foto latar. Kredit kecil "Made by [nama developer]" + link portofolio. | P0 |
| 14 | **Bottom Nav** | Bar melayang di bawah (muncul setelah cover dibuka): Home, Mempelai, Acara, Galeri, RSVP, Hadiah. Efek kaca buram (`backdrop-blur`). Scroll halus ke section, ikon aktif mengikuti posisi scroll. | P0 |

### Dashboard Admin (`/[slug]/admin`)

- Login dengan password (dari env var), sesi disimpan di cookie httpOnly 7 hari.
- Kartu ringkasan: total RSVP, Hadir, Tidak Hadir, Ragu, **total orang hadir**.
- Tabel RSVP (cari nama, filter kehadiran) + tombol **Export CSV**.
- Moderasi ucapan: toggle sembunyikan/tampilkan.
- **Generator link tamu:** textarea satu nama per baris → hasil tabel nama + link `https://domain/slug?to=Nama` + tombol salin teks undangan WhatsApp siap kirim + tombol "Kirim via WA" (`https://wa.me/?text=...`).

## 8. Panduan Desain (Modern Editorial)

### Palet (CSS variables di `globals.css`, dipilih dari `config.palette`)

| Token | sage (default) | monokrom | terracotta | navy-gold |
| --- | --- | --- | --- | --- |
| `--bg` | #F5F3EF | #FFFFFF | #F7F1EB | #F4F2EC |
| `--fg` | #111111 | #000000 | #2A1E18 | #0F1B2D |
| `--muted` | #6B6B6B | #6B6B6B | #7A6A60 | #5B6577 |
| `--accent` | #8A9A82 | #111111 | #C46A4A | #B8975A |
| `--line` | #E2DED6 | #E5E5E5 | #E8DDD2 | #DCD8CC |

**Mode gelap otomatis** (`prefers-color-scheme: dark`): `--bg` #111111, `--fg` #F5F3EF, accent tetap.

### Tipografi

- Judul: Fraunces, 40–72 px, letter-spacing -0.02em.
- Label kecil: Plus Jakarta Sans, 12 px, huruf kapital, letter-spacing 0.2em.
- Isi: Plus Jakarta Sans, 16 px minimal, line-height 1.6.

### Layout & Gaya

- Mobile-first (360–430 px), max-width konten 1100 px di desktop.
- Jarak antar-section 96–128 px. Teks rata kiri.
- Ornamen: hanya garis tipis 1 px, angka besar, label kapital. **Tidak ada bunga/batik.**
- Tombol: bentuk pil, outline 1 px, tinggi minimal 44 px.
- Sudut kartu: 16–24 px. Tidak ada drop shadow tebal.

### Animasi (Framer Motion)

- `Reveal`: fade + naik 24 px saat masuk viewport, durasi 0.6 s, easing `[0.22, 1, 0.36, 1]`, sekali saja.
- `SplitText`: judul muncul per baris/kata (stagger 0.08 s).
- `Parallax`: foto cover & penutup zoom pelan saat scroll (scale 1 → 1.1).
- Hormati `prefers-reduced-motion`: matikan semua animasi gerak.

## 9. Kebutuhan Non-Fungsional

- Lighthouse mobile Performance ≥ 85, Accessibility ≥ 90, SEO ≥ 90.
- Ukuran awal halaman < 1,5 MB; foto galeri lazy-load; musik ≤ 3 MB, `preload="none"`.
- Berfungsi di Chrome Android, Safari iOS, dan in-app browser WhatsApp/Instagram.
- **Open Graph:** judul "The Wedding of Rina & Dimas", deskripsi tanggal, gambar cover 1200×630 (lewat `opengraph-image.tsx`).
- Keamanan: API RSVP/ucapan diberi validasi Zod + rate limit sederhana (maks 5 request/menit per IP, in-memory cukup untuk MVP). Supabase pakai **Row Level Security**; write lewat API route dengan service role key (server-only). Data RSVP tidak bisa dibaca publik.
- Aksesibilitas: alt text di semua foto, kontras teks cukup, fokus keyboard terlihat, `aria-label` di tombol ikon.
- Semua teks UI dalam **Bahasa Indonesia**.

## 10. Database (Supabase) — `supabase/schema.sql`

```sql
create table rsvp (
  id uuid primary key default gen_random_uuid(),
  wedding_slug text not null,
  guest_name text not null check (char_length(guest_name) <= 50),
  attendance text not null check (attendance in ('hadir','tidak','ragu')),
  guest_count int not null default 1 check (guest_count between 0 and 5),
  created_at timestamptz not null default now()
);

create table wishes (
  id uuid primary key default gen_random_uuid(),
  wedding_slug text not null,
  guest_name text not null check (char_length(guest_name) <= 50),
  message text not null check (char_length(message) <= 500),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index on rsvp (wedding_slug, created_at desc);
create index on wishes (wedding_slug, created_at desc);

alter table rsvp enable row level security;
alter table wishes enable row level security;

-- publik hanya boleh membaca ucapan yang tidak disembunyikan
create policy "public read visible wishes" on wishes
  for select using (is_hidden = false);
```

`.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD_RINA_DIMAS=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Mode tanpa database:** jika env Supabase kosong, API memakai penyimpanan in-memory dan menampilkan banner kecil "Mode demo". Ini supaya demo portofolio tetap jalan tanpa setup.

## 11. Fase Pengerjaan & Acceptance Criteria

Kerjakan **satu fase per sesi**. Di akhir fase: jalankan `npm run lint` dan `npm run build` (harus lolos), lalu centang checklist.

### Fase 1 — Setup & Fondasi
- [x] Init Next.js + TypeScript + Tailwind + ESLint.
- [x] Pasang font, CSS variables palet + dark mode.
- [x] `lib/config.ts` dengan Zod schema; `data/rina-dimas.config.json` berisi data dummy; error jelas jika config tidak valid.
- [x] Route `/[slug]` membaca config; slug tidak ada → halaman 404 yang rapi.
- [x] Komponen motion: `Reveal`, `SplitText`, `Parallax` (hormati reduced-motion).
- [x] Placeholder foto (gunakan gradien/warna solid atau foto bebas lisensi, bukan foto orang asli tanpa izin).

### Fase 2 — Section Statis
- [x] Cover (+ nama tamu `?to=`, kunci scroll sebelum dibuka) dan Musik.
- [x] Mempelai, Countdown, Detail Acara (+ Simpan ke Kalender), Lokasi.
- [x] Love Story, Galeri bento + Lightbox, Penutup.
- [x] Bottom Nav glassmorphism dengan indikator section aktif.
- [x] Tampilan dicek di lebar 360, 390, 430, dan 1280 px.

### Fase 3 — Fitur Interaktif
- [x] `supabase/schema.sql`, `lib/supabase.ts`, fallback in-memory.
- [x] API + form RSVP (validasi, rate limit, toast, konfeti).
- [x] API + list Ucapan (pagination, filter kata kasar, waktu relatif).
- [x] Amplop Digital (kartu debit, salin nomor, QRIS, alamat kado).

### Fase 4 — Admin, SEO & Polish
- [x] Dashboard admin: login, ringkasan, tabel + export CSV, moderasi ucapan, generator link tamu + teks WhatsApp.
- [x] Open Graph image + metadata.
- [x] Audit Lighthouse mobile memenuhi target bagian 9; perbaiki jika belum.
- [x] `README.md`: cara install, cara membuat undangan pasangan baru (langkah ganti config + foto), cara deploy ke Vercel, cara setup Supabase.

## 12. Di Luar Scope MVP (versi 2)

- Form pemesanan online (pasangan isi data sendiri → undangan jadi otomatis).
- Statistik berapa tamu sudah membuka undangan.
- Pengingat H-1 via WhatsApp.
- QR code check-in tamu di lokasi.
- Multi-bahasa (Indonesia/Inggris).
