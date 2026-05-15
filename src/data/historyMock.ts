import type {
  DefectRecord,
  EvidenceItem,
  HistoryMotorSummary,
  MotorAuditEvent,
  ShiftRollup,
  StationLogEntry,
} from '../types/history'
import { stations } from './mock'

const st = (id: string) => stations.find((s) => s.id === id)!

export const historyMotors: HistoryMotorSummary[] = [
  {
    motorId: 'MTR-88433',
    qrCode: 'QR-MTR-88433-L1',
    sku: 'MV-230F-HS',
    customerLot: 'LOT-ACME-4481',
    status: 'hold',
    lastStationId: 'st-b2',
    lastSeenAt: '2026-05-11T14:16:00',
  },
  {
    motorId: 'MTR-88421',
    qrCode: 'QR-MTR-88421-L1',
    sku: 'MV-230F-HS',
    customerLot: 'LOT-ACME-4479',
    status: 'shipped',
    lastStationId: 'st-a1',
    lastSeenAt: '2026-05-11T11:02:00',
  },
  {
    motorId: 'MTR-88440',
    qrCode: 'QR-MTR-88440-L2',
    sku: 'MV-180C',
    status: 'shipped',
    lastStationId: 'st-d4',
    lastSeenAt: '2026-05-11T14:20:00',
  },
]

export const motorAuditTrailMTR88433: MotorAuditEvent[] = [
  {
    id: 'a1',
    motorId: 'MTR-88433',
    at: '2026-05-11T14:10:12',
    stationId: 'st-b2',
    stationName: st('st-b2').name,
    kind: 'station_in',
    summary: 'Motor entered station',
    cameraId: 'cam-3',
    evidenceIds: ['ev-1'],
  },
  {
    id: 'a2',
    motorId: 'MTR-88433',
    at: '2026-05-11T14:11:03',
    stationId: 'st-b2',
    stationName: st('st-b2').name,
    kind: 'qr_scan',
    summary: 'QR read OK',
    detail: 'QR-MTR-88433-L1',
    evidenceIds: ['ev-2'],
  },
  {
    id: 'a3',
    motorId: 'MTR-88433',
    at: '2026-05-11T14:12:18',
    stationId: 'st-b2',
    stationName: st('st-b2').name,
    kind: 'vision_pass',
    summary: 'YOLO assembly classes stable',
    detail: 'Classes: stator_body, wind_head, lead_bundle',
    cameraId: 'cam-4',
    evidenceIds: ['ev-3'],
  },
  {
    id: 'a4',
    motorId: 'MTR-88433',
    at: '2026-05-11T14:13:00',
    stationId: 'st-b2',
    stationName: st('st-b2').name,
    kind: 'vision_fail',
    summary: 'Rule torque sequence — gun not in frame',
    detail: 'RULE-TORQUE-SEQ-03',
    cameraId: 'cam-4',
    evidenceIds: ['ev-4', 'ev-clip-1'],
    replayWindow: {
      start: '2026-05-11T14:12:30',
      end: '2026-05-11T14:13:45',
    },
  },
  {
    id: 'a5',
    motorId: 'MTR-88433',
    at: '2026-05-11T14:13:01',
    stationId: 'st-b2',
    stationName: st('st-b2').name,
    kind: 'alarm',
    summary: 'Alarm raised: missing torque sequence',
    detail: 'alm-101',
    cameraId: 'cam-4',
    evidenceIds: ['ev-4', 'ev-clip-1'],
  },
  {
    id: 'a6',
    motorId: 'MTR-88433',
    at: '2026-05-11T14:15:22',
    stationId: 'st-b2',
    stationName: st('st-b2').name,
    kind: 'operator',
    summary: 'QC acknowledged — corrective action',
    detail: 'Operator corrected missing step (Jenny Lai)',
    evidenceIds: ['ev-5'],
  },
  {
    id: 'a7',
    motorId: 'MTR-88433',
    at: '2026-05-11T14:16:00',
    stationId: 'st-b2',
    stationName: st('st-b2').name,
    kind: 'clear',
    summary: 'Station released on hold for engineering review',
    cameraId: 'cam-3',
  },
]

