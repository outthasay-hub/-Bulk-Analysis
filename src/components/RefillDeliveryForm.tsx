import React, { useState } from 'react';
import { RefillRecord } from '../types/o2Tracker';
import { calculateFromLevel } from '../data/cfl20Table';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Clock, 
  FileText, 
  Scale, 
  Camera, 
  ChevronRight,
  Info,
  Layers
} from 'lucide-react';

interface RefillDeliveryFormProps {
  onSaveRefill: (refill: Omit<RefillRecord, 'id' | 'createdAt'>) => void;
  lastTankLevel?: number;
  nextRoundNumber?: number;
  lang?: Language;
}

export const RefillDeliveryForm: React.FC<RefillDeliveryFormProps> = ({
  onSaveRefill,
  lastTankLevel = 1500,
  nextRoundNumber = 2,
  lang = 'lo'
}) => {
  const t = TRANSLATIONS[lang];
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [roundNumber, setRoundNumber] = useState<number>(nextRoundNumber);
  const [roundBatchCode, setRoundBatchCode] = useState<string>(`R${String(nextRoundNumber).padStart(2, '0')}-${now.getFullYear()}`);
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState(timeStr);
  const [supplier, setSupplier] = useState('Linde (Thailand) Public Company Limited');
  const [docketNumber, setDocketNumber] = useState('18058');
  const [invoiceNumber, setInvoiceNumber] = useState('3192337');
  const [tankerId, setTankerId] = useState('SISU-1310025');
  const [truckPlate, setTruckPlate] = useState('71-2634 / 71-2851');

  // Weights & Levels
  const [tareWeightKg, setTareWeightKg] = useState<number>(21720);
  const [grossWeightKg, setGrossWeightKg] = useState<number>(41750);
  const [docketSuppliedKg, setDocketSuppliedKg] = useState<number>(20030);

  const [levelBeforeMmH2O, setLevelBeforeMmH2O] = useState<number>(lastTankLevel);
  const [levelAfterMmH2O, setLevelAfterMmH2O] = useState<number>(6700);

  const [pressureBeforeMpa, setPressureBeforeMpa] = useState<number>(0.72);
  const [pressureAfterMpa, setPressureAfterMpa] = useState<number>(0.86);

  const [receiverName, setReceiverName] = useState<string>(
    localStorage.getItem('last_receiver_name') || 'ອຸດທະໄສ (Outthasay)'
  );
  const [notes, setNotes] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('/public/assets/aistudio/____________4322076a.jpeg');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Calculations
  const calcBefore = calculateFromLevel(levelBeforeMmH2O);
  const calcAfter = calculateFromLevel(levelAfterMmH2O);
  const calculatedReceivedKg = Math.max(0, calcAfter.weight - calcBefore.weight);
  const discrepancyKg = calculatedReceivedKg - docketSuppliedKg;
  const discrepancyPercent = docketSuppliedKg > 0 ? (discrepancyKg / docketSuppliedKg) * 100 : 0;

  const handleTareGrossChange = (tare: number, gross: number) => {
    setTareWeightKg(tare);
    setGrossWeightKg(gross);
    if (gross > tare) {
      setDocketSuppliedKg(gross - tare);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!docketNumber.trim()) {
      alert(lang === 'th' ? 'กรุณาใส่เลขที่ใบส่งสินค้า' : lang === 'en' ? 'Please enter Delivery Docket No.' : 'ກະລຸນາໃສ່ເລກທີໃບສົ່ງເຄື່ອງ');
      return;
    }

    localStorage.setItem('last_receiver_name', receiverName);

    onSaveRefill({
      roundNumber,
      roundBatchCode,
      date,
      time,
      supplier,
      docketNumber,
      invoiceNumber: invoiceNumber.trim() || undefined,
      tankerId,
      truckPlate,
      tareWeightKg: tareWeightKg || undefined,
      grossWeightKg: grossWeightKg || undefined,
      docketSuppliedKg,
      levelBeforeMmH2O,
      weightBeforeKg: calcBefore.weight,
      levelAfterMmH2O,
      weightAfterKg: calcAfter.weight,
      pressureBeforeMpa,
      pressureAfterMpa,
      calculatedReceivedKg: Number(calculatedReceivedKg.toFixed(1)),
      discrepancyKg: Number(discrepancyKg.toFixed(1)),
      discrepancyPercent: Number(discrepancyPercent.toFixed(2)),
      receiverName,
      cycleStatus: 'active',
      notes: notes.trim() || undefined,
      photoUrl: photoUrl || undefined
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t.refillBannerTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t.refillBannerSub}
            </p>
          </div>
        </div>
      </div>

      {/* Discrepancy & Verification Summary Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          {t.reconciliationTitle}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {t.docketNetLabel}
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {docketSuppliedKg.toLocaleString()} <span className="text-xs font-normal">kg</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Gross - Tare = {grossWeightKg - tareWeightKg} kg
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {t.tankGainLabel}
            </div>
            <div className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">
              {calculatedReceivedKg.toLocaleString(undefined, { minimumFractionDigits: 1 })}{' '}
              <span className="text-xs font-normal">kg</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {calcAfter.weight.toLocaleString()} - {calcBefore.weight.toLocaleString()} kg
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border ${
            Math.abs(discrepancyPercent) <= 4.0
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
          }`}>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {t.varianceLabel}
            </div>
            <div className="text-xl font-bold font-mono mt-0.5 text-slate-900 dark:text-white">
              {discrepancyKg > 0 ? `+${discrepancyKg.toFixed(1)}` : discrepancyKg.toFixed(1)}{' '}
              <span className="text-xs font-normal">kg</span>
            </div>
            <div className={`text-[11px] font-semibold mt-0.5 ${
              Math.abs(discrepancyPercent) <= 4.0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
            }`}>
              {discrepancyPercent > 0 ? `+${discrepancyPercent.toFixed(2)}%` : `${discrepancyPercent.toFixed(2)}%`}
              {Math.abs(discrepancyPercent) <= 4.0 ? ` ${t.normalBoilOffNote}` : ` ${t.inspectFurtherNote}`}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg">
          <Info className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
          <span>{t.engineeringTransferNote}</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        {/* Section: Delivery Details */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            {t.refillSec1Title}
          </h4>

          {/* Cycle & Batch Code Selection */}
          <div className="p-3.5 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-cyan-950 dark:text-cyan-200 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>{t.inputRoundNumber}</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={roundNumber}
                  onChange={e => {
                    const val = Number(e.target.value) || 1;
                    setRoundNumber(val);
                    setRoundBatchCode(`R${String(val).padStart(2, '0')}-${now.getFullYear()}`);
                  }}
                  className="w-24 px-3 py-2 bg-white dark:bg-slate-800 border border-cyan-300 dark:border-cyan-700 rounded-xl text-sm font-mono font-bold text-cyan-800 dark:text-cyan-300 text-center"
                  required
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {lang === 'en' ? `(Round #${roundNumber})` : lang === 'th' ? `(รอบที่ ${roundNumber})` : `(ຮອບທີ ${roundNumber})`}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-cyan-950 dark:text-cyan-200 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>{t.inputBatchCode}</span>
              </label>
              <input
                type="text"
                value={roundBatchCode}
                onChange={e => setRoundBatchCode(e.target.value)}
                placeholder="e.g. R02-2026"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-cyan-300 dark:border-cyan-700 rounded-xl text-sm font-mono text-slate-800 dark:text-slate-200 font-semibold uppercase"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.inputRefillDate}</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.inputRefillTime}</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.inputSupplier}
              </label>
              <input
                type="text"
                value={supplier}
                onChange={e => setSupplier(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.inputDocketNo}
              </label>
              <input
                type="text"
                value={docketNumber}
                onChange={e => setDocketNumber(e.target.value)}
                placeholder="18057"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.inputTankerId}
              </label>
              <input
                type="text"
                value={tankerId}
                onChange={e => setTankerId(e.target.value)}
                placeholder="SISU-1310025"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.inputTruckPlate}
              </label>
              <input
                type="text"
                value={truckPlate}
                onChange={e => setTruckPlate(e.target.value)}
                placeholder="71-2634 / 71-2851"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section: Weight from Docket */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            {t.refillSec2Title}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.inputGrossWeight}
              </label>
              <input
                type="number"
                value={grossWeightKg}
                onChange={e => handleTareGrossChange(tareWeightKg, Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.inputTareWeight}
              </label>
              <input
                type="number"
                value={tareWeightKg}
                onChange={e => handleTareGrossChange(Number(e.target.value), grossWeightKg)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.inputNetSupplied}
              </label>
              <input
                type="number"
                value={docketSuppliedKg}
                onChange={e => setDocketSuppliedKg(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-bold font-mono text-cyan-600 dark:text-cyan-400"
                required
              />
            </div>
          </div>
        </div>

        {/* Section: Tank Level Before & After */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            {t.refillSec3Title}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Before Fill */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.beforeRefillBox}
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  {t.inputCyjLevel}
                </label>
                <input
                  type="number"
                  value={levelBeforeMmH2O}
                  onChange={e => setLevelBeforeMmH2O(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-mono"
                  required
                />
                <div className="text-[11px] text-slate-500 mt-1">
                  {t.metricWeight}: <strong className="font-mono">{calcBefore.weight.toLocaleString()} kg</strong> ({calcBefore.volume.toLocaleString()} L)
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  {t.inputPressureBefore}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={pressureBeforeMpa}
                  onChange={e => setPressureBeforeMpa(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-mono"
                />
              </div>
            </div>

            {/* After Fill */}
            <div className="p-3.5 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 space-y-3">
              <div className="text-xs font-semibold text-cyan-800 dark:text-cyan-300">
                {t.afterRefillBox}
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  {t.inputCyjLevel}
                </label>
                <input
                  type="number"
                  value={levelAfterMmH2O}
                  onChange={e => setLevelAfterMmH2O(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-mono font-bold text-cyan-600 dark:text-cyan-400"
                  required
                />
                <div className="text-[11px] text-slate-500 mt-1">
                  {t.metricWeight}: <strong className="font-mono">{calcAfter.weight.toLocaleString()} kg</strong> ({calcAfter.volume.toLocaleString()} L)
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  {t.inputPressureAfter}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={pressureAfterMpa}
                  onChange={e => setPressureAfterMpa(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Receiver & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t.inputReceiverName}
            </label>
            <input
              type="text"
              value={receiverName}
              onChange={e => setReceiverName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t.inputRefillNotes}
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Tanker hoses checked, normal transfer..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Photo Docket link */}
        {photoUrl && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
            <img
              src={photoUrl}
              alt="Docket preview"
              referrerPolicy="no-referrer"
              className="w-14 h-14 object-cover rounded-lg border border-slate-200"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {t.docketPhotoAttachment}
              </div>
              <div className="text-[11px] text-slate-500">
                Linde Docket No. 18057
              </div>
            </div>
            <a
              href={photoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-cyan-600 hover:text-cyan-700 font-medium px-2 py-1"
            >
              {t.btnViewFullPhoto}
            </a>
          </div>
        )}

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-emerald-800 dark:text-emerald-200 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t.successRefillSaved}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{t.btnSaveRefill}</span>
        </button>
      </form>
    </div>
  );
};
