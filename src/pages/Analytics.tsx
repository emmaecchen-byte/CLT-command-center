import type { ReactNode } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { analyticsSeed } from '../data/mock'

const chartTooltip = {
  background: '#ffffff',
  border: '1px solid oklch(0.88 0.02 260)',
  borderRadius: 8,
  fontSize: 12,
  color: '#0f172a',
  boxShadow: '0 4px 12px oklch(0 0 0 / 0.08)',
}

const gridStroke = 'oklch(0.9 0.02 260)'
const axisStroke = 'oklch(0.45 0.02 260)'

const heatColors = [
  'oklch(0.35 0.06 260)',
  'oklch(0.45 0.1 260)',
  'oklch(0.55 0.14 195)',
  'oklch(0.65 0.16 195)',
  'oklch(0.72 0.18 165)',
]

export function AnalyticsPage() {
  const {
    alarmFrequency,
    defectTrend,
    throughput,
    stationCompare,
    heatmap,
    compliance,
    reworkPct,
    downtimeMin,
  } = analyticsSeed

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Analytics / reporting
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Alarm frequency, defect trends, bottlenecks, compliance, throughput,
          rework, and downtime — tuned for management reviews.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Compliance" value={`${compliance}%`} hint="rule adherence" />
        <Kpi label="Rework" value={`${reworkPct}%`} hint="of WIP" />
        <Kpi label="Downtime" value={`${downtimeMin} min`} hint="shift to date" />
        <Kpi
          label="Peak throughput"
          value={`${Math.max(...throughput.map((t) => t.units))} u/h`}
          hint="best hour today"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Alarm frequency (7d)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={alarmFrequency}>
              <CartesianGrid stroke={gridStroke} vertical={false} />
              <XAxis dataKey="day" stroke={axisStroke} fontSize={11} />
              <YAxis stroke={axisStroke} fontSize={11} />
              <Tooltip contentStyle={chartTooltip} />
              <Bar dataKey="count" fill="oklch(0.65 0.14 75)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Defect trend (weekly)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={defectTrend}>
              <CartesianGrid stroke={gridStroke} vertical={false} />
              <XAxis dataKey="week" stroke={axisStroke} fontSize={11} />
              <YAxis stroke={axisStroke} fontSize={11} />
              <Tooltip contentStyle={chartTooltip} />
              <Line
                type="monotone"
                dataKey="defects"
                stroke="oklch(0.72 0.14 195)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Throughput by hour">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={throughput}>
              <defs>
                <linearGradient id="fillThr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.65 0.14 195)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.65 0.14 195)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={gridStroke} vertical={false} />
              <XAxis dataKey="hour" stroke={axisStroke} fontSize={11} />
              <YAxis stroke={axisStroke} fontSize={11} />
              <Tooltip contentStyle={chartTooltip} />
              <Area
                type="monotone"
                dataKey="units"
                stroke="oklch(0.72 0.14 195)"
                fill="url(#fillThr)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Station comparison (OEE proxy)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stationCompare} layout="vertical">
              <CartesianGrid stroke={gridStroke} horizontal={false} />
              <XAxis type="number" stroke={axisStroke} fontSize={11} />
              <YAxis
                type="category"
                dataKey="name"
                stroke={axisStroke}
                fontSize={11}
                width={72}
              />
              <Tooltip contentStyle={chartTooltip} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#0f172a' }} />
              <Bar dataKey="oee" name="OEE %" fill="oklch(0.68 0.14 155)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="fpY" name="FPY units" fill="oklch(0.55 0.08 260)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Station × hour load (heatmap)">
        <p className="mb-4 text-xs text-slate-500">
          Relative congestion — darker is hotter. Wire to real WIP or queue
          depth.
        </p>
        <div className="overflow-x-auto">
          <div
            className="inline-grid gap-1"
            style={{
              gridTemplateColumns: `100px repeat(${heatmap[0]?.length ?? 0}, minmax(40px,1fr))`,
            }}
          >
            <div />
            {(heatmap[0] ?? []).map((_, ci) => (
              <div
                key={ci}
                className="text-center font-mono text-[10px] text-slate-500"
              >
                H{ci}
              </div>
            ))}
            {heatmap.map((row, ri) => (
              <div key={`row-${ri}`} className="contents">
                <div className="pr-2 text-right font-mono text-[10px] text-slate-500">
                  S{ri + 1}
                </div>
                {row.map((v, ci) => (
                  <div
                    key={`cell-${ri}-${ci}`}
                    title={`${(v * 100).toFixed(0)}%`}
                    className="aspect-square min-h-[36px] rounded-md ring-1 ring-slate-200"
                    style={{
                      background:
                        heatColors[Math.min(heatColors.length - 1, Math.floor(v * heatColors.length))],
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </ChartCard>
    </div>
  )
}

function Kpi({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-mono text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
    </div>
  )
}

function ChartCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  )
}
