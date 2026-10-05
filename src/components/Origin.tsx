import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Head, Cut, Fade, Mono, draw } from './kit'

const paths = [
  {
    k: 'Building',
    n: '一',
    line: 'I learn by building. Prototypes first, theory confirmed in the making.',
    traits: ['Prototyping', 'Systems', 'IoT', 'Automation'],
    mark: <path d="M10 70 L50 20 L90 70 Z M30 70 L50 45 L70 70" />,
  },
  {
    k: 'Intelligence',
    n: '二',
    line: 'Teaching machines to see and decide: ML, deep learning, computer vision.',
    traits: ['Machine Learning', 'Deep Learning', 'Computer Vision', 'Intelligent Systems'],
    mark: <><circle cx="50" cy="45" r="26" /><circle cx="50" cy="45" r="8" /><path d="M24 45 H8 M92 45 H76 M50 19 V5 M50 85 V71" /></>,
  },
  {
    k: 'Creativity',
    n: '三',
    line: 'Design and 3D as engineering tools. How it feels is part of how it works.',
    traits: ['Design', '3D', 'Interactive Technology', 'Exploration'],
    mark: <path d="M12 70 C 30 10, 70 10, 88 70 M28 70 C 40 36, 60 36, 72 70" />,
  },
]

export default function Origin() {
  const [open, setOpen] = useState(1)
  return (
    <section id="origin" data-tone="ink" className="relative mx-auto max-w-[1500px] px-5 py-32 md:px-10 lg:pl-40">
      <Head n="I" label="Origin" aside="Who walks this path" />
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Cut as="h2" className="font-display text-[clamp(2rem,4.6vw,4.6rem)] leading-[1.06] tracking-[-0.02em]">A builder and an explorer —</Cut>
          <Cut as="h2" delay={0.1} className="font-display text-[clamp(2rem,4.6vw,4.6rem)] italic leading-[1.06] tracking-[-0.02em] text-bone">who learns how systems think</Cut>
          <Cut as="h2" delay={0.2} className="font-display text-[clamp(2rem,4.6vw,4.6rem)] leading-[1.06] tracking-[-0.02em]">by making them<span className="text-blood">.</span></Cut>
        </div>
        <Fade delay={0.3} className="self-end lg:col-span-4">
          <p className="text-[15px] leading-relaxed text-mist">
            Computer Science & Engineering at Kumaraguru College of Technology, Coimbatore. Drawn to artificial intelligence, machine learning, computer vision, intelligent systems, automation, IoT, 3D and interactive technology.
          </p>
        </Fade>
      </div>

      {/* three paths, one figure — open one at a time */}
      <div className="mt-24 flex flex-col gap-px border-y border-washi/10 lg:h-[440px] lg:flex-row">
        {paths.map((p, i) => {
          const on = open === i
          return (
            <motion.button
              key={p.k}
              layout
              onMouseEnter={() => setOpen(i)}
              onFocus={() => setOpen(i)}
              onClick={() => setOpen(i)}
              aria-expanded={on}
              data-cursor={on ? '' : 'Open'}
              className={`relative overflow-hidden text-left transition-colors duration-700 lg:h-full ${on ? 'bg-washi/[0.04] lg:flex-[2.6]' : 'lg:flex-1'} border-washi/10 px-6 py-8 md:px-8 lg:border-r lg:last:border-r-0`}
              transition={{ duration: 0.8, ease: draw }}
            >
              <span className="absolute right-4 top-2 font-display text-[9rem] leading-none text-washi/[0.04]">{p.n}</span>
              <div className="flex items-center gap-4">
                <Mono className={on ? 'text-blood' : 'text-mist'}>0{i + 1}</Mono>
                <span className="font-display text-3xl font-semibold md:text-4xl">{p.k}</span>
              </div>
              <AnimatePresence mode="wait">
                {on && (
                  <motion.div key="b" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: draw, delay: 0.2 }} className="mt-8 grid gap-8 md:grid-cols-[120px_1fr] lg:absolute lg:inset-x-8 lg:bottom-8">
                    <svg viewBox="0 0 100 90" className="h-24 w-28 text-blood" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <motion.g initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}>{p.mark}</motion.g>
                    </svg>
                    <div>
                      <p className="max-w-md font-display text-xl leading-snug md:text-2xl">{p.line}</p>
                      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                        {p.traits.map((t) => <Mono key={t} className="text-bone">{t}</Mono>)}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}
