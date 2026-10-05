import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const CONTENT_DIR = path.join(ROOT, 'portfolio-content')
const BLOGS_DIR = path.join(ROOT, 'Blogs')
const BLOG_ASSETS = path.join(BLOGS_DIR, 'assets', 'weekly')
const PUBLIC_ARCHIVE = path.join(ROOT, 'public', 'archive')
const PUBLIC_ASSETS = path.join(PUBLIC_ARCHIVE, 'weekly')
const GENERATED = path.join(ROOT, 'src', 'generated', 'archive.ts')

const WEEK_COUNT = 20
const DAY_ORDER = ['01_Monday', '02_Tuesday', '03_Wednesday', '04_Thursday', '05_Friday', '06_Saturday', '07_Sunday']
const IMAGE_RE = /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i
const MODEL_RE = /\.glb$/i

const esc = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const stripQuotes = (value = '') => value.replace(/^['"]|['"]$/g, '')

function parseFrontmatter(source) {
  const match = source.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]*/)
  if (!match) return { meta: {}, body: source }

  const meta = {}
  let currentArrayKey = null

  for (const raw of match[1].split(/\r?\n/)) {
    if (!raw.trim()) continue

    const item = raw.match(/^\s*-\s*(.*)$/)
    if (item && currentArrayKey) {
      if (!Array.isArray(meta[currentArrayKey])) meta[currentArrayKey] = []
      meta[currentArrayKey].push(stripQuotes(item[1].trim()))
      continue
    }

    const field = raw.match(/^([^:#][^:]*):\s*(.*)$/)
    if (!field) continue

    const key = field[1].trim()
    const value = field[2].trim()
    currentArrayKey = null

    if (!value) {
      meta[key] = []
      currentArrayKey = key
    } else if (/^\[.*\]$/.test(value)) {
      meta[key] = value.slice(1, -1).split(',').map((v) => stripQuotes(v.trim())).filter(Boolean)
    } else if (/^(true|false)$/i.test(value)) {
      meta[key] = value.toLowerCase() === 'true'
    } else if (/^-?\d+(?:\.\d+)?$/.test(value)) {
      meta[key] = Number(value)
    } else {
      meta[key] = stripQuotes(value)
    }
  }

  return { meta, body: source.slice(match[0].length) }
}

function safeDecode(value) {
  try { return decodeURIComponent(value) } catch { return value }
}

function normalizeFilename(value) {
  return path.basename(safeDecode(String(value).trim()).replace(/^file:\/\//i, ''))
}

function sortDays(a, b) {
  const ai = DAY_ORDER.indexOf(a)
  const bi = DAY_ORDER.indexOf(b)
  return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.localeCompare(b)
}

function findFileAcrossWeek(weekPath, requested, predicate = () => true) {
  const target = normalizeFilename(requested)
  if (!target) return null

  for (const day of fs.existsSync(weekPath) ? fs.readdirSync(weekPath).filter((d) => fs.existsSync(path.join(weekPath, d)) && fs.statSync(path.join(weekPath, d)).isDirectory()).sort(sortDays) : []) {
    const dayPath = path.join(weekPath, day)
    const files = fs.readdirSync(dayPath)
    const exact = files.find((file) => file === target && predicate(file))
    if (exact) return { dayPath, dayName: day, file: exact }
    const insensitive = files.find((file) => file.toLowerCase() === target.toLowerCase() && predicate(file))
    if (insensitive) return { dayPath, dayName: day, file: insensitive }
  }

  return null
}

function findFileAcrossContent(requested, predicate = () => true) {
  const target = normalizeFilename(requested).toLowerCase()
  if (!target) return null

  const stack = [CONTENT_DIR]
  while (stack.length) {
    const current = stack.pop()
    if (!fs.existsSync(current)) continue
    for (const name of fs.readdirSync(current)) {
      const full = path.join(current, name)
      const stat = fs.statSync(full)
      if (stat.isDirectory()) {
        if (name !== '.obsidian') stack.push(full)
        continue
      }
      if (name.toLowerCase() === target && predicate(name)) return {
        dayPath: path.dirname(full),
        dayName: path.basename(path.dirname(full)).match(/^\d+_/) ? path.basename(path.dirname(full)) : '00_Monday',
        file: name,
      }
    }
  }
  return null
}

function copyAsset(found, weekName) {
  if (!found) return null

  const blogDay = path.join(BLOG_ASSETS, weekName, found.dayName)
  const publicDay = path.join(PUBLIC_ASSETS, weekName, found.dayName)
  fs.mkdirSync(blogDay, { recursive: true })
  fs.mkdirSync(publicDay, { recursive: true })

  const source = path.join(found.dayPath, found.file)
  const destinations = [
    path.join(blogDay, found.file),
    path.join(publicDay, found.file),
  ]

  for (const destination of destinations) {
    fs.copyFileSync(source, destination)
  }

  const encoded = encodeURIComponent(found.file)
  return {
    blog: `assets/weekly/${weekName}/${found.dayName}/${encoded}`,
    public: `/archive/weekly/${weekName}/${found.dayName}/${encoded}`,
    name: found.file,
    day: found.dayName,
  }
}

function safeHref(target) {
  const raw = String(target).trim()
  if (/^(?:https?:\/\/|mailto:|tel:|#|\/|\.{1,2}\/)/i.test(raw)) return raw
  return '#'
}

function extractFirstSentence(html) {
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!text) return ''
  const stop = text.search(/[.!?]\s/)
  return stop >= 0 ? text.slice(0, stop + 1) : text.slice(0, 180)
}

function markdownInline(value, ctx) {
  let s = esc(value)

  // Obsidian embedded images.
  s = s.replace(/!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, requested, alt) => {
    const found = findFileAcrossWeek(ctx.weekPath, requested, (file) => IMAGE_RE.test(file))
      ?? findFileAcrossContent(requested, (file) => IMAGE_RE.test(file))
    if (!found) {
      ctx.missingMedia.push(normalizeFilename(requested))
      return `<span class="archive-missing-media">[image unavailable: ${esc(normalizeFilename(requested))}]</span>`
    }

    const assetKey = `${found.dayName}/${found.file}`
    const asset = ctx.assets.get(assetKey) ?? copyAsset(found, ctx.weekName)
    if (asset) ctx.assets.set(assetKey, asset)
    if (!asset) return `<span class="archive-missing-media">[image unavailable: ${esc(found.file)}]</span>`

    ctx.previewImages.push(asset.public)
    ctx.allImages.add(`${found.dayName}/${found.file}`)
    ctx.embeddedImages.add(found.file.toLowerCase())

    return `<figure class="archive-inline-figure"><img class="archive-image" src="${asset.blog}" alt="${esc(alt || found.file)}" loading="lazy"><figcaption>${esc(alt || found.file)}</figcaption></figure>`
  })

  // Markdown images. Resolve local paths to generated asset paths; preserve remote images.
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, target) => {
    const rawTarget = safeDecode(String(target).trim())
    if (/^https?:\/\//i.test(rawTarget)) {
      return `<figure class="archive-inline-figure"><img class="archive-image" src="${esc(rawTarget)}" alt="${esc(alt)}" loading="lazy"></figure>`
    }

    const found = findFileAcrossWeek(ctx.weekPath, rawTarget, (file) => IMAGE_RE.test(file))
      ?? findFileAcrossContent(rawTarget, (file) => IMAGE_RE.test(file))
    if (!found) {
      ctx.missingMedia.push(normalizeFilename(rawTarget))
      return `<span class="archive-missing-media">[image unavailable: ${esc(normalizeFilename(rawTarget) || alt || 'unresolved')}]</span>`
    }

    const assetKey = `${found.dayName}/${found.file}`
    const asset = ctx.assets.get(assetKey) ?? copyAsset(found, ctx.weekName)
    if (asset) ctx.assets.set(assetKey, asset)
    if (!asset) return `<span class="archive-missing-media">[image unavailable: ${esc(found.file)}]</span>`

    ctx.previewImages.push(asset.public)
    ctx.allImages.add(`${found.dayName}/${found.file}`)
    ctx.embeddedImages.add(found.file.toLowerCase())

    return `<figure class="archive-inline-figure"><img class="archive-image" src="${asset.blog}" alt="${esc(alt || found.file)}" loading="lazy"></figure>`
  })

  // Links.
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, target) => {
    const href = safeHref(target)
    const external = /^(?:https?:|mailto:|tel:)/i.test(href)
    return `<a href="${esc(href)}"${external ? ' target="_blank" rel="noreferrer"' : ''}>${label}</a>`
  })

  // Inline emphasis/code.
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>')
  s = s.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>')
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Plain Obsidian wiki links that remain.
  s = s.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, label) => esc(label || target))

  return s
}

function isTableStart(lines, i) {
  if (i + 1 >= lines.length) return false
  const head = lines[i].trim()
  const divider = lines[i + 1].trim()
  return head.includes('|') && /^\|?\s*:?-{3,}\s*(?:\|\s*:?-{3,}\s*)+\|?$/.test(divider)
}

function splitTableRow(line) {
  const raw = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  return raw.split('|').map((cell) => cell.trim())
}

function markdownToHtml(md, ctx) {
  const lines = md.replace(/\r/g, '').split('\n')
  const out = []
  let paragraph = []
  let listType = null
  let quoteOpen = false
  let codeOpen = false
  let codeLang = ''
  let codeLines = []

  const flushParagraph = () => {
    if (!paragraph.length) return
    out.push(`<p>${markdownInline(paragraph.join(' '), ctx)}</p>`)
    paragraph = []
  }

  const closeList = () => {
    if (!listType) return
    out.push(`</${listType}>`)
    listType = null
  }

  const closeQuote = () => {
    if (quoteOpen) {
      out.push('</blockquote>')
      quoteOpen = false
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const line = raw.trimEnd()

    if (line.startsWith('```')) {
      flushParagraph()
      closeList()
      closeQuote()

      if (!codeOpen) {
        codeOpen = true
        codeLang = line.slice(3).trim()
        codeLines = []
      } else {
        const cls = codeLang ? ` class="language-${esc(codeLang)}"` : ''
        out.push(`<pre><code${cls}>${esc(codeLines.join('\n'))}</code></pre>`)
        codeOpen = false
        codeLang = ''
        codeLines = []
      }
      continue
    }

    if (codeOpen) {
      codeLines.push(line)
      continue
    }

    if (isTableStart(lines, i)) {
      flushParagraph()
      closeList()
      closeQuote()

      const headers = splitTableRow(lines[i])
      i += 2

      const rows = []
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
        rows.push(splitTableRow(lines[i]))
        i++
      }
      i--

      out.push('<div class="archive-table-wrap"><table class="archive-table"><thead><tr>')
      for (const head of headers) out.push(`<th>${markdownInline(head, ctx)}</th>`)
      out.push('</tr></thead><tbody>')
      for (const row of rows) {
        out.push('<tr>')
        for (let c = 0; c < headers.length; c++) out.push(`<td>${markdownInline(row[c] ?? '', ctx)}</td>`)
        out.push('</tr>')
      }
      out.push('</tbody></table></div>')
      continue
    }

    if (!line.trim()) {
      flushParagraph()
      closeList()
      closeQuote()
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      flushParagraph()
      closeList()
      closeQuote()
      const level = Math.min(heading[1].length + 1, 4)
      out.push(`<h${level}>${markdownInline(heading[2], ctx)}</h${level}>`)
      continue
    }

    if (/^---+$/.test(line.trim())) {
      flushParagraph()
      closeList()
      closeQuote()
      out.push('<hr>')
      continue
    }

    const task = line.match(/^\s*[-*]\s+\[([ xX])\]\s+(.+)$/)
    if (task) {
      flushParagraph()
      closeQuote()
      if (listType !== 'ul') {
        closeList()
        out.push('<ul class="archive-checklist">')
        listType = 'ul'
      }
      const checked = task[1].toLowerCase() === 'x'
      out.push(`<li><span class="archive-check ${checked ? 'is-checked' : ''}">${checked ? '✓' : '○'}</span>${markdownInline(task[2], ctx)}</li>`)
      continue
    }

    const ordered = line.match(/^\s*\d+\.\s+(.+)$/)
    if (ordered) {
      flushParagraph()
      closeQuote()
      if (listType !== 'ol') {
        closeList()
        out.push('<ol>')
        listType = 'ol'
      }
      out.push(`<li>${markdownInline(ordered[1], ctx)}</li>`)
      continue
    }

    const bullet = line.match(/^\s*[-*]\s+(.+)$/)
    if (bullet) {
      flushParagraph()
      closeQuote()
      if (listType !== 'ul') {
        closeList()
        out.push('<ul>')
        listType = 'ul'
      }
      out.push(`<li>${markdownInline(bullet[1], ctx)}</li>`)
      continue
    }

    if (/^\s*>\s?/.test(line)) {
      flushParagraph()
      closeList()
      if (!quoteOpen) {
        out.push('<blockquote>')
        quoteOpen = true
      }
      out.push(`<p>${markdownInline(line.replace(/^\s*>\s?/, ''), ctx)}</p>`)
      continue
    }

    closeList()
    closeQuote()
    paragraph.push(line.trim())
  }

  flushParagraph()
  closeList()
  closeQuote()

  if (codeOpen) {
    out.push(`<pre><code>${esc(codeLines.join('\n'))}</code></pre>`)
  }

  return out.join('\n')
}

