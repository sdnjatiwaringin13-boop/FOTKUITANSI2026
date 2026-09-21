import React, { useState } from 'react';
import {
  X,
  Cloud,
  FileSpreadsheet,
  Copy,
  Check,
  ExternalLink,
  Save,
  RefreshCw,
  HelpCircle,
  Code2,
  Settings,
  Layers,
} from 'lucide-react';
import { CloudConfig, Receipt } from '../types';
import { APPS_SCRIPT_TEMPLATE } from '../services/cloudSpreadsheet';

interface CloudSpreadsheetModalProps {
  config: CloudConfig;
  isOpen: boolean;
  receipts: Receipt[];
  onClose: () => void;
  onSaveConfig: (config: CloudConfig) => void;
  onSyncAll: () => void;
  isSyncing: boolean;
  onExportCSV: () => void;
}

export const CloudSpreadsheetModal: React.FC<CloudSpreadsheetModalProps> = ({
  config,
  isOpen,
  receipts,
  onClose,
  onSaveConfig,
  onSyncAll,
  isSyncing,
  onExportCSV,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'script' | 'guide'>('config');
  const [formData, setFormData] = useState<CloudConfig>(config);
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    onClose();
  };

  const handleTestConnection = async () => {
    if (!formData.appsScriptUrl.trim()) {
      alert('Masukkan Web App URL terlebih dahulu.');
      return;
    }

    setTestStatus('testing');
    try {
      // In browser, test fetch with no-cors or standard GET
      await fetch(formData.appsScriptUrl, { method: 'GET', mode: 'no-cors' });
      setTestStatus('success');
      setTimeout(() => setTestStatus('idle'), 4000);
    } catch (e) {
      console.error(e);
      setTestStatus('failed');
      setTimeout(() => setTestStatus('idle'), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Integrasi Cloud Google Spreadsheet &amp; Apps Script
              </h2>
              <p className="text-xs text-emerald-200">
                Otomatisasi pencatatan data kuitansi langsung ke Google Sheets secara real-time
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Pengaturan Webhook Cloud
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('script')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'script'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Salin Kode Apps Script (Code.gs)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Panduan 3 Menit
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'config' && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 leading-relaxed">
                <p className="font-bold mb-1">
                  Sinkronisasi Otomatis Google Sheets:
                </p>
                Kuitansi yang Anda simpan akan dikirimkan otomatis ke spreadsheet sekolah Anda melalui Google Apps Script Web App URL.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Google Apps Script Web App URL <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.appsScriptUrl}
                    onChange={(e) => setFormData({ ...formData, appsScriptUrl: e.target.value })}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Dapatkan URL ini dari menu <b>Deploy &gt; New deployment &gt; Web app</b> di Google Spreadsheet Anda.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tautan Google Spreadsheet Anda (Opsional)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.spreadsheetUrl}
                    onChange={(e) => setFormData({ ...formData, spreadsheetUrl: e.target.value })}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Untuk tombol pintas buka spreadsheet langsung dari aplikasi ini.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.autoSync}
                    onChange={(e) => setFormData({ ...formData, autoSync: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="font-semibold">
                    Otomatis sinkronkan setiap kuitansi baru yang disimpan
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testStatus === 'testing' || !formData.appsScriptUrl}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                    {testStatus === 'testing'
                      ? 'Menguji...'
                      : testStatus === 'success'
                      ? 'Terkoneksi!'
                      : 'Uji Endpoint'}
                  </button>

                  {formData.spreadsheetUrl && (
                    <a
                      href={formData.spreadsheetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Buka Spreadsheet
                    </a>
                  )}
                </div>

                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  Simpan Pengaturan
                </button>
              </div>
            </form>
          )}

          {activeTab === 'script' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Script Google Apps Script (Code.gs)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Salin script ini, lalu tempelkan ke menu Ekstensi &gt; Apps Script di Google Sheets.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition flex items-center gap-1.5 shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Salin Semua Kode
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-xl overflow-x-auto max-h-80 leading-relaxed border border-slate-800 selection:bg-emerald-700 selection:text-white">
                  {APPS_SCRIPT_TEMPLATE}
                </pre>
              </div>

              <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
                <span>* Script sudah mencakup pembuatan tabel otomatis, format mata uang, dan tanggal</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('guide')}
                  className="text-emerald-700 hover:underline font-semibold"
                >
                  Lihat Langkah Deploy &rarr;
                </button>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  Langkah Mudah Mengaktifkan Cloud Google Sheets (3 Menit):
                </h3>

                <ol className="list-decimal pl-5 space-y-2.5">
                  <li>
                    <b>Buat Spreadsheet Baru:</b> Buka Google Drive (drive.google.com), klik <i>+ Baru &gt; Google Spreadsheet</i>. Beri nama misal <i>&quot;Buku Kuitansi Sekolah 2026&quot;</i>.
                  </li>
                  <li>
                    <b>Buka Apps Script:</b> Di spreadsheet tersebut, klik menu <b>Ekstensi</b> di bar atas, lalu pilih <b>Apps Script</b>.
                  </li>
                  <li>
                    <b>Tempelkan Kode:</b> Hapus tulisan <code>function myFunction() &#123;&#125;</code> yang ada di layar, lalu <b>Paste</b> seluruh script dari tab <i>&quot;Salin Kode Apps Script&quot;</i> di atas. Klik ikon disket (Simpan).
                  </li>
                  <li>
                    <b>Deploy sebagai Web App:</b>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                      <li>Klik tombol biru <b>Deploy (Terapkan)</b> di kanan atas &gt; <b>New deployment (Penerapan baru)</b>.</li>
                      <li>Pilih jenis ikon gerigi: <b>Web app (Aplikasi Web)</b>.</li>
                      <li>Isi Deskripsi: <i>Kuitansi API</i>.</li>
                      <li>Setel <b>Execute as</b>: <i>Me (email Anda)</i>.</li>
                      <li>Setel <b>Who has access</b>: <b>Anyone (Siapa saja)</b>. <i>(Wajib agar WebApp bisa mengirimkan data)</i>.</li>
                      <li>Klik <b>Deploy</b>, setujui izin akses Google akun Anda jika diminta (klik Advanced &gt; Go to Untitled Project &gt; Allow).</li>
                    </ul>
                  </li>
                  <li>
                    <b>Salin Web App URL:</b> Salin URL yang dihasilkan (berakhiran <code>/exec</code>), lalu tempelkan di tab <b>Pengaturan Webhook Cloud</b> aplikasi ini!
                  </li>
                </ol>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Apakah data tetap tersimpan jika belum setup Google Sheets?</p>
                  <p className="mt-0.5 text-[11px] text-amber-800">
                    Ya, 100% aman! Aplikasi ini memiliki database internal browser (LocalStorage) yang langsung menyimpan semua transaksi kuitansi Anda. Anda juga bisa langsung men-download file CSV untuk diimpor ke spreadsheet kapan saja.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs px-6">
          <button
            type="button"
            onClick={onExportCSV}
            className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Ekspor Langsung File CSV Kuitansi
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-md transition font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
