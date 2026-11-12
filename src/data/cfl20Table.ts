// Calibration table CFL(P)-20 for Liquid Oxygen (LO2)
// Density: 1,140 kg/m3 (1.14 kg/L)
// Source: Yangzhou Giant Machinery Co., Ltd plate & CFL(P)-20 50 mmH2O interval table

export interface CalibrationRow {
  level: number;       // mmH2O
  volume: number;      // Liters (L)
  weight: number;      // Kilograms (kg)
}

// Master calibration table every 50 mmH2O from 250 to 6,750 (and up to 8,368 max)
export const CFL20_CALIBRATION_TABLE: CalibrationRow[] = [
  { level: 250, volume: 274.3, weight: 312.7 },
  { level: 300, volume: 403.5, weight: 460.0 },
  { level: 350, volume: 532.8, weight: 607.4 },
  { level: 400, volume: 662.0, weight: 754.7 },
  { level: 450, volume: 791.3, weight: 902.1 },
  { level: 500, volume: 920.5, weight: 1049.4 },
  { level: 550, volume: 1073.0, weight: 1223.3 },
  { level: 600, volume: 1225.5, weight: 1397.1 },
  { level: 650, volume: 1378.0, weight: 1571.0 },
  { level: 700, volume: 1530.5, weight: 1744.8 },
  { level: 750, volume: 1683.0, weight: 1918.7 },
  { level: 800, volume: 1836.1, weight: 2093.2 },
  { level: 850, volume: 1989.2, weight: 2267.7 },
  { level: 900, volume: 2142.2, weight: 2442.2 },
  { level: 950, volume: 2295.3, weight: 2616.7 },
  { level: 1000, volume: 2448.4, weight: 2791.2 },
  { level: 1050, volume: 2601.5, weight: 2965.7 },
  { level: 1100, volume: 2754.5, weight: 3140.2 },
  { level: 1150, volume: 2907.6, weight: 3314.7 },
  { level: 1200, volume: 3060.6, weight: 3489.2 },
  { level: 1250, volume: 3213.7, weight: 3663.7 },
  { level: 1300, volume: 3366.8, weight: 3838.2 },
  { level: 1350, volume: 3519.9, weight: 4012.7 },
  { level: 1400, volume: 3672.9, weight: 4187.2 },
  { level: 1450, volume: 3826.0, weight: 4361.7 },
  { level: 1500, volume: 3979.1, weight: 4536.2 },
  { level: 1550, volume: 4132.2, weight: 4710.7 },
  { level: 1600, volume: 4285.3, weight: 4885.2 },
  { level: 1650, volume: 4438.3, weight: 5059.7 },
  { level: 1700, volume: 4591.4, weight: 5234.2 },
  { level: 1750, volume: 4744.5, weight: 5408.7 },
  { level: 1800, volume: 4897.6, weight: 5583.2 },
  { level: 1850, volume: 5050.6, weight: 5757.7 },
  { level: 1900, volume: 5203.7, weight: 5932.2 },
  { level: 1950, volume: 5356.7, weight: 6106.7 },
  { level: 2000, volume: 5509.8, weight: 6281.2 },
  { level: 2050, volume: 5662.9, weight: 6455.7 },
  { level: 2100, volume: 5816.0, weight: 6630.2 },
  { level: 2150, volume: 5969.0, weight: 6804.7 },
  { level: 2200, volume: 6122.1, weight: 6979.2 },
  { level: 2250, volume: 6275.2, weight: 7153.7 },
  { level: 2300, volume: 6428.3, weight: 7328.2 },
  { level: 2350, volume: 6581.4, weight: 7502.7 },
  { level: 2400, volume: 6734.4, weight: 7677.2 },
  { level: 2450, volume: 6887.5, weight: 7851.7 },
  { level: 2500, volume: 7040.6, weight: 8026.2 },
  { level: 2550, volume: 7193.7, weight: 8200.7 },
  { level: 2600, volume: 7346.7, weight: 8375.2 },
  { level: 2650, volume: 7499.8, weight: 8549.7 },
  { level: 2700, volume: 7652.8, weight: 8724.2 },
  { level: 2750, volume: 7805.9, weight: 8898.7 },
  { level: 2800, volume: 7959.0, weight: 9073.2 },
  { level: 2850, volume: 8112.1, weight: 9247.7 },
  { level: 2900, volume: 8265.1, weight: 9422.3 },
  { level: 2950, volume: 8418.2, weight: 9596.8 },
  { level: 3000, volume: 8571.3, weight: 9771.3 },
  { level: 3050, volume: 8724.4, weight: 9945.8 },
  { level: 3100, volume: 8877.4, weight: 10120.3 },
  { level: 3150, volume: 9030.5, weight: 10294.8 },
  { level: 3200, volume: 9183.5, weight: 10469.3 },
  { level: 3250, volume: 9336.6, weight: 10643.8 },
  { level: 3300, volume: 9489.7, weight: 10818.3 },
  { level: 3350, volume: 9642.8, weight: 10992.8 },
  { level: 3400, volume: 9795.8, weight: 11167.3 },
  { level: 3450, volume: 9948.9, weight: 11341.8 },
  { level: 3500, volume: 10102.0, weight: 11516.3 },
  { level: 3550, volume: 10255.1, weight: 11690.8 },
  { level: 3600, volume: 10408.2, weight: 11865.3 },
  { level: 3650, volume: 10561.2, weight: 12039.8 },
  { level: 3700, volume: 10714.3, weight: 12214.3 },
  { level: 3750, volume: 10867.4, weight: 12388.8 },
  { level: 3800, volume: 11020.5, weight: 12563.3 },
  { level: 3850, volume: 11173.5, weight: 12737.8 },
  { level: 3900, volume: 11326.6, weight: 12912.3 },
  { level: 3950, volume: 11479.6, weight: 13086.8 },
  { level: 4000, volume: 11632.7, weight: 13261.3 },
  { level: 4050, volume: 11785.8, weight: 13435.8 },
  { level: 4100, volume: 11938.9, weight: 13610.3 },
  { level: 4150, volume: 12091.9, weight: 13784.8 },
  { level: 4200, volume: 12245.0, weight: 13959.3 },
  { level: 4250, volume: 12398.1, weight: 14133.8 },
  { level: 4300, volume: 12551.2, weight: 14308.3 },
  { level: 4350, volume: 12704.2, weight: 14482.8 },
  { level: 4400, volume: 12857.3, weight: 14657.3 },
  { level: 4450, volume: 13010.3, weight: 14831.8 },
  { level: 4500, volume: 13163.4, weight: 15006.3 },
  { level: 4550, volume: 13316.5, weight: 15180.8 },
  { level: 4600, volume: 13469.6, weight: 15355.3 },
  { level: 4650, volume: 13622.6, weight: 15529.8 },
  { level: 4700, volume: 13775.7, weight: 15704.3 },
  { level: 4750, volume: 13928.8, weight: 15878.9 },
  { level: 4800, volume: 14081.9, weight: 16053.4 },
  { level: 4850, volume: 14235.0, weight: 16227.9 },
  { level: 4900, volume: 14388.0, weight: 16402.3 },
  { level: 4950, volume: 14541.1, weight: 16576.8 },
  { level: 5000, volume: 14694.2, weight: 16751.3 },
  { level: 5050, volume: 14847.3, weight: 16925.8 },
  { level: 5100, volume: 15000.3, weight: 17100.3 },
  { level: 5150, volume: 15153.4, weight: 17274.9 },
  { level: 5200, volume: 15306.4, weight: 17449.4 },
  { level: 5250, volume: 15459.5, weight: 17623.9 },
  { level: 5300, volume: 15612.6, weight: 17798.4 },
  { level: 5350, volume: 15765.7, weight: 17972.9 },
  { level: 5400, volume: 15918.7, weight: 18147.4 },
  { level: 5450, volume: 16071.8, weight: 18321.9 },
  { level: 5500, volume: 16224.9, weight: 18496.4 },
  { level: 5550, volume: 16378.0, weight: 18670.9 },
  { level: 5600, volume: 16531.0, weight: 18845.4 },
  { level: 5650, volume: 16684.1, weight: 19019.9 },
  { level: 5700, volume: 16837.1, weight: 19194.4 },
  { level: 5750, volume: 16990.2, weight: 19368.9 },
  { level: 5800, volume: 17143.3, weight: 19543.4 },
  { level: 5850, volume: 17296.4, weight: 19717.9 },
  { level: 5900, volume: 17449.4, weight: 19892.4 },
  { level: 5950, volume: 17602.5, weight: 20066.9 },
  { level: 6000, volume: 17755.6, weight: 20241.4 },
  { level: 6050, volume: 17908.7, weight: 20415.9 },
  { level: 6100, volume: 18061.8, weight: 20590.4 },
  { level: 6150, volume: 18214.8, weight: 20764.9 },
  { level: 6200, volume: 18367.9, weight: 20939.4 },
  { level: 6250, volume: 18521.0, weight: 21113.9 },
  { level: 6300, volume: 18674.1, weight: 21288.4 },
  { level: 6350, volume: 18827.1, weight: 21462.9 },
  { level: 6400, volume: 18980.2, weight: 21637.4 },
  { level: 6450, volume: 19133.2, weight: 21811.9 },
  { level: 6500, volume: 19286.3, weight: 21986.4 },
  { level: 6550, volume: 19421.0, weight: 22139.9 },
  { level: 6600, volume: 19555.6, weight: 22293.4 },
  { level: 6650, volume: 19690.3, weight: 22446.9 },
  { level: 6700, volume: 19824.9, weight: 22600.4 },
  { level: 6750, volume: 19959.6, weight: 22753.9 },
  { level: 6765, volume: 20000.0, weight: 22800.0 }
];

