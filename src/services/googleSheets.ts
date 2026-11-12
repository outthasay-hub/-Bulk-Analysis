import { DailyRecord, RefillRecord } from '../types/o2Tracker';

export interface SpreadsheetConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  lastSyncedAt?: number;
}

const STORAGE_SPREADSHEET_KEY = 'o2_bulk_spreadsheet_config_v1';

export function getStoredSpreadsheetConfig(): SpreadsheetConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_SPREADSHEET_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse spreadsheet config', e);
  }
  return null;
}

export function saveSpreadsheetConfig(config: SpreadsheetConfig | null): void {
  try {
    if (config) {
      localStorage.setItem(STORAGE_SPREADSHEET_KEY, JSON.stringify(config));
    } else {
      localStorage.removeItem(STORAGE_SPREADSHEET_KEY);
    }
  } catch (e) {
    console.error('Failed to save spreadsheet config', e);
  }
}

/**
 * Creates a dedicated Google Sheet for O2 Bulk Flow with two pre-formatted sheets
 */
export async function createO2TrackingSpreadsheet(
  accessToken: string,
  title: string = 'O2 Bulk Flow - Liquid Oxygen Tracking Log (CFL(P)-20)'
): Promise<SpreadsheetConfig> {
  const requestBody = {
    properties: {
      title
    },
    sheets: [
      {
        properties: {
          title: 'Daily Inspections',
          gridProperties: {
            frozenRowCount: 1
          }
        }
      },
      {
        properties: {
          title: 'Bulk Refills',
          gridProperties: {
            frozenRowCount: 1
          }
        }
      }
    ]
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to create Google Spreadsheet');
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Write headers to both sheets
  const dailyHeaders = [
    'ວັນທີ / Date',
    'ເວລາ / Time',
    'ມາດວັດ CYJ (mmH2O)',
    'ຄວາມດັນ (MPa)',
    'ບໍລິມາດ / Volume (L)',
    'ນ້ຳໜັກ / Weight (kg)',
    'ຄວາມຈຸຖັງ / Tank (%)',
    'ຊົມໃຊ້ຈິງ / Daily Burn (kg)',
    'ຜູ້ກວດກາ / Inspector',
    'ສະຖານະ / Status',
    'ໝາຍເຫດ / Notes'
  ];

  const refillHeaders = [
    'ວັນທີ / Date',
    'ເວລາ / Time',
    'ຜູ້ສະໜອງ / Supplier',
    'ເລກທີໃບສົ່ງ / Docket No.',
    'ເລກຖັງ / Tanker ID',
    'ທະບຽນລົດ / Plate',
    'Gross Weight (kg)',
    'Tare Weight (kg)',
    'ຍອດຕາມໃບ / Net Docket (kg)',
    'ກ່ອນເຕີມ (mmH2O)',
    'ຫຼັງເຕີມ (mmH2O)',
    'ຍອດຂຶ້ນຖັງຈິງ / Gain (kg)',
    'ສ່ວນຕ່າງ / Variance (kg)',
    'ສ່ວນຕ່າງ / Variance (%)',
    'ຜູ້ກວດຮັບ / Receiver',
    'ໝາຍເຫດ / Notes'
  ];

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: [
        {
          range: "'Daily Inspections'!A1:K1",
          values: [dailyHeaders]
        },
        {
          range: "'Bulk Refills'!A1:P1",
          values: [refillHeaders]
        }
      ]
    })
  });

  const config: SpreadsheetConfig = {
    spreadsheetId,
    spreadsheetUrl,
    title,
    lastSyncedAt: Date.now()
  };

  saveSpreadsheetConfig(config);
  return config;
}

/**
 * Appends a single daily inspection record into the Google Sheet
 */
export async function appendDailyRecordToSheet(
  accessToken: string,
  spreadsheetId: string,
  record: DailyRecord
): Promise<void> {
  const row = [
    record.date,
    record.time,
    record.levelMmH2O,
    record.pressureMpa,
    record.calculatedVolumeL,
    record.calculatedWeightKg,
    record.tankPercentage,
    record.dailyConsumptionKg ?? '',
    record.inspectorName,
    record.verificationStatus,
    record.notes || ''
  ];

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Daily Inspections'!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [row]
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to append row to Google Sheets');
  }
}

/**
 * Appends a single refill delivery record into the Google Sheet
 */
export async function appendRefillRecordToSheet(
  accessToken: string,
  spreadsheetId: string,
  refill: RefillRecord
): Promise<void> {
  const row = [
    refill.date,
    refill.time,
    refill.supplier,
    refill.docketNumber,
    refill.tankerId || '',
    refill.truckPlate || '',
    refill.grossWeightKg ?? '',
    refill.tareWeightKg ?? '',
    refill.docketSuppliedKg,
    refill.levelBeforeMmH2O,
    refill.levelAfterMmH2O,
    refill.calculatedReceivedKg,
    refill.discrepancyKg,
    `${refill.discrepancyPercent}%`,
    refill.receiverName,
    refill.notes || ''
  ];

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Bulk Refills'!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [row]
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to append refill row to Google Sheets');
  }
}

/**
 * Synchronizes all records in batch to the Google Sheet
 */
export async function syncAllRecordsToSheet(
  accessToken: string,
  spreadsheetId: string,
  dailyRecords: DailyRecord[],
  refillRecords: RefillRecord[]
): Promise<void> {
  // Sort ascending by date for neat spreadsheet order
  const sortedDaily = [...dailyRecords].sort((a, b) => {
    return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
  });

  const sortedRefills = [...refillRecords].sort((a, b) => {
    return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
  });

  const dailyRows = sortedDaily.map(r => [
    r.date,
    r.time,
    r.levelMmH2O,
    r.pressureMpa,
    r.calculatedVolumeL,
    r.calculatedWeightKg,
    r.tankPercentage,
    r.dailyConsumptionKg ?? '',
    r.inspectorName,
    r.verificationStatus,
    r.notes || ''
  ]);

  const refillRows = sortedRefills.map(refill => [
    refill.date,
    refill.time,
    refill.supplier,
    refill.docketNumber,
    refill.tankerId || '',
    refill.truckPlate || '',
    refill.grossWeightKg ?? '',
    refill.tareWeightKg ?? '',
    refill.docketSuppliedKg,
    refill.levelBeforeMmH2O,
    refill.levelAfterMmH2O,
    refill.calculatedReceivedKg,
    refill.discrepancyKg,
    `${refill.discrepancyPercent}%`,
    refill.receiverName,
    refill.notes || ''
  ]);

  // Clear previous data rows (leaving header row 1)
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Daily Inspections'!A2:K1000:clear`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Bulk Refills'!A2:P1000:clear`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  // Write all rows
  if (dailyRows.length > 0) {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Daily Inspections'!A2:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values: dailyRows })
      }
    );
  }

  if (refillRows.length > 0) {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Bulk Refills'!A2:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values: refillRows })
      }
    );
  }

  // Update last synced timestamp
  const config = getStoredSpreadsheetConfig();
  if (config) {
    config.lastSyncedAt = Date.now();
    saveSpreadsheetConfig(config);
  }
}
