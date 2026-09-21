import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

interface GeneratePdfOptions {
  elementId: string;
  filename?: string;
  orientation?: 'landscape' | 'portrait';
}

/**
 * Generate PDF dari elemen DOM dengan html2canvas dan jsPDF
 */
export async function downloadReceiptPDF({
  elementId,
  filename = 'kuitansi.pdf',
  orientation = 'landscape',
}: GeneratePdfOptions): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return false;
  }

  try {
    // Render element ke canvas dengan resolusi tinggi (scale 2.5)
    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
    });

    const imgData = canvas.toDataURL('image/png');

    // Buat dokumen PDF (A4)
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = orientation === 'landscape' ? 297 : 210;
    const pdfHeight = orientation === 'landscape' ? 210 : 297;

    // Margin halaman (mm)
    const margin = 10;
    const availableWidth = pdfWidth - margin * 2;
    const availableHeight = pdfHeight - margin * 2;

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);

    const renderWidth = imgWidth * ratio;
    const renderHeight = imgHeight * ratio;

    // Center di halaman
    const xPos = margin + (availableWidth - renderWidth) / 2;
    const yPos = margin + (availableHeight - renderHeight) / 2;

    pdf.addImage(imgData, 'PNG', xPos, yPos, renderWidth, renderHeight, undefined, 'FAST');
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return false;
  }
}

/**
 * Pemicu cetak langsung lewat browser print dialog
 */
export function triggerBrowserPrint(): void {
  window.print();
}
