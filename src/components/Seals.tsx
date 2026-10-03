import { motion } from 'motion/react'
import { Head, Cut, Mono, draw } from './kit'
import { education, infosys, hackerrank } from '../content'

/** A hanko — stamped into the paper with impact. */
function Seal({ title, issuer, href, i, big }: { title: string; issuer: string; href?: string; i: number; big?: boolean }) {
  const C = href ? motion.a : motion.div
  return (
    <C
      {...(href ? { href, target: '_blank', rel: 'noreferrer', 'data-cursor': 'PDF' } : {})}
      className={`group relative flex flex-col justify-between bg-washi/[0.03] p-4 ${big ? 'aspect-square md:p-6' : 'aspect-[4/5]'}`}
      initial={{ scale: 1.6, opacity: 0, rotate: -8 }}
      whileInView={{ scale: 1, opacity: 1, rotate: (i % 3) - 1 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ type: 'spring', stiffness: 500, damping: 22, delay: (i % 4) * 0.09 }}
      whileHover={{ rotate: 0, scale: 1.03 }}
    >
      <span className="absolute inset-0 border-2 border-blood" style={{ filter: 'url(#rough)' }} />
      <span className="absolute inset-[5px] border border-blood/50" />
      <span className="relative font-mono text-[9px] uppercase tracking-[0.2em] text-blood">{issuer}</span>
      <span className={`relative font-display font-semibold leading-tight text-washi ${big ? 'text-4xl md:text-6xl' : 'text-[15px]'}`}>{title}</span>
      {href && <span className="relative font-mono text-[9px] uppercase tracking-[0.2em] text-mist transition-colors group-hover:text-washi">Certificate ↗</span>}
    </C>
  )
}

export default function Seals() {
  return (
    <section id="seals" data-tone="blood" className="relative mx-auto max-w-[1500px] px-5 py-32 md:px-10 lg:pl-40">
      <Head n="VI" label="Education & credentials" aside="12 certifications" />
      <div className="grid gap-16 lg:grid-cols-12">
        {/* education — the scroll of record */}
        <div className="lg:col-span-5">
          <Cut as="h2" className="font-display text-[clamp(2.4rem,6vw,6rem)] font-extrabold leading-[0.92] tracking-[-0.03em]">Seals<span className="text-blood">.</span></Cut>
          <motion.div className="paper relative mt-10 p-7 md:p-9" initial={{ clipPath: 'inset(0 0 100% 0)' }} whileInView={{ clipPath: 'inset(0 0 0% 0)' }} viewport={{ once: true }} transition={{ duration: 1.3, ease: draw }}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-blood">Education</span>
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-sumi/70"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blood" />Currently enrolled</span>
            </div>
            <h3 className="mt-8 font-display text-3xl font-extrabold leading-tight md:text-4xl">{education.degree}</h3>
            <p className="mt-3 text-lg text-sumi/70">{education.school}<br />{education.city}</p>
            <div className="mt-10 grid grid-cols-2 border-t border-sumi/20">
              <div className="border-r border-sumi/20 py-4 pr-4"><span className="font-mono text-[10px] uppercase tracking-[0.2em] text-sumi/50">Years</span><p className="mt-1 font-display text-2xl font-semibold">{education.years}</p></div>
              <div className="py-4 pl-4"><span className="font-mono text-[10px] uppercase tracking-[0.2em] text-sumi/50">CGPA</span><p className="mt-1 font-display text-2xl font-semibold">{education.cgpa}<span className="text-base text-sumi/50"> / 10.00</span></p></div>
            </div>
            {/* the college seal */}
            <span className="absolute -bottom-6 -right-4 grid h-20 w-20 rotate-[-10deg] place-items-center border-2 border-blood font-display text-xs font-bold leading-tight text-blood" style={{ filter: 'url(#rough)' }}>KCT<br />2028</span>
          </motion.div>

          <div className="mt-16 grid grid-cols-2 gap-3">
            <Seal title="#1 Rank" issuer="HackerRank" i={0} big />
            <Seal title="5★ Gold" issuer="HackerRank badge" i={1} big />
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="flex items-baseline justify-between border-b border-washi/10 pb-3">
            <span className="font-display text-2xl">Infosys Springboard</span><Mono className="text-mist">08</Mono>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {infosys.map(([t, f], i) => <Seal key={f} title={t} issuer="Infosys" href={`./certs/${f}.pdf`} i={i} />)}
          </div>
          <div className="mt-14 flex items-baseline justify-between border-b border-washi/10 pb-3">
            <span className="font-display text-2xl">HackerRank</span><Mono className="text-mist">04</Mono>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {hackerrank.map(([t, f], i) => <Seal key={f} title={`${t} Certificate`} issuer="HackerRank" href={`./certs/${f}.pdf`} i={i} />)}
          </div>
        </div>
      </div>
    </section>
  )
}
