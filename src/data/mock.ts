import type {
  ActiveAlarmSummary,
  AlarmRow,
  CameraFeed,
  Detection,
  PlantStatus,
  Station,
  TimelineEvent,
} from '../types'

export const plantMetrics = {
  status: 'running' as PlantStatus,
  activeAlarms: 4,
  /** All feeds (people + motor). */
  camerasOnline: 8,
  camerasTotal: 9,
}

export const stations: Station[] = [
  {
    id: 'st-a1',
    name: 'Rotor Press A1',
    line: 'Line 1',
    utilizationPct: 87,
    cycleTimeSec: 142,
    passCount: 312,
    failCount: 9,
    currentMotor: 'MTR-88421',
    processStep: 'Torque verify (T3)',
    operator: { name: 'M. Chen', status: 'present' },
  },
  {
    id: 'st-b2',
    name: 'Stator Wind B2',
    line: 'Line 1',
    utilizationPct: 72,
    cycleTimeSec: 198,
    passCount: 198,
    failCount: 14,
    currentMotor: 'MTR-88433',
    processStep: 'Lead dress / QC frame',
    operator: { name: 'J. Lai', status: 'present' },
  },
  {
    id: 'st-c3',
    name: 'Final Assembly C3',
    line: 'Line 2',
    utilizationPct: 91,
    cycleTimeSec: 165,
    passCount: 421,
    failCount: 6,
    currentMotor: null,
    processStep: 'Idle — load next',
    operator: { name: 'R. Ortiz', status: 'break' },
  },
  {
    id: 'st-d4',
    name: 'Endcap & Encoder D4',
    line: 'Line 2',
    utilizationPct: 68,
    cycleTimeSec: 210,
    passCount: 267,
    failCount: 22,
    currentMotor: 'MTR-88440',
    processStep: 'Encoder alignment',
    operator: { name: 'K. Singh', status: 'present' },
  },
]

const det = (
  id: string,
  label: string,
  step: string,
  conf: number,
  bbox: { x: number; y: number; w: number; h: number },
): Detection => ({
  id,
  label,
  processStep: step,
  confidence: conf,
  bbox,
})

/** Operator / safety / ergonomics — separate live page from motor QC. */
export const camerasPeople: CameraFeed[] = [
  {
    id: 'pcam-1',
    name: 'PCam 1 — Line 1 aisle',
    stationId: 'st-a1',
    monitorKind: 'people',
    online: true,
    detections: [
      det('p1', 'person', 'PPE check zone', 0.92, {
        x: 28,
        y: 20,
        w: 22,
        h: 58,
      }),
      det('p2', 'hard_hat', 'Head PPE', 0.89, { x: 32, y: 18, w: 14, h: 14 }),
    ],
  },
  {
    id: 'pcam-2',
    name: 'PCam 2 — Light curtain zone',
    stationId: 'st-a1',
    monitorKind: 'people',
    online: true,
    detections: [
      det('p3', 'person', 'Safe distance', 0.87, {
        x: 40,
        y: 25,
        w: 18,
        h: 50,
      }),
    ],
  },
  {
    id: 'pcam-3',
    name: 'PCam 3 — Pack bench',
    stationId: 'st-c3',
    monitorKind: 'people',
    online: true,
    detections: [
      det('p4', 'person', 'Ergo / reach zone', 0.84, {
        x: 15,
        y: 22,
        w: 35,
        h: 55,
      }),
      det('p5', 'safety_vest', 'Hi-vis', 0.91, { x: 22, y: 38, w: 20, h: 28 }),
    ],
  },
]

