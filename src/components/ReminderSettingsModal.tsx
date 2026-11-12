import React, { useState, useEffect } from 'react';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { 
  getStoredReminderSettings, 
  saveReminderSettings, 
  getNotificationPermission, 
  requestNotificationPermission, 
  isNotificationSupported, 
  sendInspectionNotification,
  sendGasLevelAlertNotification,
  playNotificationChime,
  playAlertWarningChime,
  ReminderSettings 
} from '../services/reminderNotification';
import { MAX_TANK_CAPACITY_KG } from '../data/cfl20Table';
import { 
  Bell, 
  BellRing, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  X,
  ShieldCheck,
  Info,
  Sliders,
  Percent,
  Gauge
} from 'lucide-react';

interface ReminderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
  onNavigateToInspect?: () => void;
  onNavigateToRefill?: () => void;
  currentTankPercent?: number;
  currentWeightKg?: number;
  onSettingsSaved?: (settings: ReminderSettings) => void;
}

export const ReminderSettingsModal: React.FC<ReminderSettingsModalProps> = ({
  isOpen,
  onClose,
  lang = 'lo',
  onNavigateToInspect,
  onNavigateToRefill,
  currentTankPercent = 84.2,
  currentWeightKg = 19194.4,
  onSettingsSaved
}) => {
  const t = TRANSLATIONS[lang];
  const [settings, setSettings] = useState<ReminderSettings>(getStoredReminderSettings());
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [newTimeInput, setNewTimeInput] = useState<string>('12:00');
  const [testStatus, setTestStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredReminderSettings();
      setSettings(stored);
      setPermission(getNotificationPermission());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const supported = isNotificationSupported();

  const updateAndSave = (updated: ReminderSettings) => {
    setSettings(updated);
    saveReminderSettings(updated);
    if (onSettingsSaved) {
      onSettingsSaved(updated);
    }
  };

  const handleToggleEnabled = () => {
    const updated = { ...settings, enabled: !settings.enabled };
    updateAndSave(updated);
  };

  const handleToggleSound = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    updateAndSave(updated);
    if (updated.soundEnabled) {
      playNotificationChime();
    }
  };

  const handleToggleGasAlert = () => {
    const updated = { ...settings, gasLevelAlertEnabled: !settings.gasLevelAlertEnabled };
    updateAndSave(updated);
    if (updated.gasLevelAlertEnabled && updated.soundEnabled) {
      playAlertWarningChime();
    }
  };

  const handleThresholdChange = (val: number) => {
    const clamped = Math.max(5, Math.min(50, val));
    const updated = { ...settings, gasLevelAlertThresholdPercent: clamped };
    updateAndSave(updated);
  };

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
  };

  const handleAddTime = () => {
    if (!newTimeInput) return;
    if (settings.scheduledTimes.includes(newTimeInput)) return;
    const updatedTimes = [...settings.scheduledTimes, newTimeInput].sort();
    const updated = { ...settings, scheduledTimes: updatedTimes };
    updateAndSave(updated);
  };

  const handleRemoveTime = (timeToRemove: string) => {
    const updatedTimes = settings.scheduledTimes.filter(t => t !== timeToRemove);
    const updated = { ...settings, scheduledTimes: updatedTimes };
    updateAndSave(updated);
  };

  const handleAddPresetTime = (time: string) => {
    if (settings.scheduledTimes.includes(time)) return;
    const updatedTimes = [...settings.scheduledTimes, time].sort();
    const updated = { ...settings, scheduledTimes: updatedTimes };
    updateAndSave(updated);
  };

  const handleTriggerInspectionTest = () => {
    const sent = sendInspectionNotification(
      t.notificationAlertTitle,
      t.notificationAlertBody,
      () => {
        onClose();
        if (onNavigateToInspect) {
          onNavigateToInspect();
        }
      }
    );

    if (sent) {
      setTestStatus(t.testNotificationSuccess);
    } else {
      if (permission !== 'granted') {
        setTestStatus(
          lang === 'en'
            ? 'Browser notification blocked or not permitted. In-app sound chime played.'
            : lang === 'th'
            ? 'การแจ้งเตือนบราวเซอร์ถูกปิดกั้น แต่มีเสียงเตือนในระบบ'
            : 'ການແຈ້ງເຕືອນ Browser ຖືກປິດກັ້ນ ແຕ່ມີສຽງເຕືອນໃນລະບົບ'
        );
      } else {
        setTestStatus(t.testNotificationSuccess);
      }
    }

    setTimeout(() => setTestStatus(null), 4000);
  };

  const handleTriggerGasAlertTest = () => {
    const threshold = settings.gasLevelAlertThresholdPercent ?? 20;
    const title = t.gasAlertNotificationTitle;
    const body = t.gasAlertNotificationBody
      .replace('{pct}', String(currentTankPercent))
      .replace('{threshold}', String(threshold));

    const sent = sendGasLevelAlertNotification(
      title,
      body,
      () => {
        onClose();
        if (onNavigateToRefill) {
          onNavigateToRefill();
        }
      }
    );

    if (sent) {
      setTestStatus(
        lang === 'en'
          ? `Gas alert notification sent! (Threshold: ${threshold}%)`
          : lang === 'th'
          ? `ส่งการแจ้งเตือนระดับก๊าซต่ำเรียบร้อยแล้ว! (เกณฑ์: ${threshold}%)`
          : `ສົ່ງການແຈ້ງເຕືອນລະດັບກ໊າຊຕ່ຳສຳເລັດແລ້ວ! (ເກນ: ${threshold}%)`
      );
    } else {
      setTestStatus(
        lang === 'en'
          ? `In-app warning chime played! (Threshold: ${threshold}%)`
          : lang === 'th'
          ? `เล่นเสียงสัญญาณเตือนก๊าซต่ำเรียบร้อยแล้ว! (เกณฑ์: ${threshold}%)`
          : `ສົ່ງສຽງເຕືອນລະດັບກ໊າຊຕ່ຳຮຽບຮ້ອຍແລ້ວ! (ເກນ: ${threshold}%)`
      );
    }

    setTimeout(() => setTestStatus(null), 4500);
  };

  const currentThreshold = settings.gasLevelAlertThresholdPercent ?? 20;
  const equivalentKg = Math.round((currentThreshold / 100) * MAX_TANK_CAPACITY_KG);
  const isCurrentlyLow = currentTankPercent <= currentThreshold;
  const isCurrentlyCritical = currentTankPercent <= (settings.criticalLevelThresholdPercent ?? 10);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t.reminderTitle}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.reminderSub}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
          {/* Permission Status Banner */}
          <div className="p-3.5 rounded-2xl border bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {t.reminderStatus}
              </span>

              {permission === 'granted' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t.reminderPermissionGranted}</span>
                </span>
              )}

              {permission === 'denied' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span>{t.reminderPermissionDenied}</span>
                </span>
              )}

              {permission === 'default' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <Info className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t.reminderPermissionPrompt}</span>
                </span>
              )}
            </div>

            {permission !== 'granted' && supported && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.btnEnableNotifications}</span>
                </button>
              </div>
            )}
          </div>

          {/* Master Enable & Sound Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    {t.reminderEnabled}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {settings.enabled ? 'Active' : 'Muted'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleEnabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-hidden ${
                  settings.enabled ? 'bg-cyan-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                  {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    {t.soundChimeLabel}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Dual-tone Chime
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleSound}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-hidden ${
                  settings.soundEnabled ? 'bg-cyan-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section 1: Gas Level Percentage Alert (% in Tank) */}
          <div className="p-4 rounded-2xl border-2 border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 dark:border-amber-500/30 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                    <span>{t.gasLevelAlertSectionTitle}</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.gasLevelAlertDesc}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleGasAlert}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-hidden shrink-0 ${
                  settings.gasLevelAlertEnabled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.gasLevelAlertEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.gasLevelAlertEnabled && (
              <div className="space-y-3.5 pt-1">
                {/* Live Tank Comparison Status Badge */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-cyan-500" />
                      <span>{t.gasAlertCurrentLevel}:</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                      {currentTankPercent}%{' '}
                      <span className="text-[11px] font-normal text-slate-400 font-sans">
                        (≈ {currentWeightKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg)
                      </span>
                    </span>
                  </div>

                  {/* Status Indicator Chip */}
                  <div className="pt-0.5">
                    {isCurrentlyCritical ? (
                      <div className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
                        <span>{t.gasAlertCriticalStatus}</span>
                      </div>
                    ) : isCurrentlyLow ? (
                      <div className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                        <span>{t.gasAlertTriggeredStatus}</span>
                      </div>
                    ) : (
                      <div className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{t.gasAlertSafeStatus}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Interactive Slider & Progress Bar */}
                <div className="space-y-2.5 bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t.gasAlertThresholdLabel}:</span>
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
                        {currentThreshold}%
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        (≈ {equivalentKg.toLocaleString()} kg)
                      </span>
                    </div>
                  </div>

                  {/* Range Slider Track */}
                  <div className="space-y-1">
                    <input
                      type="range"
                      min={5}
                      max={50}
                      step={1}
                      value={currentThreshold}
                      onChange={e => handleThresholdChange(Number(e.target.value))}
                      className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />

                    {/* Visual Progress Scale Markers */}
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono px-0.5">
                      <span>5%</span>
                      <span className="text-amber-500 font-bold">20% (Default)</span>
                      <span>35%</span>
                      <span>50%</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.gasAlertSliderHint}
                  </p>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-400 mr-1">{t.quickPresetsLabel}</span>
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
                        onClick={() => handleThresholdChange(p.val)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          currentThreshold === p.val
                            ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-amber-50 dark:hover:bg-slate-600'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Trigger Test Button */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <button
                      type="button"
                      onClick={handleTriggerGasAlertTest}
                      className="w-full py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold rounded-xl text-xs border border-amber-500/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t.btnTestGasAlert}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Scheduled Daily Inspection Shifts */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>{t.reminderTimesLabel}</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {settings.scheduledTimes.length} times
              </span>
            </div>

            {/* Time chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {settings.scheduledTimes.map(time => (
                <div
                  key={time}
                  className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {time}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTime(time)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Remove time"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 mr-1">Presets:</span>
              {[
                { label: '08:00 (เช้า)', time: '08:00' },
                { label: '12:00 (เที่ยง)', time: '12:00' },
                { label: '16:00 (เย็น)', time: '16:00' },
                { label: '20:00 (ค่ำ)', time: '20:00' }
              ].map(p => (
                <button
                  key={p.time}
                  type="button"
                  onClick={() => handleAddPresetTime(p.time)}
                  disabled={settings.scheduledTimes.includes(p.time)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                    settings.scheduledTimes.includes(p.time)
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 opacity-60'
                      : 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800 hover:bg-cyan-50'
                  }`}
                >
                  +{p.label}
                </button>
              ))}
            </div>

            {/* Custom Time Adder */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="time"
                value={newTimeInput}
                onChange={e => setNewTimeInput(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddTime}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.btnAddTime}</span>
              </button>
            </div>
          </div>

          {/* Test Inspection Notification Action */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <button
              type="button"
              onClick={handleTriggerInspectionTest}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{t.btnTestNotification}</span>
            </button>

            {testStatus && (
              <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                <span>{testStatus}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            {t.btnClose}
          </button>
        </div>
      </div>
    </div>
  );
};
