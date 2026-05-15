import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Camera, Gauge, Shield, Sliders, Users, Wrench } from 'lucide-react'
import type { ReactNode } from 'react'

export function AdminPage() {
  const [camCount, setCamCount] = useState(9)
  const [torqueTh, setTorqueTh] = useState(0.82)
  const [alarmSens, setAlarmSens] = useState(72)
  const [maintMode, setMaintMode] = useState(false)
  const [calibDue, setCalibDue] = useState(true)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Admin / configuration
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Cameras, station rules, thresholds, alarm sensitivity, roles,
          maintenance mode, and calibration — keep parity with your edge
          pipeline.
        </p>
      </div>

      <Section icon={Camera} title="Cameras">
        <p className="text-sm text-slate-600">
          Add or remove logical camera feeds mapped to stations and YOLO
          streams.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="text-sm text-slate-600">
            Active cameras
            <input
              type="number"
              min={1}
              max={32}
              value={camCount}
              onChange={(e) => setCamCount(Number(e.target.value))}
              className="ml-2 w-20 rounded-lg border border-[var(--color-border)] bg-slate-50 px-2 py-1 font-mono text-slate-900"
            />
          </label>
          <button
            type="button"
            className="rounded-lg bg-[var(--color-accent)]/20 px-3 py-2 text-sm font-medium text-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/35 hover:bg-[var(--color-accent)]/30"
          >
            Add camera
          </button>
          <button
            type="button"
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200"
          >
            Remove selected
          </button>
        </div>
      </Section>

      <Section icon={Sliders} title="Station rules & thresholds">
        <p className="text-sm text-slate-600">
          Edit per-station rules (e.g. torque presence, class checklist) and
          numeric thresholds consumed by the rules engine.
        </p>
        <div className="mt-4 space-y-4">
          <label className="block text-sm text-slate-600">
            Min vision confidence (encoder disk)
            <input
              type="range"
              min={0.5}
              max={0.99}
              step={0.01}
              value={torqueTh}
              onChange={(e) => setTorqueTh(Number(e.target.value))}
              className="mt-2 block w-full accent-[var(--color-accent)]"
            />
            <span className="font-mono text-xs text-slate-500">
              {torqueTh.toFixed(2)}
            </span>
          </label>
        </div>
      </Section>

      <Section icon={Gauge} title="Alarm sensitivity">
        <p className="text-sm text-slate-600">
          Global bias: higher reacts faster to marginal vision / sequence
          violations.
        </p>
        <input
          type="range"
          min={0}
          max={100}
          value={alarmSens}
          onChange={(e) => setAlarmSens(Number(e.target.value))}
          className="mt-4 block w-full accent-amber-400"
        />
        <p className="mt-1 font-mono text-xs text-slate-500">{alarmSens}%</p>
      </Section>

      <Section icon={Users} title="User roles">
        <p className="text-sm text-slate-600">
          Operator, line lead, QC, engineer, admin — map to SSO groups in
          production.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {['Operator', 'QC', 'Engineer', 'Admin'].map((r) => (
            <button
              key={r}
              type="button"
              className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200"
            >
              Manage {r}
            </button>
          ))}
        </div>
      </Section>

      <Section icon={Wrench} title="Maintenance & calibration">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Toggle
            label="Maintenance mode"
            description="Suppress production alarms; tag events as maintenance."
            checked={maintMode}
            onChange={setMaintMode}
          />
          <Toggle
            label="Calibration due flag"
            description="Surface banner on live dashboard until extrinsics saved."
            checked={calibDue}
            onChange={setCalibDue}
          />
        </div>
        <button
          type="button"
          className="mt-4 rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 ring-1 ring-slate-300 hover:bg-slate-200"
        >
          Open camera calibration wizard
        </button>
      </Section>

      <Section icon={Shield} title="Audit">
        <p className="text-sm text-slate-600">
          Configuration changes should append to an immutable audit log with
          user, diff, and effective time — hook your backend here.
        </p>
      </Section>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
        <Icon className="size-4 text-[var(--color-accent)]" aria-hidden />
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="pt-4">{children}</div>
    </section>
  )
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex max-w-md flex-1 items-start justify-between gap-4 rounded-lg bg-slate-100 p-3 ring-1 ring-slate-200">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? 'bg-[var(--color-accent)]' : 'bg-slate-200'
        }`}
      >
        <span
          className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition ${
            checked ? 'left-6' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  )
}
