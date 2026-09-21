import React from 'react';
import { Receipt, SchoolProfile } from '../types';
import { formatNominal, formatTanggalIndo } from '../utils/format';

interface ReceiptDocumentProps {
  receipt: Receipt;
  schoolProfile: SchoolProfile;
  id?: string;
  isCompact?: boolean;
}

export const ReceiptDocument: React.FC<ReceiptDocumentProps> = ({
  receipt,
  schoolProfile,
  id = 'receipt-print-area',
  isCompact = false,
}) => {
  const tanggalFormat = formatTanggalIndo(receipt.tanggal);
  const showMaterai = receipt.materai || receipt.jumlahUang >= 5000000;

  return (
    <div
      id={id}
      className={`bg-white text-slate-900 border-2 border-slate-800 shadow-sm mx-auto font-sans relative ${
        isCompact ? 'p-6 max-w-2xl text-xs' : 'p-8 max-w-4xl text-sm'
      }`}
      style={{
        boxSizing: 'border-box',
        width: '100%',
        minHeight: isCompact ? 'auto' : '520px',
      }}
    >
      {/* Decorative Outer Border Double Line */}
      <div className="border border-slate-700 p-5 rounded-none relative">
        {/* Kop Surat Resmi Sekolah */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 mb-1">
          <div className="flex items-center gap-4 w-full">
            {/* Logo placeholder or emblem */}
            <div className="w-16 h-16 shrink-0 flex items-center justify-center border-2 border-slate-800 rounded bg-slate-50 text-slate-700">
              {schoolProfile.logoUrl ? (
                <img
                  src={schoolProfile.logoUrl}
                  alt="Logo Sekolah"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <div className="text-center font-bold text-[10px] leading-tight">
                  <span className="block text-base">🏫</span>
                  TUT WURI
                </div>
              )}
            </div>

            <div className="text-center flex-1 pr-12">
              <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-700 leading-tight">
                {schoolProfile.instansiInduk || 'PEMERINTAH DAERAH PROVINSI / DINAS PENDIDIKAN'}
              </div>
              <div className="text-lg font-extrabold uppercase tracking-wide text-slate-900 font-serif leading-snug">
                {schoolProfile.namaSekolah || 'SEKOLAH NEGERI / SWASTA'}
              </div>
              <div className="text-[11px] text-slate-600 leading-tight mt-0.5">
                {schoolProfile.alamatSekolah}
              </div>
            </div>
          </div>
        </div>
        {/* Garis batas tipis kop surat */}
        <div className="border-b border-slate-900 mb-4 -mt-0.5"></div>

        {/* Judul Kuitansi & Nomor */}
        <div className="flex items-end justify-between mb-5">
          <div className="border border-slate-800 bg-slate-50 px-3 py-1 font-mono text-xs font-semibold text-slate-700">
            Tahun Anggaran : {new Date(receipt.tanggal || Date.now()).getFullYear()}
          </div>

          <div className="text-center">
            <h1 className="text-xl font-black uppercase tracking-[0.2em] text-slate-900 border-b-2 border-slate-900 pb-0.5 inline-block">
              K U I T A N S I
            </h1>
            <div className="text-xs font-medium text-slate-700 mt-1 font-mono">
              Nomor: <span className="font-bold text-slate-900">{receipt.noKuitansi || '-'}</span>
            </div>
          </div>

          <div className="w-24 text-right text-[11px] text-slate-500 font-mono">
            Lembar Asli
          </div>
        </div>

        {/* Form Isian Kuitansi (Standar Akuntansi & Administrasi Sekolah) */}
        <div className="space-y-3 mb-6">
          {/* Baris 1: Telah Diterima Dari */}
          <div className="grid grid-cols-12 gap-2 items-baseline">
            <div className="col-span-3 font-semibold text-slate-800 uppercase text-xs tracking-wider">
              Telah Diterima Dari
            </div>
            <div className="col-span-1 text-center font-bold">:</div>
            <div className="col-span-8 font-semibold text-slate-900 border-b border-dotted border-slate-400 pb-1">
              {receipt.telahDiterimaDari || '(Nama / Instansi Pengirim Dana)'}
            </div>
          </div>

          {/* Baris 2: Uang Sejumlah (Terbilang) */}
          <div className="grid grid-cols-12 gap-2 items-baseline">
            <div className="col-span-3 font-semibold text-slate-800 uppercase text-xs tracking-wider">
              Uang Sejumlah
            </div>
            <div className="col-span-1 text-center font-bold">:</div>
            <div className="col-span-8 bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-sm font-serif italic font-bold text-slate-900 text-[13px] leading-relaxed">
              &ldquo; {receipt.terbilang || 'Nol Rupiah'} &rdquo;
            </div>
          </div>

          {/* Baris 3: Untuk Pembayaran */}
          <div className="grid grid-cols-12 gap-2 items-baseline">
            <div className="col-span-3 font-semibold text-slate-800 uppercase text-xs tracking-wider">
              Untuk Pembayaran
            </div>
            <div className="col-span-1 text-center font-bold">:</div>
            <div className="col-span-8 text-slate-900 border-b border-dotted border-slate-400 pb-1 leading-relaxed">
              {receipt.untukPembayaran || '(Rincian transaksi / keperluan pembayaran)'}
            </div>
          </div>
        </div>

        {/* Bagian Nominal Box & Tanggal Tempat */}
        <div className="flex items-center justify-between my-4 pt-2 pb-3 border-y border-slate-200">
          {/* Kotak Jumlah Uang Besar */}
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-slate-100 to-slate-50 border-2 border-slate-800 px-4 py-2 rounded-sm shadow-inner">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Jumlah Rp.
            </span>
            <span className="text-xl font-black font-mono tracking-tight text-slate-900">
              {formatNominal(receipt.jumlahUang)},-
            </span>
          </div>

          {/* Tanggal dan Tempat */}
          <div className="text-right text-xs font-medium text-slate-800">
            <span>{receipt.tempat || schoolProfile.kota || 'Jakarta'}</span>,{' '}
            <span>{tanggalFormat || '—'}</span>
          </div>
        </div>

        {/* Kolom Tanda Tangan: 3 Kolom Sesuai Instruksi
            - Kiri: Kepala Sekolah (Setuju Dibayar)
            - Tengah: Bendahara Sekolah (Lunas Dibayar)
            - Kanan: Panitia Pelaksana / Penerima Uang
        */}
        <div className="grid grid-cols-3 gap-3 pt-3 text-center text-xs">
          {/* Kolom Kiri: Setuju Dibayar Kepala Sekolah */}
          <div className="flex flex-col justify-between h-44 px-2">
            <div>
              <p className="font-semibold text-slate-700">Setuju Dibayar,</p>
              <p className="font-bold text-slate-900 uppercase">Kepala Sekolah</p>
            </div>
            <div className="mt-auto">
              <div className="font-bold text-slate-900 underline uppercase tracking-wide">
                {receipt.setujuDibayarKepalaSekolah || schoolProfile.kepalaSekolahDefault || '(Nama Kepala Sekolah)'}
              </div>
              <div className="text-[11px] text-slate-600 font-mono">
                NIP. {receipt.nipKepalaSekolah || schoolProfile.nipKepalaSekolahDefault || '.........................'}
              </div>
            </div>
          </div>

          {/* Kolom Tengah: Bendahara Sekolah */}
          <div className="flex flex-col justify-between h-44 px-2">
            <div>
              <p className="font-semibold text-slate-700">Lunas Dibayar,</p>
              <p className="font-bold text-slate-900 uppercase">Bendahara Sekolah</p>
            </div>
            <div className="mt-auto">
              <div className="font-bold text-slate-900 underline uppercase tracking-wide">
                {receipt.bendaharaSekolah || schoolProfile.bendaharaDefault || '(Nama Bendahara Sekolah)'}
              </div>
              <div className="text-[11px] text-slate-600 font-mono">
                NIP. {receipt.nipBendahara || schoolProfile.nipBendaharaDefault || '.........................'}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Panitia Pelaksana / Penerima */}
          <div className="flex flex-col justify-between h-44 px-2 relative">
            <div>
              <p className="font-semibold text-slate-700">Penerima Uang,</p>
              <p className="font-bold text-slate-900 uppercase">
                {receipt.jabatanPanitia || 'Panitia Pelaksana'}
              </p>
            </div>

            {/* Kotak Materai 10.000 jika disetujui / nominal besar */}
            {showMaterai && (
              <div className="absolute left-1/2 top-14 -translate-x-1/2 w-20 h-10 border border-dashed border-slate-400 flex flex-col items-center justify-center bg-slate-50/70 text-[9px] text-slate-500 font-mono">
                <span>MATERAI</span>
                <span>Rp 10.000</span>
              </div>
            )}

            <div className="mt-auto">
              <div className="font-bold text-slate-900 underline uppercase tracking-wide">
                {receipt.panitiaPelaksana || '(Nama Panitia Pelaksana)'}
              </div>
              <div className="text-[11px] text-slate-600 font-mono">
                {receipt.nipPanitia ? `NIP. ${receipt.nipPanitia}` : '(Tanda Tangan & Nama Terang)'}
              </div>
            </div>
          </div>
        </div>

        {/* Catatan Kaki / Security Stamp line */}
        <div className="mt-5 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>* Kuitansi ini sah sebagai bukti pembayaran yang sah dan dapat dipertanggungjawabkan</span>
          <span></span>
        </div>
      </div>
    </div>
  );
};
