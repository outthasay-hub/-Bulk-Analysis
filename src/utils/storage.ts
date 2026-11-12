import { DailyRecord, RefillRecord, TankSpecs, RefillCycleSummary } from '../types/o2Tracker';
import { calculateFromLevel, MAX_TANK_CAPACITY_KG, MAX_TANK_VOLUME_L } from '../data/cfl20Table';

export const DEFAULT_TANK_SPECS: TankSpecs = {
  model: 'CFL(P)-20',
  manufacturer: 'Yangzhou Giant Machinery Co., Ltd.',
  totalVolumeL: MAX_TANK_VOLUME_L,
  maxWeightKg: MAX_TANK_CAPACITY_KG,
  medium: 'Liquid Oxygen (LO2 / อ๊อกซิเจนเหลว / ອົກຊີແຫຼວ)',
  density: 1.14, // 1140 kg/m3
  safeWorkingPressureMpa: {
    min: 0.35,
    normalMin: 0.60,
    normalMax: 1.00,
    max: 1.40
  },
  lowStockThresholdKg: 6000,      // ~26% of tank
  criticalStockThresholdKg: 3500  // ~15% of tank
};

const DAILY_RECORDS_KEY = 'o2_bulk_daily_records_v1';
const REFILL_RECORDS_KEY = 'o2_bulk_refill_records_v1';
const TANK_SPECS_KEY = 'o2_bulk_tank_specs_v1';

// Seed initial historical data matching user's real documents
export const INITIAL_REFILLS: RefillRecord[] = [
  {
    id: 'refill-20261107-1',
    roundNumber: 1,
    roundBatchCode: 'R01-2026',
    date: '2026-11-07',
    time: '13:42',
    supplier: 'Linde (Thailand) Public Company Limited',
    docketNumber: '18057',
    invoiceNumber: '3192336',
    tankerId: 'SISU-1310025',
    truckPlate: '71-2634 / 71-2851',
    tareWeightKg: 21720,
    grossWeightKg: 41750,
    docketSuppliedKg: 20030,
    levelBeforeMmH2O: 1200,
    weightBeforeKg: 3489.2,
    levelAfterMmH2O: 6765,
    weightAfterKg: 22800.0,
    pressureBeforeMpa: 0.70,
    pressureAfterMpa: 0.88,
    calculatedReceivedKg: 19310.8,
    discrepancyKg: -719.2,
    discrepancyPercent: -3.59,
    receiverName: 'ສົມສັກ (Somsak)',
    notes: 'ເຕີມກ໊າຊຮອບໃຫຍ່ ຈາກລົດ tanker Linde / บันทึกส่งสินค้าตามใบส่งของ No. 18057',
    photoUrl: '/public/assets/aistudio/____________4322076a.jpeg',
    cycleStatus: 'active',
    createdAt: new Date('2026-11-07T13:42:00').getTime()
  }
];

