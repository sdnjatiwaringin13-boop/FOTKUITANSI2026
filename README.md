# Kuitansi Digital — Siap Upload

Aplikasi web pencetak kuitansi tanpa framework dan tanpa database.

## Fitur
- Buat kuitansi
- Nomor otomatis
- Tanggal
- Nama penerima
- Alamat/keterangan
- Banyak item
- Qty x harga
- Subtotal, diskon, total
- Terbilang Rupiah
- Metode pembayaran
- Catatan
- Logo usaha/sekolah
- Pengaturan identitas
- Riwayat, pencarian, edit, hapus
- Cetak A4 / Save as PDF
- Responsive
- Penyimpanan localStorage

## Cara paling mudah di Cloudflare Workers Builds
Repository harus berisi:
- package.json
- build.mjs
- wrangler.jsonc
- public/index.html
- public/styles.css
- public/app.js

Pengaturan:
Build command: npm run build
Deploy command: npx wrangler deploy
Version command: kosong
Root directory: /
Production branch: main

Tidak ada bun.lock dan tidak ada dependency npm tambahan.

## Lokal
npm install
npm run build

Hasil ada di dist/.
