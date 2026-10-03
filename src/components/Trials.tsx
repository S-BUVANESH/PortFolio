import { useRef, useState, type ReactElement } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react'
import { Head, Mono, draw } from './kit'
import { projects, contact, type Project } from '../content'

const BEATS = ['Problem', 'Idea', 'System', 'Technology', 'Purpose'] as const

/* ——— visual metaphors: each system drawn as a living diagram that evolves with the beat ——— */

function Leaf({ b, c }: { b: number; c: string }) {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" fill="none" strokeLinecap="round">
      <motion.path d="M200 360 C 80 300, 60 140, 200 40 C 340 140, 320 300, 200 360 Z" stroke="#ece4d3" strokeOpacity=".5" strokeWidth="1.5" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 2, ease: draw }} />
      <path d="M200 360 V60" stroke="#ece4d3" strokeOpacity=".35" />
      {[100, 150, 200, 250, 300].map((y, i) => <path key={y} d={`M200 ${y} Q ${i % 2 ? 260 : 140} ${y - 30} ${i % 2 ? 290 : 110} ${y - 50}`} stroke="#ece4d3" strokeOpacity=".22" />)}
      {[100, 150, 200, 250, 300].map((y, i) => <path key={'r' + y} d={`M200 ${y} Q ${i % 2 ? 140 : 260} ${y - 30} ${i % 2 ? 110 : 290} ${y - 50}`} stroke="#ece4d3" strokeOpacity=".22" />)}
      {/* disease spots */}
      <motion.g animate={{ opacity: b === 0 ? 1 : 0.5 }}>
        {[[160, 180, 10], [240, 230, 14], [180, 270, 8], [235, 150, 6]].map(([x, y, r]) => <circle key={x} cx={x} cy={y} r={r} fill="#8b5a2b" fillOpacity=".7" />)}
      </motion.g>
      {/* camera scan */}
      <motion.rect x="60" width="280" height="2" fill={c} animate={b >= 1 ? { y: [40, 360, 40], opacity: 1 } : { opacity: 0 }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
      {/* conv grid */}
      <motion.g animate={{ opacity: b >= 2 ? 1 : 0 }} stroke={c} strokeOpacity=".7">
        {[0, 1, 2].map((k) => <rect key={k} x={290 + k * 18} y={60 + k * 18} width={80 - k * 24} height={80 - k * 24} />)}
        <path d="M250 180 L290 120" strokeDasharray="3 4" />
      </motion.g>
      {/* diagnosis + switch */}
      <motion.g animate={{ opacity: b >= 4 ? 1 : 0 }}>
        {[[160, 180, 10], [240, 230, 14]].map(([x, y, r]) => <circle key={x} cx={x} cy={y} r={r + 8} stroke={c} />)}
        <path d="M40 360 q 20 -40 40 -60 M80 300 q -20 0 -30 -20 M80 300 q 20 -5 30 -25" stroke={c} strokeWidth="2" />
      </motion.g>
    </svg>
  )
}

function City({ b, c }: { b: number; c: string }) {
  const bins = [[80, 80], [300, 70], [200, 200], [90, 300], [320, 300], [210, 330]]
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" fill="none">
      {[60, 140, 220, 300].map((v) => <g key={v} stroke="#ece4d3" strokeOpacity=".14"><path d={`M${v} 20 V380`} /><path d={`M20 ${v} H380`} /></g>)}
      <path id="route" d="M60 60 H300 V220 H140 V300 H340" stroke="#ece4d3" strokeOpacity={b >= 2 ? 0.5 : 0.12} strokeDasharray="4 6" />
      {bins.map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 8} y={y - 8} width="16" height="16" stroke="#ece4d3" strokeOpacity=".5" />
          <motion.rect x={x - 6} width="12" fill={i % 3 === 0 ? '#c3301b' : c} animate={{ y: y + 6 - (b >= 1 ? (i % 3 === 0 ? 12 : 5) : 0), height: b >= 1 ? (i % 3 === 0 ? 12 : 5) : 0 }} />
          {b >= 1 && <motion.circle cx={x} cy={y} r="8" stroke={c} initial={{ r: 8, opacity: 0.8 }} animate={{ r: 26, opacity: 0 }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />}
        </g>
      ))}
      {b >= 2 && (
        <circle r="6" fill="#ece4d3">
          <animateMotion dur="7s" repeatCount="indefinite"><mpath href="#route" /></animateMotion>
        </circle>
      )}
      <motion.g animate={{ opacity: b >= 3 ? 1 : 0 }}>
        <rect x="250" y="120" width="120" height="70" fill="#0b0a09" stroke={c} />
        {[0, 1, 2].map((k) => <rect key={k} x={262} y={134 + k * 16} width={[70, 40, 90][k]} height="5" fill={c} fillOpacity={0.5 + k * 0.15} />)}
      </motion.g>
    </svg>
  )
}

