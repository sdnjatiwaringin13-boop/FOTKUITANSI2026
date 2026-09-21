import { Receipt, CloudConfig } from '../types';
import { formatTanggalIndo } from '../utils/format';

/**
 * Kode Google Apps Script siap pakai untuk di-copy ke Google Spreadsheet
 * (Ekstensi > Apps Script > Code.gs)
 */
export const APPS_SCRIPT_TEMPLATE = `/**
 * GOOGLE APPS SCRIPT - SISTEM KUITANSI RESMI SEKOLAH
 * Script ini otomatis menerima data kuitansi dari WebApp dan mencatatnya ke Google Sheets.
 * 
 * CARA PEMASANGAN:
 * 1. Buat Spreadsheet baru di Google Drive Anda (misal: "Buku Kuitansi Sekolah").
 * 2. Klik menu 'Ekstensi' > 'Apps Script'.
 * 3. Hapus semua kode default, lalu PASTE kode di bawah ini.
 * 4. Klik tombol 'Deploy' (Terapkan) di kanan atas > 'New deployment' (Penerapan baru).
 * 5. Pilih jenis 'Web app' (Aplikasi web).
 * 6. Setel:
 *    - Execute as: 'Me' (Saya)
 *    - Who has access: 'Anyone' (Siapa saja)
 * 7. Klik 'Deploy', berikan izin (Authorize), lalu salin 'Web App URL' ke WebApp Kuitansi!
 */

const SHEET_NAME = "Data Kuitansi";

function doPost(e) {
  try {
    const contents = e.postData ? e.postData.contents : "";
    let data;
    try {
      data = JSON.parse(contents);
    } catch(err) {
      data = e.parameter;
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // Jika sheet belum ada, buat baru dan berikan format resmi
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      inisialisasiHeaderSheet(sheet);
    }

    const timestamp = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
    
    // Format nominal ke angka murni untuk perhitungan di sheet
    const nominal = Number(data.jumlahUang) || 0;

    // Periksa apakah no kuitansi sudah ada (untuk update) atau data baru
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (values[i][1] == data.noKuitansi) {
        rowIndex = i + 1; // 1-based index
        break;
      }
    }

    const rowData = [
      timestamp,
      data.noKuitansi || "-",
      data.tanggal || "-",
      data.tempat || "-",
      data.telahDiterimaDari || "-",
      nominal,
      data.terbilang || "-",
      data.untukPembayaran || "-",
      data.setujuDibayarKepalaSekolah || "-",
      data.nipKepalaSekolah || "-",
      data.bendaharaSekolah || "-",
      data.nipBendahara || "-",
      data.panitiaPelaksana || "-",
      data.nipPanitia || "-",
      data.materai ? "Ya (Rp 10.000)" : "Tidak"
    ];

    if (rowIndex > 0) {
      // Update data yang sudah ada
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      // Tambah baris baru
      sheet.appendRow(rowData);
      rowIndex = sheet.getLastRow();
    }

    // Format mata uang pada kolom Jumlah (kolom ke-6 / F)
    sheet.getRange(rowIndex, 6).setNumberFormat('"Rp" #,##0');

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data kuitansi berhasil disimpan ke Google Spreadsheet!",
      row: rowIndex,
      noKuitansi: data.noKuitansi
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "Google Apps Script Kuitansi WebApp aktif & siap menerima data!"
  })).setMimeType(ContentService.MimeType.JSON);
}

function inisialisasiHeaderSheet(sheet) {
  const headers = [
    "Waktu Sync",
    "No. Kuitansi",
    "Tanggal",
    "Tempat",
    "Telah Diterima Dari",
    "Jumlah (Rp)",
    "Terbilang",
    "Untuk Pembayaran",
    "Kepala Sekolah (Setuju)",
    "NIP Kepsek",
    "Bendahara Sekolah",
    "NIP Bendahara",
    "Panitia Pelaksana",
    "NIP Panitia",
    "Bea Materai"
  ];

  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setBackground("#1e3a8a"); // Navy Blue
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  
  // Lebar kolom yang optimal
  sheet.setColumnWidth(1, 140);
  sheet.setColumnWidth(2, 140);
  sheet.setColumnWidth(3, 100);
  sheet.setColumnWidth(4, 100);
  sheet.setColumnWidth(5, 220);
  sheet.setColumnWidth(6, 140);
  sheet.setColumnWidth(7, 280);
  sheet.setColumnWidth(8, 300);
  sheet.setColumnWidth(9, 180);
  sheet.setColumnWidth(10, 160);
  sheet.setColumnWidth(11, 180);
  sheet.setColumnWidth(12, 160);
  sheet.setColumnWidth(13, 180);
  sheet.setColumnWidth(14, 160);
  sheet.setColumnWidth(15, 110);
}
`;

