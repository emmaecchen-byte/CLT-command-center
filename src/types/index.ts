export type Severity = 'critical' | 'high' | 'medium' | 'low'
export type AlarmStatus = 'open' | 'acknowledged' | 'cleared'
export type PlantStatus = 'running' | 'degraded' | 'stopped'

export interface BBox {
  x: number
  y: number
  w: number
  h: number
}

export interface Detection {
  id: string
  label: string
  processStep: string
  confidence: number
  bbox: BBox
}

export type CameraMonitorKind = 'people' | 'motor'

export interface CameraFeed {
  id: string
  name: string
  stationId: string
  /** Separate live views: operator/safety vs product QC. */
  monitorKind: CameraMonitorKind
  online: boolean
  detections: Detection[]
}

export interface ActiveAlarmSummary {
  id: string
  title: string
  station: string
  severity: Severity
  time: string
}

export interface AlarmRow {
  id: string
  time: string
  stationId: string
  stationName: string
  alarmType: string
  severity: Severity
  status: AlarmStatus
  assignedTo: string | null
  ruleViolated: string
  motorId: string
  qrCode: string
  snapshotUrl: string
  cameraId: string
  timeline: { t: string; label: string; kind: 'info' | 'warn' | 'error' | 'ok' }[]
  comments: { author: string; time: string; text: string; reason?: string }[]
}

export interface Station {
  id: string
  name: string
  line: string
  utilizationPct: number
  cycleTimeSec: number
  passCount: number
  failCount: number
  currentMotor: string | null
  processStep: string
  operator: { name: string; status: 'present' | 'break' | 'offline' }
}

export interface TimelineEvent {
  id: string
  at: string
  label: string
  kind: 'motor' | 'scan' | 'qc' | 'alarm' | 'clear'
}
