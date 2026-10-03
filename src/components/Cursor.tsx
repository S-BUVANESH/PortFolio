import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

/** A drop of ink and a trailing ring that tightens over anything you can act on. */
export default function Cursor() {
  const [on, setOn] = useState(false)
  const [label, setLabel] = useState('')
  const [hot, setHot] = useState(false)
  const [down, setDown] = useState(false)
  const x = useMotionValue(-100), y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 260, damping: 26, mass: 0.6 })
  const ry = useSpring(y, { stiffness: 260, damping: 26, mass: 0.6 })

  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setOn(true)
    document.body.classList.add('cursor-on')
    const move = (e: PointerEvent) => {
      x.set(e.clientX); y.set(e.clientY)
      const t = (e.target as HTMLElement).closest<HTMLElement>('a, button, [data-cursor]')
      setHot(!!t)
      setLabel(t?.dataset.cursor ?? '')
    }
    const d = () => setDown(true), u = () => setDown(false)
    addEventListener('pointermove', move)
    addEventListener('pointerdown', d)
    addEventListener('pointerup', u)
    return () => { document.body.classList.remove('cursor-on'); removeEventListener('pointermove', move); removeEventListener('pointerdown', d); removeEventListener('pointerup', u) }
  }, [x, y])

  if (!on) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-[90] mix-blend-difference" aria-hidden>
      <motion.div className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-washi" style={{ x, y }} />
      <motion.div
        className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-washi"
        style={{ x: rx, y: ry }}
        animate={{ width: label ? 84 : hot ? 46 : 30, height: label ? 84 : hot ? 46 : 30, scale: down ? 0.75 : 1, opacity: hot ? 1 : 0.5 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        {label && <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-washi">{label}</span>}
      </motion.div>
    </div>
  )
}