export const INITIAL_DAILY_RECORDS: DailyRecord[] = [
  {
    id: 'daily-20261108',
    date: '2026-11-08',
    time: '08:30',
    levelMmH2O: 6500,
    pressureMpa: 0.86,
    calculatedVolumeL: 19286.3,
    calculatedWeightKg: 21986.4,
    tankPercentage: 96.4,
    dailyConsumptionKg: 813.6,
    consumptionRateKgDay: 813.6,
    inspectorName: 'ຄຳໃສ (Khamsai)',
    notes: 'ກວດກາຫຼັງເຕີມກ໊າຊ ປົກກະຕິດີ ບໍ່ມີຮອຍຮົ່ວຊຶມ',
    verificationStatus: 'verified',
    verificationDetails: ['ລະດັບຄວາມດັນປົກກະຕິ (0.86 MPa)', 'ອັດຕາການຊົມໃຊ้อยู่ในเกณฑ์ปกติ'],
    createdAt: new Date('2026-11-08T08:30:00').getTime()
  },
  {
    id: 'daily-20261109',
    date: '2026-11-09',
    time: '08:30',
    levelMmH2O: 6250,
    pressureMpa: 0.84,
    calculatedVolumeL: 18521.0,
    calculatedWeightKg: 21113.9,
    tankPercentage: 92.6,
    dailyConsumptionKg: 872.5,
    consumptionRateKgDay: 872.5,
    inspectorName: 'ຄຳໃສ (Khamsai)',
    notes: 'ການນຳໃຊ້ປົກກະຕິ',
    verificationStatus: 'verified',
    verificationDetails: ['ລະດັບຄວາມດັນປົກກະຕິ (0.84 MPa)'],
    createdAt: new Date('2026-11-09T08:30:00').getTime()
  },
  {
    id: 'daily-20261110',
    date: '2026-11-10',
    time: '08:45',
    levelMmH2O: 6050,
    pressureMpa: 0.85,
    calculatedVolumeL: 17908.7,
    calculatedWeightKg: 20415.9,
    tankPercentage: 89.5,
    dailyConsumptionKg: 698.0,
    consumptionRateKgDay: 698.0,
    inspectorName: 'ບຸນມີ (Bounmee)',
    notes: 'ກວດກາປະຈຳວັນຊ່ວງເຊົ້າ',
    photoUrl: '/public/assets/aistudio/WhatsApp_Image_2026-11-10_at_20.10.49_8f3be3e6.jpeg',
    photoTitle: 'Tanker & Storage Overview',
    verificationStatus: 'verified',
    verificationDetails: ['ລະດັບຄວາມດັນປົກກະຕິ (0.85 MPa)'],
    createdAt: new Date('2026-11-10T08:45:00').getTime()
  },
  {
    id: 'daily-20261111',
    date: '2026-11-11',
    time: '09:00',
    levelMmH2O: 5800,
    pressureMpa: 0.85,
    calculatedVolumeL: 17143.3,
    calculatedWeightKg: 19543.4,
    tankPercentage: 85.7,
    dailyConsumptionKg: 872.5,
    consumptionRateKgDay: 872.5,
    inspectorName: 'ອຸດທະໄສ (Outthasay)',
    notes: 'ອ່ານຄ່າມາດວັດໄດ້ 5,800 mmH2O (ຄົງເຫຼືອ 19,543.4 kg)',
    photoUrl: '/public/assets/aistudio/11-11-2026_7f88e785.jpeg',
    photoTitle: 'ມາດວັດ CYJ ວັນທີ 11.11.2026',
    verificationStatus: 'verified',
    verificationDetails: ['ລະດັບຄວາມດັນປົກກະຕິ (0.85 MPa)', 'ຄິດໄລ່ຕາມຕາຕະລາງ CFL(P)-20 ຖືກຕ້ອງ'],
    createdAt: new Date('2026-11-11T09:00:00').getTime()
  },
  {
    id: 'daily-20261112',
    date: '2026-11-12',
    time: '09:00',
    levelMmH2O: 5700,
    pressureMpa: 0.82,
    calculatedVolumeL: 16837.1,
    calculatedWeightKg: 19194.4,
    tankPercentage: 84.2,
    dailyConsumptionKg: 349.0, // Exactly matching the PDF doc: 19543.4 - 19194.4 = 349.0 kg!
    consumptionRateKgDay: 349.0,
    inspectorName: 'ອຸດທະໄສ (Outthasay)',
    notes: 'ອ່ານຄ່າມາດວັດ 5,700 mmH2O, ບໍລິມາດຊົມໃຊ້ຈິງ = 349.0 kg',
    photoUrl: '/public/assets/aistudio/WhatsApp_Image_2026-11-12_at_09.58.23_02beedd3.jpeg',
    photoTitle: 'ມາດວັດ CYJ & Pressure ວັນທີ 12.11.2026',
    verificationStatus: 'verified',
    verificationDetails: [
      'ຄວາມດັນ 0.82 MPa (ປົກກະຕິ)',
      'ຊົມໃຊ້ຈິງ 349.0 kg ສົມທຽບວັນທີ 11/11/2026 ຖືກຕ້ອງ 100%'
    ],
    createdAt: new Date('2026-11-12T09:00:00').getTime()
  }
];