export const evidenceLocker: EvidenceItem[] = [
  {
    id: 'ev-1',
    motorId: 'MTR-88433',
    at: '2026-05-11T14:10:12',
    type: 'snapshot',
    cameraId: 'cam-3',
    stationName: st('st-b2').name,
    label: 'Load present — wind cell',
  },
  {
    id: 'ev-2',
    motorId: 'MTR-88433',
    at: '2026-05-11T14:11:03',
    type: 'snapshot',
    cameraId: 'cam-3',
    stationName: st('st-b2').name,
    label: 'QR decode overlay',
  },
  {
    id: 'ev-3',
    motorId: 'MTR-88433',
    at: '2026-05-11T14:12:18',
    type: 'snapshot',
    cameraId: 'cam-4',
    stationName: st('st-b2').name,
    label: 'Overhead QC — pre-fail frame',
  },
  {
    id: 'ev-4',
    motorId: 'MTR-88433',
    at: '2026-05-11T14:13:00',
    type: 'snapshot',
    cameraId: 'cam-4',
    stationName: st('st-b2').name,
    label: 'Violation frame (torque absent)',
    relatedAlarmId: 'alm-101',
  },
  {
    id: 'ev-clip-1',
    motorId: 'MTR-88433',
    at: '2026-05-11T14:12:45',
    type: 'clip',
    cameraId: 'cam-4',
    stationName: st('st-b2').name,
    label: 'Synced replay — overhead + tooling',
    durationSec: 75,
    relatedAlarmId: 'alm-101',
  },
  {
    id: 'ev-5',
    motorId: 'MTR-88433',
    at: '2026-05-11T14:15:22',
    type: 'snapshot',
    cameraId: 'cam-4',
    stationName: st('st-b2').name,
    label: 'Post-ack frame',
  },
]

export const defectRegister: DefectRecord[] = [
  {
    id: 'def-88433-1',
    motorId: 'MTR-88433',
    at: '2026-05-11T14:13:00',
    stationId: 'st-b2',
    stationName: st('st-b2').name,
    code: 'D-TQ-SEQ',
    description: 'Torque verification step not detected before complete',
    severity: 'major',
    evidenceIds: ['ev-4', 'ev-clip-1'],
    clearedAt: '2026-05-11T14:16:00',
  },
  {
    id: 'def-88421-1',
    motorId: 'MTR-88421',
    at: '2026-05-11T09:44:00',
    stationId: 'st-a1',
    stationName: st('st-a1').name,
    code: 'D-VIS-CONF',
    description: 'Rotor stack confidence borderline — auto re-scan passed',
    severity: 'minor',
    evidenceIds: [],
  },
]

export const stationLogs: StationLogEntry[] = [
  {
    id: 'l1',
    at: '2026-05-11T14:13:01',
    stationId: 'st-b2',
    stationName: st('st-b2').name,
    level: 'error',
    message: 'RULE-TORQUE-SEQ-03 tripped for MTR-88433',
    motorId: 'MTR-88433',
    operator: 'J. Lai',
  },
  {
    id: 'l2',
    at: '2026-05-11T14:13:05',
    stationId: 'st-b2',
    stationName: st('st-b2').name,
    level: 'warn',
    message: 'Line hold — awaiting QC ack',
    motorId: 'MTR-88433',
  },
  {
    id: 'l3',
    at: '2026-05-11T14:15:22',
    stationId: 'st-b2',
    stationName: st('st-b2').name,
    level: 'info',
    message: 'Alarm alm-101 acknowledged by Jenny Lai',
    motorId: 'MTR-88433',
    operator: 'Jenny Lai',
  },
  {
    id: 'l4',
    at: '2026-05-11T14:07:00',
    stationId: 'st-d4',
    stationName: st('st-d4').name,
    level: 'warn',
    message: 'Encoder vision confidence dip MTR-88440',
    motorId: 'MTR-88440',
    operator: 'K. Singh',
  },
  {
    id: 'l5',
    at: '2026-05-11T13:58:00',
    stationId: 'st-c3',
    stationName: st('st-c3').name,
    level: 'error',
    message: 'Camera heartbeat lost cam-6',
  },
]

export const shiftRollups: ShiftRollup[] = [
  {
    shiftId: 'shift-2026-05-11-A',
    label: 'Day A · Line 1–2',
    startedAt: '2026-05-11T06:00:00',
    endedAt: '2026-05-11T14:30:00',
    unitsPassed: 1188,
    unitsFailed: 41,
    alarmsOpened: 23,
    meanCycleSecByStation: [
      { stationId: 'st-a1', name: 'Rotor Press A1', sec: 142 },
      { stationId: 'st-b2', name: 'Stator Wind B2', sec: 198 },
      { stationId: 'st-c3', name: 'Final Assembly C3', sec: 165 },
      { stationId: 'st-d4', name: 'Encoder D4', sec: 210 },
    ],
  },
]

export function auditTrailForMotor(motorId: string): MotorAuditEvent[] {
  if (motorId === 'MTR-88433') return motorAuditTrailMTR88433
  return [
    {
      id: 'x1',
      motorId,
      at: '2026-05-11T10:00:00',
      stationId: 'st-a1',
      stationName: st('st-a1').name,
      kind: 'station_in',
      summary: 'Entered line',
      evidenceIds: [],
    },
  ]
}

export function evidenceForMotor(motorId: string): EvidenceItem[] {
  return evidenceLocker.filter((e) => e.motorId === motorId)
}

export function defectsForMotor(motorId: string): DefectRecord[] {
  return defectRegister.filter((d) => d.motorId === motorId)
}

export function logsForStation(stationId: string): StationLogEntry[] {
  return stationLogs
    .filter((l) => l.stationId === stationId)
    .sort((a, b) => b.at.localeCompare(a.at))
}
