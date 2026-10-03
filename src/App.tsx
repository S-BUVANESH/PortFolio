import { useCallback, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import Opening, { shouldOpen } from './components/Opening'
import World from './components/World'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Origin from './components/Origin'
import Forge from './components/Forge'
import Trials from './components/Trials'
import Waystones from './components/Waystones'
import Armory from './components/Armory'
import Seals from './components/Seals'
import Summit from './components/Summit'
import { Filters, TitleCard } from './components/kit'

export default function App() {
  const [opening, setOpening] = useState(shouldOpen)
  const done = useCallback(() => setOpening(false), [])
  const live = !opening

  return (
    <div className="grain relative">
      <Filters />
      <World />
      <Cursor />
      <AnimatePresence>{opening && <Opening key="open" onDone={done} />}</AnimatePresence>
      <Nav live={live} />
      <main>
        <Hero live={live} />
        <Origin />
        <TitleCard n="II" title="The Forge" line="Twenty weeks of tempering." tone="ember" />
        <Forge />
        <TitleCard n="III" title="Three Trials" line="Every problem met with a system." tone="blood" />
        <Trials />
        <TitleCard n="IV" title="The Waystones" line="A record of the road, week by week." tone="steel" />
        <Waystones />
        <Armory />
        <Seals />
        <Summit />
      </main>
    </div>
  )
}
