import { useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react'
import { Mono, draw, cut } from './kit'
import { contact } from '../content'

/** The ending — dawn breaks over the summit, and the path arrives at a person. */
export default function Summit() {
  const ref = useRef<HTMLElement>(null)
  const [copied, setCopied] = useState(false)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const sun = useTransform(p, [0, 1], ['60%', '0%'])
  const glow = useTransform(p, [0.2, 1], [0, 1])

  const copy = async () => {
    try { await navigator.clipboard.writeText(contact.email); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { location.href = `mailto:${contact.email}` }
  }

  const rows: [string, string, string][] = [
    ['Call', contact.phone, contact.phoneHref],
    ['LinkedIn', 'in/buvanesh-s', contact.linkedin],
    ['GitHub', 'S-BUVANESH', contact.github],
    ['Résumé', 'Download CV (PDF)', contact.cv],
  ]

  return (
    <section ref={ref} id="summit" data-tone="dawn" className="relative min-h-screen overflow-hidden px-5 pb-8 pt-40 md:px-10 lg:pl-40">
      {/* rising sun */}
      <motion.div style={{ y: sun, opacity: glow }} className="pointer-events-none absolute left-1/2 top-[18%] h-[60vmin] w-[60vmin] -translate-x-1/2 rounded-full" aria-hidden>
        <div className="h-full w-full rounded-full" style={{ background: 'radial-gradient(circle, #f6d29a 0%, #e8743a88 35%, transparent 70%)', filter: 'blur(2px)' }} />
      </motion.div>

      <div className="relative mx-auto max-w-[1500px]">
        <motion.p initial={{ opacity: 0, letterSpacing: '0.5em' }} whileInView={{ opacity: 1, letterSpacing: '0.22em' }} viewport={{ once: true }} transition={{ duration: 1.6, ease: draw }} className="text-center font-mono text-[11px] uppercase text-bone">
          Chapter VII · Contact
        </motion.p>
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.3 }} className="mt-6 text-center font-display text-2xl italic text-washi/90 md:text-4xl">
          The path doesn't end here. It leads to a conversation.
        </motion.p>

        <motion.h2
          initial={{ clipPath: 'inset(0 50% 0 50%)' }}
          whileInView={{ clipPath: 'inset(0 0% 0 0%)' }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: cut, delay: 0.5 }}
          className="mt-12 whitespace-nowrap text-center font-display text-[clamp(2.4rem,11vw,12rem)] font-extrabold leading-[0.85] tracking-[-0.035em]"
        >
          BUVANESH S<span className="text-blood">.</span>
        </motion.h2>

        <div className="mt-14 flex flex-col items-center gap-4">
          <a href={`mailto:${contact.email}`} data-cursor="Write" className="group relative font-display text-[clamp(1.2rem,3.4vw,2.8rem)] text-washi">
            {contact.email}
            <span className="absolute -bottom-1 left-0 h-[2px] w-full origin-left scale-x-0 bg-blood transition-transform duration-500 group-hover:scale-x-100" />
          </a>
          <div className="flex gap-2">
            <a href={`mailto:${contact.email}`} className="bg-blood px-5 py-3 transition-colors hover:bg-washi hover:text-sumi"><Mono>Write to me</Mono></a>
            <button onClick={copy} className="relative min-w-[130px] border border-washi/30 px-5 py-3 transition-colors hover:border-washi">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={String(copied)} className="block" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }}><Mono>{copied ? 'Copied ✓' : 'Copy email'}</Mono></motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* end credits */}
        <ul className="mx-auto mt-24 max-w-3xl">
          {rows.map(([k, v, h], i) => (
            <motion.li key={k} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: draw, delay: i * 0.08 }}>
              <a href={h} target={h.startsWith('http') || h.endsWith('.pdf') ? '_blank' : undefined} rel="noreferrer" className="group grid grid-cols-[1fr_auto_1fr] items-baseline gap-6 border-t border-washi/15 py-5">
                <span className="text-right font-mono text-[11px] uppercase tracking-[0.22em] text-bone">{k}</span>
                <span className="h-px w-8 self-center bg-washi/30 transition-all duration-500 group-hover:w-16 group-hover:bg-blood" />
                <span className="font-display text-xl transition-transform duration-500 group-hover:translate-x-2 md:text-2xl">{v}</span>
              </a>
            </motion.li>
          ))}
        </ul>

        <footer className="mt-32 flex flex-col items-center gap-3 text-center">
          <span className="font-display text-3xl italic text-bone">fin.</span>
          <Mono className="text-washi/50">Built with React, Three.js & Motion · Set in Shippori Mincho & Zen Kaku Gothic</Mono>
          <a href="#top" className="mt-4 text-bone hover:text-blood"><Mono>Return to the beginning ↑</Mono></a>
        </footer>
      </div>
    </section>
  )
}
