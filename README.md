# Kuitansi Digital

Aplikasi web kuitansi berbasis React + Vite.

## Fitur
- Membuat kuitansi
- Nomor dan tanggal otomatis
- Banyak item transaksi
- Subtotal, diskon, total
- Terbilang Rupiah
- Metode pembayaran
- Catatan
- Simpan riwayat di localStorage
- Edit/hapus/cari riwayat
- Cetak / simpan PDF melalui dialog print browser
- Pengaturan identitas usaha/sekolah
- Responsive desktop dan HP

## Menjalankan
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

Output produksi ada di folder `dist`.

## Cloudflare Pages
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js: gunakan versi LTS yang tersedia
- Jangan gunakan `bun install`
- Jangan commit `bun.lock`
