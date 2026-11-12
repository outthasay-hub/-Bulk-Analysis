import React from 'react';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface GaugeProps {
  levelMmH2O: number; // 0 to 10,000 mmH2O
  pressureMpa?: number; // 0 to 2.5 MPa
  interactive?: boolean;
  onLevelChange?: (level: number) => void;
  onPressureChange?: (pressure: number) => void;
  size?: 'sm' | 'md' | 'lg';
  lang?: Language;
}

export const GaugeVisualizer: React.FC<GaugeProps> = ({
  levelMmH2O,
  pressureMpa = 0.85,
  interactive = false,
  onLevelChange,
  onPressureChange,
  size = 'md',
  lang = 'lo'
}) => {
  const t = TRANSLATIONS[lang];
  // CYJ Level Gauge: 0 to 10,000 mmH2O (0 - 100 kPa)
  // Angle: -135deg (0) to +135deg (10000 mmH2O), total 270 degrees sweep
  const levelClamped = Math.max(0, Math.min(10000, levelMmH2O));
  const levelAngle = -135 + (levelClamped / 10000) * 270;

  // Pressure Gauge: 0 to 2.5 MPa
  // Angle: -135deg (0) to +135deg (2.5 MPa)
  const pressureClamped = Math.max(0, Math.min(2.5, pressureMpa));
  const pressureAngle = -135 + (pressureClamped / 2.5) * 270;

  const dimension = size === 'sm' ? 160 : size === 'lg' ? 260 : 210;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 bg-slate-900/90 text-white p-4 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(6,182,212,0.12),transparent_70%)] pointer-events-none" />

      {/* 1. CYJ Differential Pressure Level Gauge (mmH2O) */}
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: dimension, height: dimension }}>
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full drop-shadow-lg select-none"
          >
            {/* Outer metallic bezel ring */}
            <circle cx="100" cy="100" r="96" fill="#1e293b" stroke="#64748b" strokeWidth="4" />
            <circle cx="100" cy="100" r="92" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
            
            {/* White dial plate */}
            <circle cx="100" cy="100" r="88" fill="#f8fafc" />

            {/* Inner aesthetic ring */}
            <circle cx="100" cy="100" r="68" fill="none" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="2,2" />

            {/* Level zones arc (Red danger below 2000 mmH2O, Blue normal, Green high) */}
            {/* Danger low zone 0 - 2000 mmH2O (-135 to -81 deg) */}
            <path
              d="M 37.9 162.1 A 88 88 0 0 1 45.4 72.8"
              fill="none"
              stroke="#ef4444"
              strokeWidth="3.5"
              strokeOpacity="0.85"
            />
            {/* Normal operating zone 2000 - 8000 mmH2O */}
            <path
              d="M 45.4 72.8 A 88 88 0 0 1 154.6 72.8"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="3.5"
              strokeOpacity="0.85"
            />
            {/* Top capacity zone 8000 - 10000 mmH2O */}
            <path
              d="M 154.6 72.8 A 88 88 0 0 1 162.1 162.1"
              fill="none"
              stroke="#64748b"
              strokeWidth="2.5"
            />

            {/* Tick marks and labels for 0, 20, 40, 60, 80, 100 */}
            {[
              { val: 0, label: '0', sub: '0' },
              { val: 2000, label: '20', sub: '(2000)' },
              { val: 4000, label: '40', sub: '(4000)' },
              { val: 6000, label: '60', sub: '(6000)' },
              { val: 8000, label: '80', sub: '(8000)' },
              { val: 10000, label: '100', sub: '(10000)' }
            ].map((tick, i) => {
              const ang = -135 + (tick.val / 10000) * 270;
              const rad = (ang - 90) * (Math.PI / 180);
              const x1 = 100 + 82 * Math.cos(rad);
              const y1 = 100 + 82 * Math.sin(rad);
              const x2 = 100 + 72 * Math.cos(rad);
              const y2 = 100 + 72 * Math.sin(rad);

              const xt = 100 + 58 * Math.cos(rad);
              const yt = 100 + 58 * Math.sin(rad);

              return (
                <g key={i}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
                  <text
                    x={xt}
                    y={yt + 4}
                    fontSize="11"
                    fontWeight="700"
                    fill="#0f172a"
                    textAnchor="middle"
                    className="font-mono"
                  >
                    {tick.label}
                  </text>
                </g>
              );
            })}

            {/* Minor ticks (every 1000 mmH2O / 10 kPa) */}
            {[1000, 3000, 5000, 7000, 9000].map((val, i) => {
              const ang = -135 + (val / 10000) * 270;
              const rad = (ang - 90) * (Math.PI / 180);
              const x1 = 100 + 82 * Math.cos(rad);
              const y1 = 100 + 82 * Math.sin(rad);
              const x2 = 100 + 76 * Math.cos(rad);
              const y2 = 100 + 76 * Math.sin(rad);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#475569" strokeWidth="1.2" />;
            })}

            {/* Minor sub-ticks (every 200 mmH2O) */}
            {Array.from({ length: 51 }).map((_, i) => {
              const val = i * 200;
              if (val % 1000 === 0) return null;
              const ang = -135 + (val / 10000) * 270;
              const rad = (ang - 90) * (Math.PI / 180);
              const x1 = 100 + 82 * Math.cos(rad);
              const y1 = 100 + 82 * Math.sin(rad);
              const x2 = 100 + 78 * Math.cos(rad);
              const y2 = 100 + 78 * Math.sin(rad);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="0.7" />;
            })}

            {/* Brand text & markings matching physical gauge */}
            <text x="100" y="82" fontSize="7" fontWeight="bold" fill="#334155" textAnchor="middle" letterSpacing="0.5">
              CYJ-
            </text>
            <text x="100" y="90" fontSize="5.5" fill="#64748b" textAnchor="middle">
              differential pressure
            </text>
            <text x="100" y="122" fontSize="6.5" fontWeight="600" fill="#334155" textAnchor="middle">
              kPa / mmH₂O
            </text>
            <text x="84" y="136" fontSize="7" fontWeight="bold" fill="#0284c7" textAnchor="middle">
              OXYGEN
            </text>
            
            {/* LS logo ellipse */}
            <ellipse cx="114" cy="133" rx="10" ry="6" fill="#0284c7" />
            <text x="114" y="135.5" fontSize="6" fontWeight="bold" fill="#ffffff" textAnchor="middle">
              LS
            </text>

            <text x="100" y="152" fontSize="4.2" fill="#64748b" textAnchor="middle">
              ChengDuLanShi Cryogenic Technology CO., LTD
            </text>

            {/* Needle pointer */}
            <g transform={`rotate(${levelAngle} 100 100)`} className="transition-transform duration-300 ease-out">
              {/* Counter-balance tail */}
              <polygon points="98,100 102,100 101,118 99,118" fill="#0f172a" />
              {/* Sleek needle */}
              <polygon points="98.8,100 101.2,100 100.4,26 99.6,26" fill="#0f172a" />
              {/* Highlight line on needle */}
              <line x1="100" y1="95" x2="100" y2="28" stroke="#38bdf8" strokeWidth="0.8" />
            </g>

            {/* Center cap */}
            <circle cx="100" cy="100" r="7" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="2.5" fill="#38bdf8" />
          </svg>
        </div>

        <div className="mt-2 text-center">
          <div className="text-xs font-semibold text-cyan-400 tracking-wide uppercase">
            {t.cyjGaugeName}
          </div>
          <div className="text-xl font-bold font-mono text-white tabular-nums">
            {levelMmH2O.toLocaleString()} <span className="text-xs font-normal text-slate-400">{t.unitMmH2O}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            ≈ {(levelMmH2O / 100).toFixed(1)} {t.unitKpa}
          </div>
        </div>

        {interactive && onLevelChange && (
          <div className="w-full mt-2 px-2">
            <input
              type="range"
              min="0"
              max="7000"
              step="50"
              value={levelMmH2O}
              onChange={e => onLevelChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
              <span>0</span>
              <span>2,500</span>
              <span>5,000</span>
              <span>7,000</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Top Tank Pressure Gauge (0 - 2.5 MPa) */}
      <div className="flex flex-col items-center pt-2 sm:pt-0 sm:border-l sm:border-slate-800 sm:pl-6">
        <div className="relative" style={{ width: dimension * 0.75, height: dimension * 0.75 }}>
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full drop-shadow-md select-none"
          >
            {/* Outer ring */}
            <circle cx="100" cy="100" r="96" fill="#1e293b" stroke="#64748b" strokeWidth="4" />
            <circle cx="100" cy="100" r="92" fill="#0f172a" />
            <circle cx="100" cy="100" r="88" fill="#f8fafc" />

            {/* Pressure operating arc: Green normal 0.6 - 1.0 MPa, Red danger > 1.2 MPa */}
            {/* -135 + (0.6/2.5)*270 = -70.2 deg; (1.0/2.5)*270 = -27 deg */}
            <path
              d="M 52.8 52.8 A 88 88 0 0 1 147.2 52.8"
              fill="none"
              stroke="#22c55e"
              strokeWidth="3.5"
              strokeOpacity="0.8"
            />
            <path
              d="M 147.2 52.8 A 88 88 0 0 1 162.1 162.1"
              fill="none"
              stroke="#ef4444"
              strokeWidth="3.5"
              strokeOpacity="0.8"
            />

            {/* Major marks: 0, 0.5, 1.0, 1.5, 2.0, 2.5 MPa */}
            {[0, 0.5, 1.0, 1.5, 2.0, 2.5].map((val, i) => {
              const ang = -135 + (val / 2.5) * 270;
              const rad = (ang - 90) * (Math.PI / 180);
              const x1 = 100 + 82 * Math.cos(rad);
              const y1 = 100 + 82 * Math.sin(rad);
              const x2 = 100 + 70 * Math.cos(rad);
              const y2 = 100 + 70 * Math.sin(rad);
              const xt = 100 + 56 * Math.cos(rad);
              const yt = 100 + 56 * Math.sin(rad);

              return (
                <g key={i}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
                  <text
                    x={xt}
                    y={yt + 3.5}
                    fontSize="12"
                    fontWeight="700"
                    fill="#0f172a"
                    textAnchor="middle"
                    className="font-mono"
                  >
                    {val.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Gauge brand text */}
            <text x="100" y="80" fontSize="7" fontWeight="bold" fill="#0f172a" textAnchor="middle">
              不锈钢氧气压力表
            </text>
            <text x="100" y="90" fontSize="6" fill="#dc2626" fontWeight="bold" textAnchor="middle">
              禁 油
            </text>
            <text x="100" y="130" fontSize="8" fontWeight="bold" fill="#0f172a" textAnchor="middle">
              MPa
            </text>
            <text x="100" y="145" fontSize="5" fill="#64748b" textAnchor="middle">
              无锡凯丰压力表有限公司
            </text>

            {/* Needle */}
            <g transform={`rotate(${pressureAngle} 100 100)`} className="transition-transform duration-300 ease-out">
              <polygon points="98,100 102,100 101,114 99,114" fill="#0f172a" />
              <polygon points="98.8,100 101.2,100 100.3,28 99.7,28" fill="#dc2626" />
              <line x1="100" y1="95" x2="100" y2="30" stroke="#fca5a5" strokeWidth="0.7" />
            </g>

            {/* Center Cap */}
            <circle cx="100" cy="100" r="6" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />
            <circle cx="100" cy="100" r="2" fill="#ef4444" />
          </svg>
        </div>

        <div className="mt-2 text-center">
          <div className="text-xs font-semibold text-emerald-400 tracking-wide uppercase">
            {t.tankGaugeName}
          </div>
          <div className="text-lg font-bold font-mono text-white tabular-nums">
            {pressureMpa.toFixed(2)} <span className="text-xs font-normal text-slate-400">{t.unitMpa}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            ≈ {(pressureMpa * 10).toFixed(1)} {t.unitBar}
          </div>
        </div>

        {interactive && onPressureChange && (
          <div className="w-full mt-2 px-2">
            <input
              type="range"
              min="0"
              max="2.0"
              step="0.01"
              value={pressureMpa}
              onChange={e => onPressureChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
              <span>0.0</span>
              <span>0.8 (Normal)</span>
              <span>2.0</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
