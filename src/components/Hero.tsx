import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { Mono, draw, cut } from './kit'

export default function Hero({ live }: { live: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const portraitY = useTransform(p, [0, 1], ['0%', '18%'])
  const portraitS = useTransform(p, [0, 1], [1, 1.12])
  const nameY = useTransform(p, [0, 1], ['0%', '-60%'])
  const fade = useTransform(p, [0, 0.7], [1, 0])

  return (
    <section ref={ref} id="top" data-tone="ink" className="relative h-[100svh] min-h-[640px] overflow-hidden">
      <h1 className="sr-only">Buvanesh S. — Computer Science & Engineering student, AI and creative technology</h1>

      {/* the subject — standing in the scene, lit, present */}
      <motion.div style={{ y: portraitY, scale: portraitS }} className="absolute right-[6%] top-[13svh] w-[min(52%,30svh)] sm:right-[8%] sm:w-[min(34%,36svh)] lg:right-[11%] lg:w-[min(23vw,39svh)]">
        {/* warm key light behind the figure — separates the subject from the dark */}
        <motion.div
          aria-hidden
          className="absolute -inset-[18%] -z-10 rounded-full"
          style={{ background: 'radial-gradient(50% 45% at 55% 38%, #e8743a40 0%, #d8b46a1f 35%, transparent 70%)' }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={live ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.6, ease: draw, delay: 0.3 }}
        />
        <motion.span className="absolute -left-5 top-[8%] -z-10 h-[70%] w-[3px] origin-top bg-blood" initial={{ scaleY: 0 }} animate={live ? { scaleY: 1 } : {}} transition={{ duration: 1.2, ease: draw, delay: 0.9 }} />

        <motion.div
          className="relative aspect-[3/4] w-full overflow-hidden"
          initial={{ opacity: 0, y: 40, scale: 1.04, filter: 'blur(12px) saturate(0.4)' }}
          animate={live ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px) saturate(1)' } : {}}
          transition={{ duration: 1.2, ease: draw, delay: 0.35 }}
        >
          <img
            src="/assets/me.jpeg"
            alt="Portrait of Buvanesh S."
            className="h-full w-full object-cover object-[50%_22%] brightness-[1.04] contrast-[1.06] saturate-[0.95]"
            style={{ maskImage: 'linear-gradient(180deg, #000 72%, transparent 100%)', WebkitMaskImage: 'linear-gradient(180deg, #000 72%, transparent 100%)' }}
          />
          {/* a gentle cinematic grade — warm highlights, nothing heavy */}
          <div className="absolute inset-0 mix-blend-soft-light" style={{ background: 'linear-gradient(160deg, #f6d29a40 0%, transparent 45%, #0b0a0930 100%)' }} />
        </motion.div>

      </motion.div>

      <motion.div style={{ opacity: fade }} className="relative z-10 flex h-full flex-col px-5 pb-6 pt-24 md:px-10 lg:pl-40">
        <motion.div initial={{ opacity: 0 }} animate={live ? { opacity: 1 } : {}} transition={{ delay: 0.8, duration: 1.2 }} className="flex items-center gap-4">
          <span className="h-px w-10 bg-blood" />
          <Mono className="text-bone">11.0168° N · 76.9558° E — Coimbatore</Mono>
        </motion.div>

        <div className="flex min-h-0 flex-1 items-center py-[4svh]">
        <div className="max-w-[46rem]">
          <div>
            {['Where gaming instincts', 'meet AI, code', '& design.'].map((l, i) => (
              <span key={l} className="block overflow-hidden">
                <motion.span
                  className={`block h-fit font-display text-[clamp(1.9rem,4.4vw,4.2rem)] leading-[1.04] tracking-[-0.02em] ${i === 1 ? 'italic text-washi' : 'text-bone'}`}
                  initial={{ y: '110%' }}
                  animate={live ? { y: '0%' } : {}}
                  transition={{ duration: 1.3, ease: draw, delay: 0.9 + i * 0.12 }}
                >
                  {i === 1 ? <>meet <span className="not-italic text-blood">AI</span>, code</> : l}
                </motion.span>
              </span>
            ))}
            <motion.p initial={{ opacity: 0 }} animate={live ? { opacity: 1 } : {}} transition={{ delay: 1.6, duration: 1 }} className="mt-6 max-w-md text-[15px] leading-relaxed text-mist">
              CSE student at Kumaraguru College of Technology. Innovation Engineer Trainee at FORGE.
            </motion.p>
          </div>

        </div>

        </div>

        {/* the name — one line, always */}
        <motion.div style={{ y: nameY }} className="relative mt-[3svh]">
          <motion.p
            aria-hidden
            className="h-fit whitespace-nowrap font-display text-[clamp(2.4rem,min(11.2vw,20svh),13rem)] font-extrabold leading-[0.82] tracking-[-0.035em]"
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={live ? { clipPath: 'inset(0 0% 0 0)' } : {}}
            transition={{ duration: 1.4, ease: cut, delay: 0.4 }}
          >
            BUVANESH S<span className="text-blood">.</span>
          </motion.p>
          <motion.span className="absolute -bottom-2 left-0 h-[2px] w-full origin-left bg-washi/80" style={{ boxShadow: '0 0 18px #ece4d388' }} initial={{ scaleX: 0, opacity: 1 }} animate={live ? { scaleX: [0, 1, 1], opacity: [1, 1, 0.12] } : {}} transition={{ duration: 1.6, ease: cut, delay: 0.3, times: [0, 0.6, 1] }} />
        </motion.div>

        <div className="mt-5 flex items-center justify-between">
          <Mono className="text-mist">B.E. CSE · 2024 — 2028</Mono>
          <a href="#origin" className="group flex items-center gap-3 text-bone">
            <Mono>Walk the path</Mono>
            <span className="relative block h-8 w-px overflow-hidden bg-washi/15"><span className="absolute inset-x-0 top-0 h-3 bg-blood [animation:fall_1.8s_ease-in-out_infinite]" /></span>
          </a>
        </div>
      </motion.div>
      <style>{'@keyframes fall{0%{transform:translateY(-100%)}100%{transform:translateY(300%)}}'}</style>
    </section>
  )
}
