import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * The world behind every chapter: ridgelines receding into mist, a cold moon,
 * embers rising. The camera travels deeper into the range as you scroll, and
 * the atmosphere re-grades to whichever chapter is on screen (data-tone).
 */
const TONES: Record<string, { fog: string; ridge: string; moon: string; ember: string; density: number }> = {
  ink: { fog: '#0d0b0a', ridge: '#050404', moon: '#cfc5b2', ember: '#e8743a', density: 0.011 },
  ember: { fog: '#1f0d06', ridge: '#070302', moon: '#f08a4a', ember: '#ffae5c', density: 0.014 },
  steel: { fog: '#0c1013', ridge: '#030506', moon: '#aeb8c2', ember: '#cfd8e0', density: 0.012 },
  blood: { fog: '#170707', ridge: '#050202', moon: '#c3301b', ember: '#ff6a3d', density: 0.013 },
  dawn: { fog: '#3b2219', ridge: '#120a07', moon: '#f6d29a', ember: '#ffd8a0', density: 0.009 },
}

function ridgeShape(seed: number, w: number, h: number) {
  const s = new THREE.Shape()
  s.moveTo(-w / 2, -40)
  const n = 160
  for (let i = 0; i <= n; i++) {
    const x = -w / 2 + (i / n) * w
    const t = x * 0.02 + seed
    const y =
      Math.sin(t) * h * 0.5 + Math.sin(t * 2.3 + seed * 2) * h * 0.25 + Math.abs(Math.sin(t * 5.1 + seed)) * h * 0.18 + Math.sin(t * 13.7) * h * 0.04
    s.lineTo(x, y)
  }
  s.lineTo(w / 2, -40)
  s.lineTo(-w / 2, -40)
  return s
}

function mistTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  r.addColorStop(0, 'rgba(255,255,255,0.55)')
  r.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

