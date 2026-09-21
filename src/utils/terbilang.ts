/**
 * Fungsi konversi angka numerik ke huruf terbilang Bahasa Indonesia
 */
const SATUAN = [
  '',
  'Satu',
  'Dua',
  'Tiga',
  'Empat',
  'Lima',
  'Enam',
  'Tujuh',
  'Delapan',
  'Sembilan',
  'Sepuluh',
  'Sebelas',
];

function angkaKeKata(n: number): string {
  if (n < 12) {
    return SATUAN[n];
  }
  if (n < 20) {
    return `${angkaKeKata(n - 10)} Belas`;
  }
  if (n < 100) {
    const sisa = n % 10;
    const depan = Math.floor(n / 10);
    return `${angkaKeKata(depan)} Puluh ${angkaKeKata(sisa)}`.trim();
  }
  if (n < 200) {
    const sisa = n - 100;
    return `Seratus ${angkaKeKata(sisa)}`.trim();
  }
  if (n < 1000) {
    const sisa = n % 100;
    const depan = Math.floor(n / 100);
    return `${angkaKeKata(depan)} Ratus ${angkaKeKata(sisa)}`.trim();
  }
  if (n < 2000) {
    const sisa = n - 1000;
    return `Seribu ${angkaKeKata(sisa)}`.trim();
  }
  if (n < 1000000) {
    const sisa = n % 1000;
    const depan = Math.floor(n / 1000);
    return `${angkaKeKata(depan)} Ribu ${angkaKeKata(sisa)}`.trim();
  }
  if (n < 1000000000) {
    const sisa = n % 1000000;
    const depan = Math.floor(n / 1000000);
    return `${angkaKeKata(depan)} Juta ${angkaKeKata(sisa)}`.trim();
  }
  if (n < 1000000000000) {
    const sisa = n % 1000000000;
    const depan = Math.floor(n / 1000000000);
    return `${angkaKeKata(depan)} Milyar ${angkaKeKata(sisa)}`.trim();
  }
  if (n < 1000000000000000) {
    const sisa = n % 1000000000000;
    const depan = Math.floor(n / 1000000000000);
    return `${angkaKeKata(depan)} Triliun ${angkaKeKata(sisa)}`.trim();
  }
  return '';
}

export function terbilang(nilai: number | string): string {
  const angka = typeof nilai === 'string' ? parseFloat(nilai.replace(/[^0-9.-]+/g, '')) : nilai;

  if (isNaN(angka) || angka === 0) {
    return 'Nol Rupiah';
  }

  const positif = Math.abs(Math.floor(angka));
  const hasil = angkaKeKata(positif).trim();

  // Normalize multi-spaces
  const terbilangRapi = hasil.replace(/\s+/g, ' ');
  return `${terbilangRapi} Rupiah`;
}