function collectWeek(index) {
  const weekName = `Week_${String(index).padStart(2, '0')}`
  const weekPath = path.join(CONTENT_DIR, weekName)

  const record = {
    n: index,
    sourceWeek: weekName,
    title: `Week ${String(index).padStart(2, '0')} — Field Record`,
    summary: '',
    date: '',
    status: 'awaiting',
    tags: [],
    days: [],
    previewImages: [],
    imageCount: 0,
    hasContent: false,
    url: `Blogs/Week_${String(index).padStart(2, '0')}.html`,
  }

  if (!fs.existsSync(weekPath)) return record

  const dayNames = fs.readdirSync(weekPath)
    .filter((name) => fs.statSync(path.join(weekPath, name)).isDirectory())
    .sort(sortDays)

  const sourceFiles = []
  const rootFiles = fs.readdirSync(weekPath)
    .filter((file) => file.toLowerCase().endsWith('.md') && file.toLowerCase() !== 'readme.md')
    .sort()

  for (const file of rootFiles) sourceFiles.push({ file, day: null, path: path.join(weekPath, file) })

  for (const dayName of dayNames) {
    const dayPath = path.join(weekPath, dayName)
    for (const file of fs.readdirSync(dayPath).filter((f) => f.toLowerCase().endsWith('.md') && f.toLowerCase() !== 'readme.md').sort()) {
      sourceFiles.push({ file, day: dayName, path: path.join(dayPath, file) })
    }
  }

  let mergedMeta = {}
  for (const item of sourceFiles) {
    const parsed = parseFrontmatter(fs.readFileSync(item.path, 'utf8'))
    mergedMeta = { ...mergedMeta, ...parsed.meta }
  }

  let firstTitle = ''
  let firstDate = ''
  let firstBody = ''
  for (const item of sourceFiles) {
    const raw = fs.readFileSync(item.path, 'utf8')
    const parsed = parseFrontmatter(raw)
    if (!firstTitle) firstTitle = parsed.meta.title || ''
    if (!firstDate && parsed.meta.date) firstDate = String(parsed.meta.date)
    if (!firstBody) firstBody = parsed.body
    if (parsed.meta.week_title) record.title = String(parsed.meta.week_title)
  }

  if (!record.title || record.title.startsWith('Week ')) record.title = firstTitle || record.title
  record.date = mergedMeta.date || firstDate || ''
  record.summary = mergedMeta.description || mergedMeta.summary || ''
  record.status = mergedMeta.status || (sourceFiles.length ? 'published' : 'awaiting')
  record.tags = Array.isArray(mergedMeta.tags) ? mergedMeta.tags : []

  const ctxBase = {
    weekPath,
    weekName,
    assets: new Map(),
    previewImages: [],
    embeddedImages: new Set(),
    missingMedia: [],
    allImages: new Set(),
  }

  const rootNotes = []
  for (const item of sourceFiles.filter((x) => x.day === null)) {
    const parsed = parseFrontmatter(fs.readFileSync(item.path, 'utf8'))
    const html = markdownToHtml(parsed.body, ctxBase)
    rootNotes.push({ source: item.file, title: parsed.meta.title || '', html, date: parsed.meta.date || '' })
  }

  const dayRecords = []
  for (const dayName of dayNames) {
    const dayPath = path.join(weekPath, dayName)
    const mdFiles = fs.readdirSync(dayPath)
      .filter((file) => file.toLowerCase().endsWith('.md') && file.toLowerCase() !== 'readme.md')
      .sort()
    const imageFiles = fs.readdirSync(dayPath).filter((file) => IMAGE_RE.test(file)).sort()
    const modelFiles = fs.readdirSync(dayPath).filter((file) => MODEL_RE.test(file)).sort()

    if (!mdFiles.length && !imageFiles.length && !modelFiles.length) continue

    const notes = []
    for (const file of mdFiles) {
      const raw = fs.readFileSync(path.join(dayPath, file), 'utf8')
      const parsed = parseFrontmatter(raw)
      const html = markdownToHtml(parsed.body, ctxBase)
      notes.push({
        source: file,
        title: parsed.meta.title || '',
        date: parsed.meta.date || '',
        tags: Array.isArray(parsed.meta.tags) ? parsed.meta.tags : [],
        html,
      })
      if (!record.date && parsed.meta.date) record.date = parsed.meta.date
      for (const tag of notes.at(-1).tags) if (!record.tags.includes(tag)) record.tags.push(tag)
    }

    // Unembedded images form the day's gallery.
    const gallery = []
    for (const image of imageFiles) {
      const key = `${dayName}/${image}`
      if (ctxBase.embeddedImages.has(image.toLowerCase())) {
        // It was already copied while rendering its embed.
        const found = findFileAcrossWeek(weekPath, image, (file) => file === image)
        if (found && !ctxBase.assets.has(key)) {
          ctxBase.assets.set(key, copyAsset(found, weekName))
        }
        continue
      }

      const found = { dayPath, dayName, file: image }
      const asset = copyAsset(found, weekName)
      if (asset) {
        ctxBase.assets.set(key, asset)
        ctxBase.allImages.add(`${dayName}/${image}`)
        gallery.push({ src: asset.blog, alt: image, publicSrc: asset.public })
      }
    }

    for (const model of modelFiles) {
      const found = { dayPath, dayName, file: model }
      const asset = copyAsset(found, weekName)
      if (asset) ctxBase.assets.set(`${dayName}/${model}`, asset)
    }

    dayRecords.push({
      name: dayName.replace(/^\d+_/, ''),
      date: notes.find((n) => n.date)?.date || '',
      notes,
      gallery,
      models: modelFiles.map((model) => {
        const asset = ctxBase.assets.get(`${dayName}/${model}`)
        return asset ? { src: asset.blog, name: model } : null
      }).filter(Boolean),
    })
  }

  if (!record.summary && firstBody) {
    record.summary = extractFirstSentence(markdownToHtml(firstBody, { ...ctxBase, previewImages: [], embeddedImages: new Set(), assets: new Map(), missingMedia: [], allImages: new Set() }))
  }

  const uniquePreview = []
  for (const img of ctxBase.previewImages) if (!uniquePreview.includes(img)) uniquePreview.push(img)
  for (const d of dayRecords) for (const g of d.gallery) if (!uniquePreview.includes(g.publicSrc)) uniquePreview.push(g.publicSrc)

  record.previewImages = uniquePreview.slice(0, 4)
  record.imageCount = ctxBase.allImages.size
  record.days = dayRecords.map((d) => ({ name: d.name, date: d.date }))
  record.hasContent = Boolean(rootNotes.length || dayRecords.some((d) => d.notes.length || d.gallery.length || d.models.length))

  if (!record.date) record.date = dayRecords.flatMap((d) => d.notes.map((n) => n.date)).find(Boolean) || ''

  const publishContext = {
    record,
    rootNotes,
    days: dayRecords,
    missingMedia: ctxBase.missingMedia,
  }

  return publishContext
}

