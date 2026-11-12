import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { googleSignIn, googleLogout, getAccessToken, initAuth } from '../services/googleAuth';
import { 
  createO2TrackingSpreadsheet, 
  syncAllRecordsToSheet, 
  getStoredSpreadsheetConfig, 
  saveSpreadsheetConfig, 
  SpreadsheetConfig 
} from '../services/googleSheets';
import { DailyRecord, RefillRecord } from '../types/o2Tracker';
import { Language } from '../utils/i18n';
import { 
  X, 
  FileSpreadsheet, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw, 
  Plus, 
  LogOut, 
  ShieldCheck, 
  Cloud, 
  Database,
  AlertCircle
} from 'lucide-react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyRecords: DailyRecord[];
  refillRecords: RefillRecord[];
  lang?: Language;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  dailyRecords,
  refillRecords,
  lang = 'lo'
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [spreadsheetConfig, setSpreadsheetConfig] = useState<SpreadsheetConfig | null>(getStoredSpreadsheetConfig());
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [customSheetId, setCustomSheetId] = useState<string>('');

  useEffect(() => {
    const unsubscribe = initAuth(
      (authedUser, accessToken) => {
        setUser(authedUser);
        setToken(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setStatusMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setStatusMessage({
          type: 'success',
          text: lang === 'th' ? `เชื่อมต่อบัญชี ${result.user.email} เรียบร้อยแล้ว` :
                lang === 'en' ? `Connected as ${result.user.email}` :
                `ເຊື່ອມຕໍ່ບັນຊີ ${result.user.email} ສຳເລັດແລ້ວ`
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Login failed'
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await googleLogout();
    setUser(null);
    setToken(null);
  };

  const handleCreateSpreadsheet = async () => {
    const accessToken = token || (await getAccessToken());
    if (!accessToken) {
      setStatusMessage({
        type: 'error',
        text: lang === 'th' ? 'กรุณา Sign in with Google ก่อน' :
              lang === 'en' ? 'Please sign in with Google first' :
              'ກະລຸນາ Sign in with Google ກ່ອນ'
      });
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const config = await createO2TrackingSpreadsheet(accessToken);
      setSpreadsheetConfig(config);

      // Immediately sync current records into the newly created sheet
      await syncAllRecordsToSheet(accessToken, config.spreadsheetId, dailyRecords, refillRecords);

      setStatusMessage({
        type: 'success',
        text: lang === 'th' ? 'สร้างไฟล์ Google Spreadsheet และซิงก์ข้อมูลเรียบร้อยแล้ว!' :
              lang === 'en' ? 'Google Spreadsheet created and data synced successfully!' :
              'ສ້າງໄຟລ໌ Google Spreadsheet ແລະ ຊິງຄ໌ຂໍ້ມູນສຳເລັດແລ້ວ!'
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to create spreadsheet'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSyncAll = async () => {
    if (!spreadsheetConfig) return;
    const accessToken = token || (await getAccessToken());
    if (!accessToken) {
      setStatusMessage({
        type: 'error',
        text: lang === 'th' ? 'เซสชันหมดอายุ กรุณา Sign in อีกครั้ง' :
              lang === 'en' ? 'Session expired, please sign in again' :
              'ເຊດຊັນໝົດອາຍຸ ກະລຸນາ Sign in ອີກຄັ້ງ'
      });
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      await syncAllRecordsToSheet(accessToken, spreadsheetConfig.spreadsheetId, dailyRecords, refillRecords);
      const updated = { ...spreadsheetConfig, lastSyncedAt: Date.now() };
      setSpreadsheetConfig(updated);
      saveSpreadsheetConfig(updated);

      setStatusMessage({
        type: 'success',
        text: lang === 'th' ? `ซิงก์ข้อมูล ${dailyRecords.length} รายการตรวจ และ ${refillRecords.length} รายการเติม เรียบร้อยแล้ว!` :
              lang === 'en' ? `Synced ${dailyRecords.length} daily logs and ${refillRecords.length} refills successfully!` :
              `ຊິງຄ໌ຂໍ້ມູນ ${dailyRecords.length} ລາຍການກວດກາ ແລະ ${refillRecords.length} ລາຍການເຕີມ ສຳເລັດແລ້ວ!`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Sync failed'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConnectExisting = () => {
    if (!customSheetId.trim()) return;
    let cleanId = customSheetId.trim();
    if (cleanId.includes('/d/')) {
      const parts = cleanId.split('/d/');
      cleanId = parts[1].split('/')[0];
    }

    const config: SpreadsheetConfig = {
      spreadsheetId: cleanId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${cleanId}/edit`,
      title: 'Connected Google Sheet',
      lastSyncedAt: Date.now()
    };
    setSpreadsheetConfig(config);
    saveSpreadsheetConfig(config);
    setCustomSheetId('');
    setStatusMessage({
      type: 'success',
      text: lang === 'th' ? 'เชื่อมต่อกับ Google Sheet สำเร็จแล้ว' :
            lang === 'en' ? 'Connected to Google Sheet successfully' :
            'ເຊື່ອມຕໍ່ກັບ Google Sheet ສຳເລັດແລ້ວ'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full my-auto shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {lang === 'th' ? 'เชื่อมต่อฐานข้อมูล Google Sheets' :
                 lang === 'en' ? 'Google Sheets Database Integration' :
                 'ເຊື່ອມຕໍ່ຖານຂໍ້ມູນ Google Sheets'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'th' ? 'บันทึกข้อมูลและซิงก์ค่าก๊าซลง Google Drive ของคุณโดยอัตโนมัติ' :
                 lang === 'en' ? 'Automatically stream and backup bulk O2 records to your Google Drive' :
                 'ບັນທຶກຂໍ້ມູນ ແລະ ຊິງຄ໌ຄ່າກ໊າຊລົງ Google Drive ຂອງທ່ານອັດຕະໂນມັດ'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 text-sm">
          {/* Status Alert Banner */}
          {statusMessage && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Section 1: Google Account Status */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {lang === 'th' ? '1. บัญชี Google ผู้ใช้งาน' :
                 lang === 'en' ? '1. Google Account Connection' :
                 '1. ບັນຊີ Google ຜູ້ໃຊ້ງານ'}
              </span>
              {user ? (
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>CONNECTED</span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">NOT CONNECTED</span>
              )}
            </div>

            <div className="mt-3">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full border border-slate-300"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {user.displayName || user.email}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {lang === 'th' ? 'ลงชื่อเข้าใช้ด้วยบัญชี Google เพื่ออนุญาตให้แอปสร้างและอัปเดตสเปรดชีตใน Google Drive' :
                     lang === 'en' ? 'Sign in with your Google account to grant permission to create and update spreadsheets in your Drive.' :
                     'ເຂົ້າສູ່ລະບົບດ້ວຍບັນຊີ Google ເພື່ອອະນຸຍາດໃຫ້ແອັບສ້າງ ແລະ ອັບເດດສະເປຣດຊີດໃນ Google Drive'}
                  </p>

                  {/* Official Google Material Button */}
                  <button
                    type="button"
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    className="w-full h-11 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl font-medium text-xs shadow-xs transition-all flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-60"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Spreadsheet Connection & Actions */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {lang === 'th' ? '2. สเปรดชีตที่เชื่อมต่อ (Target Spreadsheet)' :
               lang === 'en' ? '2. Target Spreadsheet' :
               '2. ສະເປຣດຊີດທີ່ເຊື່ອມຕໍ່ (Target Spreadsheet)'}
            </div>

            {spreadsheetConfig ? (
              <div className="space-y-3">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {spreadsheetConfig.title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      ID: {spreadsheetConfig.spreadsheetId}
                    </div>
                    {spreadsheetConfig.lastSyncedAt && (
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {lang === 'th' ? 'ซิงก์ล่าสุดเมื่อ: ' : lang === 'en' ? 'Last synced: ' : 'ຊິງຄ໌ລ່າສຸດ: '}
                        {new Date(spreadsheetConfig.lastSyncedAt).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <a
                    href={spreadsheetConfig.spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-3 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0"
                  >
                    <span>{lang === 'th' ? 'เปิดดูใน Sheets' : lang === 'en' ? 'Open in Sheets' : 'ເປີດໃນ Sheets'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSyncAll}
                    disabled={isProcessing}
                    className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                    <span>
                      {isProcessing
                        ? 'Syncing...'
                        : lang === 'th' ? 'ซิงก์ข้อมูลทั้งหมดลง Sheet ตอนนี้' :
                          lang === 'en' ? 'Sync All Records to Sheet Now' :
                          'ຊິງຄ໌ຂໍ້ມູນທັງໝົດລົງ Sheet ດຽວນີ້'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(lang === 'th' ? 'ต้องการยกเลิกการผูกไฟล์นี้ใช่หรือไม่?' : 'Disconnect this sheet?')) {
                        setSpreadsheetConfig(null);
                        saveSpreadsheetConfig(null);
                      }
                    }}
                    className="px-3 py-2 text-xs text-slate-500 hover:text-rose-600 rounded-xl"
                  >
                    {lang === 'th' ? 'เปลี่ยนไฟล์' : 'Change Sheet'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleCreateSpreadsheet}
                  disabled={isProcessing || !user}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-60"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {isProcessing
                      ? 'Creating in Google Drive...'
                      : lang === 'th' ? 'สร้างไฟล์ Google Spreadsheet ใหม่ใน Google Drive ของคุณ' :
                        lang === 'en' ? 'Create New O₂ Log Sheet in your Google Drive' :
                        'ສ້າງໄຟລ໌ Google Sheet ໃໝ່ໃນ Google Drive ຂອງທ່ານ'}
                  </span>
                </button>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] text-slate-500 mb-1.5">
                    {lang === 'th' ? 'หรือนำ Spreadsheet ID ที่มีอยู่แล้วมาเชื่อมต่อ:' :
                     lang === 'en' ? 'Or paste an existing Google Spreadsheet ID / Link:' :
                     'ຫຼື ໃສ່ Spreadsheet ID ທີ່ມີຢູ່ແລ້ວ:'}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customSheetId}
                      onChange={e => setCustomSheetId(e.target.value)}
                      placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleConnectExisting}
                      className="px-3 py-2 bg-slate-900 dark:bg-cyan-500 dark:text-slate-950 text-white rounded-xl text-xs font-semibold shrink-0"
                    >
                      {lang === 'th' ? 'เชื่อมต่อ' : 'Connect'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Google Sheets Structure Explanation */}
          <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40 p-3 rounded-xl space-y-1">
            <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'th' ? 'โครงสร้างไฟล์ที่ระบบจะสร้างให้อัตโนมัติ:' : 'Auto-generated Sheets Structure:'}</span>
            </div>
            <div>• <strong>Daily Inspections (ກວດກາປະຈຳວັນ)</strong>: ວັນທີ, ເວລາ, ມາດວັດ CYJ, ຄວາມດັນ MPa, Volume L, Weight kg, % ຖັງ, ຊົມໃຊ້ຈິງ, ຜູ້ກວດກາ</div>
            <div>• <strong>Bulk Refills (ຮັບເຕີມກ໊າຊ)</strong>: ວັນທີ, ເລກທີໃບສົ່ງ Docket, Tanker ID, ທະບຽນລົດ, Gross/Tare/Net kg, ຍອດຂຶ້ນຖັງ, ສ່ວນຕ່າງ Variance %</div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            {lang === 'th' ? 'เสร็จสิ้น (Done)' : lang === 'en' ? 'Done' : 'ສຳເລັດ (Done)'}
          </button>
        </div>
      </div>
    </div>
  );
};
