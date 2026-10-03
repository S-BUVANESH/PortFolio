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

function writeSharedFiles() {
  fs.mkdirSync(BLOGS_DIR, { recursive: true })
  fs.writeFileSync(path.join(BLOGS_DIR, 'archive.css'), BLOG_CSS)
  fs.writeFileSync(path.join(BLOGS_DIR, 'archive.js'), BLOG_JS)
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
    fs.writeFileSync(path.join(BLOGS_DIR, filename), pageHtml(ctx, records))
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