export const MAX_TANK_CAPACITY_KG = 22800; // 20,000 Liters * 1.14 kg/L
export const MAX_TANK_VOLUME_L = 20000;
export const LO2_DENSITY_KG_L = 1.14; // 1,140 kg/m3

/**
 * Calculates LO2 volume (L) and weight (kg) from mmH2O level using linear interpolation
 */
export function calculateFromLevel(level: number): {
  volume: number;
  weight: number;
  percentage: number;
  inRange: boolean;
  lowerRow?: CalibrationRow;
  upperRow?: CalibrationRow;
} {
  if (isNaN(level) || level <= 0) {
    return { volume: 0, weight: 0, percentage: 0, inRange: false };
  }

  const minLevel = CFL20_CALIBRATION_TABLE[0].level;
  const maxLevel = CFL20_CALIBRATION_TABLE[CFL20_CALIBRATION_TABLE.length - 1].level;

  if (level < minLevel) {
    // Extrapolate below 250 using slope
    const r1 = CFL20_CALIBRATION_TABLE[0];
    const r2 = CFL20_CALIBRATION_TABLE[1];
    const factor = level / r1.level;
    const vol = Math.max(0, Number((r1.volume * factor).toFixed(1)));
    const wt = Math.max(0, Number((r1.weight * factor).toFixed(1)));
    return {
      volume: vol,
      weight: wt,
      percentage: Number(((wt / MAX_TANK_CAPACITY_KG) * 100).toFixed(1)),
      inRange: false,
      lowerRow: r1,
      upperRow: r2
    };
  }

  if (level >= maxLevel) {
    return {
      volume: MAX_TANK_VOLUME_L,
      weight: MAX_TANK_CAPACITY_KG,
      percentage: 100,
      inRange: true,
      lowerRow: CFL20_CALIBRATION_TABLE[CFL20_CALIBRATION_TABLE.length - 2],
      upperRow: CFL20_CALIBRATION_TABLE[CFL20_CALIBRATION_TABLE.length - 1]
    };
  }

  // Exact match search
  const exact = CFL20_CALIBRATION_TABLE.find(r => r.level === level);
  if (exact) {
    return {
      volume: exact.volume,
      weight: exact.weight,
      percentage: Number(((exact.weight / MAX_TANK_CAPACITY_KG) * 100).toFixed(1)),
      inRange: true,
      lowerRow: exact,
      upperRow: exact
    };
  }

  // Linear Interpolation between r1 and r2
  for (let i = 0; i < CFL20_CALIBRATION_TABLE.length - 1; i++) {
    const r1 = CFL20_CALIBRATION_TABLE[i];
    const r2 = CFL20_CALIBRATION_TABLE[i + 1];

    if (level > r1.level && level < r2.level) {
      const t = (level - r1.level) / (r2.level - r1.level);
      const vol = r1.volume + t * (r2.volume - r1.volume);
      const wt = r1.weight + t * (r2.weight - r1.weight);

      return {
        volume: Number(vol.toFixed(1)),
        weight: Number(wt.toFixed(1)),
        percentage: Number(((wt / MAX_TANK_CAPACITY_KG) * 100).toFixed(1)),
        inRange: true,
        lowerRow: r1,
        upperRow: r2
      };
    }
  }

  return { volume: 0, weight: 0, percentage: 0, inRange: false };
}