export function getStoredTankSpecs(): TankSpecs {
  try {
    const raw = localStorage.getItem(TANK_SPECS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed reading specs', e);
  }
  return DEFAULT_TANK_SPECS;
}

export function saveTankSpecs(specs: TankSpecs): void {
  try {
    localStorage.setItem(TANK_SPECS_KEY, JSON.stringify(specs));
  } catch (e) {
    console.error('Failed saving specs', e);
  }
}

export function getStoredRefills(): RefillRecord[] {
  try {
    const raw = localStorage.getItem(REFILL_RECORDS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed reading refills', e);
  }
  return INITIAL_REFILLS;
}

export function saveRefills(refills: RefillRecord[]): void {
  try {
    localStorage.setItem(REFILL_RECORDS_KEY, JSON.stringify(refills));
  } catch (e) {
    console.error('Failed saving refills', e);
  }
}

export function getStoredDailyRecords(): DailyRecord[] {
  try {
    const raw = localStorage.getItem(DAILY_RECORDS_KEY);
    if (raw) {
      const records: DailyRecord[] = JSON.parse(raw);
      return recomputeConsumptions(records, getStoredRefills());
    }
  } catch (e) {
    console.warn('Failed reading daily records', e);
  }
  return recomputeConsumptions(INITIAL_DAILY_RECORDS, INITIAL_REFILLS);
}

export function saveDailyRecords(records: DailyRecord[]): void {
  try {
    const recomputed = recomputeConsumptions(records, getStoredRefills());
    localStorage.setItem(DAILY_RECORDS_KEY, JSON.stringify(recomputed));
  } catch (e) {
    console.error('Failed saving daily records', e);
  }
}

/**
 * Recomputes the daily consumptions sequentially across sorted records
 */
export function recomputeConsumptions(records: DailyRecord[], refills: RefillRecord[]): DailyRecord[] {
  // Sort ascending by date + time
  const sorted = [...records].sort((a, b) => {
    const timeA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
    const timeB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
    return timeA - timeB;
  });

  const result: DailyRecord[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = { ...sorted[i] };
    const prev = i > 0 ? sorted[i - 1] : null;

    if (!prev) {
      current.dailyConsumptionKg = undefined;
      current.consumptionRateKgDay = undefined;
    } else {
      const prevDate = new Date(`${prev.date}T${prev.time || '00:00'}`);
      const currDate = new Date(`${current.date}T${current.time || '00:00'}`);
      const diffHours = Math.max(1, (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60));
      const diffDays = diffHours / 24;

      // Check if any refill occurred between prevDate and currDate
      const refilledBetween = refills.filter(r => {
        const rTime = new Date(`${r.date}T${r.time || '00:00'}`).getTime();
        return rTime > prevDate.getTime() && rTime <= currDate.getTime();
      });

      const totalRefilledKg = refilledBetween.reduce((sum, r) => sum + r.calculatedReceivedKg, 0);

      const netDrop = prev.calculatedWeightKg + totalRefilledKg - current.calculatedWeightKg;
      current.dailyConsumptionKg = Number(Math.max(0, netDrop).toFixed(1));
      current.consumptionRateKgDay = Number((current.dailyConsumptionKg / Math.max(0.2, diffDays)).toFixed(1));

      // Automated verification checks
      const checks: string[] = [];
      let status: 'verified' | 'warning' | 'anomaly' = 'verified';

      // Check pressure bounds
      if (current.pressureMpa > 1.2) {
        checks.push(`ຄວາມດັນສູງເກີນປົກກະຕິ (${current.pressureMpa} MPa > 1.2 MPa) - ຄວນກວດກາວາວນິລະໄພ`);
        status = 'warning';
      } else if (current.pressureMpa < 0.45) {
        checks.push(`ຄວາມດັນຕ່ຳກວ່າເກນ (${current.pressureMpa} MPa < 0.45 MPa) - ຄວນກວດກາລະບົບສ້າງແຮງດັນ (PBU)`);
        status = 'warning';
      } else {
        checks.push(`ຄວາມດັນຢູ່ໃນເກນປົກກະຕິ (${current.pressureMpa} MPa)`);
      }

      // Check negative drop without refill
      if (netDrop < -50 && totalRefilledKg === 0) {
        checks.push(`ຄ່ານ້ຳໜັກເພີ່ມຂຶ້ນ ${Math.abs(netDrop).toFixed(1)} kg ແຕ່ບໍ່ພົບຂໍ້ມູນການເຕີມກ໊າຊ - ກະລຸນາກວດສອບການອ່ານມາດວັດ`);
        status = 'anomaly';
      }

      // Check sudden extreme consumption
      if (current.consumptionRateKgDay > 2500) {
        checks.push(`ອັດຕາຊົມໃຊ້ສູງຜິດປົກກະຕິ (${current.consumptionRateKgDay.toFixed(0)} kg/ວັນ) - ອາດມີການຮົ່ວໄຫຼ ຫຼື ໃຊ້ງານໜັກ`);
        if (status !== 'anomaly') status = 'warning';
      }

      current.verificationStatus = status;
      current.verificationDetails = checks;
    }

    result.push(current);
  }

  // Return sorted descending (newest first) for UI display convenience
  return result.reverse();
}

/**
 * Resets all demo data to initial defaults
 */
export function resetToDemoData(): void {
  const recomputed = recomputeConsumptions(INITIAL_DAILY_RECORDS, INITIAL_REFILLS);
  localStorage.setItem(DAILY_RECORDS_KEY, JSON.stringify(recomputed));
  localStorage.setItem(REFILL_RECORDS_KEY, JSON.stringify(INITIAL_REFILLS));
  localStorage.setItem(TANK_SPECS_KEY, JSON.stringify(DEFAULT_TANK_SPECS));
}

/**
 * Groups historical refill deliveries and daily inspections into refill cycles / rounds (รอบการเติม).
 */
export function computeRefillCycles(
  refills: RefillRecord[],
  dailyRecords: DailyRecord[]
): RefillCycleSummary[] {
  if (refills.length === 0) return [];

  // Sort refills chronologically (oldest first)
  const sortedRefills = [...refills].sort((a, b) => {
    const timeA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
    const timeB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
    return timeA - timeB;
  });

  // Sort daily records ascending for calculation
  const sortedDaily = [...dailyRecords].sort((a, b) => {
    return new Date(`${a.date}T${a.time || '00:00'}`).getTime() - new Date(`${b.date}T${b.time || '00:00'}`).getTime();
  });

  const cycles: RefillCycleSummary[] = [];

  for (let i = 0; i < sortedRefills.length; i++) {
    const refill = sortedRefills[i];
    const roundNumber = refill.roundNumber || (i + 1);
    const roundBatchCode = refill.roundBatchCode || `R${String(roundNumber).padStart(2, '0')}-${refill.date.slice(0, 4)}`;
    const startDate = refill.date;
    const nextRefill = sortedRefills[i + 1];
    const endDate = nextRefill ? nextRefill.date : undefined;
    const isActive = !nextRefill;

    // Filter daily records belonging to this cycle
    const cycleDaily = sortedDaily.filter(d => {
      if (d.date < startDate) return false;
      if (endDate && d.date >= endDate) return false;
      return true;
    });

    const totalOxygenUsedKg = cycleDaily.reduce((sum, d) => sum + (d.dailyConsumptionKg || 0), 0);
    const inspectionsCount = cycleDaily.length;

    // Duration calculation
    const startMs = new Date(startDate).getTime();
    const endMs = endDate ? new Date(endDate).getTime() : Date.now();
    const durationDays = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)));
    const avgDailyBurnKg = inspectionsCount > 0 ? (totalOxygenUsedKg / inspectionsCount) : 0;

    const startingStockKg = refill.weightAfterKg;
    const latestInCycle = cycleDaily[cycleDaily.length - 1];
    const currentStockKg = latestInCycle ? latestInCycle.calculatedWeightKg : startingStockKg;

    cycles.push({
      roundNumber,
      roundBatchCode,
      refill,
      startDate,
      endDate,
      durationDays,
      isActive,
      startingStockKg,
      currentStockKg,
      totalOxygenUsedKg: Number(totalOxygenUsedKg.toFixed(1)),
      avgDailyBurnKg: Number(avgDailyBurnKg.toFixed(1)),
      inspectionsCount,
      cycleDailyRecords: [...cycleDaily].reverse() // newest first for display
    });
  }

  // Return newest cycle first (descending)
  return cycles.reverse();
}