function Lifecycle({ b, c }: { b: number; c: string }) {
  const nodes = ['Menu', 'Order', 'Kitchen', 'Ready', 'Served']
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" fill="none">
      <circle id="ring" cx="200" cy="200" r="140" stroke="#ece4d3" strokeOpacity=".15" />
      <motion.circle cx="200" cy="200" r="140" stroke={c} strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: b >= 2 ? 1 : b >= 1 ? 0.4 : 0 }} transition={{ duration: 1.2, ease: draw }} style={{ rotate: -90, transformOrigin: '200px 200px' }} />
      {nodes.map((n, i) => {
        const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2
        const x = 200 + Math.cos(a) * 140, y = 200 + Math.sin(a) * 140
        return (
          <g key={n}>
            <circle cx={x} cy={y} r="18" fill="#0b0a09" stroke={b >= 1 ? c : '#ece4d355'} />
            <text x={x} y={y + (y > 200 ? 38 : -28)} textAnchor="middle" fill="#c9bfac" fontSize="12" fontFamily="DM Mono">{n.toUpperCase()}</text>
          </g>
        )
      })}
      {b === 0 && <g stroke="#c3301b" strokeDasharray="3 5"><path d="M200 60 L310 230" /><path d="M90 230 L280 315" /></g>}
      {b >= 2 && (
        <circle r="5" fill="#ece4d3">
          <animateMotion dur="5s" repeatCount="indefinite" path="M200 60 A140 140 0 1 1 199.9 60" />
        </circle>
      )}
      <motion.g animate={{ opacity: b >= 3 ? 1 : 0.15 }} stroke={c}>
        <ellipse cx="200" cy="180" rx="44" ry="12" />
        <path d="M156 180 v44 c0 7 20 12 44 12 s44 -5 44 -12 v-44" />
        <path d="M156 202 c0 7 20 12 44 12 s44 -5 44 -12" />
      </motion.g>
    </svg>
  )
}

const VIS: Record<string, (p: { b: number; c: string }) => ReactElement> = { thunai: Leaf, 'kovai-surge': City, 'food-os': Lifecycle }
const TONE: Record<string, string> = { thunai: 'ink', 'kovai-surge': 'steel', 'food-os': 'ember' }

function Trial({ p, i }: { p: Project; i: number }) {
  const ref = useRef<HTMLElement>(null)
  const [b, setB] = useState(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => setB(Math.min(4, Math.floor(v * 5.2))))
  const text = [p.problem, p.idea, p.built, null, p.purpose][b]
  const Vis = VIS[p.id]

  const go = (k: number) => {
    const el = ref.current
    if (!el) return
    const top = el.offsetTop + ((el.offsetHeight - innerHeight) * (k + 0.4)) / 5.2
    scrollTo({ top, behavior: 'smooth' })
  }

  return (
    <article ref={ref} id={p.id} data-tone={TONE[p.id]} className="relative h-[360vh]">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden px-5 pb-8 pt-24 md:px-10 lg:pl-40">
        <div className="flex items-center justify-between">
          <Mono className="text-mist">Trial {['I', 'II', 'III'][i]} · {p.field}</Mono>
          <a href={contact.github} target="_blank" rel="noreferrer" className="text-bone transition-colors hover:text-blood"><Mono>GitHub ↗</Mono></a>
        </div>

        <motion.h3
          className="mt-4 whitespace-nowrap font-display text-[clamp(3rem,12vw,12rem)] font-extrabold leading-[0.85] tracking-[-0.035em]"
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.9, 0, 0.1, 1] }}
        >
          {p.name}
        </motion.h3>
        <p className="mt-2 font-display text-lg italic text-bone md:text-2xl">{p.what}</p>

        <div className="mt-auto grid items-end gap-6 lg:grid-cols-12">
          <div className="order-2 lg:order-1 lg:col-span-5">
            <div className="min-h-[170px] md:min-h-[200px]">
              <AnimatePresence mode="wait">
                <motion.div key={b} initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.6, ease: draw }}>
                  <Mono className="text-blood">{String(b + 1).padStart(2, '0')} — {BEATS[b]}</Mono>
                  {text ? (
                    <p className="mt-4 max-w-xl font-display text-[clamp(1.25rem,2.1vw,1.9rem)] leading-snug">{text}</p>
                  ) : (
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {p.tech.map((t) => <li key={t} className="border border-washi/25 px-4 py-2 font-display text-lg">{t}</li>)}
                    </ul>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            <ol className="mt-6 grid grid-cols-5 gap-1">
              {BEATS.map((k, j) => (
                <li key={k}>
                  <button onClick={() => go(j)} className="group w-full text-left" aria-current={b === j}>
                    <span className="relative block h-[2px] overflow-hidden bg-washi/15"><span className={`absolute inset-0 origin-left bg-blood transition-transform duration-700 ${j <= b ? 'scale-x-100' : 'scale-x-0'}`} /></span>
                    <span className={`mt-2 block font-mono text-[9px] uppercase tracking-[0.15em] md:text-[10px] ${j === b ? 'text-washi' : 'text-mist group-hover:text-bone'}`}>{k}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className="order-1 h-[34vh] lg:order-2 lg:col-span-6 lg:col-start-7 lg:h-[52vh]">
            <Vis b={b} c={p.hue} />
          </div>
        </div>
      </div>
    </article>
  )
}

export default function Trials() {
  return (
    <section id="trials" className="relative">
      <div data-tone="ink" className="mx-auto max-w-[1500px] px-5 pt-32 md:px-10 lg:pl-40">
        <Head n="III" label="Projects" aside="Three systems, built" />
        <p className="max-w-2xl font-display text-[clamp(1.6rem,3vw,2.6rem)] leading-tight">
          Three trials. Each began as a problem, and each was answered with a system. <span className="text-mist italic">Scroll through each one beat by beat.</span>
        </p>
        <nav className="mt-10 flex flex-wrap gap-3">
          {projects.map((p, i) => (
            <a key={p.id} href={`#${p.id}`} className="group flex items-center gap-3 border border-washi/15 px-4 py-2 transition-colors hover:border-blood">
              <span className="font-display text-sm text-blood">{['I', 'II', 'III'][i]}</span>
              <span className="font-display text-lg">{p.name}</span>
            </a>
          ))}
        </nav>
      </div>
      {projects.map((p, i) => <Trial key={p.id} p={p} i={i} />)}
    </section>
  )
}
