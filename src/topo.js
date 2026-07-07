/**
 * Generates dynamic topographical contour lines on a canvas.
 * Uses 2D Perlin-style noise to create elevation data,
 * then traces iso-lines via marching squares.
 */

function noise2D() {
  const perm = new Uint8Array(512)
  const grad = [
    [1, 1], [-1, 1], [1, -1], [-1, -1],
    [1, 0], [-1, 0], [0, 1], [0, -1],
  ]
  for (let i = 0; i < 256; i++) perm[i] = i
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[perm[i], perm[j]] = [perm[j], perm[i]]
  }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i]

  function dot(gi, x, y) {
    const g = grad[gi % 8]
    return g[0] * x + g[1] * y
  }

  function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  function lerp(a, b, t) {
    return a + t * (b - a)
  }

  return function (x, y) {
    const xi = Math.floor(x) & 255
    const yi = Math.floor(y) & 255
    const xf = x - Math.floor(x)
    const yf = y - Math.floor(y)
    const u = fade(xf)
    const v = fade(yf)
    const aa = perm[perm[xi] + yi]
    const ab = perm[perm[xi] + yi + 1]
    const ba = perm[perm[xi + 1] + yi]
    const bb = perm[perm[xi + 1] + yi + 1]
    return lerp(
      lerp(dot(aa, xf, yf), dot(ba, xf - 1, yf), u),
      lerp(dot(ab, xf, yf - 1), dot(bb, xf - 1, yf - 1), u),
      v
    )
  }
}

function fbm(noiseFn, x, y, octaves) {
  let val = 0
  let amp = 1
  let freq = 1
  let max = 0
  for (let i = 0; i < octaves; i++) {
    val += noiseFn(x * freq, y * freq) * amp
    max += amp
    amp *= 0.5
    freq *= 2
  }
  return val / max
}

const SCALE = 0.003
const LEVELS = 20
const STEP = 4

function generateField(w, h) {
  const noiseFn = noise2D()
  const cols = Math.ceil(w / STEP) + 1
  const rows = Math.ceil(h / STEP) + 1
  const field = new Float32Array(cols * rows)

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      field[j * cols + i] = fbm(noiseFn, i * STEP * SCALE, j * STEP * SCALE, 4)
    }
  }

  let min = Infinity, max = -Infinity
  for (let k = 0; k < field.length; k++) {
    if (field[k] < min) min = field[k]
    if (field[k] > max) max = field[k]
  }

  return { field, cols, rows, min, max }
}

function traceContours(ctx, { field, cols, rows, min, max }) {
  for (let l = 1; l < LEVELS; l++) {
    const threshold = min + (max - min) * (l / LEVELS)
    ctx.beginPath()

    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const tl = field[j * cols + i]
        const tr = field[j * cols + i + 1]
        const br = field[(j + 1) * cols + i + 1]
        const bl = field[(j + 1) * cols + i]

        const idx =
          (tl >= threshold ? 8 : 0) |
          (tr >= threshold ? 4 : 0) |
          (br >= threshold ? 2 : 0) |
          (bl >= threshold ? 1 : 0)

        if (idx === 0 || idx === 15) continue

        const x = i * STEP
        const y = j * STEP

        const interpTop = (threshold - tl) / (tr - tl)
        const interpRight = (threshold - tr) / (br - tr)
        const interpBottom = (threshold - bl) / (br - bl)
        const interpLeft = (threshold - tl) / (bl - tl)

        const top = [x + interpTop * STEP, y]
        const right = [x + STEP, y + interpRight * STEP]
        const bottom = [x + interpBottom * STEP, y + STEP]
        const left = [x, y + interpLeft * STEP]

        const segments = []
        switch (idx) {
          case 1: case 14: segments.push([left, bottom]); break
          case 2: case 13: segments.push([bottom, right]); break
          case 3: case 12: segments.push([left, right]); break
          case 4: case 11: segments.push([top, right]); break
          case 5: segments.push([left, top], [bottom, right]); break
          case 6: case 9: segments.push([top, bottom]); break
          case 7: case 8: segments.push([left, top]); break
          case 10: segments.push([top, right], [left, bottom]); break
        }

        for (const [a, b] of segments) {
          ctx.moveTo(a[0], a[1])
          ctx.lineTo(b[0], b[1])
        }
      }
    }

    ctx.stroke()
  }
}

// Shared field data so background and text use the same lines
let currentField = null

export function drawTopography(canvas) {
  const dpr = window.devicePixelRatio || 1
  const w = window.innerWidth
  const h = window.innerHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  canvas.style.width = w + 'px'
  canvas.style.height = h + 'px'

  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, w, h)

  currentField = generateField(w, h)

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.06)'
  ctx.lineWidth = 0.8
  traceContours(ctx, currentField)
}

let goldBaseCanvas = null

export function getGoldFoilDataUrl() {
  if (!currentField) return null

  const dpr = window.devicePixelRatio || 1
  const w = window.innerWidth
  const h = window.innerHeight

  if (!goldBaseCanvas) {
    goldBaseCanvas = document.createElement('canvas')
  }
  goldBaseCanvas.width = w * dpr
  goldBaseCanvas.height = h * dpr

  const ctx = goldBaseCanvas.getContext('2d')
  ctx.scale(dpr, dpr)

  const gradient = ctx.createLinearGradient(0, 0, w, 0)
  gradient.addColorStop(0, '#c9a84c')
  gradient.addColorStop(0.3, '#e8d48b')
  gradient.addColorStop(0.5, '#f5e6a3')
  gradient.addColorStop(0.7, '#e8d48b')
  gradient.addColorStop(1, '#b8943e')
  ctx.strokeStyle = gradient
  ctx.lineWidth = 1.5
  traceContours(ctx, currentField)

  return { url: goldBaseCanvas.toDataURL(), w, h }
}

let shimmerW = 0
let shimmerH = 0

export function drawShimmerFrame(canvas, textEl, shimmerOffset) {
  if (!goldBaseCanvas) return

  const dpr = window.devicePixelRatio || 1
  const w = textEl.offsetWidth
  const h = textEl.offsetHeight

  // Only resize canvas when dimensions change
  if (shimmerW !== w || shimmerH !== h) {
    canvas.width = w * dpr
    canvas.height = h * dpr
    shimmerW = w
    shimmerH = h
  }

  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.globalCompositeOperation = 'source-over'
  ctx.clearRect(0, 0, w, h)

  // Draw gold lines offset to match page position
  ctx.drawImage(
    goldBaseCanvas,
    textEl.offsetLeft * dpr, textEl.offsetTop * dpr,
    w * dpr, h * dpr,
    0, 0, w, h
  )

  // Composite shimmer only on existing line pixels
  ctx.globalCompositeOperation = 'source-atop'
  const shimmerX = shimmerOffset * w
  const shimmerWidth = w * 0.2
  const shine = ctx.createLinearGradient(
    shimmerX - shimmerWidth, 0,
    shimmerX + shimmerWidth, 0
  )
  shine.addColorStop(0, 'transparent')
  shine.addColorStop(0.3, 'rgba(255, 245, 200, 0.7)')
  shine.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)')
  shine.addColorStop(0.7, 'rgba(255, 245, 200, 0.7)')
  shine.addColorStop(1, 'transparent')
  ctx.fillStyle = shine
  ctx.fillRect(0, 0, w, h)

  // Clip to text shape using destination-in
  ctx.globalCompositeOperation = 'destination-in'
  const style = window.getComputedStyle(textEl)
  ctx.font = `${style.fontSize} ${style.fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#000'
  ctx.fillText(textEl.getAttribute('data-text'), w / 2, h / 2)
}
