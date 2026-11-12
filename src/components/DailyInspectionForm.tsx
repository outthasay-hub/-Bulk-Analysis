import React, { useState, useId } from 'react';
import { DailyRecord } from '../types/o2Tracker';
import { calculateFromLevel } from '../data/cfl20Table';
import { GaugeVisualizer } from './GaugeVisualizer';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { getStoredReminderSettings } from '../services/reminderNotification';
import { 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Calendar, 
  Clock, 
  User, 
  FileText,
  HelpCircle,
  TrendingDown,
  Sparkles
} from 'lucide-react';

interface DailyInspectionFormProps {
  latestRecord?: DailyRecord;
  onSaveRecord: (record: Omit<DailyRecord, 'id' | 'createdAt'>) => void;
  onNavigateToRefill?: () => void;
  lang?: Language;
}

const SAMPLE_PHOTOS = [
  { url: '/public/assets/aistudio/11-11-2026_7f88e785.jpeg', label: '11/11/2026 (5,800 mmH₂O)' },
  { url: '/public/assets/aistudio/WhatsApp_Image_2026-11-12_at_09.58.23_02beedd3.jpeg', label: '12/11/2026 (5,700 mmH₂O)' },
  { url: '/public/assets/aistudio/BulkO2_2178be2e.jpeg', label: 'Bulk Tank SDG' }
];

