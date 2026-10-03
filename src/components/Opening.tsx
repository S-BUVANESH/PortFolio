import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { cut, draw, Mono } from './kit'

const KEY = 'bs-awake'

export function shouldOpen() {
  if (typeof window === 'undefined') return false
  try { if (sessionStorage.getItem(KEY)) return false } catch { /* storage blocked */ }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  const n = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }
  if (n.connection?.saveData || (n.deviceMemory && n.deviceMemory < 2)) return false
  return true
}

/**
 * Awakening — silence, a pulse, ink blooming into a mountain range,
 * a single brush stroke, then the name revealed by one clean cut.
 * Then the screen parts like sliding paper doors.
 */
export default function Opening({ onDone }: { onDone: () => void }) {
  const [beat, setBeat] = useState(0)

  useEffect(() => {
    const ts = [700, 1700, 2700, 4300].map((t, i) => setTimeout(() => setBeat(i + 1), t))
    const end = setTimeout(finish, 5300)
    const key = (e: KeyboardEvent) => (e.key === 'Escape' || e.key === 'Enter') && finish()
    addEventListener('keydown', key)
    return () => { ts.forEach(clearTimeout); clearTimeout(end); removeEventListener('keydown', key) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function finish() {
    try { sessionStorage.setItem(KEY, '1') } catch { /* ignore */ }
    onDone()
  }

  return (
    <motion.div className="fixed inset-0 z-[80] overflow-hidden" exit={{ pointerEvents: 'none' }} role="dialog" aria-label="Opening sequence">
      {/* paper doors — the exit */}
      {[0, 1].map((i) => (
        <motion.div key={i} className={`absolute inset-y-0 w-1/2 bg-sumi ${i ? 'right-0' : 'left-0'}`} exit={{ x: i ? '100%' : '-100%' }} transition={{ duration: 1.2, ease: cut }} />
      ))}

      <motion.div className="absolute inset-0" exit={{ opacity: 0, scale: 1.08 }} transition={{ duration: 0.9, ease: draw }}>
        {/* the pulse */}
        <motion.span
          className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blood"
          animate={beat < 1 ? { scale: [1, 1.8, 1], opacity: [0.4, 1, 0.4] } : { scale: 0, opacity: 0 }}
          transition={beat < 1 ? { duration: 1.1, repeat: Infinity } : { duration: 0.4 }}
        />

        {/* ink bloom */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-[160vmax] w-[160vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle, #2b1a14 0%, #160f0c 30%, transparent 62%)' }}
          initial={{ scale: 0, opacity: 0 }}
          animate={beat >= 1 ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 2.4, ease: draw }}
        />

        {/* moon */}
        <motion.div
          className="absolute left-[62%] top-[22%] h-[22vmin] w-[22vmin] rounded-full bg-bone"
          style={{ boxShadow: '0 0 120px 40px #c9bfac22' }}
          initial={{ opacity: 0, y: 40 }}
          animate={beat >= 1 ? { opacity: 0.85, y: 0 } : {}}
          transition={{ duration: 2.4, ease: draw }}
        />

        {/* ranges rising */}
        <svg viewBox="0 0 1600 600" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[62vh] w-full">
          {[
            ['M0 420 L180 300 L300 360 L470 220 L640 330 L820 250 L980 340 L1160 230 L1340 320 L1600 260 L1600 600 L0 600Z', '#1d1714', 0],
            ['M0 470 L140 400 L320 450 L520 340 L700 430 L900 360 L1080 440 L1280 370 L1460 430 L1600 390 L1600 600 L0 600Z', '#120e0c', 0.2],
            ['M0 540 L220 480 L420 530 L640 470 L860 525 L1080 480 L1300 530 L1600 490 L1600 600 L0 600Z', '#0b0a09', 0.4],
          ].map(([d, f, dl]) => (
            <motion.path key={dl as number} d={d as string} fill={f as string} initial={{ y: 260 }} animate={beat >= 1 ? { y: 0 } : {}} transition={{ duration: 2.2, ease: draw, delay: dl as number }} />
          ))}
        </svg>

        {/* mist */}
        <div className="absolute inset-x-0 bottom-[18vh] h-40 opacity-50 [animation:drift_9s_ease-in-out_infinite_alternate]" style={{ background: 'radial-gradient(50% 50% at 50% 50%, #c9bfac22, transparent 70%)' }} />

        {/* stroke + whisper */}
        <div className="absolute left-1/2 top-1/2 w-[min(86vw,1100px)] -translate-x-1/2 -translate-y-1/2 text-center">
          <motion.p className="font-display text-lg italic text-bone md:text-2xl" initial={{ opacity: 0, letterSpacing: '0.4em' }} animate={beat >= 2 ? { opacity: beat >= 3 ? 0 : 1, letterSpacing: '0.04em' } : {}} transition={{ duration: 1.4, ease: draw }}>
            A path through code, intelligence and craft.
          </motion.p>

          {/* the name, split by a cut */}
          <div className="relative mt-[-1.2em]">
            {[0, 1].map((half) => (
              <motion.p
                key={half}
                aria-hidden={half === 1}
                className="absolute inset-x-0 whitespace-nowrap font-display text-[clamp(2.6rem,10vw,9rem)] font-extrabold leading-none tracking-[-0.02em] text-washi"
                style={{ clipPath: half ? 'polygon(0 58%, 100% 38%, 100% 100%, 0 100%)' : 'polygon(0 0, 100% 0, 100% 38%, 0 58%)' }}
                initial={{ opacity: 0, x: half ? 60 : -60 }}
                animate={beat >= 3 ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.9, ease: cut, delay: 0.25 }}
              >
                BUVANESH S<span className="text-blood">.</span>
              </motion.p>
            ))}
            <p className="invisible whitespace-nowrap font-display text-[clamp(2.6rem,10vw,9rem)] font-extrabold leading-none">BUVANESH S.</p>
            {/* the blade */}
            <motion.span
              className="absolute left-[-10%] top-1/2 h-[2px] w-[120%] origin-left bg-washi"
              style={{ rotate: '-4deg', boxShadow: '0 0 24px 4px #ece4d3aa' }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={beat >= 3 ? { scaleX: [0, 1, 1], opacity: [1, 1, 0] } : {}}
              transition={{ duration: 0.7, ease: cut, times: [0, 0.4, 1] }}
            />
          </div>
          <motion.div initial={{ opacity: 0 }} animate={beat >= 3 ? { opacity: 1 } : {}} transition={{ delay: 1, duration: 1 }} className="mt-6">
            <Mono className="text-mist">Computer Science · Artificial Intelligence · Design</Mono>
          </motion.div>
        </div>
      </motion.div>

      <button onClick={finish} className="absolute bottom-6 right-6 z-10 flex items-center gap-3 border border-washi/20 px-4 py-2 text-washi/70 transition-colors hover:border-blood hover:text-washi md:bottom-10 md:right-10">
        <Mono>Skip</Mono><span className="font-mono text-[10px] text-mist">Esc</span>
      </button>
    </motion.div>
  )
}
