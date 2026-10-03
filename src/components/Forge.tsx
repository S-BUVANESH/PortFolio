import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { Head, Cut, Fade, Mono, draw } from './kit'
import { forge } from '../content'

/**
 * The Forge — twenty weeks rendered as a blade being tempered.
 * Scroll draws heat along the steel; each fold is a week you can open.
 */
export default function Forge() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start 85%', 'end 40%'] })
  const heat = useTransform(p, [0, 1], ['0%', '100%'])
  const glow = useTransform(p, [0, 1], [0.2, 1])

  const open = (n: number) => {
    document.getElementById('waystones')?.scrollIntoView({ behavior: 'smooth' })
    setTimeout(() => dispatchEvent(new CustomEvent('archive:open', { detail: n })), 700)
  }

  return (
    <section id="forge" data-tone="ember" className="relative mx-auto max-w-[1500px] px-5 py-32 md:px-10 lg:pl-40">
      <Head n="II" label="Experience" aside="Industry-integrated programme" />

      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Mono className="text-ember">{forge.role}</Mono>
          <Cut as="h2" className="mt-5 whitespace-nowrap font-display text-[clamp(3rem,9vw,8.5rem)] font-extrabold leading-[0.88] tracking-[-0.03em]">FORGE</Cut>
          <Cut as="p" delay={0.1} className="font-display text-[clamp(1.5rem,3vw,2.6rem)] italic text-bone">PRICE ProtoSem</Cut>
        </div>
        <Fade delay={0.2} className="self-end lg:col-span-5">
          <p className="text-[17px] leading-relaxed text-bone">{forge.summary}</p>
          <dl className="mt-8 grid grid-cols-3 border-t border-washi/10">
            {[['Duration', '20 weeks'], ['Role', 'Trainee'], ['Track', 'Innovation']].map(([k, v]) => (
              <div key={k} className="border-r border-washi/10 py-4 pr-3 last:border-r-0 [&:not(:first-child)]:pl-4">
                <dt><Mono className="text-mist">{k}</Mono></dt>
                <dd className="mt-1 font-display text-lg">{v}</dd>
              </div>
            ))}
          </dl>
        </Fade>
      </div>

      {/* the blade */}
      <div ref={ref} className="relative mt-24">
        <div className="mb-4 flex items-end justify-between">
          <Mono className="text-mist">Twenty folds · select a week</Mono>
          <Mono className="text-ember">Week 01 → 20</Mono>
        </div>
        <div className="relative h-28 md:h-36">
          <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            <defs>
              <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#d6dbe0" />
                <stop offset="0.5" stopColor="#7d858e" />
                <stop offset="1" stopColor="#2d3237" />
              </linearGradient>
                          </defs>
            <path d="M0 52 L940 40 Q990 44 1000 62 Q960 74 940 76 L0 70 Z" fill="url(#steel)" />
            {/* hamon — temper line */}
            <path d="M0 63 Q25 58 50 63 T100 63 T150 63 T200 63 T250 63 T300 63 T350 63 T400 63 T450 63 T500 62 T550 62 T600 62 T650 62 T700 61 T750 61 T800 61 T850 60 T900 60 T950 60" fill="none" stroke="#f1ede4" strokeOpacity=".55" strokeWidth="1" />
          </svg>
          {/* heat travels down the steel */}
          <div className="absolute inset-0 mix-blend-screen" style={{ clipPath: 'polygon(0 43%, 94% 33%, 99% 40%, 100% 52%, 96% 61%, 94% 63%, 0 58%)' }} aria-hidden>
            <motion.div className="h-full bg-gradient-to-r from-ember/30 to-[#ffb36a]" style={{ width: heat, opacity: glow }} />
          </div>
          <motion.div className="pointer-events-none absolute top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: heat, background: 'radial-gradient(circle, #ffb36acc, #e8743a44 40%, transparent 70%)', filter: 'blur(6px)' }} aria-hidden />
          {/* twenty folds */}
          <ol className="absolute inset-0 grid grid-cols-20">
            {Array.from({ length: 20 }, (_, i) => (
              <li key={i} className="relative">
                <button onClick={() => open(i + 1)} data-cursor={`Wk ${i + 1}`} aria-label={`Open week ${i + 1} record`} className="group absolute inset-0 flex flex-col items-center justify-between">
                  <span className="font-mono text-[9px] text-mist transition-colors group-hover:text-washi md:text-[10px]">{String(i + 1).padStart(2, '0')}</span>
                  <span className="h-10 w-px bg-sumi/70 transition-all duration-300 group-hover:h-16 group-hover:w-[2px] group-hover:bg-blood md:h-12" />
                  <span className="h-1.5 w-1.5 scale-0 rounded-full bg-blood transition-transform duration-300 group-hover:scale-100" />
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* eight disciplines of the programme */}
      <div className="mt-24 grid grid-cols-2 gap-px bg-washi/10 md:grid-cols-4">
        {forge.areas.map((a, i) => (
          <motion.div key={a} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: draw, delay: (i % 4) * 0.08 }} className="group relative overflow-hidden bg-sumi/80 p-6 backdrop-blur-sm md:p-8">
            <span className="absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-ember/25 to-transparent transition-all duration-700 group-hover:h-full" />
            <Mono className="relative text-mist">{String(i + 1).padStart(2, '0')}</Mono>
            <p className="relative mt-10 font-display text-xl font-semibold md:text-2xl">{a}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
