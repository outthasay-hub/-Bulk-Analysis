import React, { useState } from 'react';
import { CFL20_CALIBRATION_TABLE, calculateFromLevel, LO2_DENSITY_KG_L, MAX_TANK_CAPACITY_KG } from '../data/cfl20Table';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { 
  Calculator, 
  Search, 
  Table, 
  Info, 
  FileSpreadsheet, 
  ArrowRight,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

interface CalibrationProps {
  lang?: Language;
}

export const CalibrationLookup: React.FC<CalibrationProps> = ({ lang = 'lo' }) => {
  const t = TRANSLATIONS[lang];
  const [inputLevel, setInputLevel] = useState<number>(5700);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const calc = calculateFromLevel(inputLevel);

  const filteredRows = CFL20_CALIBRATION_TABLE.filter(r => {
    if (!searchTerm) return true;
    return r.level.toString().includes(searchTerm) ||
      r.weight.toString().includes(searchTerm) ||
      r.volume.toString().includes(searchTerm);
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-700 dark:text-cyan-400">
              <Table className="w-4 h-4" />
              <span>TABLE OF LIQUID LEVEL — CFL(P)-20</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {t.calibBannerTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t.calibBannerSub}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300">
              Interval: 50 mmH₂O
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Custom Value Interpolator Calculator */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">
            {t.calibPrecisionTitle}
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          {t.calibPrecisionSub}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-2">
          {/* Input Control */}
          <div className="md:col-span-5 space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              {t.inputTargetLevel}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="7500"
                step="1"
                value={inputLevel}
                onChange={e => setInputLevel(Number(e.target.value))}
                className="w-full h-12 px-4 bg-slate-800 border border-slate-700 rounded-xl text-xl font-bold font-mono text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <span className="text-xs font-mono text-slate-400 shrink-0">mmH₂O</span>
            </div>

            {/* Quick buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[1200, 2500, 4000, 5700, 5750, 5800, 6000, 6750].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setInputLevel(v)}
                  className={`px-2 py-1 text-[11px] font-mono rounded-md border transition-colors ${
                    inputLevel === v
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Interpolation Result */}
          <div className="md:col-span-7 bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] text-slate-400">{t.calibCalcVolume}</div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-0.5 tabular-nums">
                  {calc.volume.toLocaleString(undefined, { minimumFractionDigits: 1 })}{' '}
                  <span className="text-sm font-normal text-slate-400">Liters</span>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400">{t.calibCalcWeight}</div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 mt-0.5 tabular-nums">
                  {calc.weight.toLocaleString(undefined, { minimumFractionDigits: 1 })}{' '}
                  <span className="text-sm font-normal text-slate-400">kg</span>
                </div>
              </div>
            </div>

            {/* Formula Step Explanation */}
            {calc.lowerRow && calc.upperRow && calc.lowerRow.level !== calc.upperRow.level && (
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
                <div className="text-cyan-300 font-sans font-semibold">
                  {t.calibFormulaSteps}
                </div>
                <div>
                  • {t.refRangeTable}: [{calc.lowerRow.level} mmH₂O = {calc.lowerRow.weight} kg] ➔ [{calc.upperRow.level} mmH₂O = {calc.upperRow.weight} kg]
                </div>
                <div>
                  • {t.formulaText}: W = {calc.lowerRow.weight} + [({inputLevel} - {calc.lowerRow.level}) / ({calc.upperRow.level} - {calc.lowerRow.level})] × ({calc.upperRow.weight} - {calc.lowerRow.weight})
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Master Table Browser */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t.masterTableTitle}
            </h3>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={t.searchTablePlaceholder}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-4 font-mono">{t.colLevel}</th>
                <th className="py-2.5 px-4 font-mono">{t.colKpa}</th>
                <th className="py-2.5 px-4 font-mono">{t.colVol}</th>
                <th className="py-2.5 px-4 font-mono">{t.colWt}</th>
                <th className="py-2.5 px-4">{t.colTankPct}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredRows.map((row) => {
                const isSelected = row.level === inputLevel;
                const isDemoHighlight = row.level === 5700 || row.level === 5800;
                const pct = ((row.weight / MAX_TANK_CAPACITY_KG) * 100).toFixed(1);

                return (
                  <tr
                    key={row.level}
                    onClick={() => setInputLevel(row.level)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-cyan-50 dark:bg-cyan-950/40 font-semibold text-cyan-900 dark:text-cyan-200'
                        : isDemoHighlight
                        ? 'bg-amber-50/60 dark:bg-amber-950/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="py-2 px-4 font-mono font-medium">
                      {row.level.toLocaleString()}
                      {isDemoHighlight && (
                        <span className="ml-2 text-[10px] text-amber-600 dark:text-amber-400 font-sans font-semibold">
                          [Sample Doc]
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 font-mono text-slate-500">
                      {(row.level / 100).toFixed(1)} kPa
                    </td>
                    <td className="py-2 px-4 font-mono">
                      {row.volume.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                    </td>
                    <td className="py-2 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {row.weight.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                    </td>
                    <td className="py-2 px-4 font-mono text-slate-500">
                      {pct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
          <span>{t.tableShowingCount} {filteredRows.length} {t.recordsUnit} (250 – 6,765 mmH₂O)</span>
          <span className="font-mono">LO₂ Density = {LO2_DENSITY_KG_L} kg/L (1,140 kg/m³)</span>
        </div>
      </div>
    </div>
  );
};
