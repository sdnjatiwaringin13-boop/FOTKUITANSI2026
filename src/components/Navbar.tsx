import React from 'react';
import {
  Receipt as ReceiptIcon,
  Building2,
  FileSpreadsheet,
  Cloud,
  CheckCircle2,
  PlusCircle,
  Database,
} from 'lucide-react';
import { CloudConfig, SchoolProfile } from '../types';

interface NavbarProps {
  schoolProfile: SchoolProfile;
  cloudConfig: CloudConfig;
  receiptCount: number;
  onOpenCloudModal: () => void;
  onOpenSchoolModal: () => void;
  onNewReceipt: () => void;
  activeTab: 'form' | 'list' | 'preview';
  setActiveTab: (tab: 'form' | 'list' | 'preview') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  schoolProfile,
  cloudConfig,
  receiptCount,
  onOpenCloudModal,
  onOpenSchoolModal,
  onNewReceipt,
  activeTab,
  setActiveTab,
}) => {
  const isCloudConnected = Boolean(cloudConfig.appsScriptUrl && cloudConfig.appsScriptUrl.trim());

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & School info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-900/30">
              <ReceiptIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  Kuitansi Digital
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                  Resmi
                </span>
              </div>
              <div className="text-xs text-slate-300 truncate max-w-[200px] sm:max-w-xs font-serif">
                {schoolProfile.namaSekolah || 'Sistem Pencatatan Kuitansi Sekolah'}
              </div>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`px-4 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'form'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Input Kuitansi
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`px-4 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'list'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Riwayat Transaksi
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-700 text-[10px] text-slate-300 font-mono">
                {receiptCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <ReceiptIcon className="w-3.5 h-3.5" />
              Pratinjau Cetak
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            {/* Cloud sync status pill */}
            <button
              type="button"
              onClick={onOpenCloudModal}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                isCloudConnected
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
              title={
                isCloudConnected
                  ? 'Google Spreadsheet Cloud Terhubung'
                  : 'Hubungkan ke Google Spreadsheet & Apps Script'
              }
            >
              {isCloudConnected ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden lg:inline">Sheets Sync: Aktif</span>
                  <span className="lg:hidden">Cloud</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden lg:inline">Hubungkan Spreadsheet</span>
                  <span className="lg:hidden">Cloud</span>
                </>
              )}
            </button>

            {/* School Profile Button */}
            <button
              type="button"
              onClick={onOpenSchoolModal}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
              title="Atur Profil Sekolah & Kop Surat"
            >
              <Building2 className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline">Kop Sekolah</span>
            </button>

            {/* Buat Kuitansi Baru Button */}
            <button
              type="button"
              onClick={onNewReceipt}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Buat Kuitansi</span>
              <span className="sm:hidden">Baru</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub Navigation */}
        <div className="flex md:hidden items-center justify-around border-t border-slate-800 py-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`px-3 py-1 rounded font-semibold ${
              activeTab === 'form' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Form Input
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1 rounded font-semibold flex items-center gap-1 ${
              activeTab === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Riwayat ({receiptCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded font-semibold ${
              activeTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Pratinjau Cetak
          </button>
        </div>
      </div>
    </header>
  );
};