function pageHtml(ctx, allRecords) {
  const { record, rootNotes, days } = ctx
  const index = record.n
  const prev = index > 0 ? allRecords[index - 1] : null
  const next = index < WEEK_COUNT - 1 ? allRecords[index + 1] : null
  const dateLabel = record.date || 'Awaiting publication'
  const statusLabel = record.hasContent ? 'Published field record' : 'Record slot ready'
  const preview = record.previewImages.slice(0, 4)

  const modelCards = days.flatMap((d) => d.models.map((m) => `
    <section class="model-record">
      <div class="model-record-head">
        <div>
          <span class="eyebrow">Interactive artefact</span>
          <h3>${esc(m.name)}</h3>
        </div>
        <span class="model-hint">Drag · rotate · zoom</span>
      </div>
      <model-viewer src="${m.src}" alt="Interactive 3D model — ${esc(m.name)}" camera-controls touch-action="pan-y" shadow-intensity="1" exposure="1" environment-image="neutral"></model-viewer>
    </section>
  `)).join('')

  const rootHtml = rootNotes.map((note) => `
    <article class="note-card root-note">
      <div class="source">${esc(note.source)}</div>
      ${note.html}
    </article>
  `).join('')

  const dayHtml = days.map((day, dayIndex) => `
    <section class="day-record" id="day-${slug(day.name)}">
      <div class="day-rail">
        <span>${String(dayIndex + 1).padStart(2, '0')}</span>
        <span>${esc(day.name)}</span>
      </div>
      <div class="day-body">
        <div class="day-heading">
          <span class="eyebrow">${esc(day.name)}${day.date ? ` · ${esc(day.date)}` : ''}</span>
          <span class="day-line"></span>
        </div>
        ${day.notes.map((note) => `
          <article class="note-card">
            <div class="source">${esc(note.source)}</div>
            ${note.html}
          </article>
        `).join('')}
        ${day.gallery.length ? `
          <div class="gallery">
            <div class="gallery-heading"><span>Visual record</span><span>${String(day.gallery.length).padStart(2,'0')} images</span></div>
            <div class="gallery-grid">
              ${day.gallery.map((g) => `<figure><img src="${g.src}" alt="${esc(g.alt)}" loading="lazy"><figcaption>${esc(g.alt)}</figcaption></figure>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </section>
  `).join('')

  const previewHtml = preview.length ? `
    <div class="hero-preview">
      ${preview.map((src, i) => `<div class="hero-preview-item hero-preview-${i + 1}"><img src="${src.replace(/^\/archive\//, 'assets/archive-rewrite-not-used/').replace(/^\/archive\/weekly\//, 'assets/weekly/').replace(/\\/g,'/')}" alt="Week ${record.n} preview image" loading="eager"></div>`).join('')}
    </div>
  ` : ''

  const blogPreview = record.previewImages.length
    ? record.previewImages.map((src, i) => `<figure><img src="${src.replace(/^\/archive\/weekly\//, 'assets/weekly/').replace(/\\/g,'/')}" alt="Week ${record.n} preview image ${i + 1}" loading="lazy"><figcaption>Field image ${String(i+1).padStart(2,'0')}</figcaption></figure>`).join('')
    : ''

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Week ${String(record.n).padStart(2,'0')} · ${esc(record.title)} — Buvanesh S.</title>
<meta name="description" content="${esc(record.summary || `Engineering field record — Week ${String(record.n).padStart(2,'0')}`)}">
<meta name="theme-color" content="#0b0a09">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@400;600;800&family=Zen+Kaku+Gothic+New:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="./archive.css">
<script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer@4.0.0/dist/model-viewer.min.js"></script>
</head>
<body>
<div class="grain"></div>
<div class="reading-progress" aria-hidden="true"><span></span></div>
<header class="site-nav">
  <a class="brand" href="../index.html#waystones">BUVANESH S.</a>
  <div class="nav-meta">ENGINEERING ARCHIVE · WEEK ${String(record.n).padStart(2,'0')}</div>
  <a class="back" href="../index.html#waystones">← Return to portfolio</a>
</header>

<main>
  <section class="record-hero">
    <div class="hero-copy">
      <div class="eyebrow">FORGE — PRICE PROTOSEM · ${statusLabel}</div>
      <div class="hero-week">
        <span class="week-word">WEEK</span>
        <span class="week-number">${String(record.n).padStart(2,'0')}</span>
      </div>
      <h1>${esc(record.title)}</h1>
      <p class="hero-summary">${esc(record.summary || 'A field record of learning, experimentation and engineering work.')}</p>
      <div class="hero-meta">
        <span>${esc(dateLabel)}</span>
        <span>${record.days.length ? `${record.days.length} day${record.days.length === 1 ? '' : 's'} recorded` : 'No day entries yet'}</span>
        <span>${record.imageCount} visual${record.imageCount === 1 ? '' : 's'}</span>
      </div>
    </div>
    <div class="hero-scene">
      <div class="scene-ring"></div>
      <div class="scene-glow"></div>
      ${blogPreview ? `<div class="preview-grid">${blogPreview}</div>` : '<div class="preview-empty">FIELD RECORD<br>AWAITING IMAGE EVIDENCE</div>'}
    </div>
  </section>

  <section class="record-map">
    <div>
      <span class="eyebrow">Record map</span>
      <h2>Walk the week.</h2>
    </div>
    <nav class="day-index" aria-label="Week days">
      ${days.length ? days.map((d) => `<a href="#day-${slug(d.name)}"><span>${esc(d.name)}</span>${d.date ? `<small>${esc(d.date)}</small>` : ''}</a>`).join('') : '<span class="empty-state">No entries published yet.</span>'}
    </nav>
  </section>

  <section class="record-body">
    ${rootHtml}
    ${dayHtml}
    ${modelCards}
    ${record.hasContent ? '' : `<section class="empty-record"><span class="eyebrow">Awaiting field notes</span><h2>This record is wired to the Obsidian pipeline.</h2><p>Add Markdown notes and media to <code>portfolio-content/Week_${String(record.n).padStart(2,'0')}/</code> and push. GitHub Actions will regenerate this page automatically.</p></section>`}
  </section>

  <nav class="record-nav" aria-label="Previous and next week">
    ${prev ? `<a href="./Week_${String(prev.n).padStart(2,'0')}.html"><span class="nav-kicker">Previous record</span><strong>Week ${String(prev.n).padStart(2,'0')}</strong><em>${esc(prev.title)}</em></a>` : '<span class="nav-placeholder"></span>'}
    <a class="archive-home" href="../index.html#waystones"><span class="nav-kicker">Archive</span><strong>20 weeks</strong><em>Return to the full path</em></a>
    ${next ? `<a class="next" href="./Week_${String(next.n).padStart(2,'0')}.html"><span class="nav-kicker">Next record</span><strong>Week ${String(next.n).padStart(2,'0')}</strong><em>${esc(next.title)}</em></a>` : '<span class="nav-placeholder"></span>'}
  </nav>
</main>

<footer class="site-footer">
  <span>BUVANESH S. · FORGE — PRICE PROTOSEM</span>
  <a href="../index.html#waystones">Return to the portfolio</a>
</footer>

<script src="./archive.js" defer></script>
</body>
</html>`
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'record'
}

const BLOG_CSS = `@import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@400;600;800&family=Zen+Kaku+Gothic+New:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');

:root{
  --sumi:#0b0a09;
  --char:#151311;
  --ash:#2a2622;
  --washi:#ece4d3;
  --bone:#c9bfac;
  --mist:#8d877c;
  --steel:#9aa3ad;
  --blood:#c3301b;
  --ember:#e8743a;
  --gold:#d8b46a;
  --hair:rgba(236,228,211,.14);
  --ease-draw:cubic-bezier(.7,0,.2,1);
  --ease-cut:cubic-bezier(.9,0,.1,1);
}
*{box-sizing:border-box}
html{scroll-behavior:smooth;background:var(--sumi)}
body{margin:0;background:
  radial-gradient(circle at 72% 6%,rgba(216,180,106,.08),transparent 22rem),
  linear-gradient(180deg,#0b0a09 0%,#11100e 38%,#0b0a09 100%);
  color:var(--washi);font:400 17px/1.8 'Zen Kaku Gothic New',system-ui,sans-serif;
  -webkit-font-smoothing:antialiased}
a{color:inherit}
::selection{background:var(--blood);color:var(--washi)}
.grain{position:fixed;inset:-30%;pointer-events:none;z-index:50;opacity:.06;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 .95 0 0 0 0 .88 0 0 0 1.15 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");animation:grain 1.3s steps(6) infinite}
@keyframes grain{0%{transform:translate(0,0)}25%{transform:translate(-2%,2%)}50%{transform:translate(2%,-3%)}75%{transform:translate(-3%,-1%)}100%{transform:translate(0,0)}}
.reading-progress{position:fixed;left:0;right:0;top:0;height:2px;background:rgba(236,228,211,.08);z-index:60}
.reading-progress span{display:block;height:100%;width:0;background:var(--blood);box-shadow:0 0 16px rgba(195,48,27,.45)}
.site-nav{position:sticky;top:0;z-index:40;display:grid;grid-template-columns:1fr auto 1fr;gap:24px;align-items:center;padding:18px clamp(18px,4vw,64px);background:rgba(11,10,9,.78);backdrop-filter:blur(16px);border-bottom:1px solid var(--hair)}
.site-nav .brand,.site-nav .back{font-family:'DM Mono',monospace;text-transform:uppercase;text-decoration:none;letter-spacing:.12em;font-size:11px}
.site-nav .brand{color:var(--washi);font-weight:500}
.site-nav .back{justify-self:end;border:1px solid rgba(236,228,211,.2);padding:10px 14px;color:var(--bone);transition:border-color .3s,background .3s,color .3s}
.site-nav .back:hover{border-color:var(--blood);background:var(--blood);color:var(--washi)}
.nav-meta{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.2em;text-align:center;color:var(--mist);text-transform:uppercase}
.record-hero{min-height:88vh;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(360px,.95fr);gap:clamp(40px,7vw,120px);align-items:center;max-width:1500px;margin:auto;padding:clamp(72px,11vw,150px) clamp(22px,6vw,96px) 100px;border-bottom:1px solid var(--hair)}
.hero-copy{position:relative}
.eyebrow{font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:.19em;font-size:10px;color:var(--blood)}
.hero-week{display:flex;align-items:baseline;gap:22px;margin:26px 0 10px}
.week-word{font-family:'DM Mono',monospace;letter-spacing:.24em;font-size:11px;color:var(--mist)}
.week-number{font-family:'Shippori Mincho B1',serif;font-weight:800;font-size:clamp(6rem,15vw,14rem);line-height:.77;color:var(--washi);letter-spacing:-.06em}
.record-hero h1{margin:32px 0 16px;max-width:850px;font-family:'Shippori Mincho B1',serif;font-size:clamp(2.8rem,6.2vw,7.2rem);line-height:.96;letter-spacing:-.045em;font-weight:800}
.hero-summary{max-width:66ch;margin:0;color:var(--bone);font-size:17px}
.hero-meta{display:flex;flex-wrap:wrap;gap:10px 24px;margin-top:26px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--mist)}
.hero-scene{position:relative;min-height:520px;display:grid;place-items:center}
.scene-ring{position:absolute;width:min(36vw,450px);height:min(36vw,450px);border:1px solid rgba(216,180,106,.25);border-radius:50%;box-shadow:0 0 80px rgba(216,180,106,.08) inset,0 0 80px rgba(195,48,27,.06);animation:slowSpin 28s linear infinite}
.scene-ring:before,.scene-ring:after{content:'';position:absolute;inset:12%;border:1px solid rgba(236,228,211,.07);border-radius:50%}
.scene-ring:after{inset:28%;border-color:rgba(195,48,27,.12)}
.scene-glow{position:absolute;width:68%;height:68%;border-radius:50%;background:radial-gradient(circle,rgba(216,180,106,.11),transparent 68%);filter:blur(12px)}
.preview-grid{position:relative;width:min(100%,520px);display:grid;grid-template-columns:1.2fr .8fr;grid-template-rows:220px 180px;gap:8px;transform:rotate(-2deg)}
.preview-grid figure{margin:0;overflow:hidden;border:1px solid rgba(236,228,211,.12);background:#151311}
.preview-grid figure:first-child{grid-row:span 2}
.preview-grid img{display:block;width:100%;height:100%;object-fit:cover;filter:saturate(.82) contrast(1.04)}
.preview-grid figcaption{display:none}
.preview-empty{text-align:center;border:1px solid rgba(236,228,211,.12);padding:50px;color:var(--mist);font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.2em;line-height:2}
@keyframes slowSpin{to{transform:rotate(360deg)}}
.record-map{display:grid;grid-template-columns:minmax(240px,.7fr) 1.3fr;gap:50px;max-width:1180px;margin:0 auto;padding:90px clamp(22px,6vw,96px);border-bottom:1px solid var(--hair)}
.record-map h2{margin:.2rem 0 0;font-family:'Shippori Mincho B1',serif;font-size:clamp(2.3rem,5vw,5rem);line-height:1;letter-spacing:-.04em}
.day-index{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:0;border-top:1px solid var(--hair)}
.day-index a{display:flex;flex-direction:column;gap:2px;padding:16px 14px;border-right:1px solid var(--hair);border-bottom:1px solid var(--hair);text-decoration:none;transition:background .25s,color .25s,transform .25s}
.day-index a:hover{background:rgba(195,48,27,.12);color:var(--washi);transform:translateY(-2px)}
.day-index a span{font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:.16em;font-size:10px}
.day-index a small{font-family:'DM Mono',monospace;color:var(--mist);font-size:8px}
.record-body{max-width:1280px;margin:auto;padding:0 clamp(22px,6vw,96px) 100px}
.root-note{max-width:860px;margin:90px auto}
.day-record{display:grid;grid-template-columns:150px minmax(0,1fr);gap:clamp(24px,5vw,70px);padding:88px 0;border-top:1px solid var(--hair)}
.day-rail{position:sticky;top:110px;align-self:start;display:flex;flex-direction:column;gap:8px;color:var(--mist);font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:.17em;font-size:9px}
.day-rail span:first-child{color:var(--blood)}
.day-body{min-width:0}
.day-heading{display:flex;align-items:center;gap:14px;margin-bottom:28px}
.day-heading .eyebrow{white-space:nowrap}
.day-line{height:1px;flex:1;background:var(--hair)}
.note-card{max-width:860px;margin:0 auto 46px;padding:0 0 46px;border-bottom:1px solid rgba(236,228,211,.08)}
.note-card:last-child{border-bottom:0}
.note-card .source{margin-bottom:18px;color:rgba(236,228,211,.4);font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:.13em;font-size:9px}
.note-card h2,.note-card h3,.note-card h4{font-family:'Shippori Mincho B1',serif;color:var(--washi);line-height:1.08;letter-spacing:-.025em}
.note-card h2{margin:2.2rem 0 .8rem;font-size:clamp(2rem,3.3vw,3.4rem)}
.note-card h3{margin:1.6rem 0 .6rem;font-size:clamp(1.5rem,2.6vw,2.3rem);color:var(--bone)}
.note-card h4{margin:1.4rem 0 .5rem;font-size:1.25rem;color:var(--gold)}
.note-card p{margin:1rem 0;max-width:78ch;color:var(--bone)}
.note-card ul,.note-card ol{max-width:74ch;margin:1rem 0;padding-left:1.35rem;color:var(--bone)}
.note-card li{margin:.4rem 0;padding-left:.2rem}
.note-card strong{color:var(--washi)}
.note-card em{font-family:'Shippori Mincho B1',serif;color:#d7c9b3}
.note-card a{color:var(--gold);text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px}
.note-card blockquote{margin:1.8rem 0;padding:16px 20px;border-left:2px solid var(--blood);background:rgba(195,48,27,.06);color:var(--washi);font-family:'Shippori Mincho B1',serif;font-size:1.15rem}
.note-card hr{border:0;border-top:1px solid var(--hair);margin:2.4rem 0}
.note-card code{padding:.12rem .35rem;background:rgba(236,228,211,.07);font-family:'DM Mono',monospace;font-size:.9em;color:var(--gold)}
.note-card pre{margin:1.5rem 0;overflow:auto;padding:18px;background:#050504;border:1px solid rgba(236,228,211,.1);color:var(--washi);font-family:'DM Mono',monospace;font-size:12px;line-height:1.65}
.note-card pre code{padding:0;background:none;color:inherit}
.archive-inline-figure{margin:20px 0}
.archive-image{display:block;max-width:100%;width:min(100%,820px);height:auto;margin:0 auto;background:#111;border:1px solid rgba(236,228,211,.1)}
.archive-inline-figure figcaption{margin-top:7px;text-align:center;color:var(--mist);font:9px 'DM Mono',monospace;letter-spacing:.12em}
.archive-table-wrap{overflow-x:auto;margin:22px 0}
.archive-table{width:100%;min-width:540px;border-collapse:collapse;font-size:14px}
.archive-table th,.archive-table td{padding:11px 12px;border:1px solid rgba(236,228,211,.1);text-align:left;vertical-align:top}
.archive-table th{background:rgba(236,228,211,.05);color:var(--washi);font-family:'DM Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.12em}
.archive-checklist{list-style:none!important;padding-left:0!important}
.archive-check{display:inline-grid;place-items:center;width:18px;height:18px;margin-right:8px;border:1px solid var(--mist);font:10px 'DM Mono',monospace}
.archive-check.is-checked{background:var(--blood);border-color:var(--blood);color:var(--washi)}
.gallery{margin:36px 0 10px;padding-top:20px;border-top:1px solid rgba(236,228,211,.08)}
.gallery-heading{display:flex;justify-content:space-between;color:var(--mist);font:9px 'DM Mono',monospace;text-transform:uppercase;letter-spacing:.14em;margin-bottom:12px}
.gallery-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.gallery figure{margin:0;background:#10100e;border:1px solid rgba(236,228,211,.1)}
.gallery img{width:100%;aspect-ratio:4/3;object-fit:cover}
.gallery figcaption{padding:7px;color:var(--mist);font:8px 'DM Mono',monospace;line-height:1.45;word-break:break-word}
.model-record{margin:70px auto;max-width:980px;border:1px solid rgba(216,180,106,.18);background:linear-gradient(180deg,rgba(216,180,106,.04),rgba(0,0,0,.18))}
.model-record-head{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:16px 18px;border-bottom:1px solid rgba(236,228,211,.1)}
.model-record-head h3{margin:4px 0 0;font-family:'DM Mono',monospace;font-size:12px;color:var(--washi);letter-spacing:.08em}
.model-hint{font:9px 'DM Mono',monospace;text-transform:uppercase;letter-spacing:.12em;color:var(--mist)}
model-viewer{display:block;width:100%;height:min(68vh,620px);min-height:390px;background:radial-gradient(circle at 50% 44%,rgba(195,48,27,.08),#050504 72%)}
.empty-record{max-width:860px;margin:110px auto;padding:52px 0;border-top:1px solid var(--hair);border-bottom:1px solid var(--hair)}
.empty-record h2{margin:12px 0 8px;font-family:'Shippori Mincho B1',serif;font-size:clamp(2.2rem,5vw,4.6rem);line-height:1}
.empty-record p{max-width:70ch;color:var(--bone)}
.record-nav{max-width:1280px;margin:auto;padding:26px clamp(22px,6vw,96px) 80px;border-top:1px solid var(--hair);display:grid;grid-template-columns:1fr auto 1fr;gap:18px}
.record-nav a,.record-nav .nav-placeholder{min-height:88px;border:1px solid rgba(236,228,211,.1);padding:15px;text-decoration:none;display:flex;flex-direction:column;justify-content:center;background:rgba(236,228,211,.02);transition:transform .25s,border-color .25s,background .25s}
.record-nav a:hover{transform:translateY(-3px);border-color:var(--blood);background:rgba(195,48,27,.06)}
.record-nav .next{text-align:right}
.record-nav .archive-home{text-align:center}
.nav-kicker{font:9px 'DM Mono',monospace;text-transform:uppercase;letter-spacing:.15em;color:var(--mist)}
.record-nav strong{font-family:'Shippori Mincho B1',serif;font-size:1.4rem}
.record-nav em{margin-top:2px;color:var(--mist);font-style:normal;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.site-footer{display:flex;justify-content:space-between;gap:20px;max-width:1280px;margin:auto;padding:24px clamp(22px,6vw,96px) 42px;border-top:1px solid var(--hair);color:var(--mist);font:9px 'DM Mono',monospace;text-transform:uppercase;letter-spacing:.12em}
.site-footer a{color:var(--bone);text-decoration:none}
.archive-missing-media{color:var(--blood);font:10px 'DM Mono',monospace}
@media(max-width:900px){
  .site-nav{grid-template-columns:1fr auto}
  .nav-meta{display:none}
  .record-hero{grid-template-columns:1fr;min-height:auto;padding-top:64px}
  .hero-scene{min-height:410px}
  .record-map{grid-template-columns:1fr}
  .day-record{grid-template-columns:1fr;padding:60px 0}
  .day-rail{position:static;display:flex;flex-direction:row;align-items:center;gap:12px;margin-bottom:12px}
  .record-nav{grid-template-columns:1fr}
  .record-nav .archive-home{order:-1}
  .record-nav .next{text-align:left}
}
@media(max-width:560px){
  body{font-size:15px}
  .site-nav{padding:14px 16px}
  .site-nav .brand{font-size:9px}
  .site-nav .back{padding:8px 10px;font-size:9px}
  .record-hero{padding:54px 18px 60px}
  .record-hero h1{font-size:2.7rem}
  .hero-summary{font-size:15px}
  .hero-scene{min-height:290px}
  .scene-ring{width:250px;height:250px}
  .preview-grid{grid-template-rows:145px 120px}
  .record-map{padding:58px 18px}
  .record-body{padding:0 18px 70px}
  .gallery-grid{grid-template-columns:1fr}
  .model-record{margin:50px 0}
  model-viewer{min-height:300px;height:55vh}
  .record-nav{padding:20px 18px 60px}
  .site-footer{padding:20px 18px 32px;flex-direction:column}
}
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.001ms!important}
}
`

const BLOG_JS = `(() => {
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
`

const WEEK06_CSS = `
/* ─── Week 06 bespoke styles ──────────────────────────────────────── */

/* Hero */
.w06-hero{position:relative;min-height:100svh;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;}
.w06-hero-bg{position:absolute;inset:0;z-index:0;}
.w06-hero-img{width:100%;height:100%;object-fit:cover;object-position:center 30%;filter:brightness(.45) saturate(.7);}
.w06-hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,#0b0a0980 0%,#0b0a09f0 70%,#0b0a09 100%);}
.w06-hero-content{position:relative;z-index:1;padding:8rem 2rem 2rem;max-width:900px;}
.w06-eyebrow{font-family:'DM Mono',monospace;font-size:.68rem;letter-spacing:.18em;text-transform:uppercase;color:#c8a97e;margin-bottom:1.2rem;display:block;}
.w06-week-stamp{display:flex;align-items:baseline;gap:.6rem;margin-bottom:.6rem;}
.w06-week-word{font-family:'DM Mono',monospace;font-size:.75rem;letter-spacing:.25em;color:#8c7357;text-transform:uppercase;}
.w06-week-num{font-family:'Shippori Mincho B1',serif;font-size:clamp(3rem,10vw,7rem);font-weight:800;line-height:1;color:#e8d5b0;}
.w06-hero-title{font-family:'Shippori Mincho B1',serif;font-size:clamp(2.8rem,8vw,6.5rem);font-weight:800;line-height:.92;letter-spacing:-.02em;color:#f0e6d0;margin:0 0 1.5rem;}
.w06-hero-sub{font-family:'Zen Kaku Gothic New',sans-serif;font-size:1.05rem;color:#9e8a73;max-width:520px;line-height:1.65;margin-bottom:2rem;}
.w06-hero-pills{display:flex;flex-wrap:wrap;gap:.5rem;}
.w06-hero-pills span{font-family:'DM Mono',monospace;font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;border:1px solid #3a2e22;color:#8c7357;padding:.3em .9em;border-radius:2px;}
.w06-chapter-index{position:relative;z-index:1;display:flex;gap:0;border-top:1px solid #2a2018;margin-top:2rem;}
.w06-chapter-index a{flex:1;padding:1.2rem 2rem;text-decoration:none;border-right:1px solid #2a2018;transition:background .2s;}
.w06-chapter-index a:last-child{border-right:none;}
.w06-chapter-index a:hover{background:#161008;}
.w06-ci-num{display:block;font-family:'DM Mono',monospace;font-size:.6rem;letter-spacing:.2em;color:#8c7357;margin-bottom:.3rem;}
.w06-ci-label{display:block;font-family:'Shippori Mincho B1',serif;font-size:1rem;color:#c8b89a;}
.w06-ci-sub{display:block;font-family:'DM Mono',monospace;font-size:.6rem;letter-spacing:.1em;color:#5a4a38;margin-top:.2rem;text-transform:uppercase;}

/* Chapter banners */
.w06-chapter{border-top:1px solid #2a2018;}
.w06-chapter--tuesday{background:linear-gradient(180deg,#0d0b08 0%,#0b0a09 100%);}
.w06-chapter-banner{display:grid;grid-template-columns:auto 1fr;gap:3rem;padding:4rem 2rem 3rem;max-width:1100px;margin:0 auto;}
@media(min-width:900px){.w06-chapter-banner{padding:5rem 4rem 4rem;}}
.w06-chapter-rail{display:flex;flex-direction:column;align-items:center;padding-top:.4rem;}
.w06-chapter-num{font-family:'Shippori Mincho B1',serif;font-size:2.5rem;font-weight:800;color:#3a2e22;line-height:1;}
.w06-chapter-line{flex:1;width:1px;background:linear-gradient(#3a2e22,transparent);margin-top:.8rem;min-height:60px;}
.w06-chapter-head h2{font-family:'Shippori Mincho B1',serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:800;line-height:1;color:#e8d5b0;margin:.6rem 0 1.2rem;}
.w06-chapter-intro{font-family:'Zen Kaku Gothic New',sans-serif;font-size:1rem;color:#8c7a68;line-height:1.75;max-width:65ch;}

/* Section rows */
.w06-section{display:grid;grid-template-columns:auto 1fr;gap:2rem;padding:2.5rem 2rem;max-width:1100px;margin:0 auto;border-top:1px solid #1e180e;}
@media(min-width:768px){.w06-section{grid-template-columns:200px 1fr;gap:3rem;padding:3.5rem 4rem;}}
.w06-section--results{background:#0d0b08;}
.w06-section-label{display:flex;flex-direction:column;gap:.4rem;padding-top:.15rem;}
.w06-step{font-family:'DM Mono',monospace;font-size:.6rem;letter-spacing:.2em;color:#c8a97e;text-transform:uppercase;}
.w06-section-label span:last-child{font-family:'DM Mono',monospace;font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:#5a4a38;line-height:1.4;}
.w06-section-body{font-family:'Zen Kaku Gothic New',sans-serif;font-size:.95rem;color:#a09080;line-height:1.75;}
.w06-section-body p{margin:.8rem 0;}
.w06-section-body p:first-child{margin-top:0;}
.w06-section-body--reflection{border-left:3px solid #c8a97e30;padding-left:1.5rem;}

/* Tables */
.w06-table-wrap{overflow-x:auto;margin:1.5rem 0;border:1px solid #2a2018;border-radius:4px;}
.w06-table{width:100%;border-collapse:collapse;font-size:.82rem;}
.w06-table th{font-family:'DM Mono',monospace;font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:#8c7357;background:#0d0b08;padding:.7rem 1rem;text-align:left;border-bottom:1px solid #2a2018;}
.w06-table td{padding:.65rem 1rem;border-bottom:1px solid #1a1208;color:#9e8a73;vertical-align:top;}
.w06-table tbody tr:last-child td{border-bottom:none;}
.w06-table tbody tr:hover td{background:#0f0d0a;}
.w06-layer{font-family:'DM Mono',monospace;}
.w06-layer--red{color:#d94040;}
.w06-layer--blue{color:#4080d9;}

/* Figures */
.w06-figure{margin:1.5rem 0;}
.w06-figure img{width:100%;border:1px solid #2a2018;border-radius:4px;display:block;}
.w06-figure figcaption{font-family:'DM Mono',monospace;font-size:.6rem;letter-spacing:.08em;color:#5a4a38;margin-top:.5rem;line-height:1.5;padding:0 .2rem;}
.w06-figure--full img{max-height:540px;object-fit:contain;background:#0d0b08;}
.w06-figure--hero img{max-height:500px;object-fit:contain;background:#0d0b08;}
.w06-figure-pair{display:grid;grid-template-columns:1fr 1fr;gap:1.2rem;margin-top:1.5rem;}
@media(max-width:640px){.w06-figure-pair{grid-template-columns:1fr;}}
.w06-results-pair{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-top:1.5rem;}
@media(max-width:640px){.w06-results-pair{grid-template-columns:1fr;}}
.w06-figure--result{position:relative;}
.w06-figure--result img{filter:brightness(.95);}
.w06-figure--preferred{border:1px solid #c8a97e40;border-radius:4px;padding:.8rem;background:#0d0b08;}
.w06-preferred-badge{font-family:'DM Mono',monospace;font-size:.58rem;letter-spacing:.18em;text-transform:uppercase;color:#c8a97e;background:#c8a97e18;border:1px solid #c8a97e30;display:inline-block;padding:.2em .7em;border-radius:2px;margin-bottom:.6rem;}

/* Workflow */
.w06-workflow{border:1px solid #2a2018;border-radius:4px;padding:1.5rem;margin:1.5rem 0;display:flex;flex-direction:column;gap:.6rem;}
.w06-workflow-step{display:flex;gap:1rem;align-items:flex-start;}
.w06-wf-tool{font-family:'DM Mono',monospace;font-size:.68rem;letter-spacing:.1em;color:#c8a97e;background:#c8a97e12;border:1px solid #3a2e22;padding:.25em .8em;border-radius:2px;white-space:nowrap;min-width:140px;text-align:center;}
.w06-wf-desc{font-size:.85rem;color:#8c7a68;line-height:1.4;padding-top:.2em;}
.w06-workflow-arrow{font-family:'DM Mono',monospace;color:#3a2e22;font-size:.9rem;text-align:center;padding-left:62px;}
@media(max-width:540px){.w06-wf-tool{min-width:auto;}}

/* KV grid */
.w06-kv-grid{display:flex;flex-wrap:wrap;gap:1rem;margin:1rem 0;}
.w06-kv{background:#0d0b08;border:1px solid #2a2018;border-radius:4px;padding:.8rem 1.2rem;}
.w06-kv-label{display:block;font-family:'DM Mono',monospace;font-size:.55rem;letter-spacing:.18em;text-transform:uppercase;color:#5a4a38;margin-bottom:.2rem;}
.w06-kv-value{display:block;font-family:'Shippori Mincho B1',serif;font-size:1rem;color:#c8b89a;}

/* Two column */
.w06-two-col{display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin:1rem 0;}
@media(max-width:640px){.w06-two-col{grid-template-columns:1fr;}}
.w06-col-head{font-family:'DM Mono',monospace;font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;color:#8c7357;margin:0 0 .7rem;}
.w06-sub-head{font-family:'DM Mono',monospace;font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;color:#8c7357;margin:1.5rem 0 .5rem;}

/* Lists */
.w06-list{padding-left:1.4rem;margin:.5rem 0;}
.w06-list li{margin:.4rem 0;color:#9e8a73;}

/* Note / footnote */
.w06-note{font-family:'DM Mono',monospace;font-size:.68rem;color:#5a4a38;border-left:2px solid #2a2018;padding-left:.8rem;margin-top:.8rem;line-height:1.5;}

/* Quote */
.w06-quote{border-left:3px solid #c8a97e;padding:.8rem 1.2rem;margin:1rem 0;font-family:'Shippori Mincho B1',serif;font-size:1.05rem;color:#c8b89a;line-height:1.6;font-style:italic;}

/* Pending slots */
.w06-pending-slot{display:flex;gap:1rem;align-items:flex-start;background:#0d0b08;border:1px dashed #3a2e22;border-radius:4px;padding:1.2rem;margin:1rem 0;color:#5a4a38;}
.w06-pending-slot--large{padding:1.8rem;}
.w06-pending-icon{font-size:1.2rem;color:#3a2e22;flex-shrink:0;margin-top:.1rem;}
.w06-pending-slot strong{color:#8c7357;}

/* Source file slots */
.w06-files-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin:.5rem 0;}
@media(max-width:640px){.w06-files-grid{grid-template-columns:1fr;}}
.w06-file-slot{display:flex;gap:1rem;align-items:flex-start;background:#0d0b08;border:1px solid #2a2018;border-radius:4px;padding:1rem 1.2rem;}
.w06-file-slot--pending{border-style:dashed;}
.w06-file-icon{font-size:1rem;color:#3a2e22;flex-shrink:0;margin-top:.1rem;}
.w06-file-slot strong{display:block;color:#8c7357;font-size:.85rem;margin-bottom:.2rem;}
.w06-file-status{font-family:'DM Mono',monospace;font-size:.6rem;color:#4a3e30;line-height:1.4;}

/* References */
.w06-refs{padding-left:1.4rem;margin:.5rem 0;}
.w06-refs li{margin:.6rem 0;font-size:.85rem;color:#7a6a58;}
.w06-refs a{color:#c8a97e;text-underline-offset:3px;}

/* model-viewer reused */
model-viewer{width:100%;height:min(60vw,480px);background:#0d0b08;border:1px solid #2a2018;border-radius:4px;display:block;}

/* Mobile adjustments */
@media(max-width:768px){
  .w06-chapter-banner{grid-template-columns:1fr;}
  .w06-chapter-rail{flex-direction:row;align-items:center;}
  .w06-chapter-line{min-height:auto;width:60px;height:1px;margin-top:0;margin-left:.6rem;}
  .w06-section{grid-template-columns:1fr;}
  .w06-section-label{flex-direction:row;align-items:center;gap:.8rem;}
  .w06-step{font-size:.75rem;}
  .w06-hero-content{padding:6rem 1.2rem 1.5rem;}
  .w06-chapter-index a{padding:1rem 1.2rem;}
}
`;

function writeSharedFiles() {
  fs.mkdirSync(BLOGS_DIR, { recursive: true })
  fs.writeFileSync(path.join(BLOGS_DIR, 'archive.css'), BLOG_CSS)
  fs.writeFileSync(path.join(BLOGS_DIR, 'archive.js'), BLOG_JS)
  fs.writeFileSync(path.join(BLOGS_DIR, 'week06.css'), WEEK06_CSS)
}

function week06PageHtml(ctx, allRecords) {
  const { record } = ctx
  const prev = allRecords[5] // Week 05
  const next = allRecords[7] // Week 07
  const assetBase = 'assets/weekly/Week_06'

  const navPrev = prev ? `<a href="./Week_05.html"><span class="nav-kicker">Previous record</span><strong>Week 05</strong><em>${esc(prev.title)}</em></a>` : '<span class="nav-placeholder"></span>'
  const navNext = next ? `<a class="next" href="./Week_07.html"><span class="nav-kicker">Next record</span><strong>Week 07</strong><em>${esc(next.title)}</em></a>` : '<span class="nav-placeholder"></span>'

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Week 06 · Digital Fabrication: Laser Cutting &amp; 3D Printing — Buvanesh S.</title>
<meta name="description" content="A cinematic field record of Week 06: laser cutting Arthur Morgan in acrylic with a 1490 CO₂ cutter and FDM 3D printing a Batman model on a Bambu Lab H2S. FORGE — PRICE ProtoSem.">
<meta name="theme-color" content="#0b0a09">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@400;600;800&family=Zen+Kaku+Gothic+New:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="./archive.css">
<link rel="stylesheet" href="./week06.css">
<script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer@4.0.0/dist/model-viewer.min.js"></script>
</head>
<body>
<div class="grain"></div>
<div class="reading-progress" aria-hidden="true"><span></span></div>

<header class="site-nav">
  <a class="brand" href="../index.html#waystones">BUVANESH S.</a>
  <div class="nav-meta">ENGINEERING ARCHIVE · WEEK 06</div>
  <a class="back" href="../index.html#waystones">← Return to portfolio</a>
</header>

<main>

  <!-- ═══════════════════════ CINEMATIC OPENING ═══════════════════════ -->
  <section class="w06-hero">
    <div class="w06-hero-bg">
      <img src="${assetBase}/01_Monday/11_transparent_acrylic_result.jpeg" alt="Transparent acrylic Arthur Morgan — the final laser-cut result" class="w06-hero-img" loading="eager">
      <div class="w06-hero-overlay"></div>
    </div>
    <div class="w06-hero-content">
      <div class="w06-eyebrow">FORGE — PRICE PROTOSEM · PUBLISHED FIELD RECORD</div>
      <div class="w06-week-stamp">
        <span class="w06-week-word">WEEK</span>
        <span class="w06-week-num">06</span>
      </div>
      <h1 class="w06-hero-title">Digital<br>Fabrication</h1>
      <p class="w06-hero-sub">From a pixel to acrylic. From an STL to printed reality. Two machines, two materials, two days.</p>
      <div class="w06-hero-pills">
        <span>28–29 Sep 2026</span>
        <span>Laser Cutting</span>
        <span>3D Printing</span>
        <span>FORGE Lab</span>
      </div>
    </div>
    <div class="w06-chapter-index">
      <a href="#monday">
        <span class="w06-ci-num">01</span>
        <span class="w06-ci-label">Monday</span>
        <span class="w06-ci-sub">Laser Cutting</span>
      </a>
      <a href="#tuesday">
        <span class="w06-ci-num">02</span>
        <span class="w06-ci-label">Tuesday</span>
        <span class="w06-ci-sub">3D Printing</span>
      </a>
    </div>
  </section>

  <!-- ═══════════════════════════ MONDAY ═══════════════════════════════ -->
  <section id="monday" class="w06-chapter">
    <div class="w06-chapter-banner">
      <div class="w06-chapter-rail">
        <span class="w06-chapter-num">01</span>
        <span class="w06-chapter-line"></span>
      </div>
      <div class="w06-chapter-head">
        <span class="w06-eyebrow">Monday · 28 September 2026</span>
        <h2>From Screen to Acrylic:<br>Cutting Arthur Morgan</h2>
        <p class="w06-chapter-intro">This exercise was about taking an idea that normally exists only on a screen and making it physically manufacturable. I chose Arthur Morgan from Red Dead Redemption 2, developed a fabrication-friendly graphic at 50 × 50 mm, prepared it for vector-based laser processing, and produced two acrylic outcomes. The decision was also influenced by the environment — some FORGE staff are gamers, so I wanted the object to have a stronger chance of visual appeal beyond the exercise itself.</p>
      </div>
    </div>

    <!-- 1. Lab Safety -->
    <div class="w06-section" id="laser-safety">
      <div class="w06-section-label">
        <span class="w06-step">01</span>
        <span>Lab Safety &amp; Safety Rules</span>
      </div>
      <div class="w06-section-body">
        <p>Laser cutting combines concentrated heat, moving machinery, smoke generation, and electrical equipment. Before operating the machine, I followed the safety guidance displayed in the FORGE fabrication area.</p>
        <div class="w06-table-wrap">
          <table class="w06-table">
            <thead><tr><th>Safety area</th><th>Practice followed</th></tr></thead>
            <tbody>
              <tr><td>Laser safety</td><td>Used the enclosed machine as intended; kept the machine door closed during operation.</td></tr>
              <tr><td>Exhaust system</td><td>Kept the exhaust / ventilation system operating to remove smoke and fumes.</td></tr>
              <tr><td>Chiller</td><td>Ensured the cooling system was operating before running the laser.</td></tr>
              <tr><td>Earthing</td><td>Followed the lab's electrical safety and earthing requirements before operation.</td></tr>
              <tr><td>Air assist</td><td>Used the machine's air-assist / blowing system during processing.</td></tr>
              <tr><td>Material verification</td><td>Used acrylic, which is listed as an authorised material in the FORGE guidance.</td></tr>
              <tr><td>Supervision</td><td>Did not leave the cutter unattended during operation.</td></tr>
            </tbody>
          </table>
        </div>
        <figure class="w06-figure w06-figure--full">
          <img src="${assetBase}/01_Monday/01_laser_safety_rules.png" alt="FORGE laser-cutter safety notice" loading="lazy">
          <figcaption>FORGE laser-cutter safety notice showing precautions, operating do's and don'ts, authorised materials, and banned materials.</figcaption>
        </figure>
      </div>
    </div>

    <!-- 2. Machine Details -->
    <div class="w06-section" id="laser-machine">
      <div class="w06-section-label">
        <span class="w06-step">02</span>
        <span>Machine Details</span>
      </div>
      <div class="w06-section-body">
        <p>The machine used for the exercise was the <strong>1490 CO₂ laser cutter in the FORGE lab</strong>. All specification values below are taken directly from the physical machine placard; no manufacturer name was visible on the supplied evidence.</p>
        <div class="w06-table-wrap">
          <table class="w06-table">
            <thead><tr><th>Specification</th><th>Observed / documented value</th></tr></thead>
            <tbody>
              <tr><td>Make / Manufacturer</td><td>Not identified on the machine placard</td></tr>
              <tr><td>Model</td><td>1490 CO₂ Laser</td></tr>
              <tr><td>Working / Bed Area</td><td>1300 × 900 mm</td></tr>
              <tr><td>Laser Power</td><td>150 W</td></tr>
              <tr><td>Machine Power</td><td>1000 W</td></tr>
              <tr><td>Listed Cutting Speed</td><td>25 m/min (max capability)</td></tr>
              <tr><td>Listed Engraving Speed</td><td>55 m/min (max capability)</td></tr>
              <tr><td>Listed Accuracy</td><td>0.1 mm</td></tr>
              <tr><td>Working Temperature</td><td>0 °C – 40 °C</td></tr>
              <tr><td>Blowing System</td><td>Lower blowing system</td></tr>
              <tr><td>Control Software</td><td>RDWorks V8</td></tr>
              <tr><td>Listed Materials</td><td>Acrylic, plywood, MDF, foam board, cardboard, paper</td></tr>
            </tbody>
          </table>
        </div>
        <figure class="w06-figure w06-figure--full">
          <img src="${assetBase}/01_Monday/02_laser_machine_details.png" alt="1490 CO₂ laser cutter specification placard" loading="lazy">
          <figcaption>Machine specification placard for the 1490 CO₂ laser cutter used in the FORGE fabrication lab.</figcaption>
        </figure>
      </div>
    </div>

    <!-- 3. Materials Used -->
    <div class="w06-section" id="laser-materials">
      <div class="w06-section-label">
        <span class="w06-step">03</span>
        <span>Materials Used</span>
      </div>
      <div class="w06-section-body">
        <p>I used FORGE lab stock acrylic in two finishes to compare how material choice changes the visual character of the same geometry.</p>
        <div class="w06-table-wrap">
          <table class="w06-table">
            <thead><tr><th>Material</th><th>Thickness</th><th>Source</th></tr></thead>
            <tbody>
              <tr><td>Black acrylic</td><td>2 mm</td><td>FORGE lab stock</td></tr>
              <tr><td>Transparent / clear acrylic</td><td>2 mm</td><td>FORGE lab stock</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 4. Selected Design -->
    <div class="w06-section" id="laser-design">
      <div class="w06-section-label">
        <span class="w06-step">04</span>
        <span>Selected Design / Image</span>
      </div>
      <div class="w06-section-body">
        <p>The selected subject was <strong>Arthur Morgan from Red Dead Redemption 2</strong>. I chose the subject because I wanted a design with recognisable character and visual appeal. The target size was <strong>50 × 50 mm</strong>, so the image had to remain readable after simplification for fabrication.</p>
        <figure class="w06-figure w06-figure--hero">
          <img src="${assetBase}/01_Monday/04_gemini_arthur_reference.png" alt="Arthur Morgan RDR2 reference artwork generated as the starting point" loading="lazy">
          <figcaption>Initial Arthur Morgan concept generated via Gemini at the requested 50 × 50 mm design scale. Gaming theme chosen for its recognisable visual appeal and potential market interest.</figcaption>
        </figure>
      </div>
    </div>

    <!-- 5. Image-to-DXF Conversion -->
    <div class="w06-section" id="laser-dxf">
      <div class="w06-section-label">
        <span class="w06-step">05</span>
        <span>Image-to-DXF Conversion</span>
      </div>
      <div class="w06-section-body">
        <p>A normal raster image cannot directly become a useful laser-cutting path. The design went through several preparation stages before it was machine-ready.</p>
        <div class="w06-workflow">
          <div class="w06-workflow-step"><span class="w06-wf-tool">Gemini</span><span class="w06-wf-desc">Generated a 50 × 50 mm concept image based on Arthur Morgan</span></div>
          <div class="w06-workflow-arrow">↓</div>
          <div class="w06-workflow-step"><span class="w06-wf-tool">ChatGPT</span><span class="w06-wf-desc">Simplified the image into a high-contrast, line-based representation suitable for vectorisation</span></div>
          <div class="w06-workflow-arrow">↓</div>
          <div class="w06-workflow-step"><span class="w06-wf-tool">CloudConvert</span><span class="w06-wf-desc">File-format conversion stage</span></div>
          <div class="w06-workflow-arrow">↓</div>
          <div class="w06-workflow-step"><span class="w06-wf-tool">Adobe Illustrator</span><span class="w06-wf-desc">Repaired and refined the vector geometry; patched open edges</span></div>
          <div class="w06-workflow-arrow">↓</div>
          <div class="w06-workflow-step"><span class="w06-wf-tool">RDWorks V8</span><span class="w06-wf-desc">Job preparation: layer assignment, scan + cut setup</span></div>
          <div class="w06-workflow-arrow">↓</div>
          <div class="w06-workflow-step"><span class="w06-wf-tool">CO₂ Laser</span><span class="w06-wf-desc">Physical acrylic fabrication</span></div>
        </div>
        <figure class="w06-figure w06-figure--hero">
          <img src="${assetBase}/01_Monday/03_selected_arthur_design.png" alt="Arthur Morgan simplified to single-colour line artwork ready for vectorisation" loading="lazy">
          <figcaption>Simplified monochrome Arthur design prepared for vector-based fabrication. The important design decision was eliminating colour information and retaining structure as strokes that a laser workflow could interpret.</figcaption>
        </figure>
      </div>
    </div>

    <!-- 6. File Preparation -->
    <div class="w06-section" id="laser-fileprep">
      <div class="w06-section-label">
        <span class="w06-step">06</span>
        <span>File Preparation</span>
      </div>
      <div class="w06-section-body">
        <p>After conversion, the vector required manual cleanup before it was safe to send to the laser cutter. The most critical repair was <strong>open edges</strong> — an open edge can change how a machine interprets a boundary.</p>
        <div class="w06-table-wrap">
          <table class="w06-table">
            <thead><tr><th>Preparation step</th><th>What was done</th></tr></thead>
            <tbody>
              <tr><td>Vector cleaning</td><td>Removed or corrected geometry that could interfere with the final result.</td></tr>
              <tr><td>Scaling</td><td>Prepared the design around the intended 50 × 50 mm size.</td></tr>
              <tr><td>Closed paths</td><td>Repaired open edges so cutting boundaries could be interpreted correctly by the machine.</td></tr>
              <tr><td>Duplicate geometry</td><td>Cleaned unnecessary vector elements before machine setup.</td></tr>
              <tr><td>Final verification</td><td>Inspected the vector again in Illustrator before importing into RDWorks.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 7. Nesting & Layout in RDWorks -->
    <div class="w06-section" id="laser-rdworks">
      <div class="w06-section-label">
        <span class="w06-step">07</span>
        <span>Nesting &amp; Layout in RDWorks</span>
      </div>
      <div class="w06-section-body">
        <p>In RDWorks V8, I imported the DXF, placed the design on the material layout, and separated the fabrication behaviour into cutting and scanning operations using colour-coded layers.</p>
        <div class="w06-table-wrap">
          <table class="w06-table">
            <thead><tr><th>RDWorks layer colour</th><th>Operation</th></tr></thead>
            <tbody>
              <tr><td><span class="w06-layer w06-layer--red">■ Red</span></td><td>Cut — follows the outer boundary through the material</td></tr>
              <tr><td><span class="w06-layer w06-layer--blue">■ Blue</span></td><td>Scan / Engrave — surface detail and internal geometry</td></tr>
            </tbody>
          </table>
        </div>
        <div class="w06-figure-pair">
          <figure class="w06-figure">
            <img src="${assetBase}/01_Monday/05_rdworks_vector_layout.png" alt="RDWorks final vector layout with colour-coded processing paths" loading="lazy">
            <figcaption>Final RDWorks layout showing the vector artwork and colour-coded processing paths ready for fabrication.</figcaption>
          </figure>
          <figure class="w06-figure">
            <img src="${assetBase}/01_Monday/06_rdworks_scan_preview.png" alt="RDWorks preview of the scan/engraving geometry" loading="lazy">
            <figcaption>RDWorks preview of the line-based scan / engraving geometry before the fabrication run.</figcaption>
          </figure>
        </div>
      </div>
    </div>

    <!-- 8. Final Machine Settings -->
    <div class="w06-section" id="laser-settings">
      <div class="w06-section-label">
        <span class="w06-step">08</span>
        <span>Final Machine Settings</span>
      </div>
      <div class="w06-section-body">
        <p>Values that can be recovered from session evidence are recorded here. Where layer-specific numeric entries were not preserved in the available documentation, they are explicitly marked rather than estimated.</p>
        <div class="w06-table-wrap">
          <table class="w06-table">
            <thead><tr><th>Material</th><th>Thickness</th><th>Operation</th><th>Speed</th><th>Min Power</th><th>Max Power</th><th>Passes</th><th>Frequency</th></tr></thead>
            <tbody>
              <tr><td>Acrylic</td><td>2.00 mm</td><td>Cut (Perimeter)</td><td>100.00 mm/s</td><td>30.0%</td><td>30.0%</td><td>1</td><td>20,000 Hz</td></tr>
              <tr><td>Acrylic</td><td>2.00 mm</td><td>Scan (Engrave)</td><td>100.00 mm/s</td><td>30.0%</td><td>30.0%</td><td>1</td><td>20,000 Hz</td></tr>
            </tbody>
          </table>
        </div>
        <figure class="w06-figure">
          <img src="${assetBase}/01_Monday/07_actual_laser_settings.png" alt="Actual laser settings" loading="lazy">
          <figcaption>Actual laser settings showing 100.00 mm/s speed and 30% power for both scan and cut operations.</figcaption>
        </figure>
      </div>
    </div>

    <!-- 9. Cutting Process -->
    <div class="w06-section" id="laser-process">
      <div class="w06-section-label">
        <span class="w06-step">09</span>
        <span>Cutting Process</span>
      </div>
      <div class="w06-section-body">
        <ol class="w06-list">
          <li>Verified the prepared geometry in RDWorks before sending the job.</li>
          <li>Loaded the 2 mm acrylic sheet onto the machine bed.</li>
          <li>Confirmed the RDWorks placement and processing colour assignments.</li>
          <li>Ran the scan / engraving layer (Blue) for surface detail.</li>
          <li>Ran the cut layer (Red) to separate the outer boundary.</li>
          <li>Checked the resulting acrylic piece for quality.</li>
        </ol>
        <div class="w06-figure-pair">
          <figure class="w06-figure">
            <img src="${assetBase}/01_Monday/08_laser_machine_process.png" alt="Observing the 1490 CO2 laser cutter" loading="lazy">
            <figcaption>Observing the 1490 CO₂ laser cutter during operation in the FORGE lab.</figcaption>
          </figure>
          <figure class="w06-figure">
            <img src="${assetBase}/01_Monday/09_laser_cutting_closeup.png" alt="Direct closeup of the laser" loading="lazy">
            <figcaption>Direct closeup of the laser actively processing the acrylic surface.</figcaption>
          </figure>
        </div>
        <div class="w06-pending-slot">
          <span class="w06-pending-icon">▶</span>
          <div>
            <strong>Laser Cutting Process Video</strong><br>
            <a href="https://drive.google.com/file/d/1NFqGuHHW9DXqUykg3XHzzrZwrXTYDvEW/view?usp=sharing" target="_blank" rel="noreferrer" style="color: #c8a97e; text-decoration: underline; text-underline-offset: 3px;">Watch the fabrication video on Google Drive</a>
          </div>
        </div>
      </div>
    </div>

    <!-- 10. Final Result -->
    <div class="w06-section w06-section--results" id="laser-result">
      <div class="w06-section-label">
        <span class="w06-step">10</span>
        <span>Final Result — Hero Shot</span>
      </div>
      <div class="w06-section-body">
        <p>I produced two physical variants from the same digital geometry. The results showed that <strong>material choice is a design decision, not an afterthought</strong>.</p>
        <div class="w06-table-wrap">
          <table class="w06-table">
            <thead><tr><th>Variant</th><th>Material</th><th>Vector state</th><th>Observation</th></tr></thead>
            <tbody>
              <tr><td>01</td><td>Black acrylic</td><td>Before full Illustrator patch</td><td>Open-edge issue caused an unwanted detail in the mouth area.</td></tr>
              <tr><td>02</td><td>Transparent acrylic</td><td>After vector repair</td><td>Cleaner result. Preferred and final outcome. Ambient light through the material adds refinement to the engraved detail.</td></tr>
            </tbody>
          </table>
        </div>
        <div class="w06-results-pair">
          <figure class="w06-figure w06-figure--result">
            <img src="${assetBase}/01_Monday/10_black_acrylic_result.jpeg" alt="Early black acrylic Arthur Morgan — open-edge mouth defect visible" loading="lazy">
            <figcaption>Early black-acrylic result showing the effect of the unresolved open-edge region around the mouth. Made before the Illustrator vector patch was fully applied.</figcaption>
          </figure>
          <figure class="w06-figure w06-figure--result w06-figure--preferred">
            <div class="w06-preferred-badge">Preferred result</div>
            <img src="${assetBase}/01_Monday/11_transparent_acrylic_result.jpeg" alt="Final transparent acrylic result — corrected vector, preferred outcome" loading="lazy">
            <figcaption>Final transparent-acrylic result after repairing the vector geometry. The cleaner line structure produced the preferred outcome. Transparent acrylic allows ambient light to become part of the visual presentation.</figcaption>
          </figure>
        </div>
      </div>
    </div>

    <!-- 11. Problems Faced -->
    <div class="w06-section" id="laser-problems">
      <div class="w06-section-label">
        <span class="w06-step">11</span>
        <span>Problems Faced &amp; Solutions</span>
      </div>
      <div class="w06-section-body">
        <div class="w06-table-wrap">
          <table class="w06-table">
            <thead><tr><th>Problem</th><th>Identified cause</th><th>Solution implemented</th><th>Final outcome</th></tr></thead>
            <tbody>
              <tr><td>Incomplete mouth detail in the first black version</td><td>Open edge in the vector geometry</td><td>Patched the open path in Adobe Illustrator before the next run</td><td>Cleaner result on the transparent acrylic</td></tr>
              <tr><td>Raster image not suitable for direct fabrication</td><td>Original was a multi-tone image rather than machine-ready paths</td><td>Simplified into a line-based, single-colour representation and converted for vector use</td><td>A usable DXF-based fabrication file</td></tr>
              <tr><td>Visual result changed with acrylic finish</td><td>Material appearance affected how engraved detail was perceived</td><td>Produced a second transparent-acrylic variant using corrected geometry</td><td>Transparent version became the preferred result</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 12. Reflection -->
    <div class="w06-section" id="laser-reflection">
      <div class="w06-section-label">
        <span class="w06-step">12</span>
        <span>Reflection</span>
      </div>
      <div class="w06-section-body w06-section-body--reflection">
        <blockquote class="w06-quote">The interesting part was not operating the laser — it was understanding that the digital image had to become machine-readable geometry before the machine could do anything useful with it.</blockquote>
        <p>I learned how image selection, simplification, vector preparation, closed paths, layer assignment, material choice and machine parameters all affect the final physical object. The most useful practical lesson was the open-edge problem: a vector file can look correct on screen and still produce a poor physical result.</p>
        <p>The transparent acrylic result was also an unexpected takeaway. I initially expected the black version to look stronger, but the transparent material produced a cleaner and more interesting final appearance.</p>
        <p>In future, I would spend more time checking vector geometry before the first machine run and record the complete RDWorks parameter panel so that final documentation contains exact layer-by-layer settings.</p>
      </div>
    </div>

    <!-- 13. Source Files -->
    <div class="w06-section" id="laser-files">
      <div class="w06-section-label">
        <span class="w06-step">13</span>
        <span>Source Files</span>
      </div>
      <div class="w06-section-body">
        <div class="w06-files-grid">
          <div class="w06-file-slot w06-file-slot--pending">
            <span class="w06-file-icon">◻</span>
            <div>
              <strong>DXF source file</strong><br>
              <span class="w06-file-status">Awaiting upload — add the actual working DXF from the laser-cutting job before final faculty submission.</span>
            </div>
          </div>
          <div class="w06-file-slot w06-file-slot--pending">
            <span class="w06-file-icon">◻</span>
            <div>
              <strong>Adobe Illustrator AI source file</strong><br>
              <span class="w06-file-status">Awaiting upload — add the actual Illustrator file containing the repaired vector artwork before final faculty submission.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════ TUESDAY ══════════════════════════════ -->
  <section id="tuesday" class="w06-chapter w06-chapter--tuesday">
    <div class="w06-chapter-banner">
      <div class="w06-chapter-rail">
        <span class="w06-chapter-num">02</span>
        <span class="w06-chapter-line"></span>
      </div>
      <div class="w06-chapter-head">
        <span class="w06-eyebrow">Tuesday · 29 September 2026</span>
        <h2>From STL to Batman:<br>A 3D Printing Study</h2>
        <p class="w06-chapter-intro">The second half of the week moved from subtractive laser fabrication to additive manufacturing. I initially explored a functional wallet model, but the printed geometry was not working as intended, so I switched to a Batman 3D model for the actual print study — a model with richer surface detail and a clear way to study how slicer decisions affect a physical print.</p>
      </div>
    </div>

    <!-- 1. Printer Details -->
    <div class="w06-section" id="print-printer">
      <div class="w06-section-label">
        <span class="w06-step">01</span>
        <span>Printer Details</span>
      </div>
      <div class="w06-section-body">
        <p>The printer used was the <strong>Bambu Lab H2S</strong>, a single-nozzle FDM printer.</p>
        <div class="w06-table-wrap">
          <table class="w06-table">
            <thead><tr><th>Specification</th><th>Bambu Lab H2S</th></tr></thead>
            <tbody>
              <tr><td>Make</td><td>Bambu Lab</td></tr>
              <tr><td>Model</td><td>H2S</td></tr>
              <tr><td>Technology</td><td>FDM / FFF</td></tr>
            </tbody>
          </table>
        </div>
        <figure class="w06-figure">
          <img src="${assetBase}/02_Tuesday/01_bambu_h2s.png" alt="Bambu Lab H2S" loading="lazy">
          <figcaption>The Bambu Lab H2S 3D printer used for the additive manufacturing study.</figcaption>
        </figure>
      </div>
    </div>

    <!-- 2. Slicer & Material -->
    <div class="w06-section" id="print-slicer">
      <div class="w06-section-label">
        <span class="w06-step">02</span>
        <span>Slicer &amp; Material</span>
      </div>
      <div class="w06-section-body">
        <div class="w06-kv-grid">
          <div class="w06-kv"><span class="w06-kv-label">Slicer software</span><span class="w06-kv-value">Bambu Studio</span></div>
          <div class="w06-kv"><span class="w06-kv-label">Material</span><span class="w06-kv-value">PLA Basic</span></div>
          <div class="w06-kv"><span class="w06-kv-label">Nozzle</span><span class="w06-kv-value">0.4 mm hardened steel</span></div>
        </div>
        <p>The model was prepared, scaled, oriented and sliced in Bambu Studio before being sent to the printer.</p>
      </div>
    </div>

    <!-- 3. Printer Limits & Capabilities -->
    <div class="w06-section" id="print-limits">
      <div class="w06-section-label">
        <span class="w06-step">03</span>
        <span>Printer Limits &amp; Capabilities</span>
      </div>
      <div class="w06-section-body">
        <div class="w06-two-col">
          <div>
            <h4 class="w06-col-head">Capabilities observed</h4>
            <ul class="w06-list">
              <li>Very high practical print speed and surface-detail reproduction.</li>
              <li>Large build volume relative to many desktop printers.</li>
              <li>Ability to place multiple designs on the build plate in a single job.</li>
              <li>Good dimensional accuracy for the model scale used.</li>
              <li>Multiple speed modes let the operator trade speed against noise and process margin.</li>
            </ul>
          </div>
          <div>
            <h4 class="w06-col-head">Limitations observed</h4>
            <ul class="w06-list">
              <li>At high movement speeds, the printer produced noticeable shaking; stability still depends on the geometry and settings.</li>
              <li>Very high headline speeds are not automatically the best choice for every part.</li>
              <li>The setup used was single-colour, despite four filament positions being available; higher-end systems can offer broader multi-material capability.</li>
            </ul>
          </div>
        </div>
        <h4 class="w06-sub-head">H2S device speed modes</h4>
        <p class="w06-note">These are relative device-level speed multipliers, not the mm/s values used in the Batman slicer profile.</p>
        <div class="w06-table-wrap">
          <table class="w06-table">
            <thead><tr><th>Preset</th><th>Relative speed</th></tr></thead>
            <tbody>
              <tr><td>Silent</td><td>50%</td></tr>
              <tr><td>Normal / Standard</td><td>100%</td></tr>
              <tr><td>Sport</td><td>124%</td></tr>
              <tr><td>Ludicrous</td><td>166%</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 4. Why Cannot Be Made Subtractively -->
    <div class="w06-section" id="print-additive">
      <div class="w06-section-label">
        <span class="w06-step">04</span>
        <span>Why the Object Cannot Be Made Subtractively</span>
      </div>
      <div class="w06-section-body">
        <p>The Batman model is a highly detailed, organic 3D form with curved surfaces, recesses, overhangs and many small features. Machining that shape from a solid block using conventional subtractive methods would require substantial multi-axis machine access, complex workholding, multiple tool changes and extensive material removal — especially around recessed or undercut geometry.</p>
        <p>FDM printing is a better fit for this particular prototype because the printer can build those shapes layer by layer without first removing a large block of material. Additive manufacturing does not require a continuous cutting path to reach every surface; the part is constructed in the order the slicer defines, including internal geometry and overhangs managed by supports.</p>
      </div>
    </div>

    <!-- 5. STL Definition -->
    <div class="w06-section" id="print-stl">
      <div class="w06-section-label">
        <span class="w06-step">05</span>
        <span>STL Definition</span>
      </div>
      <div class="w06-section-body">
        <blockquote class="w06-quote">STL (stereolithography format) represents a 3D object's surface as a collection of triangular facets. The triangles approximate the outer surface of the model, giving the slicer a geometric description it can convert into layers and toolpaths.</blockquote>
        <p>STL became standard in 3D printing because it is simple, widely supported, and focused on describing the printable surface geometry rather than the full design history of the CAD model.</p>
      </div>
    </div>

    <!-- 6. Selected STL File -->
    <div class="w06-section" id="print-model">
      <div class="w06-section-label">
        <span class="w06-step">06</span>
        <span>Selected STL File</span>
      </div>
      <div class="w06-section-body">
        <p>I initially explored printing a functional wallet model, but the printed geometry did not meet the functional outcome I wanted. I therefore switched to a <strong>Batman 3D model</strong> for the actual exercise. The Batman model was a better print-study subject because it contains curved surfaces, fine surface detail, multiple overhangs, cavities and enough geometric variation to expose the effect of support, infill and layer settings.</p>
        <figure class="w06-figure w06-figure--hero">
          <img src="${assetBase}/02_Tuesday/02_batman_slicing_preview.png" alt="Batman model loaded into Bambu Studio showing full model geometry" loading="lazy">
          <figcaption>Batman model loaded into Bambu Studio for slicing and layer inspection. The preview shows the full model geometry before support, infill and process parameters are applied.</figcaption>
        </figure>
      </div>
    </div>

    <!-- 7. Slicer Settings -->
    <div class="w06-section" id="print-settings">
      <div class="w06-section-label">
        <span class="w06-step">07</span>
        <span>Slicer Settings</span>
      </div>
      <div class="w06-section-body">
        <p>The settings extracted directly from the machine-embedded metadata in the 3MF project are recorded below.</p>
        <blockquote class="w06-quote" style="border-color: #d94040; background: rgba(217, 64, 64, 0.06); color: #e8d5b0;"><strong>Data Conflict Notice:</strong> There is a conflict between the recalled parameters and the embedded machine metadata. The user recalled a nozzle temperature of approximately <strong>240 °C</strong> and a <strong>15% Gyroid</strong> infill. However, the exact embedded metadata within the 3MF file indicates <strong>220 °C</strong> and <strong>5% Gyroid</strong> infill. This requires final confirmation before publication, but the embedded data has been recorded below as the current source of truth.</blockquote>
        <div class="w06-table-wrap">
          <table class="w06-table">
            <thead><tr><th>Setting</th><th>3MF Embedded Value</th></tr></thead>
            <tbody>
              <tr><td>Nozzle temperature</td><td>220 °C</td></tr>
              <tr><td>Hot plate temperature</td><td>55 °C</td></tr>
              <tr><td>Layer height</td><td>0.20 mm</td></tr>
              <tr><td>Wall loops</td><td>2</td></tr>
              <tr><td>Sparse infill density</td><td>5%</td></tr>
              <tr><td>Sparse infill pattern</td><td>Gyroid</td></tr>
              <tr><td>Support type</td><td>tree(auto)</td></tr>
              <tr><td>Brim</td><td>auto brim, 5 mm width</td></tr>
              <tr><td>Filament</td><td>Bambu PLA Basic</td></tr>
              <tr><td>Nozzle diameter</td><td>0.40 mm</td></tr>
              <tr><td>Printer profile</td><td>0.20mm Standard @BBL H2S</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 8. Print Time & Material Weight -->
    <div class="w06-section" id="print-time">
      <div class="w06-section-label">
        <span class="w06-step">08</span>
        <span>Print Time &amp; Material Weight</span>
      </div>
      <div class="w06-section-body">
        <p>The following values are <strong>slicer estimates</strong> — not actual measured final values. Actual print weight and duration will be recorded after the physical print is completed.</p>
        <div class="w06-table-wrap">
          <table class="w06-table">
            <thead><tr><th>Measurement</th><th>Slicer-estimated value</th></tr></thead>
            <tbody>
              <tr><td>Model material</td><td>30.81 g · 10.17 m</td></tr>
              <tr><td>Support material</td><td>5.12 g · 1.69 m</td></tr>
              <tr><td><strong>Total material (estimated)</strong></td><td><strong>35.93 g · 11.86 m</strong></td></tr>
              <tr><td>Preparation time</td><td>5 min 25 s</td></tr>
              <tr><td>Model print time</td><td>2 h 3 min 7 s</td></tr>
              <tr><td><strong>Total estimated time</strong></td><td><strong>2 h 8 min 33 s</strong></td></tr>
              <tr><td>Actual material weight</td><td>Pending — final printed-part measurement not yet recorded</td></tr>
              <tr><td>Actual print duration</td><td>Pending — final print record not yet available</td></tr>
            </tbody>
          </table>
        </div>
        <figure class="w06-figure w06-figure--hero">
          <img src="${assetBase}/02_Tuesday/03_slicing_result.png" alt="Bambu Studio slicing result" loading="lazy">
          <figcaption>Bambu Studio slicing result confirming 35.93 g total estimated filament usage (model 30.81 g + support 5.12 g) and a 2 h 8 min 33 s total estimated print time. These are slicer estimates; actual values are pending the physical print.</figcaption>
        </figure>
        <p>The original intention was to keep the print comfortably under 50 g. The slicer forecast of 35.93 g confirmed the selected geometry and settings stayed within that material constraint.</p>
      </div>
    </div>

    <!-- 9. Final Result -->
    <div class="w06-section" id="print-result">
      <div class="w06-section-label">
        <span class="w06-step">09</span>
        <span>Final Result</span>
      </div>
      <div class="w06-section-body">
        <div class="w06-pending-slot w06-pending-slot--large">
          <span class="w06-pending-icon">◻</span>
          <div>
            <strong>Final Batman print photograph — awaiting physical print delivery</strong><br>
            The actual printed Batman result photograph has not yet been supplied. This slot is reserved for the physical print photograph, caption and final weight/duration measurements once the part is received. Do not insert a placeholder image here.
          </div>
        </div>
        <h4 class="w06-sub-head">Interactive 3D Model</h4>
        <p>The digital Batman geometry can be inspected directly in the browser below. Drag to rotate · scroll to zoom.</p>
        <div class="model-record">
          <div class="model-record-head">
            <div>
              <span class="eyebrow">Interactive artefact</span>
              <h3>Buvanesh.glb — Batman 3D model</h3>
            </div>
            <span class="model-hint">Drag · rotate · zoom</span>
          </div>
          <model-viewer src="${assetBase}/02_Tuesday/Buvanesh.glb" alt="Interactive 3D Batman model — drag to rotate, scroll to zoom" camera-controls touch-action="pan-y" shadow-intensity="1" exposure="1" environment-image="neutral"></model-viewer>
        </div>
      </div>
    </div>

    <!-- 10. Source Files -->
    <div class="w06-section" id="print-files">
      <div class="w06-section-label">
        <span class="w06-step">10</span>
        <span>Source Files</span>
      </div>
      <div class="w06-section-body">
        <div class="w06-files-grid">
          <div class="w06-file-slot">
            <span class="w06-file-icon">■</span>
            <div>
              <strong>STL source file</strong><br>
              <span class="w06-file-status"><a href="${assetBase}/02_Tuesday/BUVANESH_Batman.stl" style="color: #c8a97e; text-decoration: underline;">BUVANESH_Batman.stl</a> (External: <a href="https://drive.google.com/file/d/1NR81ogc_nagGP7wbmjDBktRzYfgnlKDq/view?usp=sharing" target="_blank" rel="noreferrer" style="color: #c8a97e; text-decoration: underline;">Drive Backup</a>)</span>
            </div>
          </div>
          <div class="w06-file-slot">
            <span class="w06-file-icon">■</span>
            <div>
              <strong>3MF Printer Project</strong><br>
              <span class="w06-file-status"><a href="${assetBase}/02_Tuesday/Buvanesh_Batman.3mf" style="color: #c8a97e; text-decoration: underline;">Buvanesh_Batman.3mf</a></span>
            </div>
          </div>
          <div class="w06-file-slot">
            <span class="w06-file-icon">■</span>
            <div>
              <strong>G-code / printer file</strong><br>
              <span class="w06-file-status"><a href="${assetBase}/02_Tuesday/Buvanesh_Batman.gcode" style="color: #c8a97e; text-decoration: underline;">Buvanesh_Batman.gcode</a> (External: <a href="https://drive.google.com/file/d/1b_gJIkJ55NmAXMhaRAUyqJ1ReHow2Je9/view?usp=sharing" target="_blank" rel="noreferrer" style="color: #c8a97e; text-decoration: underline;">Drive Backup</a>)</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reflection -->
    <div class="w06-section" id="print-reflection">
      <div class="w06-section-label">
        <span class="w06-step">—</span>
        <span>Reflection</span>
      </div>
      <div class="w06-section-body w06-section-body--reflection">
        <blockquote class="w06-quote">The slicer is effectively the translation layer between a model and the machine: orientation, support, infill, walls, temperature and adhesion all change what the printer can actually produce.</blockquote>
        <p>The 3D-printing exercise made the difference between digital geometry and manufacturable geometry very clear. The strongest practical lesson was that speed is impressive, but <strong>repeatable quality still depends on the constraints of the part</strong>. I could see how the H2S moves extremely quickly, yet the machine also vibrates more noticeably when pushed hard. That balance between capability and process control is something I would pay more attention to in future prints.</p>
      </div>
    </div>

    <!-- References -->
    <div class="w06-section" id="references">
      <div class="w06-section-label">
        <span class="w06-step">—</span>
        <span>References &amp; Credits</span>
      </div>
      <div class="w06-section-body">
        <ul class="w06-refs">
          <li>Bambu Lab, <em>H2S — The Ultimate Single-Nozzle 3D Printer Now Bigger Than Ever</em>, official technical overview: <a href="https://blog.bambulab.com/h2s-the-ultimate-single-nozzle-3d-printer-now-bigger-than-ever/" target="_blank" rel="noreferrer">blog.bambulab.com</a></li>
          <li>Bambu Lab, H2S technical specifications / buying guide: <a href="https://bambulab.com/it/support/buying-guide" target="_blank" rel="noreferrer">bambulab.com</a></li>
          <li>Bambu Studio — slicing and print preparation software.</li>
          <li>Google Gemini — used during the AI-assisted image generation stage for the laser-cutting design.</li>
          <li>ChatGPT — used during the monochrome / stroke-oriented image adaptation stage.</li>
          <li>Adobe Illustrator — used for vector cleanup and open-edge patching.</li>
          <li>CloudConvert — used during the image-to-DXF file-format conversion stage.</li>
          <li>RDWorks V8 — laser job preparation software.</li>
          <li>Batman 3D model — source model used for the physical printing exercise. Exact source to be confirmed and credited.</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Navigation -->
  <nav class="record-nav" aria-label="Previous and next week">
    ${navPrev}
    <a class="archive-home" href="../index.html#waystones"><span class="nav-kicker">Archive</span><strong>20 weeks</strong><em>Return to the full path</em></a>
    ${navNext}
  </nav>
</main>

<footer class="site-footer">
  <span>BUVANESH S. · FORGE — PRICE PROTOSEM</span>
  <a href="../index.html#waystones">Return to the portfolio</a>
</footer>

<script src="./archive.js" defer></script>
</body>
</html>`
}

function main() {
  // Generated output is deliberately kept separate from portfolio-content.
  fs.rmSync(BLOGS_DIR, { recursive: true, force: true })
  fs.mkdirSync(BLOG_ASSETS, { recursive: true })
  fs.rmSync(PUBLIC_ARCHIVE, { recursive: true, force: true })
  fs.mkdirSync(PUBLIC_ASSETS, { recursive: true })
  fs.mkdirSync(path.dirname(GENERATED), { recursive: true })

  writeSharedFiles()

  const contexts = []
  for (let i = 0; i < WEEK_COUNT; i++) contexts.push(collectWeek(i))

  const records = contexts.map((ctx) => ctx.record)

  for (const ctx of contexts) {
    const filename = `Week_${String(ctx.record.n).padStart(2, '0')}.html`
    const html = ctx.record.n === 6 ? week06PageHtml(ctx, records) : pageHtml(ctx, records)
    fs.writeFileSync(path.join(BLOGS_DIR, filename), html)
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    source: 'portfolio-content',
    architecture: 'Obsidian → GitHub → GitHub Actions → generated standalone HTML dossiers',
    weeks: records,
  }

  fs.writeFileSync(path.join(BLOGS_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2))

  const generatedTs = `/* Auto-generated by scripts/build-templates.js. Do not edit manually. */\nexport const archiveWeeks = ${JSON.stringify(records, null, 2)} as const\n\nexport type ArchiveWeek = (typeof archiveWeeks)[number]\n`
  fs.writeFileSync(GENERATED, generatedTs)

  const issueLines = contexts.flatMap((ctx) => ctx.missingMedia.map((name) => `${ctx.record.sourceWeek}: ${name}`))
  console.log(`Generated ${records.length} standalone week pages.`)
  console.log(`Published records: ${records.filter((r) => r.hasContent).length}`)
  console.log(`Copied visual assets: ${records.reduce((sum, r) => sum + r.imageCount, 0)}`)
  if (issueLines.length) {
    console.warn(`Unresolved media references: ${issueLines.length}`)
    for (const line of issueLines.slice(0, 30)) console.warn(` - ${line}`)
  }
}

main()