export default function World() {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current!
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25))
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const tone = { fog: new THREE.Color(TONES.ink.fog), ridge: new THREE.Color(TONES.ink.ridge), moon: new THREE.Color(TONES.ink.moon), ember: new THREE.Color(TONES.ink.ember), density: TONES.ink.density }
    scene.fog = new THREE.FogExp2(tone.fog, tone.density)
    scene.background = tone.fog.clone()
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 600)

    // ridgelines — 14 layers spaced along the camera's path
    const ridgeMat = new THREE.MeshBasicMaterial({ color: tone.ridge })
    const ridges: THREE.Mesh[] = []
    for (let i = 0; i < 14; i++) {
      const g = new THREE.ShapeGeometry(ridgeShape(i * 7.31, 520, 10 + (i % 4) * 6))
      const m = new THREE.Mesh(g, ridgeMat)
      m.position.set((i % 2 ? 1 : -1) * 30, -18 - (i % 3) * 4, -i * 32)
      scene.add(m)
      ridges.push(m)
    }

    // the moon — sits far, beyond the fog's reach (fog off)
    const moonMat = new THREE.MeshBasicMaterial({ color: tone.moon, fog: false, transparent: true, opacity: 0.9 })
    const moon = new THREE.Mesh(new THREE.CircleGeometry(38, 96), moonMat)
    moon.position.set(60, 40, -520)
    scene.add(moon)
    const haloMat = new THREE.SpriteMaterial({ map: mistTexture(), color: tone.moon, fog: false, transparent: true, opacity: 0.35, depthWrite: false })
    const halo = new THREE.Sprite(haloMat)
    halo.scale.set(260, 260, 1)
    halo.position.copy(moon.position).add(new THREE.Vector3(0, 0, 1))
    scene.add(halo)

    // mist banks
    const mistMap = mistTexture()
    const mists: THREE.Sprite[] = []
    for (let i = 0; i < 26; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: mistMap, color: '#bdb3a2', transparent: true, opacity: 0.08, depthWrite: false }))
      s.scale.set(120 + Math.random() * 80, 30 + Math.random() * 20, 1)
      s.position.set((Math.random() - 0.5) * 260, -14 + Math.random() * 10, -Math.random() * 440)
      scene.add(s)
      mists.push(s)
    }

    // embers
    const N = 900
    const pos = new Float32Array(N * 3)
    const vel = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 200
      pos[i * 3 + 1] = (Math.random() - 0.5) * 80
      pos[i * 3 + 2] = 40 - Math.random() * 460
      vel[i] = 0.02 + Math.random() * 0.06
    }
    const pg = new THREE.BufferGeometry()
    pg.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const emberMat = new THREE.PointsMaterial({ color: tone.ember, size: 0.45, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })
    scene.add(new THREE.Points(pg, emberMat))

    const resize = () => {
      const w = innerWidth, h = innerHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    addEventListener('resize', resize)

    const ptr = { x: 0, y: 0 }
    const onMove = (e: PointerEvent) => { ptr.x = e.clientX / innerWidth - 0.5; ptr.y = e.clientY / innerHeight - 0.5 }
    addEventListener('pointermove', onMove)

    let target = TONES.ink
    let lastTone = ''
    const pickTone = () => {
      const mid = innerHeight / 2
      let t = 'ink'
      document.querySelectorAll<HTMLElement>('[data-tone]').forEach((s) => {
        const r = s.getBoundingClientRect()
        if (r.top < mid && r.bottom > mid) t = s.dataset.tone!
      })
      if (t !== lastTone) { lastTone = t; target = TONES[t] ?? TONES.ink }
    }

    const tmp = new THREE.Color()
    let raf = 0, cz = 40, t0 = performance.now(), frame = 0
    // cache page height — reading it every frame forces layout and starves the main thread
    let max = 1
    const measure = () => { max = Math.max(1, document.documentElement.scrollHeight - innerHeight) }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (document.hidden || now - t0 < 1000 / 40) return
      const dt = Math.min(0.05, (now - t0) / 1000)
      t0 = now
      if (frame++ % 12 === 0) pickTone()

      const p = scrollY / max
      const z = 40 - p * 400
      cz += (z - cz) * (reduced ? 1 : 0.06)
      camera.position.set(ptr.x * 6, 2 - ptr.y * 3 + Math.sin(now * 0.0003) * 0.6, cz)
      camera.lookAt(ptr.x * 10, 2 - ptr.y * 2, cz - 60)
      moon.position.z = cz - 520
      halo.position.z = cz - 519

      // atmosphere grade
      const k = 1 - Math.pow(0.001, dt)
      tone.fog.lerp(tmp.set(target.fog), k)
      tone.ridge.lerp(tmp.set(target.ridge), k)
      tone.moon.lerp(tmp.set(target.moon), k)
      tone.ember.lerp(tmp.set(target.ember), k)
      tone.density += (target.density - tone.density) * k
      ;(scene.fog as THREE.FogExp2).color.copy(tone.fog)
      ;(scene.fog as THREE.FogExp2).density = tone.density
      ;(scene.background as THREE.Color).copy(tone.fog)
      ridgeMat.color.copy(tone.ridge)
      moonMat.color.copy(tone.moon)
      haloMat.color.copy(tone.moon)
      emberMat.color.copy(tone.ember)

      if (!reduced) {
        for (let i = 0; i < N; i++) {
          pos[i * 3 + 1] += vel[i]
          pos[i * 3] += Math.sin(now * 0.0006 + i) * 0.02
          if (pos[i * 3 + 1] > 40) { pos[i * 3 + 1] = -40; pos[i * 3 + 2] = cz - Math.random() * 300 }
        }
        pg.attributes.position.needsUpdate = true
        mists.forEach((m, i) => { m.position.x += Math.sin(now * 0.0001 + i) * 0.03 })
      }
      renderer.render(scene, camera)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      removeEventListener('resize', resize)
      removeEventListener('pointermove', onMove)
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose()
        const mat = m.material as THREE.Material | undefined
        mat?.dispose()
      })
      mistMap.dispose()
      renderer.dispose()
      el.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={host} aria-hidden className="pointer-events-none fixed inset-0 -z-10" />
}
