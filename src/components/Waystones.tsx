import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'motion/react'
import { Head, Mono } from './kit'
import { archiveWeeks, type ArchiveWeek } from '../generated/archive'

/**
 * Twenty weeks as waystones along the path.
 * The homepage shows only metadata + preview imagery.
 * Every actual weekly article lives at Blogs/Week_XX.html.
 */
const W = 4200
const pad = (n: number) => String(n).padStart(2, '0')
const trailY = (x: number) => 360 - (x / W) * 210 + Math.sin(x / 260) * 34 + Math.sin(x / 90) * 6
const stoneX = (i: number) => 260 + i * ((W - 520) / 19)

function trailPath() {
  let d = `M0 ${trailY(0)}`
  for (let x = 20; x <= W; x += 20) d += ` L${x} ${trailY(x).toFixed(1)}`
  return d
}

function range(seed: number, amp: number, base: number, w: number) {
  let d = `M0 600 L0 ${base}`
  for (let x = 0; x <= w; x += 40) d += ` L${x} ${(base - Math.abs(Math.sin(x / 210 + seed)) * amp - Math.sin(x / 70 + seed * 3) * amp * 0.12).toFixed(1)}`
  return d + ` L${w} 600 Z`
}

function resolvePublicAsset(src: string, base: string) {
  if (!src) return ''
  if (/^(?:https?:|data:|blob:)/i.test(src)) return src
  return `${base}${src.replace(/^\/+/, '')}`
}

