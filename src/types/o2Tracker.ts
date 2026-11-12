export type VerificationStatus = 'verified' | 'warning' | 'anomaly';

export interface DailyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  levelMmH2O: number; // e.g. 5800
  pressureMpa: number; // e.g. 0.8
  calculatedVolumeL: number; // Liters
  calculatedWeightKg: number; // kg
  tankPercentage: number; // %
  dailyConsumptionKg?: number; // Previous weight - current weight (adjusted for refills)
  consumptionRateKgDay?: number;
  inspectorName: string;
  notes?: string;
  photoUrl?: string;
  photoTitle?: string;
  verificationStatus: VerificationStatus;
  verificationDetails: string[];
  hadRefill?: boolean;
  refillRecordId?: string;
  createdAt: number;
}

export interface RefillRecord {
  id: string;
  roundNumber?: number; // e.g., 1, 2, 3 (รอบที่ 1, 2...)
  roundBatchCode?: string; // e.g., "R01-2026", "รอบที่ 1"
  date: string;
  time: string;
  supplier: string; // e.g., Linde (Thailand)
  docketNumber: string; // e.g., 18057
  invoiceNumber?: string; // e.g., 3192336
  tankerId: string; // e.g., SISU-1310025
  truckPlate: string; // e.g., 71-2634 / 71-2851
  tareWeightKg?: number; // e.g., 21,720
  grossWeightKg?: number; // e.g., 41,750
  docketSuppliedKg: number; // e.g., 20,030
  levelBeforeMmH2O: number;
  weightBeforeKg: number;
  levelAfterMmH2O: number;
  weightAfterKg: number;
  pressureBeforeMpa?: number;
  pressureAfterMpa?: number;
  calculatedReceivedKg: number; // weightAfter - weightBefore
  discrepancyKg: number; // calculated - docket
  discrepancyPercent: number; // ((calculated - docket) / docket) * 100
  receiverName: string;
  notes?: string;
  photoUrl?: string;
  cycleStatus?: 'active' | 'completed';
  createdAt: number;
}

export interface RefillCycleSummary {
  roundNumber: number;
  roundBatchCode: string;
  refill: RefillRecord;
  startDate: string;
  endDate?: string;
  durationDays: number;
  isActive: boolean;
  startingStockKg: number;
  currentStockKg: number;
  totalOxygenUsedKg: number;
  avgDailyBurnKg: number;
  inspectionsCount: number;
  cycleDailyRecords: DailyRecord[];
}

export interface TankSpecs {
  model: string;
  manufacturer: string;
  totalVolumeL: number;
  maxWeightKg: number;
  medium: string;
  density: number;
  safeWorkingPressureMpa: {
    min: number;
    normalMin: number;
    normalMax: number;
    max: number;
  };
  lowStockThresholdKg: number;
  criticalStockThresholdKg: number;
}

export interface SystemAnalysisTopic {
  id: string;
  title: string;
  category: 'workflow' | 'formula' | 'verification' | 'hardware' | 'architecture';
  description: string;
  details: string[];
  formula?: string;
  example?: string;
}
