import React from 'react';
import { DailyRecord, RefillRecord, TankSpecs } from '../types/o2Tracker';
import { MAX_TANK_CAPACITY_KG, MAX_TANK_VOLUME_L } from '../data/cfl20Table';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { ReminderSettings } from '../services/reminderNotification';
import { 
  Gauge, 
  TrendingDown, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Flame,
  ShieldCheck,
  Droplets,
  Layers,
  BellRing,
  Sliders,
  Percent
} from 'lucide-react';

interface DashboardProps {
  dailyRecords: DailyRecord[];
  refillRecords: RefillRecord[];
  tankSpecs: TankSpecs;
  onNavigateToInspect: () => void;
  onNavigateToRefill: () => void;
  onOpenReminderSettings?: () => void;
  lang?: Language;
  reminderSettings?: ReminderSettings;
  onUpdateReminderSettings?: (settings: ReminderSettings) => void;
}

export const DashboardAnalytics: React.FC<DashboardProps> = ({
  dailyRecords,
  refillRecords,
  tankSpecs,
  onNavigateToInspect,
  onNavigateToRefill,
  onOpenReminderSettings,
  lang = 'lo',
  reminderSettings,
  onUpdateReminderSettings
}) => {
  const t = TRANSLATIONS[lang];
  const latest = dailyRecords[0]; // Newest first

  // Consumption statistics
  const consumptions = dailyRecords
    .map(r => r.dailyConsumptionKg)
    .filter((v): v is number => typeof v === 'number' && v > 0);

  const avgConsumption = consumptions.length > 0
    ? consumptions.reduce((a, b) => a + b, 0) / consumptions.length
    : 650; // fallback default ~650 kg/day

  const currentWeight = latest?.calculatedWeightKg ?? 19194.4;
  const currentVolume = latest?.calculatedVolumeL ?? 16837.1;
  const currentLevel = latest?.levelMmH2O ?? 5700;
  const currentPressure = latest?.pressureMpa ?? 0.82;
  const currentPercent = Number(((currentWeight / MAX_TANK_CAPACITY_KG) * 100).toFixed(1));

  // Gas Level Alert calculations
  const alertThresholdPercent = reminderSettings?.gasLevelAlertThresholdPercent ?? 20;
  const isGasAlertEnabled = reminderSettings?.gasLevelAlertEnabled ?? true;
  const isGasAlertActive = isGasAlertEnabled && currentPercent <= alertThresholdPercent;
  const isGasCriticalActive = isGasAlertEnabled && currentPercent <= (reminderSettings?.criticalLevelThresholdPercent ?? 10);
  const thresholdKg = Math.round((alertThresholdPercent / 100) * MAX_TANK_CAPACITY_KG);

  const handleUpdateThreshold = (newPercent: number) => {
    const clamped = Math.max(5, Math.min(50, newPercent));
    if (onUpdateReminderSettings && reminderSettings) {
      onUpdateReminderSettings({
        ...reminderSettings,
        gasLevelAlertThresholdPercent: clamped
      });
    }
  };

  // Runout and safety days forecast
  const usableAboveReserve = Math.max(0, currentWeight - tankSpecs.lowStockThresholdKg);
  const daysUntilOrder = avgConsumption > 0 ? Number((usableAboveReserve / avgConsumption).toFixed(1)) : 0;
  const daysUntilEmpty = avgConsumption > 0 ? Number((currentWeight / avgConsumption).toFixed(1)) : 0;

  // Next order date estimation
  const nextOrderDate = new Date();
  nextOrderDate.setDate(nextOrderDate.getDate() + Math.floor(daysUntilOrder));
  const localeStr = lang === 'lo' ? 'lo-LA' : lang === 'th' ? 'th-TH' : 'en-US';
  const nextOrderStr = nextOrderDate.toLocaleDateString(localeStr, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Recent days for mini trend chart
  const recentSortedAsc = [...dailyRecords].reverse().slice(-7);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* High-Visibility Low Gas Alert Banner when current % <= threshold */}
      {isGasAlertActive && (
        <div className={`p-4 sm:p-5 rounded-3xl border-2 shadow-xl animate-in fade-in duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isGasCriticalActive 
            ? 'bg-rose-950/40 border-rose-500/80 text-rose-200' 
            : 'bg-amber-950/40 border-amber-500/80 text-amber-200'
        }`}>
          <div className="flex items-start gap-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
              isGasCriticalActive 
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse' 
                : 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-bounce'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white">
                  {t.gasAlertBannerTitle}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-white/10 border border-white/20 text-white">
                  {currentPercent}%
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {t.gasAlertBannerMsg} <strong className="text-white font-mono">{currentPercent}% ({currentWeight.toLocaleString()} kg)</strong> ซึ่งต่ำกว่าเกณฑ์แจ้งเตือนที่ตั้งไว้ <strong className="text-amber-300 font-mono">{alertThresholdPercent}% (≈ {thresholdKg.toLocaleString()} kg)</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end">
            <button
              type="button"
              onClick={onNavigateToRefill}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <Droplets className="w-4 h-4" />
              <span>{t.btnRefillNow}</span>
            </button>
            {onOpenReminderSettings && (
              <button
                type="button"
                onClick={onOpenReminderSettings}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs border border-white/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <Sliders className="w-4 h-4" />
                <span>{t.btnAdjustThreshold}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hero Tank Status Overview */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Core Tank Metric */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono">
                {t.heroSubTitle}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">{t.heroMedium}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-400">{t.heroStatusNormal}</span>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                {t.currentWeightLabel}
              </div>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight text-white tabular-nums">
                  {currentWeight.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                </span>
                <span className="text-xl sm:text-2xl font-semibold text-cyan-400">kg</span>
              </div>
              <div className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
                ≈ {currentVolume.toLocaleString(undefined, { minimumFractionDigits: 1 })} {t.currentVolumeLabel} {currentLevel.toLocaleString()} mmH₂O
              </div>
            </div>

            {/* Big Tank Gauge Level Progress Bar with Dynamic Alert Threshold Marker */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-slate-300 font-mono">
                <span>{t.tankCapacity}: {currentPercent}%</span>
                <span>{t.maxCapacity}</span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60 relative">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, currentPercent))}%` }}
                />
                {/* Visual Alert Threshold Marker Line & Glow Pin */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10 shadow-[0_0_8px_rgba(251,191,36,0.9)]"
                  style={{ left: `${Math.min(95, Math.max(5, alertThresholdPercent))}%` }}
                  title={`Alert Threshold: ${alertThresholdPercent}%`}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span className="text-rose-400">{t.criticalPoint}</span>
                <span className="text-amber-400 flex items-center gap-1 font-semibold">
                  <span>▲</span>
                  <span>{t.gasAlertThresholdLabel}: {alertThresholdPercent}% (≈ {thresholdKg.toLocaleString()} kg)</span>
                </span>
                <span className="text-emerald-400">{t.fullPoint}</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onNavigateToInspect}
                className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-xl shadow transition-colors flex items-center gap-2"
              >
                <Gauge className="w-4 h-4" />
                <span>{t.btnRecordToday}</span>
              </button>

              <button
                type="button"
                onClick={onNavigateToRefill}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-2"
              >
                <Droplets className="w-4 h-4 text-cyan-400" />
                <span>{t.btnRecordRefill}</span>
              </button>

              {onOpenReminderSettings && (
                <button
                  type="button"
                  onClick={onOpenReminderSettings}
                  className="px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
                  title="Configure Inspection Reminders"
                >
                  <BellRing className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">{t.reminderTitle}</span>
                  <span className="sm:hidden">Reminders</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Tank Pressure & Safety Diagnostics */}
          <div className="lg:col-span-5 bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t.safetyTitle}</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-md">
                {t.safetyNormal}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] text-slate-400">{t.tankPressure}</div>
                <div className="text-xl font-bold font-mono text-white mt-0.5">
                  {currentPressure.toFixed(2)} <span className="text-xs font-normal text-slate-400">MPa</span>
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5">
                  {t.normalPressureRange}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400">{t.avgDailyBurn}</div>
                <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
                  {avgConsumption.toFixed(0)} <span className="text-xs font-normal text-slate-400">{t.perDay}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  ≈ {(avgConsumption / 24).toFixed(1)} {t.perHour}
                </div>
              </div>
            </div>

            {/* Runout Projection Box */}
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{t.runoutProjectDays}:</span>
                <span className="font-bold font-mono text-emerald-300">{daysUntilEmpty} {t.daysUnit}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{t.reorderProjectDays}:</span>
                <span className="font-bold font-mono text-cyan-300">{daysUntilOrder} {t.daysUnit} (~{nextOrderStr})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Gas Alert Threshold & Progress Bar Slider Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-md space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t.gasLevelAlertSectionTitle}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  CFL(P)-20 (22,800 kg)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.gasAlertSliderHint}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-between sm:justify-end">
            <div className="text-left sm:text-right">
              <div className="text-[11px] text-slate-400 font-medium">{t.gasAlertThresholdLabel}</div>
              <div className="text-lg sm:text-xl font-mono font-extrabold text-amber-600 dark:text-amber-400 flex items-baseline gap-1.5">
                <span>{alertThresholdPercent}%</span>
                <span className="text-xs font-normal text-slate-500">
                  (≈ {thresholdKg.toLocaleString()} kg)
                </span>
              </div>
            </div>
            {onOpenReminderSettings && (
              <button
                type="button"
                onClick={onOpenReminderSettings}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title={t.reminderTitle}
              >
                <BellRing className="w-4 h-4 text-amber-500" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar & Range Slider */}
        <div className="space-y-2 pt-1">
          <div className="space-y-1">
            <input
              type="range"
              min={5}
              max={50}
              step={1}
              value={alertThresholdPercent}
              onChange={e => handleUpdateThreshold(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            {/* Visual scale markers */}
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono px-1">
              <span>5% (1,140 kg)</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">20% (4,560 kg - ค่าแนะนำ)</span>
              <span>35% (7,980 kg)</span>
              <span>50% (11,400 kg)</span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">{t.quickPresetsLabel}</span>
            {[
              { label: '10%', val: 10 },
              { label: '15%', val: 15 },
              { label: '20% (แนะนำ)', val: 20 },
              { label: '25%', val: 25 },
              { label: '30%', val: 30 }
            ].map(p => (
              <button
                key={p.val}
                type="button"
                onClick={() => handleUpdateThreshold(p.val)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                  alertThresholdPercent === p.val
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-amber-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.kpiLastConsumption}
            </span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {latest?.dailyConsumptionKg !== undefined ? latest.dailyConsumptionKg.toFixed(1) : '349.0'}{' '}
            <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
            {latest?.date || '12/11/2026'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.kpi7DayAvg}
            </span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {avgConsumption.toFixed(1)}{' '}
            <span className="text-xs font-normal text-slate-500">{t.perDay}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {t.kpiNormalProduction}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.kpiLastRefill}
            </span>
            <Droplets className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {refillRecords[0]?.calculatedReceivedKg ? refillRecords[0].calculatedReceivedKg.toLocaleString() : '19,310.8'}{' '}
            <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Linde No. {refillRecords[0]?.docketNumber || '18057'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.kpiSafetyBuffer}
            </span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {tankSpecs.lowStockThresholdKg.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {t.kpiBufferPercent}
          </div>
        </div>
      </div>

      {/* Consumption Trend Visualizer */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t.trendTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.trendSubTitle}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-cyan-500" />
              <span>{t.actualUsage}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-slate-300 dark:bg-slate-700" />
              <span>{t.remainingInTank}</span>
            </span>
          </div>
        </div>

        {/* Bar & Data Visualizer Table */}
        <div className="space-y-2 pt-2">
          {recentSortedAsc.map((rec) => {
            const consumption = rec.dailyConsumptionKg ?? 0;
            const maxBar = 1500;
            const barWidth = Math.min(100, Math.max(8, (consumption / maxBar) * 100));

            return (
              <div
                key={rec.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-24 shrink-0 font-mono text-xs font-semibold text-slate-900 dark:text-white">
                    {rec.date}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {t.metricLevel}: <strong className="font-mono text-cyan-600 dark:text-cyan-400">{rec.levelMmH2O.toLocaleString()}</strong> mmH₂O
                    {' · '}
                    <span className="font-mono">{rec.pressureMpa.toFixed(2)} MPa</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:w-1/2">
                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="w-24 text-right font-mono text-xs font-bold text-slate-900 dark:text-white">
                    {consumption > 0 ? `-${consumption.toFixed(1)} kg` : t.noDataInitial}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
