import React, { useState } from 'react';
import { DailyRecord, RefillRecord } from '../types/o2Tracker';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { downloadLoxAuditPdf } from '../services/pdfReportGenerator';
import { getStoredTankSpecs, computeRefillCycles } from '../utils/storage';
import { 
  FileText, 
  Download, 
  Printer, 
  Trash2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Image as ImageIcon,
  ExternalLink,
  Filter,
  Eye,
  Truck,
  Sheet,
  FileDown,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';

interface HistoryProps {
  dailyRecords: DailyRecord[];
  refillRecords: RefillRecord[];
  onDeleteDailyRecord: (id: string) => void;
  onDeleteRefillRecord: (id: string) => void;
  onResetDemoData: () => void;
  onOpenSheetsModal?: () => void;
  lang?: Language;
}

export const HistoryAndReports: React.FC<HistoryProps> = ({
  dailyRecords,
  refillRecords,
  onDeleteDailyRecord,
  onDeleteRefillRecord,
  onResetDemoData,
  onOpenSheetsModal,
  lang = 'lo'
}) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'daily' | 'refills' | 'report'>('daily');
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; title: string } | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);
  const [refillViewMode, setRefillViewMode] = useState<'cycles' | 'dockets'>('cycles');
  const [expandedCycleId, setExpandedCycleId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    type: 'resetDemo' | 'deleteDaily' | 'deleteRefill';
    id?: string;
    title: string;
    message: string;
  } | null>(null);

  const refillCycles = computeRefillCycles(refillRecords, dailyRecords);

  // PDF Export using jsPDF and jspdf-autotable
  const handleExportPDF = () => {
    try {
      setIsExportingPdf(true);
      const specs = getStoredTankSpecs();
      downloadLoxAuditPdf(dailyRecords, refillRecords, specs);
      setPdfSuccessMessage(t.pdfGeneratedSuccess);
      setTimeout(() => setPdfSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Failed to generate PDF report:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // CSV Export for Daily Records
  const handleExportDailyCSV = () => {
    const headers = [
      'Date',
      'Time',
      'Level (mmH2O)',
      'Pressure (MPa)',
      'Calculated Volume (L)',
      'Calculated Weight (kg)',
      'Tank %',
      'Daily Consumption (kg)',
      'Inspector',
      'Status',
      'Notes'
    ];

    const rows = dailyRecords.map(r => [
      r.date,
      r.time,
      r.levelMmH2O,
      r.pressureMpa,
      r.calculatedVolumeL,
      r.calculatedWeightKg,
      r.tankPercentage,
      r.dailyConsumptionKg ?? '',
      `"${r.inspectorName.replace(/"/g, '""')}"`,
      r.verificationStatus,
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `o2_bulk_inspection_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Top Bar with View Selector & Export CTA */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t.historyTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t.historySub}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenSheetsModal && (
            <button
              type="button"
              onClick={onOpenSheetsModal}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Sheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Google Sheets</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExportingPdf}
            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
            title="Download PDF Audit Report"
          >
            <FileDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>{isExportingPdf ? '...' : t.btnExportPdf}</span>
          </button>

          <button
            type="button"
            onClick={handleExportDailyCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.btnExportCsv}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.btnPrintReport}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setConfirmModal({
                type: 'resetDemo',
                title: t.btnResetDemo,
                message: t.confirmResetDemo
              });
            }}
            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
            title={t.btnResetDemo}
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">{t.btnResetDemo}</span>
            <span className="sm:hidden">Reset</span>
          </button>
        </div>
      </div>

      {/* PDF Export Success Toast */}
      {pdfSuccessMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium">{pdfSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setPdfSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold ml-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Action Success Toast */}
      {actionSuccessToast && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">{actionSuccessToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessToast(null)}
            className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold ml-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Segmented Filter Control */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'daily'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          {t.tabDailyRecords} ({dailyRecords.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('refills')}
          className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'refills'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          {t.tabRefillRecords} ({refillRecords.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('report')}
          className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'report'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          {t.tabPrintableReport}
        </button>
      </div>

      {/* TAB 1: DAILY INSPECTION RECORDS */}
      {activeTab === 'daily' && (
        <div className="space-y-3">
          {dailyRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-mono text-xs font-bold">
                    {record.date} {record.time}
                  </div>
                  <span className="text-xs text-slate-500">
                    {t.inputInspectorName}: <strong>{record.inspectorName}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {record.verificationStatus === 'verified' && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.statusVerified}</span>
                    </span>
                  )}
                  {record.verificationStatus === 'warning' && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{t.statusWarning}</span>
                    </span>
                  )}
                  {record.verificationStatus === 'anomaly' && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{t.statusAnomaly}</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setConfirmModal({
                        type: 'deleteDaily',
                        id: record.id,
                        title: lang === 'th' ? 'ลบบันทึกประจำวัน' : lang === 'en' ? 'Delete Daily Log' : 'ລຶບບັນທຶກປະຈຳວັນ',
                        message: t.confirmDeleteDaily
                      });
                    }}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">{t.metricLevel}</div>
                  <div className="text-base font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">
                    {record.levelMmH2O.toLocaleString()}{' '}
                    <span className="text-[10px] font-normal text-slate-500">mmH₂O</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {t.tankPressure} {record.pressureMpa.toFixed(2)} MPa
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">{t.metricVolume} (L)</div>
                  <div className="text-base font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                    {record.calculatedVolumeL.toLocaleString(undefined, { minimumFractionDigits: 1 })}{' '}
                    <span className="text-[10px] font-normal text-slate-500">L</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {t.metricTankPct} {record.tankPercentage}%
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">{t.metricWeight} (kg)</div>
                  <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {record.calculatedWeightKg.toLocaleString(undefined, { minimumFractionDigits: 1 })}{' '}
                    <span className="text-[10px] font-normal text-slate-500">kg</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    CFL(P)-20 Table
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">{t.actualUsedLabel}</div>
                  <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                    {record.dailyConsumptionKg !== undefined ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {record.dailyConsumptionKg.toFixed(1)} kg
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">{t.noDataInitial}</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {t.prevRecordLabel}
                  </div>
                </div>
              </div>

              {/* Photo & Notes */}
              {(record.notes || record.photoUrl) && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-600 dark:text-slate-400">
                  {record.notes && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{t.inputNotes}:</span>
                      <span>{record.notes}</span>
                    </div>
                  )}

                  {record.photoUrl && (
                    <button
                      type="button"
                      onClick={() => setSelectedPhoto({ url: record.photoUrl!, title: record.photoTitle || t.photoEvidenceLabel })}
                      className="inline-flex items-center gap-1.5 text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{t.btnViewEvidence}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: REFILL RECORDS (CYCLES & DOCKETS) */}
      {activeTab === 'refills' && (
        <div className="space-y-4">
          {/* Sub-view toggle: Cycle Summary vs Delivery Dockets */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setRefillViewMode('cycles')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  refillViewMode === 'cycles'
                    ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t.tabCycleView}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-cyan-100 dark:bg-cyan-950/80 rounded-full font-bold">
                  {refillCycles.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRefillViewMode('dockets')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  refillViewMode === 'dockets'
                    ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{t.tabDocketView}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 rounded-full font-bold">
                  {refillRecords.length}
                </span>
              </button>
            </div>
          </div>

          {/* VIEW A: CYCLE-BY-CYCLE BATCH SUMMARY */}
          {refillViewMode === 'cycles' && (
            <div className="space-y-4">
              {refillCycles.map((cycle) => (
                <div
                  key={cycle.refill.id}
                  className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                >
                  {/* Cycle Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-cyan-600 text-white font-bold text-xs tracking-wide">
                        {t.cycleRound} {cycle.roundNumber} ({cycle.roundBatchCode})
                      </span>

                      {cycle.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{t.cycleStatusActive}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {t.cycleStatusCompleted}
                        </span>
                      )}

                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {cycle.startDate} {cycle.endDate ? `➔ ${cycle.endDate}` : '➔ Present'} ({cycle.durationDays} {t.daysUnit})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-xs text-slate-500">
                        Docket: <strong className="font-mono text-cyan-600">{cycle.refill.docketNumber}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmModal({
                            type: 'deleteRefill',
                            id: cycle.refill.id,
                            title: lang === 'th' ? 'ลบประวัติการรับก๊าซ' : lang === 'en' ? 'Delete Refill Record' : 'ລຶບໃບຮັບເຕີມກ໊າຊ',
                            message: t.confirmDeleteRefill
                          });
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete cycle refill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 4 KPIs of the Cycle */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-medium">{t.cycleStartingStock}</div>
                      <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                        {cycle.refill.docketSuppliedKg.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">kg</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {cycle.refill.supplier.split(' ')[0]}
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-medium">{t.cycleTotalUsed}</div>
                      <div className="text-base font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">
                        {cycle.totalOxygenUsedKg.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">kg</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {cycle.inspectionsCount} {t.recordsUnit}
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-medium">{t.cycleBurnAvg}</div>
                      <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {cycle.avgDailyBurnKg.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">kg/ວັນ</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        ≈ {(cycle.avgDailyBurnKg / 24).toFixed(1)} kg/ชม
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-medium">{t.cycleCurrentStock}</div>
                      <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                        {cycle.currentStockKg.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">kg</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Flash loss: {cycle.refill.discrepancyPercent}%
                      </div>
                    </div>
                  </div>

                  {/* Expand Daily Inspections inside this cycle */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setExpandedCycleId(expandedCycleId === cycle.refill.id ? null : cycle.refill.id)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                        <span>{t.cycleViewDailyLogs} ({cycle.cycleDailyRecords.length} {t.recordsUnit})</span>
                      </span>
                      {expandedCycleId === cycle.refill.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {expandedCycleId === cycle.refill.id && (
                      <div className="mt-3 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 p-2 animate-in fade-in">
                        {cycle.cycleDailyRecords.length > 0 ? (
                          <table className="w-full text-left text-xs">
                            <thead className="text-[11px] text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                              <tr>
                                <th className="py-2 px-2.5 font-medium">{t.inputInspectionDate}</th>
                                <th className="py-2 px-2.5 font-medium text-right">{t.metricLevel} (mmH₂O)</th>
                                <th className="py-2 px-2.5 font-medium text-right">{t.metricWeight} (kg)</th>
                                <th className="py-2 px-2.5 font-medium text-right">{t.actualUsedLabel} (kg)</th>
                                <th className="py-2 px-2.5 font-medium">{t.inputInspectorName}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                              {cycle.cycleDailyRecords.map(d => (
                                <tr key={d.id} className="hover:bg-white dark:hover:bg-slate-800/40">
                                  <td className="py-2 px-2.5 font-sans font-semibold">{d.date} {d.time}</td>
                                  <td className="py-2 px-2.5 text-right font-bold text-cyan-600 dark:text-cyan-400">{d.levelMmH2O.toLocaleString()}</td>
                                  <td className="py-2 px-2.5 text-right">{d.calculatedWeightKg.toLocaleString(undefined, { minimumFractionDigits: 1 })}</td>
                                  <td className="py-2 px-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                    {d.dailyConsumptionKg !== undefined ? `${d.dailyConsumptionKg.toFixed(1)} kg` : '-'}
                                  </td>
                                  <td className="py-2 px-2.5 font-sans text-slate-600 dark:text-slate-400">{d.inspectorName}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="text-center py-4 text-xs text-slate-400">
                            {lang === 'en' ? 'No daily inspections logged for this cycle yet.' : lang === 'th' ? 'ยังไม่มีบันทึกการตรวจวัดในรอบนี้' : 'ຍັງບໍ່ມີບັນທຶກການກວດກາໃນຮອບນີ້'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIEW B: DELIVERY DOCKETS LIST */}
          {refillViewMode === 'dockets' && (
            <div className="space-y-3">
              {refillRecords.map((refill) => (
                <div
                  key={refill.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold">
                        {refill.date} {refill.time}
                      </div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {refill.roundBatchCode || `รอบที่ ${refill.roundNumber || 1}`} · Docket No: <span className="font-mono text-cyan-600">{refill.docketNumber}</span>
                      </span>
                      <span className="text-xs text-slate-400">· {refill.supplier}</span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmModal({
                            type: 'deleteRefill',
                            id: refill.id,
                            title: lang === 'th' ? 'ลบประวัติการรับก๊าซ' : lang === 'en' ? 'Delete Refill Record' : 'ລຶບໃບຮັບເຕີມກ໊າຊ',
                            message: t.confirmDeleteRefill
                          });
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                      <div className="text-[10px] text-slate-400">{t.inputTruckPlate} / {t.inputTankerId}</div>
                      <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                        {refill.truckPlate || 'SISU-1310025'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {refill.tankerId}
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                      <div className="text-[10px] text-slate-400">{t.docketNetLabel}</div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 text-sm">
                        {refill.docketSuppliedKg.toLocaleString()} kg
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Gross: {refill.grossWeightKg?.toLocaleString()} kg
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                      <div className="text-[10px] text-slate-400">{t.tankGainLabel}</div>
                      <div className="font-mono font-bold text-cyan-600 dark:text-cyan-400 mt-0.5 text-sm">
                        {refill.calculatedReceivedKg.toLocaleString()} kg
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {refill.levelBeforeMmH2O} ➔ {refill.levelAfterMmH2O} mmH₂O
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                      <div className="text-[10px] text-slate-400">{t.varianceLabel}</div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 text-sm">
                        {refill.discrepancyKg > 0 ? `+${refill.discrepancyKg}` : refill.discrepancyKg} kg
                      </div>
                      <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {refill.discrepancyPercent}% (Flash loss)
                      </div>
                    </div>
                  </div>

                  {refill.photoUrl && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedPhoto({ url: refill.photoUrl!, title: `Docket ${refill.docketNumber}` })}
                        className="inline-flex items-center gap-1.5 text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>{t.docketPhotoAttachment}</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: OFFICIAL PRINT-READY AUDIT REPORT */}
      {activeTab === 'report' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-300 text-slate-900 shadow-md space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Quick Action Toolbar (hidden on print) */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 print:hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
                <FileDown className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {t.btnDownloadPdf}
                </div>
                <div className="text-[11px] text-slate-500">
                  Yangzhou Giant CFL(P)-20 Cryogenic Storage Tank · A4 Standard
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportPDF}
                disabled={isExportingPdf}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>{isExportingPdf ? '...' : t.btnDownloadPdf}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t.btnPrintReport}</span>
              </button>
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-1.5 border-b border-slate-200 pb-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {t.auditDocTitle}
            </h2>
            <h3 className="text-sm sm:text-base font-semibold text-slate-700">
              {t.auditDocSub}
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Yangzhou Giant Machinery Co., Ltd · Liquid Oxygen Density 1,140 kg/m³
            </p>
          </div>

          {/* Section: Calculation Formula Demo Table matching PDF */}
          <div>
            <div className="text-xs font-bold text-slate-800 mb-2">
              {t.auditDocFormulaLead}
            </div>

            <div className="overflow-x-auto border border-slate-300 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-300 font-mono">{t.auditColDate}</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 font-mono">{t.auditColGaugeVal}</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 font-mono">{t.auditColRefWeight}</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 font-mono">{t.auditColActualBurn}</th>
                    <th className="py-2.5 px-3">{t.auditColNotes}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {dailyRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 border-r border-slate-200 font-semibold">{r.date}</td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-bold">{r.levelMmH2O.toLocaleString()}</td>
                      <td className="py-2 px-3 border-r border-slate-200 text-right">{r.calculatedWeightKg.toLocaleString(undefined, { minimumFractionDigits: 1 })}</td>
                      <td className="py-2 px-3 border-r border-slate-200 text-right font-bold text-cyan-800">
                        {r.dailyConsumptionKg !== undefined ? r.dailyConsumptionKg.toFixed(1) : '-'}
                      </td>
                      <td className="py-2 px-3 text-slate-600 font-sans text-[11px]">{r.notes || r.inspectorName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sample Gauges Comparison Snapshot */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="border border-slate-200 rounded-xl p-3 text-center space-y-2">
              <img
                src="/public/assets/aistudio/11-11-2026_7f88e785.jpeg"
                alt="11.11.2026"
                referrerPolicy="no-referrer"
                className="w-full h-44 object-contain rounded bg-slate-50"
              />
              <div className="text-xs font-bold text-slate-800 font-mono">
                {lang === 'en' ? 'Gauge 11.11.2026 (5,800 mmH₂O)' : lang === 'th' ? 'เกจวัด วันที่ 11.11.2026 (5,800 mmH₂O)' : 'ມາດວັດ ວັນທີ 11.11.2026 (5,800 mmH₂O)'}
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-3 text-center space-y-2">
              <img
                src="/public/assets/aistudio/WhatsApp_Image_2026-11-12_at_09.58.23_02beedd3.jpeg"
                alt="12.11.2026"
                referrerPolicy="no-referrer"
                className="w-full h-44 object-contain rounded bg-slate-50"
              />
              <div className="text-xs font-bold text-slate-800 font-mono">
                {lang === 'en' ? 'Gauge 12.11.2026 (5,700 mmH₂O)' : lang === 'th' ? 'เกจวัด วันที่ 12.11.2026 (5,700 mmH₂O)' : 'ມາດວັດ ວັນທີ 12.11.2026 (5,700 mmH₂O)'}
              </div>
            </div>
          </div>

          {/* Signatures Footer */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs text-slate-700">
            <div className="space-y-8">
              <div>{t.sigInspector}</div>
              <div className="border-b border-slate-400 w-32 mx-auto" />
              <div>{t.sigDate}</div>
            </div>

            <div className="space-y-8">
              <div>{t.sigSupervisor}</div>
              <div className="border-b border-slate-400 w-32 mx-auto" />
              <div>{t.sigDate}</div>
            </div>

            <div className="space-y-8">
              <div>{t.sigManager}</div>
              <div className="border-b border-slate-400 w-32 mx-auto" />
              <div>{t.sigDate}</div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Demo Data Banner / Card */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {t.btnResetDemo}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {t.confirmResetDemo}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setConfirmModal({
              type: 'resetDemo',
              title: t.btnResetDemo,
              message: t.confirmResetDemo
            });
          }}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.btnResetDemo}</span>
        </button>
      </div>

      {/* In-App Confirmation Modal (Bypasses iframe alert/confirm blockage) */}
      {confirmModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100"
          onClick={() => setConfirmModal(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                confirmModal.type === 'resetDemo'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
              }`}>
                {confirmModal.type === 'resetDemo' ? (
                  <RotateCcw className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {confirmModal.title}
                </h4>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {confirmModal.message}
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                {lang === 'en' ? 'Cancel' : lang === 'th' ? 'ยกเลิก' : 'ຍົກເລີກ'}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirmModal.type === 'resetDemo') {
                    onResetDemoData();
                    setActionSuccessToast(
                      lang === 'en'
                        ? 'Demo data restored successfully'
                        : lang === 'th'
                        ? 'รีเซ็ตข้อมูลตัวอย่างกลับสู่ค่าเริ่มต้นเรียบร้อยแล้ว'
                        : 'ຣີເຊັດຂໍ້ມູນຕົວຢ່າງສຳເລັດແລ້ວ'
                    );
                    setTimeout(() => setActionSuccessToast(null), 4000);
                  } else if (confirmModal.type === 'deleteDaily' && confirmModal.id) {
                    onDeleteDailyRecord(confirmModal.id);
                  } else if (confirmModal.type === 'deleteRefill' && confirmModal.id) {
                    onDeleteRefillRecord(confirmModal.id);
                  }
                  setConfirmModal(null);
                }}
                className={`py-2.5 px-3 text-white text-xs font-bold rounded-xl transition-colors shadow-xs ${
                  confirmModal.type === 'resetDemo'
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {lang === 'en' ? 'Confirm' : lang === 'th' ? 'ยืนยัน' : 'ຢືນຢັນ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-3 p-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white truncate">{selectedPhoto.title}</h4>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1"
              >
                {t.btnClose}
              </button>
            </div>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title}
              referrerPolicy="no-referrer"
              className="w-full max-h-[75vh] object-contain rounded-xl bg-black"
            />
          </div>
        </div>
      )}
    </div>
  );
};
