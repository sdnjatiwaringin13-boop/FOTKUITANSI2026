/**
 * Format mata uang Rupiah
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format angka dengan pemisah ribuan (titik) tanpa prefix Rp
 */
export function formatNominal(amount: number): string {
  if (isNaN(amount)) return '0';
  return new Intl.NumberFormat('id-ID').format(amount);
}

/**
 * Parse string nominal (e.g. "5.000.000" atau "Rp 5.000.000") ke number murni
 */
export function parseNominal(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format tanggal Indonesia: contoh "09 September 2026"
 */
export function formatTanggalIndo(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Buat nomor kuitansi otomatis: KWT/YYYY/MM/XXX
 */
export function generateNoKuitansi(existingCount: number = 0): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const romanMonth = romanMonths[now.getMonth()];
  const sequence = (existingCount + 1).toString().padStart(3, '0');
  return `KWT/${year}/${romanMonth}/${sequence}`;
}
