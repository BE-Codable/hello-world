import './style.css'
import { drawTopography } from './topo.js'

const bgCanvas = document.getElementById('topo-bg')

// i18n
const translations = {
  nl: {
    listUrl: 'https://gift.micmacminuscule.be/nl/54JGEGP',
    listTitle: 'Geboortelijst',
    listText: 'We legden voor Estée een duurzame geboortelijst aan met herbruikte, faire én hippe kinderspullen bij Mic Mac Minuscule.',
    listBtn: 'Ontdek haar lijstje',
    giftTitle: 'Bijdrage',
    giftText: 'Wil je liever iets anders geven? Dan plezier je ons altijd met een aankoopbon bij <a href="https://www.asadventure.com" target="_blank" rel="noopener" class="card-inline-link">AS Adventure</a>, <a href="https://www.kudzu.be" target="_blank" rel="noopener" class="card-inline-link">Kudzu</a> of een <a href="https://www.visitmechelen.be/shoppen/mechelenbon" target="_blank" rel="noopener" class="card-inline-link">Mechelenbon</a> (waarmee we in verschillende Mechelse handelszaken terecht kunnen) voor spulletjes die we in de toekomst voor haar zullen kunnen gebruiken.',
    ibanText: 'Een centje storten op haar pamperrekening mag natuurlijk ook.',
    ibanName: 'op naam van Andries-Seynhaeve',
    copied: 'Gekopieerd!',
    copyAria: 'Kopieer IBAN',
    ogDescription: 'Estée Seynhaeve — geboren op 18 september 2026. Bekijk haar geboortelijst bij Mic Mac Minuscule of doe een bijdrage.',
  },
  fr: {
    listUrl: 'https://gift.micmacminuscule.be/fr/54JGEGP',
    listTitle: 'Liste de naissance',
    listText: 'Nous avons créé une liste de naissance durable pour Estée, avec des produits réutilisés, éthiques et tendance chez Mic Mac Minuscule.',
    listBtn: 'Découvrir sa liste',
    giftTitle: 'Contribution',
    giftText: 'Vous préférez lui offrir autre chose ? Dans ce cas, un bon d\'achat chez <a href="https://www.asadventure.com" target="_blank" rel="noopener" class="card-inline-link">AS&nbsp;Adventure</a>, <a href="https://www.kudzu.be" target="_blank" rel="noopener" class="card-inline-link">Kudzu</a> ou un <a href="https://www.visitmechelen.be/shoppen/mechelenbon" target="_blank" rel="noopener" class="card-inline-link">Mechelenbon</a> nous fera toujours plaisir (le Mechelenbon peut être utilisé dans différents commerces de Malines). Les bons d\'achat nous permettront d\'acheter, à l\'avenir, des choses dont Estée pourra profiter.',
    ibanText: 'Vous pouvez également, bien sûr, verser une petite somme sur son compte.',
    ibanName: 'au nom de Andries-Seynhaeve',
    copied: 'Copié !',
    copyAria: 'Copier l\'IBAN',
    ogDescription: 'Estée Seynhaeve — née le 18 septembre 2026. Découvrez sa liste de naissance chez Mic Mac Minuscule ou faites une contribution.',
  },
}

function detectLang() {
  const saved = localStorage.getItem('lang')
  if (saved && translations[saved]) return saved
  const browser = (navigator.language || '').slice(0, 2).toLowerCase()
  return browser === 'fr' ? 'fr' : 'nl'
}

function applyLang(lang) {
  const t = translations[lang]
  document.documentElement.lang = lang
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n')
    if (t[key] !== undefined) el.innerHTML = t[key]
  })
  document.querySelectorAll('[data-i18n-href]').forEach(el => {
    const key = el.getAttribute('data-i18n-href')
    if (t[key] !== undefined) el.setAttribute('href', t[key])
  })
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria')
    if (t[key] !== undefined) el.setAttribute('aria-label', t[key])
  })
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('lang-btn--active', btn.dataset.lang === lang)
  })
  if (t.ogDescription) {
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.ogDescription)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', t.ogDescription)
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', t.ogDescription)
  }
  document.querySelector('meta[property="og:locale"]')?.setAttribute('content', lang === 'fr' ? 'fr_BE' : 'nl_BE')
  localStorage.setItem('lang', lang)
}

const currentLang = detectLang()
applyLang(currentLang)

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => applyLang(btn.dataset.lang))
})

// Copy IBAN to clipboard
const copyBtn = document.querySelector('.copy-btn')
const copyFeedback = document.querySelector('.copy-feedback')
const cardIban = document.querySelector('.card-iban')

function showCopiedFeedback() {
  copyBtn.classList.add('copied')
  copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>'
  if (copyFeedback) copyFeedback.classList.add('visible')
  if (cardIban) cardIban.classList.add('copied')
  setTimeout(() => {
    copyBtn.classList.remove('copied')
    copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
    if (copyFeedback) copyFeedback.classList.remove('visible')
    if (cardIban) cardIban.classList.remove('copied')
  }, 2000)
}

if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    const iban = document.querySelector('.iban-text').textContent.trim()
    if (navigator.clipboard) {
      navigator.clipboard.writeText(iban).then(showCopiedFeedback).catch(() => {
        // fallback for insecure context
        const ta = document.createElement('textarea')
        ta.value = iban
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        showCopiedFeedback()
      })
    } else {
      const ta = document.createElement('textarea')
      ta.value = iban
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      showCopiedFeedback()
    }
  })
}

function render() {
  drawTopography(bgCanvas)
}

let resizeTimer = null
let lastW = window.innerWidth
function onResize() {
  const w = window.innerWidth
  if (w === lastW) return
  lastW = w
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(render, 150)
}

render()
window.addEventListener('resize', onResize)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', render)
