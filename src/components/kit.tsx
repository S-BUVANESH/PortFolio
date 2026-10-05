import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'

export const draw = [0.7, 0, 0.2, 1] as const
export const cut = [0.9, 0, 0.1, 1] as const

export function Mono({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`font-mono text-[11px] uppercase tracking-[0.22em] ${className}`}>{children}</span>
}

/** A line of type cut in by an invisible blade: masked rise with a slight shear. */
export function Cut({ children, className = '', delay = 0, as = 'div' }: { children: ReactNode; className?: string; delay?: number; as?: 'div' | 'h2' | 'h3' | 'p' }) {
  const M = motion[as]
  return (
    <span className="block overflow-hidden pb-[0.25em] -mb-[0.17em]">
      <M
        className={className}
        initial={{ y: '105%', skewY: 6 }}
        whileInView={{ y: '0%', skewY: 0 }}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 1.1, ease: draw, delay }}
      >
        {children}
      </M>
    </span>
  )
}

export function Fade({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true, margin: '0px 0px -10% 0px' }} transition={{ duration: 1.2, ease: draw, delay }}>
      {children}
    </motion.div>
  )
}

/** Hand-drawn brush stroke that writes itself in. */
export function Brush({ className = '', color = 'var(--color-blood)', delay = 0 }: { className?: string; color?: string; delay?: number }) {
  return (
    <svg viewBox="0 0 600 40" preserveAspectRatio="none" className={className} aria-hidden>
      <motion.path
        d="M4 26 C 90 10, 180 30, 290 18 S 480 8, 596 20"
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.3, ease: draw, delay }}
        style={{ filter: 'url(#rough)' }}
      />
    </svg>
  )
}

/**
 * Chapter title card — the "scene change". A sticky full-screen beat where the
 * chapter name surfaces out of the mist and is cut away as you pass.
 */
export function TitleCard({ n, title, line, tone = 'ink' }: { n: string; title: string; line: string; tone?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const o = useTransform(p, [0.2, 0.4, 0.62, 0.8], [0, 1, 1, 0])
  const s = useTransform(p, [0.2, 0.5, 0.8], [1.25, 1, 0.92])
  const b = useTransform(p, [0.2, 0.42, 0.62, 0.8], ['blur(18px)', 'blur(0px)', 'blur(0px)', 'blur(10px)'])
  const w = useTransform(p, [0.3, 0.55], ['0%', '100%'])
  const clip = useTransform(p, [0.62, 0.78], ['inset(0% 0% 0% 0%)', 'inset(0% 0% 0% 100%)'])
  return (
    <div ref={ref} data-tone={tone} className="relative h-[170vh]" aria-hidden>
      <div className="sticky top-0 grid h-screen place-items-center overflow-hidden px-6">
        <motion.div style={{ opacity: o, scale: s, filter: b }} className="text-center">
          <Mono className="text-mist">Chapter {n}</Mono>
          <motion.p style={{ clipPath: clip }} className="mt-5 pb-[0.25em] -mb-[0.25em] font-display text-[clamp(3rem,11vw,11rem)] font-extrabold leading-[0.9] tracking-[-0.03em] whitespace-nowrap">
            {title}
          </motion.p>
          <motion.div style={{ width: w }} className="mx-auto mt-6 h-px max-w-[min(70vw,640px)] bg-blood" />
          <p className="mt-6 font-display text-lg italic text-bone md:text-xl">{line}</p>
        </motion.div>
      </div>
    </div>
  )
}

/** Section head inside a chapter: numeral, label, and a hairline that unsheathes. */
export function Head({ n, label, aside }: { n: string; label: string; aside?: string }) {
  return (
    <div className="mb-14 flex items-center gap-5 md:mb-20">
      <span className="font-display text-2xl text-blood">{n}</span>
      <Mono className="text-bone">{label}</Mono>
      <motion.span className="hairline h-px flex-1 origin-left" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: draw }} />
      {aside && <Mono className="hidden text-mist md:inline">{aside}</Mono>}
    </div>
  )
}

/** Shared SVG filters: a rough paper edge used by brush strokes and seals. */
export function Filters() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <filter id="rough">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
        <feDisplacementMap in="SourceGraphic" scale="4" />
      </filter>
      <filter id="stamp">
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="8" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="3" result="d" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.6" result="m" />
        <feComposite in="d" in2="m" operator="in" />
      </filter>
    </svg>
  )
}
