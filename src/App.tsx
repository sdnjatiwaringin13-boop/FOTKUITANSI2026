import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Sparkles,
  Layers,
  Database,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { Receipt, SchoolProfile, CloudConfig } from './types';
import { storage } from './services/storage';
import {
  syncReceiptToAppsScript,
  exportReceiptsToCSV,
} from './services/cloudSpreadsheet';
import { generateNoKuitansi } from './utils/format';
import { Navbar } from './components/Navbar';
import { ReceiptForm } from './components/ReceiptForm';
import { ReceiptList } from './components/ReceiptList';
import { ReceiptDocument } from './components/ReceiptDocument';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import { CloudSpreadsheetModal } from './components/CloudSpreadsheetModal';
import { SchoolProfileModal } from './components/SchoolProfileModal';
import { downloadReceiptPDF, triggerBrowserPrint } from './utils/pdfGenerator';

export default function App() {
  const [receipts, setReceipts] = useState<Receipt[]>(() => storage.getReceipts());
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() =>
    storage.getSchoolProfile()
  );
  const [cloudConfig, setCloudConfig] = useState<CloudConfig>(() =>
    storage.getCloudConfig()
  );

  const [activeTab, setActiveTab] = useState<'form' | 'list' | 'preview'>('form');
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [activeReceiptForPrint, setActiveReceiptForPrint] = useState<Receipt | null>(
    () => receipts[0] || null
  );
  const [livePreviewReceipt, setLivePreviewReceipt] = useState<Receipt | null>(null);

  // Modals
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Keep preview receipt synced
  useEffect(() => {
    if (!activeReceiptForPrint && receipts.length > 0) {
      setActiveReceiptForPrint(receipts[0]);
    }
  }, [receipts, activeReceiptForPrint]);

  // Handle Save (Create / Update)
  const handleSaveReceipt = async (receipt: Receipt, shouldPrint: boolean = false) => {
    let receiptToSave = { ...receipt };

    // If cloud auto-sync is enabled, try syncing in background
    if (cloudConfig.autoSync && cloudConfig.appsScriptUrl) {
      const syncResult = await syncReceiptToAppsScript(receiptToSave, cloudConfig.appsScriptUrl);
      if (syncResult.success) {
        receiptToSave.syncStatus = 'synced';
        receiptToSave.syncedAt = new Date().toISOString();
      }
    }

    const updatedList = storage.saveReceipt(receiptToSave);
    setReceipts(updatedList);
    setEditingReceipt(null);
    setActiveReceiptForPrint(receiptToSave);

    showToast(
      `Kuitansi No. ${receiptToSave.noKuitansi} berhasil disimpan ke database!`,
      'success'
    );

    if (shouldPrint) {
      setIsPrintModalOpen(true);
    }
  };

  // Delete Receipt
  const handleDeleteReceipt = (id: string) => {
    const updated = storage.deleteReceipt(id);
    setReceipts(updated);
    if (activeReceiptForPrint?.id === id) {
      setActiveReceiptForPrint(updated[0] || null);
    }
    showToast('Kuitansi berhasil dihapus dari database.', 'info');
  };

  // Duplicate Receipt
  const handleDuplicateReceipt = (receipt: Receipt) => {
    const nextNo = generateNoKuitansi(receipts.length + 1);
    const duplicated: Receipt = {
      ...receipt,
      id: `kwt-${Date.now()}`,
      noKuitansi: nextNo,
      tanggal: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'local',
      syncedAt: null,
    };

    setEditingReceipt(duplicated);
    setActiveTab('form');
    showToast(`Kuitansi diduplikasi sebagai No. ${nextNo}. Silakan periksa atau ubah data.`, 'info');
  };

  // Sync Single Receipt to Cloud
  const handleSyncReceipt = async (receipt: Receipt) => {
    if (!cloudConfig.appsScriptUrl) {
      setIsCloudModalOpen(true);
      showToast('Harap atur URL Google Apps Script terlebih dahulu.', 'info');
      return;
    }

    setIsSyncing(true);
    const result = await syncReceiptToAppsScript(receipt, cloudConfig.appsScriptUrl);
    setIsSyncing(false);

    if (result.success) {
      const updatedReceipt: Receipt = {
        ...receipt,
        syncStatus: 'synced',
        syncedAt: new Date().toISOString(),
      };
      const updatedList = storage.saveReceipt(updatedReceipt);
      setReceipts(updatedList);
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  // Sync All Receipts to Cloud
  const handleSyncAll = async () => {
    if (!cloudConfig.appsScriptUrl) {
      setIsCloudModalOpen(true);
      showToast('Harap atur URL Google Apps Script terlebih dahulu.', 'info');
      return;
    }

    if (receipts.length === 0) {
      showToast('Tidak ada kuitansi untuk disinkronkan.', 'info');
      return;
    }

    setIsSyncing(true);
    let successCount = 0;

    for (const r of receipts) {
      const res = await syncReceiptToAppsScript(r, cloudConfig.appsScriptUrl);
      if (res.success) {
        successCount++;
        r.syncStatus = 'synced';
        r.syncedAt = new Date().toISOString();
      }
    }

    storage.saveCloudConfig({
      ...cloudConfig,
      lastSyncTime: new Date().toISOString(),
    });
    setReceipts([...receipts]);
    setIsSyncing(false);

    showToast(
      `Berhasil menyinkronkan ${successCount} dari ${receipts.length} kuitansi ke Google Spreadsheet!`,
      'success'
    );
  };

  // Export CSV
  const handleExportCSV = () => {
    if (receipts.length === 0) {
      showToast('Belum ada data kuitansi untuk diekspor.', 'info');
      return;
    }
    exportReceiptsToCSV(receipts);
    showToast('File CSV berhasil diunduh untuk Spreadsheet!', 'success');
  };

  // Save School Profile
  const handleSaveSchoolProfile = (profile: SchoolProfile) => {
    const saved = storage.saveSchoolProfile(profile);
    setSchoolProfile(saved);
    showToast('Profil sekolah dan kop surat berhasil diperbarui!', 'success');
  };

  // Save Cloud Config
  const handleSaveCloudConfig = (config: CloudConfig) => {
    const saved = storage.saveCloudConfig(config);
    setCloudConfig(saved);
    showToast('Konfigurasi Google Spreadsheet berhasil disimpan!', 'success');
  };

  // Reset to new receipt form
  const handleNewReceipt = () => {
    setEditingReceipt(null);
    setActiveTab('form');
  };

  const currentPreviewTarget = livePreviewReceipt || activeReceiptForPrint || receipts[0];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold text-white border ${
              toast.type === 'success'
                ? 'bg-emerald-800 border-emerald-600'
                : toast.type === 'error'
                ? 'bg-rose-800 border-rose-600'
                : 'bg-slate-900 border-slate-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        schoolProfile={schoolProfile}
        cloudConfig={cloudConfig}
        receiptCount={receipts.length}
        onOpenCloudModal={() => setIsCloudModalOpen(true)}
        onOpenSchoolModal={() => setIsSchoolModalOpen(true)}
        onNewReceipt={handleNewReceipt}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: FORM INPUT & LIVE PREVIEW */}
        {activeTab === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left side: Input Form (7 cols) */}
            <div className="lg:col-span-7">
              <ReceiptForm
                key={editingReceipt ? editingReceipt.id : 'new-form'}
                initialData={editingReceipt}
                schoolProfile={schoolProfile}
                receiptCount={receipts.length}
                onSave={handleSaveReceipt}
                onCancelEdit={() => setEditingReceipt(null)}
                onPreviewChange={(previewData) => setLivePreviewReceipt(previewData)}
              />
            </div>

            {/* Right side: Live Preview Sticky Card (5 cols) */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Pratinjau Kuitansi Terkini
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (currentPreviewTarget) {
                        setActiveReceiptForPrint(currentPreviewTarget);
                        setIsPrintModalOpen(true);
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Buka Cetak PDF
                  </button>
                </div>

                <div className="mt-3 overflow-hidden rounded border border-slate-300 bg-slate-50 p-2 transform scale-100 origin-top">
                  {currentPreviewTarget ? (
                    <ReceiptDocument
                      receipt={currentPreviewTarget}
                      schoolProfile={schoolProfile}
                      isCompact={true}
                    />
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400">
                      Mulai mengisi form untuk melihat pratinjau langsung kuitansi.
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Terbilang live sync
                  </span>
                  <span>Standar Format BOS / Sekolah</span>
                </div>
              </div>

              {/* Cloud Sync Quick Banner */}
              <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-xl p-4 text-white shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Cloud Google Sheets
                    </h4>
                    <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                      {cloudConfig.appsScriptUrl
                        ? 'Google Spreadsheet terhubung. Data kuitansi otomatis tersinkron ke cloud spreadsheet Anda.'
                        : 'Belum terhubung ke spreadsheet cloud. Hubungkan dalam 3 menit dengan Google Apps Script.'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCloudModalOpen(true)}
                    className="px-3 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-300 hover:bg-emerald-200 rounded-lg transition"
                  >
                    {cloudConfig.appsScriptUrl ? 'Kelola Integrasi Cloud' : 'Sambungkan Spreadsheet'}
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="px-3 py-1.5 text-xs font-medium text-emerald-100 hover:bg-emerald-800/80 rounded-lg transition"
                  >
                    Ekspor CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RIWAYAT TRANSAKSI TABLE */}
        {activeTab === 'list' && (
          <ReceiptList
            receipts={receipts}
            onSelectReceipt={(r) => {
              setActiveReceiptForPrint(r);
              setIsPrintModalOpen(true);
            }}
            onEditReceipt={(r) => {
              setEditingReceipt(r);
              setActiveTab('form');
            }}
            onDeleteReceipt={handleDeleteReceipt}
            onDuplicateReceipt={handleDuplicateReceipt}
            onSyncReceipt={handleSyncReceipt}
            onExportCSV={handleExportCSV}
            onSyncAll={handleSyncAll}
            isSyncing={isSyncing}
          />
        )}

        {/* TAB 3: STANDALONE PRINT PREVIEW */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Pratinjau Kuitansi Cetak Resmi A4
                </h2>
                <p className="text-xs text-slate-500">
                  Menampilkan kuitansi: <span className="font-mono font-bold text-indigo-600">{currentPreviewTarget?.noKuitansi || '-'}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerBrowserPrint()}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  Cetak Browser
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (currentPreviewTarget) {
                      const safeName = `Kuitansi_${currentPreviewTarget.noKuitansi.replace(/[\/\\]/g, '_')}.pdf`;
                      const success = await downloadReceiptPDF({
                        elementId: 'receipt-print-area',
                        filename: safeName,
                        orientation: 'landscape',
                      });
                      if (success) {
                        showToast('File PDF kuitansi berhasil diunduh!', 'success');
                      } else {
                        showToast('Gagal membuat PDF. Silakan gunakan opsi Cetak Browser.', 'error');
                      }
                    }
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  Download Dokumen PDF
                </button>
              </div>
            </div>

            <div className="bg-slate-200/80 p-6 rounded-2xl flex justify-center shadow-inner overflow-x-auto">
              {currentPreviewTarget ? (
                <div className="bg-white shadow-2xl p-2 rounded-sm max-w-4xl w-full">
                  <ReceiptDocument
                    id="receipt-print-area"
                    receipt={currentPreviewTarget}
                    schoolProfile={schoolProfile}
                    isCompact={false}
                  />
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 text-sm">
                  Belum ada data kuitansi yang dipilih.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Sistem Kuitansi &amp; Pencatatan Keuangan Sekolah &bull; Format Standar BOS / SPJ Resmi
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsCloudModalOpen(true)}
              className="text-indigo-600 hover:underline"
            >
              Panduan Google Sheets Cloud
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => setIsSchoolModalOpen(true)}
              className="text-indigo-600 hover:underline"
            >
              Ubah Kop Surat
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PrintPreviewModal
        receipt={activeReceiptForPrint}
        schoolProfile={schoolProfile}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />

      <CloudSpreadsheetModal
        config={cloudConfig}
        isOpen={isCloudModalOpen}
        receipts={receipts}
        onClose={() => setIsCloudModalOpen(false)}
        onSaveConfig={handleSaveCloudConfig}
        onSyncAll={handleSyncAll}
        isSyncing={isSyncing}
        onExportCSV={handleExportCSV}
      />

      <SchoolProfileModal
        profile={schoolProfile}
        isOpen={isSchoolModalOpen}
        onClose={() => setIsSchoolModalOpen(false)}
        onSave={handleSaveSchoolProfile}
      />
    </div>
  );
}
