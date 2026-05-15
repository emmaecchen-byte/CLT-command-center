import { clsx } from 'clsx'
import { WifiOff } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'
import { translateUi } from '../../i18n/translateUi'
import type { CameraFeed } from '../../types'

function hashHue(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h % 360
}

const overlayStyles = {
  motor: {
    box: 'border-lime-600/90 shadow-[0_0_12px_rgba(101,163,13,0.25)]',
    tag: 'bg-lime-400/95 text-black',
    ctx: 'text-lime-100 ring-lime-600/40',
    live: 'bg-emerald-500/25 text-emerald-900 ring-emerald-600/40',
  },
  people: {
    box: 'border-sky-600/90 shadow-[0_0_12px_rgba(2,132,199,0.25)]',
    tag: 'bg-sky-400/95 text-slate-950',
    ctx: 'text-sky-100 ring-sky-600/40',
    live: 'bg-sky-500/25 text-sky-900 ring-sky-600/40',
  },
} as const

export function CameraTile({
  camera,
  showConfidence = true,
  size = 'default',
}: {
  camera: CameraFeed
  showConfidence?: boolean
  /** `compact` for side panels; `default` for live grid (larger). */
  size?: 'default' | 'compact'
}) {
  const { language } = useLanguage()
  const hue = hashHue(camera.id)
  const kind = camera.monitorKind
  const o = overlayStyles[kind]
  const ctxLabel =
    kind === 'people'
      ? translateUi('Zone', language)
      : translateUi('Step', language)
  return (
    <div
      className={clsx(
        'relative w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-slate-100 shadow-inner',
        size === 'default' &&
          'aspect-video min-h-[clamp(220px,32dvh,560px)] sm:min-h-[clamp(260px,36dvh,620px)]',
        size === 'compact' && 'aspect-video',
        !camera.online && 'opacity-70',
      )}
    >
      {/* simulated feed */}
      <div
        className="absolute inset-0"
        style={{
          background: camera.online
            ? `linear-gradient(145deg, oklch(0.22 0.04 ${hue}) 0%, oklch(0.12 0.02 ${hue}) 45%, oklch(0.18 0.03 ${hue + 40}) 100%)`
            : 'linear-gradient(145deg, oklch(0.2 0 0), oklch(0.12 0 0))',
        }}
      />
      <div className="scanlines absolute inset-0" />
      {!camera.online && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-200 text-slate-600">
          <WifiOff className="size-8" aria-hidden />
          <span className="text-xs font-medium uppercase tracking-wide">
            {translateUi('Offline', language)}
          </span>
        </div>
      )}
      {/* YOLO-style overlays */}
      {camera.online &&
        camera.detections.map((d) => (
          <div key={d.id} className="absolute" style={{ inset: 0 }}>
            <div
              className={clsx('absolute rounded border-2', o.box)}
              style={{
                left: `${d.bbox.x}%`,
                top: `${d.bbox.y}%`,
                width: `${d.bbox.w}%`,
                height: `${d.bbox.h}%`,
              }}
            >
              <div className="absolute -top-px left-0 flex -translate-y-full flex-col gap-0.5">
                <span
                  className={clsx(
                    'rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide',
                    o.tag,
                  )}
                >
                  {translateUi(d.label.replace(/_/g, ' '), language)}
                </span>
                <span
                  className={clsx(
                    'w-max max-w-[140px] truncate rounded bg-slate-900 px-1.5 py-0.5 text-[10px] ring-1',
                    o.ctx,
                  )}
                >
                  {ctxLabel}: {translateUi(d.processStep, language)}
                </span>
                {showConfidence && (
                  <span className="w-max rounded bg-slate-900/90 px-1.5 py-0.5 font-mono text-[10px] text-white">
                    {(d.confidence * 100).toFixed(0)}% {translateUi('conf', language)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 to-transparent px-3 pb-2 pt-8">
        <p className="truncate text-xs font-semibold text-white">
          {translateUi(camera.name, language)}
        </p>
        <p className="font-mono text-[10px] text-white/70">{camera.id}</p>
      </div>
      {camera.online && (
        <span
          className={clsx(
            'absolute right-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1',
            o.live,
          )}
        >
          {translateUi('Live', language)}
        </span>
      )}
      <span
        className={clsx(
          'absolute left-2 top-2 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1',
          kind === 'motor' &&
            'bg-lime-500/20 text-lime-900 ring-lime-600/35',
          kind === 'people' &&
            'bg-sky-500/20 text-sky-900 ring-sky-600/35',
        )}
      >
        {kind === 'motor'
          ? translateUi('Motor QC', language)
          : translateUi('People', language)}
      </span>
    </div>
  )
}
