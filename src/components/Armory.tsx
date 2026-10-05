import { useRef, type ReactElement } from 'react'
import { motion, useSpring } from 'motion/react'
import { Head, Cut, Mono } from './kit'
import { skills, type Skill } from '../content'

/** Brush-drawn symbols for the skills that have no official mark. */
function Glyph({ g }: { g: string }) {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const m: Record<string, ReactElement> = {
    sql: <><ellipse cx="24" cy="11" rx="14" ry="5" /><path d="M10 11v26c0 2.8 6.3 5 14 5s14-2.2 14-5V11M10 24c0 2.8 6.3 5 14 5s14-2.2 14-5" /></>,
    ml: <><path d="M6 41h36M6 41V7" strokeOpacity=".4" /><path d="M8 36C18 33 22 14 40 9" /></>,
    ai: <><circle cx="24" cy="24" r="6" /><path d="M24 4v8M24 36v8M4 24h8M36 24h8M10 10l6 6M32 32l6 6M38 10l-6 6M16 32l-6 6" /></>,
    prompt: <><rect x="5" y="9" width="38" height="30" rx="2" /><path d="M13 20l6 4-6 4M23 29h11" /></>,
    dsa: <><circle cx="24" cy="9" r="4" /><circle cx="13" cy="25" r="4" /><circle cx="35" cy="25" r="4" /><circle cx="7" cy="40" r="3" /><circle cx="19" cy="40" r="3" /><path d="M21.5 12.5l-6 9M26.5 12.5l6 9M11 28.5l-2.5 8M15 28.5l2.5 8" /></>,
    '3d': <><path d="M24 5l16 9v20l-16 9-16-9V14z" /><path d="M8 14l16 9 16-9M24 23v20" /></>,
  }
  return <svg viewBox="0 0 48 48" {...s}>{m[g]}</svg>
}

/** A wooden plaque hung on a cord. Brush past it and it swings, with weight. */
function Plaque({ s, i }: { s: Skill; i: number }) {
  const r = useSpring(0, { stiffness: 70, damping: 4, mass: 1.4 })
  const last = useRef(0)
  const push = (e: React.PointerEvent) => {
    const now = performance.now()
    if (now - last.current < 60) return
    last.current = now
    r.set(Math.max(-22, Math.min(22, e.movementX * 1.6)))
    setTimeout(() => r.set(0), 90)
  }
  return (
    <motion.li
      className="relative flex flex-col items-center"
      initial={{ y: -60, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 120, damping: 9, delay: (i % 6) * 0.07 }}
    >
      <motion.div style={{ rotate: r, transformOrigin: '50% 0%' }} onPointerMove={push} onClick={() => { r.set(18); setTimeout(() => r.set(0), 120) }} className="flex flex-col items-center" data-cursor="">
        <span className="h-10 w-px bg-bone/40" />
        <span className="-mt-1 h-2 w-2 rounded-full border border-bone/60" />
        <div className="paper relative mt-1 flex h-44 w-[min(40vw,150px)] flex-col items-center justify-between px-3 py-5 shadow-[0_24px_40px_-18px_#000] md:h-52">
          <span className="absolute left-2 top-2 font-mono text-[9px] text-sumi/40">{String(i + 1).padStart(2, '0')}</span>
          <div className="h-12 w-12 text-sumi md:h-14 md:w-14">
            {s.logo ? <img src={s.logo} alt="" className="h-full w-full object-contain" loading="lazy" /> : <Glyph g={s.glyph!} />}
          </div>
          <p className="text-center font-display text-[15px] font-semibold leading-tight text-sumi md:text-base">{s.name}</p>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-blood">{s.kind}</span>
        </div>
      </motion.div>
    </motion.li>
  )
}

export default function Armory() {
  return (
    <section id="armory" data-tone="ink" className="relative mx-auto max-w-[1500px] px-5 py-32 md:px-10 lg:pl-40">
      <Head n="V" label="Skills" aside="Twelve, and only twelve" />
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Cut as="h2" className="font-display text-[clamp(2.4rem,6vw,6rem)] font-extrabold leading-[0.92] tracking-[-0.03em]">Skills<span className="text-blood">.</span></Cut>
        </div>
        <p className="self-end text-[15px] leading-relaxed text-mist lg:col-span-5">Languages, foundations and AI practice, hung on the rack and ready to use. Brush past one and it swings.</p>
      </div>

      <div className="relative mt-20">
        {/* the beam */}
        <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-[#4a3020] to-[#1c120b] shadow-[0_8px_20px_#0008]" />
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 pt-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {skills.map((s, i) => <Plaque key={s.name} s={s} i={i} />)}
        </ul>
      </div>
      <div className="mt-10 flex justify-end"><Mono className="text-mist">Official marks shown where they exist · symbols for concepts</Mono></div>
    </section>
  )
}