/** Motor & assembly YOLO — product QC only. */
export const camerasMotor: CameraFeed[] = [
  {
    id: 'cam-1',
    name: 'Cam 1 — Rotor cell',
    stationId: 'st-a1',
    monitorKind: 'motor',
    online: true,
    detections: [
      det('d1', 'rotor_stack', 'Stack height OK', 0.94, {
        x: 12,
        y: 18,
        w: 38,
        h: 52,
      }),
      det('d2', 'bearing_seat', 'Press fit zone', 0.88, {
        x: 52,
        y: 40,
        w: 28,
        h: 22,
      }),
    ],
  },
  {
    id: 'cam-2',
    name: 'Cam 2 — Tooling',
    stationId: 'st-a1',
    monitorKind: 'motor',
    online: true,
    detections: [
      det('d3', 'torque_gun', 'T3 torque check', 0.91, {
        x: 58,
        y: 22,
        w: 22,
        h: 35,
      }),
    ],
  },
  {
    id: 'cam-3',
    name: 'Cam 3 — Wind head',
    stationId: 'st-b2',
    monitorKind: 'motor',
    online: true,
    detections: [
      det('d4', 'copper_tail', 'Lead dress', 0.79, {
        x: 8,
        y: 30,
        w: 55,
        h: 40,
      }),
    ],
  },
  {
    id: 'cam-4',
    name: 'Cam 4 — Overhead QC',
    stationId: 'st-b2',
    monitorKind: 'motor',
    online: true,
    detections: [
      det('d5', 'missing_step', 'Torque absent', 0.86, {
        x: 30,
        y: 12,
        w: 45,
        h: 38,
      }),
    ],
  },
  {
    id: 'cam-5',
    name: 'Cam 5 — Encoder',
    stationId: 'st-d4',
    monitorKind: 'motor',
    online: true,
    detections: [
      det('d6', 'encoder_disk', 'Disk present', 0.97, {
        x: 22,
        y: 25,
        w: 48,
        h: 48,
      }),
    ],
  },
  {
    id: 'cam-6',
    name: 'Cam 6 — Pack-out',
    stationId: 'st-c3',
    monitorKind: 'motor',
    online: false,
    detections: [],
  },
]

/** All cameras (alarm detail lookup, admin counts). */
export const cameras: CameraFeed[] = [...camerasPeople, ...camerasMotor]

export const activeAlarmsSummary: ActiveAlarmSummary[] = [
  {
    id: 'alm-101',
    title: 'Missing torque sequence',
    station: 'Stator Wind B2',
    severity: 'high',
    time: '14:13',
  },
  {
    id: 'alm-098',
    title: 'Encoder confidence low',
    station: 'Endcap & Encoder D4',
    severity: 'medium',
    time: '14:07',
  },
  {
    id: 'alm-095',
    title: 'Camera 6 heartbeat lost',
    station: 'Final Assembly C3',
    severity: 'low',
    time: '13:58',
  },
]

const alarmComments = [
  {
    author: 'Jenny Lai',
    time: '2:14 PM',
    text: 'Alarm acknowledged',
    reason: 'Operator corrected missing step',
  },
]

export const alarms: AlarmRow[] = [
  {
    id: 'alm-101',
    time: '2026-05-11T14:13:00',
    stationId: 'st-b2',
    stationName: 'Stator Wind B2',
    alarmType: 'Process / QC',
    severity: 'high',
    status: 'open',
    assignedTo: 'QC Lead',
    ruleViolated: 'RULE-TORQUE-SEQ-03 — Torque gun not detected before station complete',
    motorId: 'MTR-88433',
    qrCode: 'QR-MTR-88433-L1',
    snapshotUrl: '/api/snapshots/alm-101.jpg',
    cameraId: 'cam-4',
    timeline: [
      { t: '14:10', label: 'Motor entered station', kind: 'info' },
      { t: '14:11', label: 'QR scanned', kind: 'info' },
      { t: '14:12', label: 'Assembly detected (YOLO)', kind: 'info' },
      { t: '14:13', label: 'Missing torque check', kind: 'error' },
      { t: '14:13', label: 'Alarm triggered', kind: 'error' },
    ],
    comments: [],
  },
  {
    id: 'alm-098',
    time: '2026-05-11T14:07:00',
    stationId: 'st-d4',
    stationName: 'Endcap & Encoder D4',
    alarmType: 'Vision confidence',
    severity: 'medium',
    status: 'acknowledged',
    assignedTo: 'R. Ortiz',
    ruleViolated: 'RULE-ENC-CONF — Mean class confidence < 0.82 for 3 consecutive frames',
    motorId: 'MTR-88440',
    qrCode: 'QR-MTR-88440-L2',
    snapshotUrl: '/api/snapshots/alm-098.jpg',
    cameraId: 'cam-5',
    timeline: [
      { t: '14:05', label: 'Motor entered station', kind: 'info' },
      { t: '14:06', label: 'Encoder disk detected', kind: 'info' },
      { t: '14:07', label: 'Confidence dip', kind: 'warn' },
    ],
    comments: alarmComments,
  },
  {
    id: 'alm-095',
    time: '2026-05-11T13:58:00',
    stationId: 'st-c3',
    stationName: 'Final Assembly C3',
    alarmType: 'Connectivity',
    severity: 'low',
    status: 'cleared',
    assignedTo: null,
    ruleViolated: 'RULE-CAM-HB — Camera heartbeat timeout > 8s',
    motorId: '—',
    qrCode: '—',
    snapshotUrl: '/api/snapshots/alm-095.jpg',
    cameraId: 'cam-6',
    timeline: [
      { t: '13:58', label: 'Heartbeat lost', kind: 'error' },
      { t: '14:02', label: 'Maintenance mode ON', kind: 'info' },
      { t: '14:04', label: 'Link restored', kind: 'ok' },
    ],
    comments: [],
  },
  {
    id: 'alm-090',
    time: '2026-05-11T12:22:00',
    stationId: 'st-a1',
    stationName: 'Rotor Press A1',
    alarmType: 'Safety interlock',
    severity: 'critical',
    status: 'cleared',
    assignedTo: 'M. Chen',
    ruleViolated: 'RULE-SAFE-01 — Light curtain broken while press armed',
    motorId: 'MTR-88410',
    qrCode: 'QR-MTR-88410-L1',
    snapshotUrl: '/api/snapshots/alm-090.jpg',
    cameraId: 'cam-1',
    timeline: [
      { t: '12:22', label: 'Interlock trip', kind: 'error' },
      { t: '12:24', label: 'Press disarmed', kind: 'ok' },
    ],
    comments: [],
  },
]