export default function Waystones() {
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<number | null>(null)
  const [here, setHere] = useState(0)
  const [vw, setVw] = useState(1200)

  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`

  useEffect(() => {
    const r = () => setVw(innerWidth)
    r()
    addEventListener('resize', r)
    return () => removeEventListener('resize', r)
  }, [])

  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useTransform(p, [0, 1], [0, -(W - vw)])
  const far = useTransform(p, [0, 1], [0, -(W - vw) * 0.25])
  const mid = useTransform(p, [0, 1], [0, -(W - vw) * 0.55])
  const walker = useTransform(p, [0, 1], [stoneX(0), stoneX(19)])
  const walkerY = useTransform(walker, (v) => trailY(v) - 10)

  useMotionValueEvent(p, 'change', (v) => {
    setHere(Math.min(19, Math.max(0, Math.round(v * 19))))
  })

  useEffect(() => {
    const h = (e: Event) => {
      const requested = Number((e as CustomEvent<number>).detail)
      if (Number.isInteger(requested) && requested >= 0 && requested < archiveWeeks.length) setOpen(requested)
    }
    addEventListener('archive:open', h)
    return () => removeEventListener('archive:open', h)
  }, [])

  const walkTo = (index: number) => {
    const el = ref.current
    if (!el) return
    scrollTo({
      top: el.offsetTop + ((el.offsetHeight - innerHeight) * index) / Math.max(1, archiveWeeks.length - 1),
      behavior: 'smooth',
    })
  }

  const current = archiveWeeks[here]

  return (
    <section id="waystones" className="relative">
      <div data-tone="steel" className="mx-auto max-w-[1500px] px-5 pt-32 md:px-10 lg:pl-40">
        <Head n="IV" label="The 20-week archive" aside="FORGE — PRICE ProtoSem" />
        <div className="grid gap-8 lg:grid-cols-12">
          <h2 className="font-display text-[clamp(2.4rem,6vw,6rem)] font-extrabold leading-[0.92] tracking-[-0.03em] lg:col-span-7">
            The Waystones<span className="text-blood">.</span>
          </h2>
          <p className="self-end text-[15px] leading-relaxed text-mist lg:col-span-5">
            Twenty weeks of learning, experiments, presentations and engineering work. Choose a week to preview its record, then open the complete standalone field dossier.
          </p>
        </div>
      </div>

      <div ref={ref} data-tone="steel" className="relative h-[520vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <motion.svg style={{ x: far }} viewBox={`0 0 ${W} 600`} preserveAspectRatio="none" className="absolute bottom-0 h-[70vh]" width={W} aria-hidden>
            <path d={range(1, 200, 360, W)} fill="#1a1f24" fillOpacity=".55" />
          </motion.svg>
          <motion.svg style={{ x: mid }} viewBox={`0 0 ${W} 600`} preserveAspectRatio="none" className="absolute bottom-0 h-[56vh]" width={W} aria-hidden>
            <path d={range(4, 140, 420, W)} fill="#101316" fillOpacity=".8" />
          </motion.svg>

          <motion.div style={{ x }} className="absolute bottom-[6vh] left-0 h-[480px]">
            <svg width={W} height="480" viewBox={`0 0 ${W} 480`} className="absolute inset-0" aria-hidden>
              <path d={trailPath() + ` L${W} 480 L0 480 Z`} fill="#070809" />
              <path d={trailPath()} fill="none" stroke="#ece4d3" strokeOpacity=".22" strokeDasharray="2 8" />
              <motion.circle r="6" fill="#c3301b" style={{ cx: walker, cy: walkerY }} />
            </svg>
            {archiveWeeks.map((w, i) => (
              <Stone key={w.n} w={w} x={stoneX(i)} y={trailY(stoneX(i))} near={here === i} onOpen={() => setOpen(i)} />
            ))}
          </motion.div>

          <div className="absolute inset-x-0 top-24 flex items-start justify-between gap-8 px-5 md:px-10 lg:pl-40">
            <div className="min-w-0">
              <Mono className="text-mist">Now passing</Mono>
              <p className="font-display text-6xl font-extrabold leading-none md:text-8xl">
                {pad(current?.n ?? 0)}<span className="text-2xl text-mist md:text-3xl"> / 20</span>
              </p>
              <p className="mt-2 max-w-xl text-sm text-bone/70">{current?.title ?? 'Record awaiting entry'}</p>
            </div>
            <button onClick={() => setOpen(here)} className="shrink-0 border border-washi/25 px-4 py-3 transition-colors hover:border-blood hover:bg-blood">
              <Mono>Preview week {pad(current?.n ?? 0)} ↗</Mono>
            </button>
          </div>

          <ol className="absolute inset-x-0 bottom-4 flex justify-center gap-1 px-5 md:px-10 lg:pl-40" aria-label="Jump to week">
            {archiveWeeks.map((w, i) => (
              <li key={w.n}>
                <button onClick={() => walkTo(i)} aria-label={`Walk to week ${pad(w.n)}`} className="group flex h-8 w-3 items-end justify-center md:w-5">
                  <span className={`block w-[2px] transition-all duration-300 ${here === i ? 'h-6 bg-blood' : w.hasContent ? 'h-3 bg-washi/60 group-hover:h-5' : 'h-2 bg-washi/25 group-hover:h-5'}`} />
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <AnimatePresence>
        {open !== null && <RecordPreview index={open} setIndex={setOpen} base={base} />}
      </AnimatePresence>
    </section>
  )
}

function Stone({ w, x, y, near, onOpen }: { w: ArchiveWeek; x: number; y: number; near: boolean; onOpen: () => void }) {
  const h = 120 + ((w.n * 37) % 5) * 14
  const title = w.title || 'Record awaiting entry'
  return (
    <button
      onClick={onOpen}
      data-cursor="Preview"
      aria-label={`Preview week ${w.n}: ${title}`}
      className="group absolute -translate-x-1/2 text-left"
      style={{ left: x, top: y - h, width: 84, height: h }}
    >
      <motion.span
        className={`absolute inset-0 border ${w.hasContent ? 'border-washi/20 bg-gradient-to-b from-[#3a3f44] to-[#15181b]' : 'border-washi/10 bg-gradient-to-b from-[#24282b] to-[#121416]'}`}
        style={{ clipPath: 'polygon(12% 4%, 88% 0, 100% 100%, 0 100%)' }}
        animate={{ y: near ? -10 : 0, filter: near ? 'brightness(1.35)' : 'brightness(1)' }}
        whileHover={{ y: -14 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      />
      <span className={`pointer-events-none absolute inset-x-0 top-5 text-center font-display text-3xl font-extrabold transition-colors ${w.hasContent ? 'text-washi/85' : 'text-washi/45'} group-hover:text-washi`}>{pad(w.n)}</span>
      <span className="pointer-events-none absolute inset-x-0 bottom-3 text-center font-mono text-[8px] uppercase tracking-[0.2em] text-mist">Week</span>
      <motion.span className="pointer-events-none absolute -bottom-6 left-1/2 h-16 w-40 -translate-x-1/2 rounded-full" style={{ background: 'radial-gradient(closest-side, #e8743a55, transparent)' }} animate={{ opacity: near ? 1 : 0 }} />
      <span className="pointer-events-none absolute left-1/2 top-[-58px] w-52 -translate-x-1/2 text-center transition-all duration-500 opacity-100">
        <span className={`block font-display text-sm leading-tight transition-opacity ${near ? 'text-washi' : 'text-washi/35'}`}>{title}</span>
      </span>
    </button>
  )
}

function RecordPreview({ index, setIndex, base }: { index: number; setIndex: (n: number | null) => void; base: string }) {
  const w = archiveWeeks[index]
  if (!w) return null

  const go = useCallback((delta: number) => {
    setIndex(Math.min(archiveWeeks.length - 1, Math.max(0, index + delta)))
  }, [index, setIndex])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIndex(null)
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    addEventListener('keydown', onKey)
    const prior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      removeEventListener('keydown', onKey)
      document.body.style.overflow = prior
    }
  }, [go, setIndex])

  const previewImages = (w.previewImages ?? []).slice(0, 4)
  const openHref = `${base}${String(w.url).replace(/^\/+/, '')}`

  return (
    <motion.div className="fixed inset-0 z-[75] flex items-center justify-center p-3 md:p-8" role="dialog" aria-modal="true" aria-label={`Preview week ${w.n}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-sumi/88 backdrop-blur-md" onClick={() => setIndex(null)} />
      <motion.div className="paper relative max-h-[88vh] w-full max-w-5xl overflow-y-auto p-5 md:p-10" initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0%)' }} exit={{ clipPath: 'inset(0 0 100% 0%)' }} transition={{ duration: 0.7, ease: 'easeInOut' }}>
        <div className="flex items-start justify-between gap-6 border-b border-sumi/15 pb-6">
          <div className="min-w-0">
            <Mono className="text-blood">FORGE — PRICE ProtoSem · Field Record</Mono>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-2">
              <h3 className="font-display text-5xl font-extrabold leading-none md:text-8xl">Week {pad(w.n)}</h3>
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-sumi/45">{w.date || 'DATE · UNPUBLISHED'}</span>
            </div>
            <p className="mt-3 max-w-3xl font-display text-xl italic text-sumi/70 md:text-2xl">{w.title}</p>
          </div>
          <button onClick={() => setIndex(null)} aria-label="Close preview" className="shrink-0 border border-sumi/20 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.2em] hover:border-blood">Close ✕</button>
        </div>

        <div className="mt-5 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            {previewImages.length ? (
              <div className="grid grid-cols-2 gap-2">
                {previewImages.map((src, i) => (
                  <div key={`${src}-${i}`} className={`overflow-hidden border border-sumi/10 bg-black/5 ${i === 0 ? 'col-span-2 aspect-[16/9]' : 'aspect-[4/3]'}`}>
                    <img src={resolvePublicAsset(src, base)} alt={`Week ${w.n} preview ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid min-h-[280px] place-items-center border border-sumi/10 bg-black/[0.03] px-6 text-center">
                <Mono className="text-sumi/45">NO VISUAL EVIDENCE PUBLISHED YET</Mono>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="grid grid-cols-2 border-y border-sumi/15">
              <div className="border-r border-sumi/15 py-4 pr-4">
                <Mono className="text-sumi/45">Status</Mono>
                <p className="mt-1 font-display text-xl capitalize">{w.status}</p>
              </div>
              <div className="py-4 pl-4">
                <Mono className="text-sumi/45">Images</Mono>
                <p className="mt-1 font-display text-xl">{w.imageCount}</p>
              </div>
            </div>

            <div className="mt-6">
              <Mono className="text-sumi/45">Published days</Mono>
              <div className="mt-3 flex flex-wrap gap-2">
                {w.days.length ? w.days.map((d) => (
                  <span key={`${d.name}-${d.date}`} className="border border-sumi/15 px-2 py-1 font-mono text-[10px] uppercase">
                    {d.name}{d.date ? ` · ${d.date}` : ''}
                  </span>
                )) : <span className="font-mono text-[10px] uppercase text-sumi/45">No entries yet</span>}
              </div>
            </div>

            {w.tags.length ? (
              <div className="mt-6">
                <Mono className="text-sumi/45">Tags</Mono>
                <div className="mt-3 flex flex-wrap gap-2">
                  {w.tags.map((tag) => <span key={tag} className="border border-sumi/15 px-2 py-1 font-mono text-[10px] uppercase">{tag}</span>)}
                </div>
              </div>
            ) : null}

            <div className="mt-auto pt-8">
              <p className="text-sm leading-relaxed text-sumi/60">
                The preview is intentionally limited to metadata and visual evidence. The complete field record opens as its own page.
              </p>
              <a href={openHref} className="mt-4 inline-flex w-full items-center justify-between border border-sumi bg-sumi px-4 py-4 text-washi transition-colors hover:bg-blood hover:border-blood">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em]">Open full field record</span>
                <span aria-hidden>↗</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-sumi/15 pt-5">
          <button disabled={index === 0} onClick={() => go(-1)} className="disabled:opacity-25">
            <Mono>← Week {pad(archiveWeeks[Math.max(0, index - 1)]?.n ?? w.n)}</Mono>
          </button>
          <Mono className="text-sumi/35">← → · Esc</Mono>
          <button disabled={index === archiveWeeks.length - 1} onClick={() => go(1)} className="disabled:opacity-25">
            <Mono>Week {pad(archiveWeeks[Math.min(archiveWeeks.length - 1, index + 1)]?.n ?? w.n)} →</Mono>
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
