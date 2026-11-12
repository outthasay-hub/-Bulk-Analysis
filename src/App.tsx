import React, { useState, useEffect } from 'react';
import { 
  getStoredDailyRecords, 
  saveDailyRecords, 
  getStoredRefills, 
  saveRefills, 
  getStoredTankSpecs,
  saveTankSpecs,
  resetToDemoData
} from './utils/storage';
import { MAX_TANK_CAPACITY_KG } from './data/cfl20Table';
import { DailyRecord, RefillRecord, TankSpecs } from './types/o2Tracker';
import { Language, TRANSLATIONS } from './utils/i18n';
import { DailyInspectionForm } from './components/DailyInspectionForm';
import { RefillDeliveryForm } from './components/RefillDeliveryForm';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { CalibrationLookup } from './components/CalibrationLookup';
import { HistoryAndReports } from './components/HistoryAndReports';
import { SystemAnalysisModal } from './components/SystemAnalysisModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { ReminderSettingsModal } from './components/ReminderSettingsModal';
import { getStoredSpreadsheetConfig, appendDailyRecordToSheet, appendRefillRecordToSheet } from './services/googleSheets';
import { getAccessToken } from './services/googleAuth';
import { 
  evaluateScheduledReminders, 
  sendInspectionNotification, 
  sendGasLevelAlertNotification,
  getStoredReminderSettings,
  saveReminderSettings,
  getNotificationPermission,
  ReminderSettings 
} from './services/reminderNotification';
import { 
  LayoutDashboard, 
  Gauge, 
  Truck, 
  Table, 
  History, 
  Moon, 
  Sun, 
  Cpu, 
  Globe,
  Sheet,
  BellRing
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('o2_bulk_lang') as Language) || 'lo';
  });
  const t = TRANSLATIONS[lang];

  const [activeTab, setActiveTab] = useState<'dashboard' | 'inspect' | 'refill' | 'calibration' | 'history'>('dashboard');
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
  const [refillRecords, setRefillRecords] = useState<RefillRecord[]>([]);
  const [tankSpecs, setTankSpecs] = useState<TankSpecs>(getStoredTankSpecs());
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState<boolean>(false);
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState<boolean>(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);
  const [activeReminderAlert, setActiveReminderAlert] = useState<string | null>(null);
  const [reminderSettings, setReminderSettings] = useState(() => getStoredReminderSettings());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => getNotificationPermission());
  const [sheetConfig, setSheetConfig] = useState(() => getStoredSpreadsheetConfig());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('o2_bulk_lang', newLang);
  };

  // Load data on mount
  useEffect(() => {
    setDailyRecords(getStoredDailyRecords());
    setRefillRecords(getStoredRefills());
    setTankSpecs(getStoredTankSpecs());
  }, []);

  // Update sheetConfig when sheets modal opens or closes
  useEffect(() => {
    setSheetConfig(getStoredSpreadsheetConfig());
  }, [isGoogleSheetsModalOpen]);

  // Sync dark class on html
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Scheduled daily inspection reminder background checker
  useEffect(() => {
    setNotificationPermission(getNotificationPermission());
    setReminderSettings(getStoredReminderSettings());

    const checkInterval = setInterval(() => {
      const triggeredSlot = evaluateScheduledReminders();
      if (triggeredSlot) {
        sendInspectionNotification(
          t.notificationAlertTitle,
          `${t.notificationAlertBody} (${triggeredSlot})`,
          () => {
            setActiveTab('inspect');
            setActiveReminderAlert(null);
          }
        );
        setActiveReminderAlert(triggeredSlot);
      }
    }, 20000);

    return () => clearInterval(checkInterval);
  }, [t.notificationAlertTitle, t.notificationAlertBody]);

  // Keep reminder settings in sync when modal closes
  useEffect(() => {
    setReminderSettings(getStoredReminderSettings());
    setNotificationPermission(getNotificationPermission());
  }, [isReminderModalOpen]);

  const handleUpdateReminderSettings = (newSettings: ReminderSettings) => {
    setReminderSettings(newSettings);
    saveReminderSettings(newSettings);
    if (typeof newSettings.gasLevelAlertThresholdPercent === 'number') {
      const newThresholdKg = Math.round((newSettings.gasLevelAlertThresholdPercent / 100) * MAX_TANK_CAPACITY_KG);
      const updatedSpecs: TankSpecs = {
        ...tankSpecs,
        lowStockThresholdKg: newThresholdKg
      };
      setTankSpecs(updatedSpecs);
      saveTankSpecs(updatedSpecs);
    }
  };

  const handleSaveDailyRecord = async (newRecData: Omit<DailyRecord, 'id' | 'createdAt'>) => {
    const newRecord: DailyRecord = {
      ...newRecData,
      id: `daily-${Date.now()}`,
      createdAt: Date.now()
    };
    const updated = [newRecord, ...dailyRecords];
    setDailyRecords(updated);
    saveDailyRecords(updated);

    // Check if new reading breaches low gas level alert threshold
    const threshold = reminderSettings.gasLevelAlertThresholdPercent ?? 20;
    if (
      newRecord.tankPercentage <= threshold &&
      (reminderSettings.gasLevelAlertEnabled ?? true)
    ) {
      const title = t.gasAlertNotificationTitle;
      const body = t.gasAlertNotificationBody
        .replace('{pct}', String(newRecord.tankPercentage))
        .replace('{threshold}', String(threshold));
      sendGasLevelAlertNotification(title, body, () => {
        setActiveTab('refill');
      });
    }

    // Auto-sync to Google Sheets in background if connected
    try {
      const token = await getAccessToken();
      const config = getStoredSpreadsheetConfig();
      if (token && config?.spreadsheetId) {
        appendDailyRecordToSheet(token, config.spreadsheetId, newRecord).catch(err => {
          console.warn('Auto-sync daily record to Google Sheets failed:', err);
        });
      }
    } catch (err) {
      console.warn('Could not retrieve access token for auto-sync:', err);
    }
  };

  const handleSaveRefillRecord = async (newRefillData: Omit<RefillRecord, 'id' | 'createdAt'>) => {
    const newRefill: RefillRecord = {
      ...newRefillData,
      id: `refill-${Date.now()}`,
      createdAt: Date.now()
    };
    const updated = [newRefill, ...refillRecords];
    setRefillRecords(updated);
    saveRefills(updated);
    setDailyRecords(getStoredDailyRecords());

    // Auto-sync to Google Sheets in background if connected
    try {
      const token = await getAccessToken();
      const config = getStoredSpreadsheetConfig();
      if (token && config?.spreadsheetId) {
        appendRefillRecordToSheet(token, config.spreadsheetId, newRefill).catch(err => {
          console.warn('Auto-sync refill to Google Sheets failed:', err);
        });
      }
    } catch (err) {
      console.warn('Could not retrieve access token for auto-sync:', err);
    }
  };

  const handleDeleteDaily = (id: string) => {
    const updated = dailyRecords.filter(r => r.id !== id);
    setDailyRecords(updated);
    saveDailyRecords(updated);
  };

  const handleDeleteRefill = (id: string) => {
    const updated = refillRecords.filter(r => r.id !== id);
    setRefillRecords(updated);
    saveRefills(updated);
    setDailyRecords(getStoredDailyRecords());
  };

  const handleResetDemo = () => {
    resetToDemoData();
    setDailyRecords(getStoredDailyRecords());
    setRefillRecords(getStoredRefills());
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar following Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-8 shadow-xs">
        {/* Zone 1: Brand title, one line */}
        <div className="flex items-center gap-2.5 shrink-0">
          <img
            src="/public/assets/aistudio/Logo_SDG_41023427.jpg"
            alt="SDG Logo"
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200 dark:border-slate-700 p-0.5"
          />
          <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            {t.appName}
          </span>
          <span className="hidden sm:inline-block text-[11px] font-mono text-cyan-700 dark:text-cyan-400 font-semibold bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-800">
            {t.tankBadge}
          </span>
        </div>

        {/* Zone 2: 4–5 nav links, 1–2 word labels, single-line (desktop only) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'dashboard'
                ? 'text-cyan-600 dark:text-cyan-400 font-bold border-b-2 border-cyan-500'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.navDashboard}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inspect')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'inspect'
                ? 'text-cyan-600 dark:text-cyan-400 font-bold border-b-2 border-cyan-500'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.navInspect}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('refill')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'refill'
                ? 'text-cyan-600 dark:text-cyan-400 font-bold border-b-2 border-cyan-500'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.navRefill}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calibration')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'calibration'
                ? 'text-cyan-600 dark:text-cyan-400 font-bold border-b-2 border-cyan-500'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.navCalibration}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'history'
                ? 'text-cyan-600 dark:text-cyan-400 font-bold border-b-2 border-cyan-500'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.navHistory}
          </button>
        </nav>

        {/* Zone 3: 1 primary action + Language Selector & Theme Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Tri-Lingual Selector: Lao, Thai, English */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => handleSetLang('lo')}
              className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all ${
                lang === 'lo'
                  ? 'bg-white dark:bg-cyan-500 text-cyan-800 dark:text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="ພາສາລາວ (Lao)"
            >
              🇱🇦 ລາວ
            </button>

            <button
              type="button"
              onClick={() => handleSetLang('th')}
              className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all ${
                lang === 'th'
                  ? 'bg-white dark:bg-cyan-500 text-cyan-800 dark:text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="ภาษาไทย (Thai)"
            >
              🇹🇭 ไทย
            </button>

            <button
              type="button"
              onClick={() => handleSetLang('en')}
              className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all ${
                lang === 'en'
                  ? 'bg-white dark:bg-cyan-500 text-cyan-800 dark:text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="English"
            >
              🇬🇧 EN
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="Toggle dark mode"
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setIsReminderModalOpen(true)}
            className={`relative p-2 rounded-xl transition-colors border ${
              reminderSettings.enabled && notificationPermission === 'granted'
                ? 'bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent'
            }`}
            title={t.reminderTitle}
            aria-label="Inspection Reminders"
          >
            <BellRing className="w-4 h-4" />
            {reminderSettings.enabled && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsGoogleSheetsModalOpen(true)}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 whitespace-nowrap ${
              sheetConfig?.spreadsheetId
                ? 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
            title="Google Sheets Sync"
          >
            <Sheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">Sheets</span>
            {sheetConfig?.spreadsheetId && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsAnalysisModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{t.systemAnalysis}</span>
            <span className="sm:hidden">{t.analysisShort}</span>
          </button>
        </div>
      </header>

      {/* Active Scheduled Reminder Alert Banner */}
      {activeReminderAlert && (
        <div className="mx-3 sm:mx-6 lg:mx-8 mt-3 p-3.5 sm:p-4 rounded-2xl bg-amber-500 text-slate-950 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm">
                {t.notificationAlertTitle} ({activeReminderAlert})
              </div>
              <div className="text-[11px] sm:text-xs text-slate-950/80 font-medium">
                {t.notificationAlertBody}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setActiveTab('inspect');
                setActiveReminderAlert(null);
              }}
              className="px-3.5 py-1.5 sm:py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              {t.btnGoRecordNow}
            </button>
            <button
              type="button"
              onClick={() => setActiveReminderAlert(null)}
              className="p-1.5 text-slate-900 hover:text-black text-xs font-bold"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-24 md:pb-8">
        {activeTab === 'dashboard' && (
          <DashboardAnalytics
            dailyRecords={dailyRecords}
            refillRecords={refillRecords}
            tankSpecs={tankSpecs}
            onNavigateToInspect={() => setActiveTab('inspect')}
            onNavigateToRefill={() => setActiveTab('refill')}
            onOpenReminderSettings={() => setIsReminderModalOpen(true)}
            lang={lang}
            reminderSettings={reminderSettings}
            onUpdateReminderSettings={handleUpdateReminderSettings}
          />
        )}

        {activeTab === 'inspect' && (
          <DailyInspectionForm
            latestRecord={dailyRecords[0]}
            onSaveRecord={rec => {
              handleSaveDailyRecord(rec);
              setActiveTab('history');
            }}
            onNavigateToRefill={() => setActiveTab('refill')}
            lang={lang}
          />
        )}

        {activeTab === 'refill' && (
          <RefillDeliveryForm
            lastTankLevel={dailyRecords[0]?.levelMmH2O || 1500}
            nextRoundNumber={refillRecords.length + 1}
            onSaveRefill={refill => {
              handleSaveRefillRecord(refill);
              setActiveTab('history');
            }}
            lang={lang}
          />
        )}

        {activeTab === 'calibration' && (
          <CalibrationLookup lang={lang} />
        )}

        {activeTab === 'history' && (
          <HistoryAndReports
            dailyRecords={dailyRecords}
            refillRecords={refillRecords}
            onDeleteDailyRecord={handleDeleteDaily}
            onDeleteRefillRecord={handleDeleteRefill}
            onResetDemoData={handleResetDemo}
            onOpenSheetsModal={() => setIsGoogleSheetsModalOpen(true)}
            lang={lang}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (Thumb Zone Ergonomics) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-5 h-16 pb-safe shadow-lg">
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeTab === 'dashboard'
              ? 'text-cyan-600 dark:text-cyan-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">{t.navDashboard}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inspect')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeTab === 'inspect'
              ? 'text-cyan-600 dark:text-cyan-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Gauge className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">{t.navInspect}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('refill')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeTab === 'refill'
              ? 'text-cyan-600 dark:text-cyan-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">{t.navRefill}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calibration')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeTab === 'calibration'
              ? 'text-cyan-600 dark:text-cyan-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Table className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">{t.navCalibration}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeTab === 'history'
              ? 'text-cyan-600 dark:text-cyan-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">{t.navHistory}</span>
        </button>
      </nav>

      {/* System Analysis Modal */}
      <SystemAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        lang={lang}
      />

      {/* Google Sheets Sync Modal */}
      <GoogleSheetsModal
        isOpen={isGoogleSheetsModalOpen}
        onClose={() => setIsGoogleSheetsModalOpen(false)}
        dailyRecords={dailyRecords}
        refillRecords={refillRecords}
        lang={lang}
      />

      {/* Reminder Settings Modal */}
      <ReminderSettingsModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        lang={lang}
        onNavigateToInspect={() => setActiveTab('inspect')}
        onNavigateToRefill={() => setActiveTab('refill')}
        currentTankPercent={dailyRecords[0]?.tankPercentage ?? 84.2}
        currentWeightKg={dailyRecords[0]?.calculatedWeightKg ?? 19194.4}
        onSettingsSaved={handleUpdateReminderSettings}
      />
    </div>
  );
}
