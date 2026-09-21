import React, { useState } from 'react';
import { X, Building2, Save, Upload, RotateCcw } from 'lucide-react';
import { SchoolProfile } from '../types';
import { DEFAULT_SCHOOL_PROFILE } from '../services/storage';

interface SchoolProfileModalProps {
  profile: SchoolProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: SchoolProfile) => void;
}

export const SchoolProfileModal: React.FC<SchoolProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<SchoolProfile>(profile);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleResetToDefault = () => {
    if (confirm('Kembalikan profil sekolah ke setelan awal standar?')) {
      setFormData(DEFAULT_SCHOOL_PROFILE);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({
            ...prev,
            logoUrl: event.target?.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Profil Sekolah &amp; Kop Surat Kuitansi</h2>
              <p className="text-xs text-slate-300">
                Informasi ini tercetak otomatis pada header kuitansi resmi &amp; penandatangan default
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Instansi Induk (Dinas / Yayasan)
            </label>
            <textarea
              rows={2}
              value={formData.instansiInduk}
              onChange={(e) => setFormData({ ...formData, instansiInduk: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Contoh: PEMERINTAH PROVINSI DKI JAKARTA / DINAS PENDIDIKAN"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Nama Sekolah / Satuan Pendidikan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.namaSekolah}
              onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
              className="w-full px-3 py-2 text-sm font-bold bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Contoh: SMP NEGERI 1 TELADAN BANGSA"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Alamat Lengkap Sekolah
              </label>
              <input
                type="text"
                value={formData.alamatSekolah}
                onChange={(e) => setFormData({ ...formData, alamatSekolah: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Kota / Kabupaten (Tempat Kuitansi)
              </label>
              <input
                type="text"
                value={formData.kota}
                onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Jakarta"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Nomor Telepon
              </label>
              <input
                type="text"
                value={formData.telepon}
                onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Email Sekolah
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Pejabat Default */}
          <div className="pt-3 border-t border-slate-200">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider mb-2">
              Pejabat Sekolah Default (Otomatis Mengisi Form)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nama Kepala Sekolah</label>
                <input
                  type="text"
                  value={formData.kepalaSekolahDefault}
                  onChange={(e) => setFormData({ ...formData, kepalaSekolahDefault: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">NIP Kepala Sekolah</label>
                <input
                  type="text"
                  value={formData.nipKepalaSekolahDefault}
                  onChange={(e) => setFormData({ ...formData, nipKepalaSekolahDefault: e.target.value })}
                  className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-300 rounded-lg focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nama Bendahara Sekolah</label>
                <input
                  type="text"
                  value={formData.bendaharaDefault}
                  onChange={(e) => setFormData({ ...formData, bendaharaDefault: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">NIP Bendahara Sekolah</label>
                <input
                  type="text"
                  value={formData.nipBendaharaDefault}
                  onChange={(e) => setFormData({ ...formData, nipBendaharaDefault: e.target.value })}
                  className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-300 rounded-lg focus:bg-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="pt-3 border-t border-slate-200">
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Logo Sekolah pada Kop Kuitansi
            </label>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded border border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-xl">🏫</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Format PNG / JPG transparan (disarankan rasio 1:1)
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-200">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Setel Ulang
            </button>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-4 h-4" />
              Simpan Profil Sekolah
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
