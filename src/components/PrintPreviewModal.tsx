import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle,
  FileCheck,
  Loader2,
  Share2,
} from 'lucide-react';
import { Receipt, SchoolProfile } from '../types';
import { ReceiptDocument } from './ReceiptDocument';
import { downloadReceiptPDF, triggerBrowserPrint } from '../utils/pdfGenerator';

interface PrintPreviewModalProps {
  receipt: Receipt | null;
  schoolProfile: SchoolProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  receipt,
  schoolProfile,
  isOpen,
  onClose,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');

  if (!isOpen || !receipt) return null;

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    setPdfSuccess(false);
    setPdfError(null);

    const safeFilename = `Kuitansi_${receipt.noKuitansi.replace(/[\/\\]/g, '_')}_${receipt.tanggal}.pdf`;
    const success = await downloadReceiptPDF({
      elementId: 'modal-receipt-print-canvas',
      filename: safeFilename,
      orientation,
    });

    setIsGeneratingPdf(false);
    if (success) {
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } else {
      setPdfError('Gagal membuat PDF. Gunakan Cetak Langsung.');
      setTimeout(() => setPdfError(null), 4000);
    }
  };

  const handlePrint = () => {
    triggerBrowserPrint();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Pratinjau &amp; Cetak Kuitansi Resmi
              </h2>
              <p className="text-xs text-slate-300">
                Nomor: <span className="font-mono text-indigo-300 font-semibold">{receipt.noKuitansi}</span> |{' '}
                {receipt.telahDiterimaDari}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Orientation toggle */}
            <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  orientation === 'landscape'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Landscape (Standar)
              </button>
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  orientation === 'portrait'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Portrait
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Format layout siap cetak pada kertas A4 standar sekolah &amp; instansi resmi.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition flex items-center gap-2 shadow-xs"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              Cetak Langsung (Browser)
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition flex items-center gap-2 shadow-sm"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Membuat PDF...
                </>
              ) : pdfSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                  PDF Berhasil Diunduh!
                </>
              ) : pdfError ? (
                <span className="text-amber-200">{pdfError}</span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Unduh Dokumen PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Document Preview Canvas */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-200/70 flex justify-center items-start">
          <div className="bg-white shadow-xl max-w-4xl w-full p-2 rounded-sm print:shadow-none print:p-0">
            <ReceiptDocument
              id="modal-receipt-print-canvas"
              receipt={receipt}
              schoolProfile={schoolProfile}
              isCompact={false}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 px-6">
          <span>* Tip: Untuk hasil cetak fisik paling tajam, gunakan kertas HVS 80gr ukuran A4 landscape</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md transition font-medium"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
};
