import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  Printer,
  RotateCcw,
  Sparkles,
  ArrowDownRight,
  CheckCircle2,
  Calendar,
  MapPin,
  Building,
  UserCheck,
  Coins,
  Copy,
} from 'lucide-react';
import { Receipt, SchoolProfile } from '../types';
import { terbilang } from '../utils/terbilang';
import { formatNominal, parseNominal, generateNoKuitansi } from '../utils/format';

interface ReceiptFormProps {
  initialData?: Receipt | null;
  schoolProfile: SchoolProfile;
  receiptCount: number;
  onSave: (receipt: Receipt, shouldPrint?: boolean) => void;
  onCancelEdit?: () => void;
  onPreviewChange?: (receipt: Receipt) => void;
}

export const ReceiptForm: React.FC<ReceiptFormProps> = ({
  initialData,
  schoolProfile,
  receiptCount,
  onSave,
  onCancelEdit,
  onPreviewChange,
}) => {
  const [formData, setFormData] = useState<Receipt>(() => {
    if (initialData) return initialData;

    const todayStr = new Date().toISOString().slice(0, 10);
    const initialNo = generateNoKuitansi(receiptCount);
    const defaultAmount = 2500000;

    return {
      id: `kwt-${Date.now()}`,
      noKuitansi: initialNo,
      telahDiterimaDari: 'Bendahara BOS Provinsi / Komite Sekolah',
      jumlahUang: defaultAmount,
      terbilang: terbilang(defaultAmount),
      tempat: schoolProfile.kota || 'Jakarta',
      tanggal: todayStr,
      untukPembayaran: 'Pembayaran Pengadaan Buku Referensi & Modul Pembelajaran Siswa Semester Ganjil',
      setujuDibayarKepalaSekolah: schoolProfile.kepalaSekolahDefault || 'Drs. H. Bambang Sudarsono, M.M',
      nipKepalaSekolah: schoolProfile.nipKepalaSekolahDefault || '19720415 199802 1 002',
      bendaharaSekolah: schoolProfile.bendaharaDefault || 'Hj. Siti Nurhaliza, S.E, Ak',
      nipBendahara: schoolProfile.nipBendaharaDefault || '19810820 200604 2 007',
      panitiaPelaksana: schoolProfile.panitiaDefault || 'Ahmad Fauzi, S.Pd',
      nipPanitia: schoolProfile.nipPanitiaDefault || '19890210 201503 1 004',
      jabatanPanitia: schoolProfile.jabatanPanitiaDefault || 'Ketua Panitia Pelaksana',
      materai: defaultAmount >= 5000000,
      syncStatus: 'local',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const [formattedNominalDisplay, setFormattedNominalDisplay] = useState<string>(
    formatNominal(formData.jumlahUang)
  );

  // Sync to parent preview on state update
  useEffect(() => {
    if (onPreviewChange) {
      onPreviewChange(formData);
    }
  }, [formData, onPreviewChange]);

  // Handle amount change and auto calculate terbilang
  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const num = parseNominal(rawVal);
    const calculatedTerbilang = terbilang(num);

    setFormattedNominalDisplay(formatNominal(num));
    setFormData((prev) => ({
      ...prev,
      jumlahUang: num,
      terbilang: calculatedTerbilang,
      materai: num >= 5000000 ? true : prev.materai,
    }));
  };

  const handleGenerateNo = () => {
    const newNo = generateNoKuitansi(receiptCount);
    setFormData((prev) => ({ ...prev, noKuitansi: newNo }));
  };

  // Quick action to copy "Telah Diterima Dari" into Kepala Sekolah or Bendahara
  const handleCopyFromTelahDiterima = (target: 'kepsek' | 'bendahara') => {
    if (target === 'kepsek') {
      setFormData((prev) => ({
        ...prev,
        setujuDibayarKepalaSekolah: prev.telahDiterimaDari,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        bendaharaSekolah: prev.telahDiterimaDari,
      }));
    }
  };

  // Reset to default school profile officials
  const handleResetOfficials = () => {
    setFormData((prev) => ({
      ...prev,
      setujuDibayarKepalaSekolah: schoolProfile.kepalaSekolahDefault,
      nipKepalaSekolah: schoolProfile.nipKepalaSekolahDefault,
      bendaharaSekolah: schoolProfile.bendaharaDefault,
      nipBendahara: schoolProfile.nipBendaharaDefault,
    }));
  };

  const handleSubmit = (e: React.FormEvent, shouldPrint: boolean = false) => {
    e.preventDefault();
    onSave(formData, shouldPrint);
  };

  const quickDescriptions = [
    'Pengadaan ATK, Modul Ajar, dan Bahan Praktikum Pembelajaran',
    'Honorarium Panitia Pelaksana Kegiatan Asesmen Standar Pendidikan',
    'Pemeliharaan Sarana dan Prasarana Ruang Kelas & Laboratorium',
    'Penyediaan Konsumsi Rapat Koordinasi Dewan Pendidik & Tenaga Kependidikan',
    'Langganan Daya, Jasa Internet & Keperluan Operasional Sekolah',
  ];

  return (
    <form
      onSubmit={(e) => handleSubmit(e, false)}
      className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6"
    >
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            {initialData ? 'Ubah Data Kuitansi' : 'Form Input Pencatatan Kuitansi Baru'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lengkapi data isian di bawah ini. Nilai terbilang dihitung otomatis secara akurat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {initialData && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Batal Edit
            </button>
          )}
          <button
            type="button"
            onClick={handleGenerateNo}
            className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition flex items-center gap-1.5"
            title="Buat Nomor Kuitansi Otomatis"
          >
            <Sparkles className="w-3.5 h-3.5" />
            No. Baru
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Nomor Kuitansi */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            No. Kuitansi <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={formData.noKuitansi}
              onChange={(e) => setFormData({ ...formData, noKuitansi: e.target.value })}
              placeholder="Contoh: KWT/2026/IX/001"
              className="w-full px-3.5 py-2 text-sm font-mono font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
            />
          </div>
        </div>

        {/* Tanggal & Tempat */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tempat <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={formData.tempat}
                onChange={(e) => setFormData({ ...formData, tempat: e.target.value })}
                placeholder="Kota/Kabupaten"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tanggal <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="date"
                required
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* TELAH DITERIMA DARI */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Telah Diterima Dari <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] text-slate-500">Pemberi dana / instansi pembayar</span>
        </div>
        <div className="relative">
          <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            required
            value={formData.telahDiterimaDari}
            onChange={(e) => setFormData({ ...formData, telahDiterimaDari: e.target.value })}
            placeholder="Contoh: Bendahara BOS Dinas Pendidikan / Komite Sekolah / Nama Perusahaan"
            className="w-full pl-9 pr-3 py-2.5 text-sm font-medium bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
          />
        </div>
      </div>

      {/* JUMLAH UANG & TERBILANG OTOMATIS */}
      <div className="bg-gradient-to-br from-indigo-50/70 to-slate-50 border border-indigo-100 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-indigo-600" />
              Jumlah Uang (Rp) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 font-bold text-slate-500 text-sm">Rp</span>
              <input
                type="text"
                required
                value={formattedNominalDisplay}
                onChange={handleNominalChange}
                placeholder="0"
                className="w-full pl-10 pr-3 py-2 text-base font-mono font-bold text-slate-900 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Ketik angka, titik ribuan otomatis tersusun.
            </p>
          </div>

          <div className="md:col-span-8">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider">
                Uang Sejumlah (Terbilang Otomatis) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    terbilang: terbilang(prev.jumlahUang),
                  }))
                }
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Refresh Terbilang
              </button>
            </div>
            <div className="relative">
              <textarea
                rows={2}
                required
                value={formData.terbilang}
                onChange={(e) => setFormData({ ...formData, terbilang: e.target.value })}
                className="w-full px-3 py-2 text-sm font-serif italic font-semibold text-indigo-950 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="Otomatis terisi kalimat terbilang..."
              />
            </div>
            <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Terbilang di-generate otomatis dari nilai jumlah uang.
            </p>
          </div>
        </div>
      </div>

      {/* UNTUK PEMBAYARAN */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Untuk Pembayaran <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] text-slate-500">Rincian keperluan pengeluaran dana</span>
        </div>
        <textarea
          rows={3}
          required
          value={formData.untukPembayaran}
          onChange={(e) => setFormData({ ...formData, untukPembayaran: e.target.value })}
          placeholder="Tuliskan keterangan lengkap keperluan pembayaran..."
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
        />

        {/* Preset Keperluan */}
        <div className="mt-2 flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] text-slate-500 font-medium mr-1">Contoh Cepat:</span>
          {quickDescriptions.slice(0, 3).map((desc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setFormData({ ...formData, untukPembayaran: desc })}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded transition truncate max-w-xs"
            >
              {desc}
            </button>
          ))}
        </div>
      </div>

      {/* PEJABAT PENANDATANGAN (KEPALA SEKOLAH, BENDAHARA, DAN PANITIA PELAKSANA) */}
      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Data Penandatangan Kuitansi (3 Pihak)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetOfficials}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium transition"
            >
              Pakai Profil Sekolah
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Kolom 1: Setuju Dibayar Kepala Sekolah */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                1. Kepala Sekolah
              </span>
              <button
                type="button"
                onClick={() => handleCopyFromTelahDiterima('kepsek')}
                className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1"
                title="Ambil dari kolom 'Telah Diterima Dari'"
              >
                <Copy className="w-3 h-3" /> Ambil dr Diterima Dari
              </button>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-semibold">Nama Kepala Sekolah</label>
              <input
                type="text"
                required
                value={formData.setujuDibayarKepalaSekolah}
                onChange={(e) =>
                  setFormData({ ...formData, setujuDibayarKepalaSekolah: e.target.value })
                }
                placeholder="Nama Kepala Sekolah"
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-semibold">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={formData.nipKepalaSekolah || ''}
                onChange={(e) => setFormData({ ...formData, nipKepalaSekolah: e.target.value })}
                placeholder="NIP: 19xxxxxxxxxxxxxx"
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded focus:bg-white outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 italic">Posisi tanda tangan: Kiri (Setuju Dibayar)</p>
          </div>

          {/* Kolom 2: Bendahara Sekolah */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                2. Bendahara Sekolah
              </span>
              <button
                type="button"
                onClick={() => handleCopyFromTelahDiterima('bendahara')}
                className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1"
                title="Ambil dari kolom 'Telah Diterima Dari'"
              >
                <Copy className="w-3 h-3" /> Ambil dr Diterima Dari
              </button>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-semibold">Nama Bendahara</label>
              <input
                type="text"
                required
                value={formData.bendaharaSekolah}
                onChange={(e) => setFormData({ ...formData, bendaharaSekolah: e.target.value })}
                placeholder="Nama Bendahara"
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-semibold">NIP Bendahara</label>
              <input
                type="text"
                value={formData.nipBendahara || ''}
                onChange={(e) => setFormData({ ...formData, nipBendahara: e.target.value })}
                placeholder="NIP: 19xxxxxxxxxxxxxx"
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded focus:bg-white outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 italic">Posisi tanda tangan: Tengah (Lunas Dibayar)</p>
          </div>

          {/* Kolom 3: Panitia Pelaksana / Penerima Uang */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                3. Panitia Pelaksana
              </span>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-semibold">Nama Panitia / Penerima</label>
              <input
                type="text"
                required
                value={formData.panitiaPelaksana}
                onChange={(e) => setFormData({ ...formData, panitiaPelaksana: e.target.value })}
                placeholder="Nama Penerima / Panitia"
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-semibold">Jabatan / NIP</label>
              <input
                type="text"
                value={formData.jabatanPanitia || ''}
                onChange={(e) => setFormData({ ...formData, jabatanPanitia: e.target.value })}
                placeholder="Ketua Panitia Kegiatan..."
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white outline-none focus:ring-1 focus:ring-indigo-500 mb-1"
              />
              <input
                type="text"
                value={formData.nipPanitia || ''}
                onChange={(e) => setFormData({ ...formData, nipPanitia: e.target.value })}
                placeholder="NIP / No. Identitas (opsional)"
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded focus:bg-white outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 italic">Posisi tanda tangan: Kanan (Penerima)</p>
          </div>
        </div>

        {/* Bea Materai Checkbox */}
        <div className="pt-2 flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
            <input
              type="checkbox"
              checked={formData.materai}
              onChange={(e) => setFormData({ ...formData, materai: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <span className="font-medium">
              Sertakan kotak Bea Materai (Rp 10.000) pada kolom tanda tangan penerima
            </span>
          </label>
          {formData.jumlahUang >= 5000000 && (
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
              Rekomendasi aturan bea meterai: nominal ≥ Rp 5.000.000
            </span>
          )}
        </div>
      </div>

      {/* BUTTONS ACTION */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={() => {
            const nextNo = generateNoKuitansi(receiptCount + 1);
            setFormData({
              id: `kwt-${Date.now()}`,
              noKuitansi: nextNo,
              telahDiterimaDari: '',
              jumlahUang: 0,
              terbilang: 'Nol Rupiah',
              tempat: schoolProfile.kota || 'Jakarta',
              tanggal: new Date().toISOString().slice(0, 10),
              untukPembayaran: '',
              setujuDibayarKepalaSekolah: schoolProfile.kepalaSekolahDefault,
              nipKepalaSekolah: schoolProfile.nipKepalaSekolahDefault,
              bendaharaSekolah: schoolProfile.bendaharaDefault,
              nipBendahara: schoolProfile.nipBendaharaDefault,
              panitiaPelaksana: '',
              nipPanitia: '',
              jabatanPanitia: 'Panitia Pelaksana',
              materai: false,
              syncStatus: 'local',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            setFormattedNominalDisplay('0');
          }}
          className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
        >
          Kosongkan Form
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition flex items-center justify-center gap-2 shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Simpan &amp; Cetak PDF
          </button>

          <button
            type="submit"
            className="flex-1 sm:flex-initial px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            {initialData ? 'Simpan Perubahan' : 'Simpan Kuitansi'}
          </button>
        </div>
      </div>
    </form>
  );
};
