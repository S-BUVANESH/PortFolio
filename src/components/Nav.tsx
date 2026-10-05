import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useScroll } from 'motion/react'
import { contact } from '../content'
import { Mono, cut } from './kit'

export const chapters: [string, string, string][] = [
  ['top', '0', 'Home'],
  ['origin', 'I', 'About'],
  ['forge', 'II', 'Experience/ProtoSem'],
  ['trials', 'III', 'Projects'],
  ['waystones', 'IV', 'Weekly Logs'],
  ['armory', 'V', 'Skills'],
  ['seals', 'VI', 'Certifications'],
  ['summit', 'VII', 'Contact'],
]

export default function Nav({ live }: { live: boolean }) {
  const [active, setActive] = useState('top')
  const [open, setOpen] = useState(false)
  const { scrollYProgress } = useScroll()

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-40% 0px -55% 0px' })
    chapters.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])

  return (
    <>
      <motion.header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-5 md:px-10" initial={{ opacity: 0, y: -20 }} animate={live ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1.2, delay: 0.6 }}>
        <a href="#top" className="whitespace-nowrap font-display text-lg font-extrabold tracking-[-0.01em]">BUVANESH S<span className="text-blood">.</span></a>
        <div className="flex items-center gap-2">
          <a href="#summit" className="hidden px-3 py-2 text-washi/80 transition-colors hover:text-washi sm:block"><Mono>Contact</Mono></a>
          <a href={contact.cv} target="_blank" rel="noreferrer" className="border border-washi/25 px-4 py-2 transition-colors hover:border-blood hover:bg-blood"><Mono>CV ↓</Mono></a>
          <button onClick={() => setOpen(true)} aria-label="Chapters" className="flex h-9 items-center gap-2 px-3 lg:hidden"><span className="block h-px w-6 bg-washi shadow-[0_5px_0_var(--color-washi)]" /></button>
        </div>
      </motion.header>

      {/* chapter rail */}
      <motion.nav aria-label="Chapters" className="fixed left-6 top-1/2 z-50 hidden -translate-y-1/2 lg:block xl:left-10" initial={{ opacity: 0, x: -20 }} animate={live ? { opacity: 1, x: 0 } : {}} transition={{ duration: 1.2, delay: 0.9 }}>
        <div className="absolute bottom-0 left-[11px] top-0 w-px bg-washi/10">
          <motion.div className="w-px origin-top bg-blood" style={{ scaleY: scrollYProgress, height: '100%' }} />
        </div>
        <ul className="relative space-y-4">
          {chapters.map(([id, n, label]) => {
            const on = active === id
            return (
              <li key={id}>
                <a href={`#${id}`} className="group flex items-center gap-4">
                  <span className={`grid h-6 w-6 place-items-center rounded-full border font-display text-[10px] transition-all duration-500 ${on ? 'border-blood bg-blood text-washi' : 'border-washi/20 bg-sumi text-mist group-hover:border-washi/60'}`}>{n}</span>
                  <span className={`font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-500 ${on ? 'translate-x-0 text-washi opacity-100' : '-translate-x-2 text-mist opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`}>{label}</span>
                </a>
              </li>
            )
          })}
        </ul>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div className="paper fixed inset-0 z-[70] flex flex-col p-6" initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ clipPath: 'inset(100% 0 0% 0)' }} transition={{ duration: 0.8, ease: cut }}>
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-extrabold">BUVANESH S<span className="text-blood">.</span></span>
              <button onClick={() => setOpen(false)} className="px-2 py-1"><Mono>Close</Mono></button>
            </div>
            <ul className="mt-auto">
              {chapters.map(([id, n, label], i) => (
                <motion.li key={id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
                  <a href={`#${id}`} onClick={() => setOpen(false)} className="flex items-baseline gap-4 border-t border-sumi/15 py-3">
                    <span className="w-8 font-display text-sm text-blood">{n}</span>
                    <span className="font-display text-3xl font-semibold">{label}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
