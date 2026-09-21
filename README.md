# Kuitansi Digital — Versi Final

Aplikasi pencetak kuitansi dengan database Google Spreadsheet melalui Google Apps Script.

## 1. Google Spreadsheet
Buat Spreadsheet kosong → Extensions → Apps Script.
Salin seluruh isi `google-apps-script/Code.gs`.
Jalankan fungsi `setupDatabase` satu kali.
Deploy → New deployment → Web app.
Execute as: Me.
Who has access: Anyone.
Salin URL yang berakhiran `/exec`.

## 2. Hubungkan website
Buka `public/config.js` dan isi:
```js
const API_URL = "URL_WEB_APP_ANDA";
```
Contoh:
```js
const API_URL = "https://script.google.com/macros/s/AKfycb.../exec";
```

## 3. GitHub
Upload semua isi project.
Jangan upload bun.lock atau bun.lockb.

## 4. Cloudflare
Build command:
npm run build

Deploy command:
npx wrangler deploy

Version command:
(kosong)

Root directory:
/ 

Production branch:
main

## 5. Fitur
- Buat/simpan/edit/hapus kuitansi
- Riwayat dari Google Spreadsheet
- Pencarian
- Banyak item
- Subtotal, diskon, total
- Terbilang rupiah
- Logo
- Pengaturan identitas
- Cetak A4 / Save as PDF
- Nomor kuitansi server-side
- Multi-user melalui database Spreadsheet
