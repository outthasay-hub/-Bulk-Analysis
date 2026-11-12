import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DailyRecord, RefillRecord, TankSpecs } from '../types/o2Tracker';

export interface PdfExportOptions {
  includeDaily?: boolean;
  includeRefills?: boolean;
  includeSummary?: boolean;
  includeSignatures?: boolean;
  title?: string;
  notes?: string;
}

/**
 * Generates an executive, professional PDF audit report for Liquid Oxygen (LOX)
 * Bulk Storage Tank CFL(P)-20.
 */
export function generateLoxAuditPdf(
  dailyRecords: DailyRecord[],
  refillRecords: RefillRecord[],
  tankSpecs: TankSpecs,
  options: PdfExportOptions = {}
): jsPDF {
  const {
    includeDaily = true,
    includeRefills = true,
    includeSummary = true,
    includeSignatures = true,
    title = 'LIQUID OXYGEN (LOX) BULK TANK AUDIT REPORT'
  } = options;

  // Initialize A4 Portrait (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = 16;

  // Colors
  const primaryColor: [number, number, number] = [8, 145, 178]; // Cyan 600
  const secondaryColor: [number, number, number] = [15, 23, 42]; // Slate 900
  const lightBg: [number, number, number] = [248, 250, 252]; // Slate 50
  const borderGray: [number, number, number] = [203, 213, 225]; // Slate 300

  // 1. TOP HEADER ACCENT BAR
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // 2. HEADER TITLE & LOGO/ORGANIZATION BLOCK
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...secondaryColor);
  doc.text(title, margin, currentY);

  currentY += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text('SDG / H Phathana · Supreme Gas · Cryogenic Storage Monitoring System', margin, currentY);

  const nowStr = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Generated: ${nowStr}`, pageWidth - margin, currentY - 5.5, { align: 'right' });
  doc.text('Standard: CFL(P)-20 (Yangzhou Giant)', pageWidth - margin, currentY, { align: 'right' });

  currentY += 4;
  doc.setDrawColor(...borderGray);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 6;

  // 3. TANK SPECIFICATION & STATUS OVERVIEW CARDS
  if (includeSummary) {
    const cardWidth = (pageWidth - margin * 2 - 9) / 4;
    const cardHeight = 19;

    const latestDaily = dailyRecords[0];
    const currentWeight = latestDaily ? `${latestDaily.calculatedWeightKg.toLocaleString()} kg` : 'N/A';
    const currentLevel = latestDaily ? `${latestDaily.levelMmH2O.toLocaleString()} mmH2O` : 'N/A';
    const currentPressure = latestDaily ? `${latestDaily.pressureMpa.toFixed(2)} MPa` : 'N/A';
    const tankPct = latestDaily ? `${latestDaily.tankPercentage}%` : 'N/A';

    const cards = [
      { label: 'EQUIPMENT MODEL', value: tankSpecs.model, sub: `${tankSpecs.totalVolumeL.toLocaleString()} L (${tankSpecs.maxWeightKg.toLocaleString()} kg)` },
      { label: 'CURRENT LEVEL', value: currentLevel, sub: `Pressure: ${currentPressure}` },
      { label: 'CURRENT WEIGHT', value: currentWeight, sub: `Fill Level: ${tankPct}` },
      { label: 'MEDIUM DENSITY', value: `${tankSpecs.density} kg/m³`, sub: 'LOX Purity: 99.99%' }
    ];

    cards.forEach((card, i) => {
      const cardX = margin + i * (cardWidth + 3);
      doc.setFillColor(...lightBg);
      doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 1.5, 1.5, 'F');
      doc.setDrawColor(...borderGray);
      doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 1.5, 1.5, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text(card.label, cardX + 2.5, currentY + 4.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      doc.text(card.value, cardX + 2.5, currentY + 10.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(71, 85, 105);
      doc.text(card.sub, cardX + 2.5, currentY + 15.5);
    });

    currentY += cardHeight + 6;
  }

  // 4. SECTION: DAILY INSPECTION RECORDS TABLE
  if (includeDaily && dailyRecords.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...secondaryColor);
    doc.text('1. DAILY INSPECTION & CONSUMPTION LOGS', margin, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Total Records: ${dailyRecords.length} entries · Gauge Calibration: CYJ Differential Gauge`, pageWidth - margin, currentY, { align: 'right' });
    currentY += 2;

    const dailyTableRows = dailyRecords.map(r => [
      `${r.date} ${r.time || ''}`.trim(),
      r.levelMmH2O.toLocaleString(),
      r.pressureMpa.toFixed(2),
      r.calculatedVolumeL.toLocaleString(undefined, { minimumFractionDigits: 1 }),
      r.calculatedWeightKg.toLocaleString(undefined, { minimumFractionDigits: 1 }),
      `${r.tankPercentage}%`,
      r.dailyConsumptionKg !== undefined ? `${r.dailyConsumptionKg.toFixed(1)} kg` : '-',
      r.inspectorName || '-',
      r.verificationStatus.toUpperCase()
    ]);

    autoTable(doc, {
      startY: currentY + 1,
      margin: { left: margin, right: margin },
      head: [['Date & Time', 'Level (mmH2O)', 'Press. (MPa)', 'Volume (L)', 'Weight (kg)', 'Tank %', 'Daily Burn', 'Inspector', 'Status']],
      body: dailyTableRows,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'center',
        cellPadding: 2
      },
      styles: {
        fontSize: 7,
        cellPadding: 1.8,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.15
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 26 },
        1: { halign: 'right', cellWidth: 22 },
        2: { halign: 'right', cellWidth: 19 },
        3: { halign: 'right', cellWidth: 22 },
        4: { halign: 'right', cellWidth: 22, fontStyle: 'bold' },
        5: { halign: 'center', cellWidth: 15 },
        6: { halign: 'right', cellWidth: 22, textColor: [14, 116, 144] },
        7: { halign: 'left' },
        8: { halign: 'center', cellWidth: 17 }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      didParseCell: (data) => {
        // Highlight status cell
        if (data.section === 'body' && data.column.index === 8) {
          const val = String(data.cell.raw);
          if (val === 'VERIFIED') {
            data.cell.styles.textColor = [16, 149, 102];
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'WARNING') {
            data.cell.styles.textColor = [217, 119, 6];
          } else if (val === 'ANOMALY') {
            data.cell.styles.textColor = [225, 29, 72];
          }
        }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // Check if we need a new page for Refills or Signatures
  if (currentY > pageHeight - 75) {
    doc.addPage();
    currentY = 18;
  }

  // 5. SECTION: BULK REFILL & DELIVERY RECONCILIATION TABLE
  if (includeRefills && refillRecords.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...secondaryColor);
    doc.text('2. BULK TANKER REFILL & DELIVERY RECONCILIATION', margin, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Supplier: Linde (Thailand) / Bulk Logistics · Density: 1,140 kg/m³', pageWidth - margin, currentY, { align: 'right' });
    currentY += 2;

    const refillTableRows = refillRecords.map((r, i) => [
      r.roundBatchCode || `R#${r.roundNumber || (i + 1)}`,
      `${r.date} ${r.time || ''}`.trim(),
      r.docketNumber || '-',
      r.truckPlate || r.tankerId || '-',
      r.supplier ? r.supplier.split(' ')[0] : 'Linde',
      `${r.docketSuppliedKg.toLocaleString()} kg`,
      `${r.levelBeforeMmH2O} -> ${r.levelAfterMmH2O}`,
      `${r.calculatedReceivedKg.toLocaleString()} kg`,
      `${r.discrepancyKg > 0 ? '+' : ''}${r.discrepancyKg} kg`,
      `${r.discrepancyPercent}%`
    ]);

    autoTable(doc, {
      startY: currentY + 1,
      margin: { left: margin, right: margin },
      head: [['Round', 'Date', 'Docket #', 'Truck Plate', 'Supplier', 'Docket (kg)', 'Level (mmH2O)', 'Tank Gain', 'Diff (kg)', 'Loss %']],
      body: refillTableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42], // Slate 900
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7,
        halign: 'center',
        cellPadding: 1.8
      },
      styles: {
        fontSize: 6.5,
        cellPadding: 1.6,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.15
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 16, fontStyle: 'bold' },
        1: { halign: 'left', cellWidth: 22 },
        2: { halign: 'left', cellWidth: 17 },
        3: { halign: 'left', cellWidth: 20 },
        4: { halign: 'left', cellWidth: 16 },
        5: { halign: 'right', cellWidth: 19, fontStyle: 'bold' },
        6: { halign: 'center', cellWidth: 22 },
        7: { halign: 'right', cellWidth: 19, textColor: [14, 116, 144] },
        8: { halign: 'right', cellWidth: 16 },
        9: { halign: 'right', cellWidth: 15 }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // Check if we need space for Signatures
  if (currentY > pageHeight - 50) {
    doc.addPage();
    currentY = 18;
  }

  // 6. SECTION: VERIFICATION SIGNATURES & COMPLIANCE NOTES
  if (includeSignatures) {
    // Audit disclaimer note box
    doc.setFillColor(...lightBg);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 12, 1.5, 1.5, 'F');
    doc.setDrawColor(...borderGray);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 12, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text('AUDIT CERTIFICATION & STANDARD COMPLIANCE NOTE:', margin + 3, currentY + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'This report certifies cryogenic Liquid Oxygen inventory recorded via differential pressure level gauge and calibrated manufacturer table (CFL(P)-20). Normal boil-off and transfer flash loss of 1.0% to 2.5% is within cryogenic logistics safety tolerances (ISO 21009-2).',
      margin + 3,
      currentY + 8.5,
      { maxWidth: pageWidth - margin * 2 - 6 }
    );

    currentY += 18;

    // 3 Signature Columns
    const sigColWidth = (pageWidth - margin * 2 - 16) / 3;
    const signees = [
      { role: 'INSPECTOR / FIELD TECHNICIAN', sub: 'Verified Gauge & Physical Integrity' },
      { role: 'ENGINEERING SUPERVISOR', sub: 'Validated Table Math & Burn Rate' },
      { role: 'PLANT / OPERATIONS MANAGER', sub: 'Approved Inventory & Delivery Dockets' }
    ];

    signees.forEach((signee, idx) => {
      const colX = margin + idx * (sigColWidth + 8);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...secondaryColor);
      doc.text(signee.role, colX + sigColWidth / 2, currentY, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(100, 116, 139);
      doc.text(signee.sub, colX + sigColWidth / 2, currentY + 3.5, { align: 'center' });

      // Signature line
      const lineY = currentY + 18;
      doc.setDrawColor(...borderGray);
      doc.setLineWidth(0.3);
      doc.line(colX + 5, lineY, colX + sigColWidth - 5, lineY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(71, 85, 105);
      doc.text('Signature & Date', colX + sigColWidth / 2, lineY + 4, { align: 'center' });
    });
  }

  // 7. FOOTER ON ALL PAGES
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 9, pageWidth - margin, pageHeight - 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text('O2 Bulk Flow · Cryogenic LOX Tank CFL(P)-20 Monitoring System · Confidential Official Record', margin, pageHeight - 5);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
  }

  return doc;
}

/**
 * Convenience helper to download the generated PDF directly in the browser.
 */
export function downloadLoxAuditPdf(
  dailyRecords: DailyRecord[],
  refillRecords: RefillRecord[],
  tankSpecs: TankSpecs,
  options: PdfExportOptions = {}
): void {
  const doc = generateLoxAuditPdf(dailyRecords, refillRecords, tankSpecs, options);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `LOX_CFL20_Bulk_Audit_Report_${dateStr}.pdf`;
  doc.save(filename);
}
