/** Genealogy / complaint investigation domain types */

export type AuditEventKind =
  | 'qr_scan'
  | 'station_in'
  | 'station_out'
  | 'vision_pass'
  | 'vision_fail'
  | 'process'
  | 'alarm'
  | 'clear'
  | 'operator'
  | 'ship'

export interface MotorAuditEvent {
  id: string
  motorId: string
  at: string
  stationId: string
  stationName: string
  kind: AuditEventKind
  summary: string
  detail?: string
  cameraId?: string
  evidenceIds?: string[]
  /** Multi-camera synchronized replay window (mock). */
  replayWindow?: { start: string; end: string }
}

export type EvidenceType = 'snapshot' | 'clip'

export interface EvidenceItem {
  id: string
  motorId: string
  at: string
  type: EvidenceType
  cameraId: string
  stationName: string
  label: string
  durationSec?: number
  relatedAlarmId?: string
}

export interface DefectRecord {
  id: string
  motorId: string
  at: string
  stationId: string
  stationName: string
  code: string
  description: string
  severity: 'critical' | 'major' | 'minor'
  evidenceIds: string[]
  clearedAt?: string
}

export interface StationLogEntry {
  id: string
  at: string
  stationId: string
  stationName: string
  level: 'info' | 'warn' | 'error'
  message: string
  motorId?: string
  operator?: string
}

export interface ShiftRollup {
  shiftId: string
  label: string
  startedAt: string
  endedAt: string
  unitsPassed: number
  unitsFailed: number
  alarmsOpened: number
  meanCycleSecByStation: { stationId: string; name: string; sec: number }[]
}

export interface HistoryMotorSummary {
  motorId: string
  qrCode: string
  sku: string
  customerLot?: string
  status: 'shipped' | 'hold' | 'scrap' | 'rework'
  lastStationId: string
  lastSeenAt: string
}