export const DailyInspectionForm: React.FC<DailyInspectionFormProps> = ({
  latestRecord,
  onSaveRecord,
  onNavigateToRefill,
  lang = 'lo'
}) => {
  const t = TRANSLATIONS[lang];
  const fileInputId = useId();
  // Form states
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState(timeStr);
  const [levelMmH2O, setLevelMmH2O] = useState<number>(latestRecord ? Math.max(250, latestRecord.levelMmH2O - 100) : 5700);
  const [pressureMpa, setPressureMpa] = useState<number>(latestRecord ? latestRecord.pressureMpa : 0.82);
  const [inspectorName, setInspectorName] = useState<string>(
    localStorage.getItem('last_inspector_name') || 'ອຸດທະໄສ (Outthasay)'
  );
  const [notes, setNotes] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoTitle, setPhotoTitle] = useState<string>('');
  const [isInteractiveDial, setIsInteractiveDial] = useState<boolean>(true);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Compute values dynamically
  const calc = calculateFromLevel(levelMmH2O);

  // Comparison with latest record
  const prevWeight = latestRecord?.calculatedWeightKg ?? null;
  const rawDiff = prevWeight !== null ? prevWeight - calc.weight : null;
  const isRefillSuspected = rawDiff !== null && rawDiff < -50;

  const handleStepLevel = (delta: number) => {
    setLevelMmH2O(prev => Math.max(0, Math.min(7500, prev + delta)));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        if (ev.target?.result) {
          setPhotoUrl(ev.target.result as string);
          setPhotoTitle(file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inspectorName.trim()) {
      alert(lang === 'th' ? 'กรุณาใส่ชื่อผู้ตรวจสอบ' : lang === 'en' ? 'Please enter inspector name' : 'ກະລຸນາໃສ່ຊື່ຜູ້ກວດກາ');
      return;
    }

    localStorage.setItem('last_inspector_name', inspectorName);

    const verificationDetails: string[] = [];
    let verificationStatus: 'verified' | 'warning' | 'anomaly' = 'verified';

    if (pressureMpa > 1.2) {
      verificationDetails.push(lang === 'th' ? `ความดันสูง (${pressureMpa} MPa) - ตรวจวาล์วระบาย` : lang === 'en' ? `High Pressure (${pressureMpa} MPa) - Check relief valve` : `ຄວາມດັນສູງ (${pressureMpa} MPa) - ກວດກາວາວລະບາຍ`);
      verificationStatus = 'warning';
    } else if (pressureMpa < 0.45) {
      verificationDetails.push(lang === 'th' ? `ความดันต่ำ (${pressureMpa} MPa) - ตรวจชุดเพิ่มความดัน` : lang === 'en' ? `Low Pressure (${pressureMpa} MPa) - Check PBU` : `ຄວາມດັນຕ່ຳ (${pressureMpa} MPa) - ກວດກາລະບົບເພີ່ມແຮງດັນ`);
      verificationStatus = 'warning';
    } else {
      verificationDetails.push(lang === 'th' ? `ความดันปกติ (${pressureMpa} MPa)` : lang === 'en' ? `Normal Pressure (${pressureMpa} MPa)` : `ຄວາມດັນປົກກະຕິ (${pressureMpa} MPa)`);
    }

    if (isRefillSuspected) {
      verificationDetails.push(lang === 'th' ? `ระดับก๊าซเพิ่มขึ้น +${Math.abs(rawDiff!).toFixed(1)} kg - อาจมีการเติมก๊าซ` : lang === 'en' ? `Stock level increased +${Math.abs(rawDiff!).toFixed(1)} kg - Unrecorded refill suspected` : `ລະດັບກ໊າຊເພີ່ມຂຶ້ນ +${Math.abs(rawDiff!).toFixed(1)} kg - ອາດມີການເຕີມກ໊າຊ`);
      verificationStatus = 'warning';
    }

    onSaveRecord({
      date,
      time,
      levelMmH2O,
      pressureMpa,
      calculatedVolumeL: calc.volume,
      calculatedWeightKg: calc.weight,
      tankPercentage: calc.percentage,
      dailyConsumptionKg: rawDiff !== null ? Math.max(0, rawDiff) : undefined,
      consumptionRateKgDay: rawDiff !== null ? Math.max(0, rawDiff) : undefined,
      inspectorName,
      notes: notes.trim() || undefined,
      photoUrl: photoUrl || undefined,
      photoTitle: photoTitle || undefined,
      verificationStatus,
      verificationDetails
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-700 dark:text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>{t.heroSubTitle}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600 dark:text-slate-400">{t.maxCapacity}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {t.inspectionBannerTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t.inspectionBannerSub}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsInteractiveDial(!isInteractiveDial)}
            className="self-start sm:self-auto px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            {isInteractiveDial ? t.btnToggleDialOff : t.btnToggleDialOn}
          </button>
        </div>
      </div>

      {/* Visual Gauges */}
      <GaugeVisualizer
        levelMmH2O={levelMmH2O}
        pressureMpa={pressureMpa}
        interactive={isInteractiveDial}
        onLevelChange={setLevelMmH2O}
        onPressureChange={setPressureMpa}
        size="md"
        lang={lang}
      />

      {/* Real-time Calculation Display Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {t.metricLevel}
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-700 dark:text-cyan-400 tabular-nums">
            {levelMmH2O.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">{t.metricLevelUnit}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {t.metricVolume}
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {calc.volume.toLocaleString(undefined, { minimumFractionDigits: 1 })}
          </div>
          <div className="text-[10px] text-slate-400">{t.metricVolumeUnit}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {t.metricWeight}
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {calc.weight.toLocaleString(undefined, { minimumFractionDigits: 1 })}
          </div>
          <div className="text-[10px] text-slate-400">{t.metricWeightUnit}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {t.metricTankPct}
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
            {calc.percentage}%
          </div>
          <div className="text-[10px] text-slate-400">{t.metricTankPctSub}</div>
        </div>
      </div>

      {/* Low Gas Level Warning Alert Box if calc.percentage <= alertThreshold */}
      {calc.percentage <= (getStoredReminderSettings().gasLevelAlertThresholdPercent ?? 20) && (getStoredReminderSettings().gasLevelAlertEnabled ?? true) && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-900 dark:text-amber-200 flex items-start gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="text-xs space-y-1">
            <div className="font-bold flex items-center gap-2">
              <span>{t.gasAlertTriggeredStatus}</span>
              <span className="font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-200">
                {calc.percentage}% ≤ {getStoredReminderSettings().gasLevelAlertThresholdPercent ?? 20}%
              </span>
            </div>
            <p className="text-amber-800/90 dark:text-amber-300/90">
              {t.inspectionLowStockWarning
                .replace('{pct}', String(calc.percentage))
                .replace('{threshold}', String(getStoredReminderSettings().gasLevelAlertThresholdPercent ?? 20))}
            </p>
          </div>
        </div>
      )}

      {/* Consumption Comparison Box (Based on Previous Reading) */}
      {latestRecord && (
        <div className={`p-4 rounded-xl border transition-all ${
          isRefillSuspected
            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
            : 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
        }`}>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {isRefillSuspected ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {isRefillSuspected ? t.comparisonAlertRefill : t.comparisonTitle}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t.prevRecordLabel} ({latestRecord.date}):{' '}
                <strong className="font-mono text-slate-800 dark:text-slate-200">
                  {latestRecord.levelMmH2O.toLocaleString()} mmH₂O ({latestRecord.calculatedWeightKg.toLocaleString()} kg)
                </strong>
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500 dark:text-slate-400">{t.actualUsedLabel}</div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {rawDiff !== null && rawDiff >= 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    -{rawDiff.toLocaleString(undefined, { minimumFractionDigits: 1 })} kg
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">
                    +{Math.abs(rawDiff || 0).toLocaleString(undefined, { minimumFractionDigits: 1 })} kg
                  </span>
                )}
              </div>
            </div>
          </div>

          {isRefillSuspected && (
            <div className="mt-3 pt-2.5 border-t border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs text-amber-800 dark:text-amber-300">
                {t.suspectRefillText}
              </span>
              {onNavigateToRefill && (
                <button
                  type="button"
                  onClick={onNavigateToRefill}
                  className="px-3 py-1 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 transition-colors shrink-0"
                >
                  {t.btnGoToRefill}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Inspection Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <span>{t.inspectionDetailsTitle}</span>
        </h3>

        {/* Date and Time Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.inputInspectionDate}</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.inputInspectionTime}</span>
            </label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
              required
            />
          </div>
        </div>

        {/* Quick Stepper for Level mmH2O */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {t.inputCyjLevel}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleStepLevel(-100)}
              className="h-11 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-mono text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              -100
            </button>
            <button
              type="button"
              onClick={() => handleStepLevel(-50)}
              className="h-11 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-mono text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              -50
            </button>
            <input
              type="number"
              min="0"
              max="10000"
              step="1"
              value={levelMmH2O}
              onChange={e => setLevelMmH2O(Number(e.target.value))}
              className="flex-1 h-11 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-center text-lg font-bold font-mono text-cyan-700 dark:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
            <button
              type="button"
              onClick={() => handleStepLevel(50)}
              className="h-11 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-mono text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              +50
            </button>
            <button
              type="button"
              onClick={() => handleStepLevel(100)}
              className="h-11 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-mono text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              +100
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 px-1">
            <span>{t.levelRangeHint}</span>
            <span>{t.calculatedTag}: {calc.weight.toLocaleString()} kg</span>
          </div>
        </div>

        {/* Tank Pressure MPa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.inputTankPressure}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="2.5"
                step="0.01"
                value={pressureMpa}
                onChange={e => setPressureMpa(Number(e.target.value))}
                className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-mono text-slate-400">
                MPa
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {t.pressureNormalHint}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.inputInspectorName}</span>
            </label>
            <input
              type="text"
              value={inspectorName}
              onChange={e => setInspectorName(e.target.value)}
              placeholder={t.inputInspectorPlaceholder}
              className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>{t.inputNotes}</span>
          </label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={t.inputNotesPlaceholder}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Photo attachment & Sample Photo Selector */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-cyan-600" />
            <span>{t.photoEvidenceLabel}</span>
          </label>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <label
              htmlFor={fileInputId}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{t.btnTakePhoto}</span>
            </label>
            <input
              id={fileInputId}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />

            <span className="text-xs text-slate-400">{t.orSelectSample}</span>
            {SAMPLE_PHOTOS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPhotoUrl(sample.url);
                  setPhotoTitle(sample.label);
                }}
                className={`px-2.5 py-1 text-[11px] rounded-lg border transition-colors ${
                  photoUrl === sample.url
                    ? 'bg-cyan-50 border-cyan-500 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                {sample.label}
              </button>
            ))}
          </div>

          {photoUrl && (
            <div className="relative mt-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <img
                src={photoUrl}
                alt="Gauge reading"
                referrerPolicy="no-referrer"
                className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-600"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {photoTitle || 'Photo'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.photoEvidenceLabel}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPhotoUrl('');
                  setPhotoTitle('');
                }}
                className="text-xs text-rose-500 hover:text-rose-600 px-2 py-1"
              >
                {t.btnDeletePhoto}
              </button>
            </div>
          )}
        </div>

        {/* Success toast notification */}
        {saveSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-emerald-800 dark:text-emerald-200 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t.successDailySaved}</span>
          </div>
        )}

        {/* Submit Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{t.btnSaveDaily}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
