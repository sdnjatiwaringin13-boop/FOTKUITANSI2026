import React, { useState, useMemo } from 'react';
import {
  Search,
  Printer,
  Edit2,
  Trash2,
  FileSpreadsheet,
  CloudUpload,
  CheckCircle2,
  AlertCircle,
  Copy,
  Receipt as ReceiptIcon,
  Filter,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Receipt } from '../types';
import { formatRupiah, formatTanggalIndo } from '../utils/format';

interface ReceiptListProps {
  receipts: Receipt[];
  onSelectReceipt: (receipt: Receipt) => void;
  onEditReceipt: (receipt: Receipt) => void;
  onDeleteReceipt: (id: string) => void;
  onDuplicateReceipt: (receipt: Receipt) => void;
  onSyncReceipt: (receipt: Receipt) => void;
  onExportCSV: () => void;
  onSyncAll: () => void;
  isSyncing?: boolean;
}

export const ReceiptList: React.FC<ReceiptListProps> = ({
  receipts,
  onSelectReceipt,
  onEditReceipt,
  onDeleteReceipt,
  onDuplicateReceipt,
  onSyncReceipt,
  onExportCSV,
  onSyncAll,
  isSyncing = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');

  // Filter receipts
  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      const matchSearch =
        r.noKuitansi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.telahDiterimaDari.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.untukPembayaran.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.tempat.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (filterMonth !== 'all') {
        const itemMonth = r.tanggal.slice(0, 7); // YYYY-MM
        return itemMonth === filterMonth;
      }

      return true;
    });
  }, [receipts, searchTerm, filterMonth]);

  // Summary statistics
  const totalNominal = useMemo(() => {
    return filteredReceipts.reduce((acc, curr) => acc + (curr.jumlahUang || 0), 0);
  }, [filteredReceipts]);

  // Unique months available
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    receipts.forEach((r) => {
      if (r.tanggal && r.tanggal.length >= 7) {
        months.add(r.tanggal.slice(0, 7));
      }
    });
    return Array.from(months).sort().reverse();
  }, [receipts]);

  return (
    <div className="space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <ReceiptIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Kuitansi
            </div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">
              {filteredReceipts.length} <span className="text-xs font-normal text-slate-400">dokumen</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Perputaran Uang
            </div>
            <div className="text-xl font-bold text-emerald-600 font-mono mt-0.5">
              {formatRupiah(totalNominal)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Rata-Rata Transaksi
            </div>
            <div className="text-xl font-bold text-slate-800 font-mono mt-0.5">
              {formatRupiah(filteredReceipts.length > 0 ? totalNominal / filteredReceipts.length : 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Action Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari No. kuitansi, nama, keperluan..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          {/* Month Filter */}
          <div className="relative w-full sm:w-44">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
            >
              <option value="all">Semua Periode</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  Bulan {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={onExportCSV}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition flex items-center gap-1.5 shadow-xs"
            title="Download file CSV untuk Spreadsheet"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Ekspor CSV
          </button>

          <button
            type="button"
            onClick={onSyncAll}
            disabled={isSyncing || receipts.length === 0}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition flex items-center gap-1.5 shadow-xs"
            title="Sinkronkan seluruh data kuitansi ke Google Spreadsheet"
          >
            <CloudUpload className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
            {isSyncing ? 'Menyinkronkan...' : 'Sync ke Spreadsheet'}
          </button>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">No. Kuitansi</th>
                <th className="py-3 px-4">Tanggal &amp; Tempat</th>
                <th className="py-3 px-4">Telah Diterima Dari</th>
                <th className="py-3 px-4">Untuk Pembayaran</th>
                <th className="py-3 px-4 text-right">Jumlah Uang</th>
                <th className="py-3 px-3 text-center">Cloud</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <ReceiptIcon className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">Belum ada riwayat kuitansi yang cocok</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Gunakan form di atas untuk membuat dan mencetak kuitansi baru.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((r, idx) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/80 transition group cursor-pointer"
                    onClick={() => onSelectReceipt(r)}
                  >
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-indigo-700">{r.noKuitansi}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {r.materai ? 'Bea Materai 10K' : 'Non-materai'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{formatTanggalIndo(r.tanggal)}</div>
                      <div className="text-[11px] text-slate-500">{r.tempat}</div>
                    </td>
                    <td className="py-3 px-4 max-w-[200px]">
                      <div className="font-semibold text-slate-800 truncate" title={r.telahDiterimaDari}>
                        {r.telahDiterimaDari}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Kepsek: {r.setujuDibayarKepalaSekolah}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-[240px]">
                      <div className="text-slate-700 line-clamp-2" title={r.untukPembayaran}>
                        {r.untukPembayaran}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {formatRupiah(r.jumlahUang)}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      {r.syncStatus === 'synced' ? (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium"
                          title="Tersinkron ke Google Sheets"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Sync
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSyncReceipt(r)}
                          className="inline-flex items-center gap-1 text-[10px] text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-2 py-0.5 rounded-full font-medium transition"
                          title="Klik untuk sync ke Google Sheets"
                        >
                          <CloudUpload className="w-3 h-3" /> Sync
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onSelectReceipt(r)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                          title="Cetak Kuitansi / PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onEditReceipt(r)}
                          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-md transition"
                          title="Ubah Data"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDuplicateReceipt(r)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                          title="Duplikasi Kuitansi"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus kuitansi nomor ${r.noKuitansi}?`)) {
                              onDeleteReceipt(r.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                          title="Hapus Kuitansi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Menampilkan <b>{filteredReceipts.length}</b> dari <b>{receipts.length}</b> total kuitansi tersimpan
          </span>
          <span className="font-mono">Penyimpanan: Database Lokal &amp; Cloud Google Sheets</span>
        </div>
      </div>
    </div>
  );
};
