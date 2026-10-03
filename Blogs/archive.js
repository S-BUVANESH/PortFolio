(() => {
  const bar = document.querySelector('.reading-progress span')
  if (bar) {
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight)
      bar.style.width = Math.min(100, Math.max(0, (scrollY / max) * 100)) + '%'
    }
    addEventListener('scroll', update, { passive: true })
    addEventListener('resize', update)
    update()
  }

  const links = [...document.querySelectorAll('.day-index a')]
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean)

  if (sections.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id))
      }
    }, { rootMargin: '-25% 0px -60% 0px' })
    sections.forEach((section) => io.observe(section))
  }
})()
