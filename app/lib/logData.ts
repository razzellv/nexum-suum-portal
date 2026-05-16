import { apiPost } from './api';

export type LogType = 'boiler' | 'chiller' | 'facility';

// Log fields
export interface BoilerLog {
  timestamp: string;
  date: string;
  equipmentId: string;
  boilerName: string;
  stackTemp: string;
  supplyTemp: string;
  returnTemp: string;
  fuelInput: string;
  operatingPressure: string;
  kwAmps: string;
  hzSpeed: string;
  techName: string;
  notes: string;
}

export interface ChillerLog {
  timestamp: string;
  date: string;
  equipmentId: string;
  chillerName: string;
  supplyTemp: string;
  returnTemp: string;
  condenserTemp: string;
  refrigerantPressure: string;
  compressorAmps: string;
  coolingTowerTemp: string;
  flowRate: string;
  techName: string;
  notes: string;
}

export interface FacilityLog {
  timestamp: string;
  date: string;
  systemType: string;
  equipmentId: string;
  location: string;
  readingValue: string;
  unit: string;
  status: string;
  techName: string;
  notes: string;
}

const PREFIX = 'fi_lite_logs_';

export function saveLogs(type: LogType, logs: unknown[]): void {
  localStorage.setItem(PREFIX + type, JSON.stringify(logs));
}

export function loadLogs<T>(type: LogType): T[] {
  try {
    const raw = localStorage.getItem(PREFIX + type);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function submitLog(type: LogType, entry: Record<string, string>): Promise<void> {
  const existing = loadLogs(type);
  const updated = [entry, ...existing].slice(0, 100);
  saveLogs(type, updated);
  try {
    await apiPost(`/logs/${type}`, entry);
  } catch {
    // Offline — entry is saved locally above
  }
}