/**
 * Sinkronisasi satu kuitansi ke Google Apps Script Web App
 */
export async function syncReceiptToAppsScript(
  receipt: Receipt,
  appsScriptUrl: string
): Promise<{ success: boolean; message: string }> {
  if (!appsScriptUrl || !appsScriptUrl.trim()) {
    return { success: false, message: 'URL Google Apps Script belum diisi.' };
  }

  try {
    const payload = {
      id: receipt.id,
      noKuitansi: receipt.noKuitansi,
      tanggal: formatTanggalIndo(receipt.tanggal),
      rawTanggal: receipt.tanggal,
      tempat: receipt.tempat,
      telahDiterimaDari: receipt.telahDiterimaDari,
      jumlahUang: receipt.jumlahUang,
      terbilang: receipt.terbilang,
      untukPembayaran: receipt.untukPembayaran,
      setujuDibayarKepalaSekolah: receipt.setujuDibayarKepalaSekolah,
      nipKepalaSekolah: receipt.nipKepalaSekolah || '',
      bendaharaSekolah: receipt.bendaharaSekolah,
      nipBendahara: receipt.nipBendahara || '',
      panitiaPelaksana: receipt.panitiaPelaksana,
      nipPanitia: receipt.nipPanitia || '',
      jabatanPanitia: receipt.jabatanPanitia || '',
      materai: receipt.materai,
    };

    // Google Apps Script endpoint requires text/plain or no-cors in browser client
    await fetch(appsScriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      message: 'Kuitansi berhasil dikirim ke Google Spreadsheet!',
    };
  } catch (error: any) {
    console.error('Apps Script Sync Error:', error);
    return {
      success: false,
      message: error?.message || 'Gagal menyinkronkan data ke Google Apps Script.',
    };
  }
}

/**
 * Ekspor data riwayat kuitansi ke file CSV kompatibel dengan Google Sheets & Microsoft Excel
 */
export function exportReceiptsToCSV(receipts: Receipt[]): void {
  const headers = [
    'No. Kuitansi',
    'Tanggal',
    'Tempat',
    'Telah Diterima Dari',
    'Jumlah (Rp)',
    'Terbilang',
    'Untuk Pembayaran',
    'Kepala Sekolah',
    'NIP Kepala Sekolah',
    'Bendahara Sekolah',
    'NIP Bendahara',
    'Panitia Pelaksana',
    'NIP Panitia',
    'Bea Materai',
    'Dibuat Pada',
  ];

  const rows = receipts.map((r) => [
    `"${r.noKuitansi.replace(/"/g, '""')}"`,
    `"${formatTanggalIndo(r.tanggal)}"`,
    `"${r.tempat.replace(/"/g, '""')}"`,
    `"${r.telahDiterimaDari.replace(/"/g, '""')}"`,
    r.jumlahUang,
    `"${r.terbilang.replace(/"/g, '""')}"`,
    `"${r.untukPembayaran.replace(/"/g, '""')}"`,
    `"${r.setujuDibayarKepalaSekolah.replace(/"/g, '""')}"`,
    `"${(r.nipKepalaSekolah || '-').replace(/"/g, '""')}"`,
    `"${r.bendaharaSekolah.replace(/"/g, '""')}"`,
    `"${(r.nipBendahara || '-').replace(/"/g, '""')}"`,
    `"${r.panitiaPelaksana.replace(/"/g, '""')}"`,
    `"${(r.nipPanitia || '-').replace(/"/g, '""')}"`,
    `"${r.materai ? 'Ya' : 'Tidak'}"`,
    `"${r.createdAt}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `rekapitulasi_kuitansi_sekolah_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