export function stationTimeline(stationId: string): TimelineEvent[] {
  if (stationId === 'st-b2') {
    return [
      {
        id: '1',
        at: '2026-05-11T14:10:00',
        label: 'Motor entered station',
        kind: 'motor',
      },
      { id: '2', at: '2026-05-11T14:11:00', label: 'QR scanned', kind: 'scan' },
      {
        id: '3',
        at: '2026-05-11T14:12:00',
        label: 'Assembly detected (YOLO)',
        kind: 'qc',
      },
      {
        id: '4',
        at: '2026-05-11T14:13:00',
        label: 'Missing torque check',
        kind: 'alarm',
      },
      {
        id: '5',
        at: '2026-05-11T14:13:00',
        label: 'Alarm triggered',
        kind: 'alarm',
      },
      {
        id: '6',
        at: '2026-05-11T14:15:00',
        label: 'Cleared by QC',
        kind: 'clear',
      },
    ]
  }
  return [
    {
      id: '1',
      at: '2026-05-11T14:18:00',
      label: 'Cycle start',
      kind: 'motor',
    },
    {
      id: '2',
      at: '2026-05-11T14:18:30',
      label: 'Vision OK — all classes ≥ threshold',
      kind: 'qc',
    },
    {
      id: '3',
      at: '2026-05-11T14:19:10',
      label: 'Station complete',
      kind: 'clear',
    },
  ]
}

export const analyticsSeed = {
  alarmFrequency: [
    { day: 'Mon', count: 12 },
    { day: 'Tue', count: 8 },
    { day: 'Wed', count: 15 },
    { day: 'Thu', count: 9 },
    { day: 'Fri', count: 11 },
    { day: 'Sat', count: 4 },
    { day: 'Sun', count: 2 },
  ],
  defectTrend: [
    { week: 'W14', defects: 42 },
    { week: 'W15', defects: 38 },
    { week: 'W16', defects: 31 },
    { week: 'W17', defects: 28 },
    { week: 'W18', defects: 22 },
  ],
  throughput: [
    { hour: '06', units: 42 },
    { hour: '08', units: 78 },
    { hour: '10', units: 91 },
    { hour: '12', units: 85 },
    { hour: '14', units: 88 },
    { hour: '16', units: 76 },
  ],
  stationCompare: stations.map((s) => ({
    name: s.name.split(' ')[0],
    oee: Math.round(s.utilizationPct * 0.92),
    fpY: s.passCount + s.failCount,
  })),
  heatmap: [
    [0.2, 0.4, 0.7, 0.5, 0.3, 0.6],
    [0.5, 0.3, 0.8, 0.6, 0.4, 0.5],
    [0.6, 0.5, 0.9, 0.7, 0.5, 0.4],
    [0.4, 0.6, 0.5, 0.8, 0.6, 0.7],
  ],
  compliance: 96.4,
  reworkPct: 3.1,
  downtimeMin: 47,
}
