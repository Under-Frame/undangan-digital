# CLAUDE.md — Undangan Pernikahan Digital

Spesifikasi lengkap ada di `PRD.md`. Baca dulu sebelum mengerjakan apa pun.

## Aturan proyek

- Stack: Next.js 15 (App Router) + TypeScript + Tailwind CSS + Framer Motion + Supabase + Zod. Jangan ganti stack.
- Kerjakan **satu fase per sesi** sesuai `PRD.md` bagian 11. Setelah selesai, centang checklist di `PRD.md`.
- Semua konten undangan berasal dari `data/<slug>.config.json`. **Jangan hardcode** nama, tanggal, alamat, atau rekening di komponen.
- Semua teks UI dalam Bahasa Indonesia.
- Desain: konsep **Modern Editorial** (lihat `PRD.md` bagian 8). Tanpa ornamen bunga/batik. Warna hanya dari CSS variables palet.
- Mobile-first. Cek tampilan di lebar 360 px sebelum desktop.
- Komponen section di `components/sections/`, satu file per section, nama PascalCase.
- Gunakan `next/image` untuk semua gambar, `next/font` untuk font.
- Secret (service role key, password admin) hanya di server. Jangan pernah dipakai di komponen client.
- Hormati `prefers-reduced-motion`.

## Perintah

```bash
npm run dev     # jalankan lokal di http://localhost:3000/rina-dimas
npm run lint    # wajib lolos sebelum fase dianggap selesai
npm run build   # wajib lolos sebelum fase dianggap selesai
```

## Cara cek cepat

- Undangan: `http://localhost:3000/rina-dimas?to=Pak%20Hadi`
- Admin: `http://localhost:3000/rina-dimas/admin`
