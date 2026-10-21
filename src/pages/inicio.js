import '../main.css'
import { montarShell } from '../shell.js'
import { esc, param } from '../util.js'
import { CATEGORIAS, filtrarClipes } from '../biblioteca.js'
import clipes from '../data/clips.json'

montarShell({ rota: 'inicio' })
// A página tem a própria busca; a do header ficaria duplicada aqui.
document.querySelector('header [role="search"]')?.remove()

const $ = (id) => document.getElementById(id)
const busca = $('clip-search')
const ordem = $('ordem')
let categoria = null

const ATIVO = ['bg-primary-container', 'text-on-primary-container', 'shadow-[0_0_16px_rgba(160,120,255,0.35)]']
const INATIVO = ['bg-surface-container-high/70', 'text-on-surface-variant', 'hover:text-on-surface', 'hover:bg-surface-container-highest']

const chips = [[null, { nome: 'Todos', icone: 'auto_awesome' }], ...Object.entries(CATEGORIAS)]
$('chips').innerHTML = chips
  .map(
    ([id, c]) => `<button type="button" data-categoria="${id ?? ''}" class="flex items-center gap-1.5 px-space-md py-2 rounded-full font-label-md text-label-md whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
  <span class="material-symbols-outlined text-sm" aria-hidden="true">${c.icone}</span>${c.nome}</button>`,
  )
  .join('')

const duracao = (s) => `00:${String(s).padStart(2, '0')}`

function card(c) {
  return `<a href="/clipe?id=${encodeURIComponent(c.id)}" class="group relative flex flex-col rounded-2xl bg-surface-container-low/70 overflow-hidden shadow-lg md:hover:shadow-[0_12px_36px_rgba(160,120,255,0.25)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
  <div class="relative w-full aspect-[9/16] overflow-hidden bg-surface-container-lowest">
    <img alt="" loading="lazy" src="${c.img}" class="w-full h-full object-cover transition-all duration-500 md:group-hover:scale-105 md:group-hover:brightness-110"/>
    <div class="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/30 to-black/40 pointer-events-none"></div>
    <div class="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1 z-10">
      ${c.popularidade >= 90 ? '<span class="px-2 py-0.5 rounded-md bg-gradient-to-r from-secondary-container to-primary-container text-white font-label-sm text-label-sm shadow-md">Popular</span>' : '<span></span>'}
      <span class="px-2 py-0.5 rounded-full bg-surface-container-lowest/85 backdrop-blur-md text-secondary font-label-sm text-label-sm flex items-center gap-1 whitespace-nowrap shadow-md">
        <span class="material-symbols-outlined text-xs" aria-hidden="true" style="font-variation-settings: 'FILL' 1;">star</span>${c.custo}<span class="sr-only sm:not-sr-only"> créditos</span>
      </span>
    </div>
    <span class="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-lowest/80 backdrop-blur-md text-on-surface font-label-sm text-label-sm">
      <span class="material-symbols-outlined text-xs" aria-hidden="true">timer</span><span class="sr-only">Duração</span>${duracao(c.duracaoSeg)}
    </span>
  </div>
  <div class="p-space-sm flex flex-col gap-1.5 flex-1 justify-between">
    <div>
      <span class="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">${esc(c.genero)}</span>
      <h3 class="font-label-lg text-label-lg text-on-surface truncate mt-0.5">${esc(c.titulo)}</h3>
    </div>
    <span class="w-full py-2 rounded-xl bg-surface-container-high md:group-hover:bg-primary-container md:group-hover:text-on-primary-container text-on-surface font-label-md text-label-md transition-all flex items-center justify-center gap-1 shadow-sm">
      <span class="material-symbols-outlined text-base" aria-hidden="true">face</span>Estrelar este clipe
    </span>
  </div>
</a>`
}

const destaque = clipes.find((c) => c.destaque) ?? clipes[0]
$('destaque').innerHTML = `
<img alt="" src="${destaque.img}" class="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity"/>
<div class="absolute inset-0 bg-gradient-to-r from-surface-container-lowest via-surface-container-lowest/80 to-transparent"></div>
<div class="relative z-10 p-space-md md:p-space-xl flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
  <div class="flex flex-col gap-space-xs max-w-2xl">
    <div class="inline-flex items-center gap-space-xs w-max px-space-sm py-1 rounded-full bg-secondary-container/80 text-on-secondary-container backdrop-blur-md shadow-[0_0_16px_rgba(170,2,102,0.5)]">
      <span class="material-symbols-outlined text-xs" aria-hidden="true">local_fire_department</span>
      <span class="font-label-sm text-label-sm uppercase tracking-wide">Novidade da semana</span>
    </div>
    <h2 class="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg text-on-surface tracking-tight mt-1">${esc(destaque.titulo)}</h2>
    <p class="font-body-md text-body-md text-on-surface-variant">Seja o protagonista desta cena de ${esc(destaque.genero.toLowerCase())}. Envie sua foto e receba o clipe com o seu rosto.</p>
    <div class="flex items-center gap-space-md mt-space-sm">
      <span class="flex items-center gap-1 font-label-sm text-label-sm text-tertiary"><span class="material-symbols-outlined text-base" aria-hidden="true">hd</span>HD</span>
      <span class="text-outline text-xs" aria-hidden="true">•</span>
      <span class="flex items-center gap-1 font-label-sm text-label-sm text-secondary"><span class="material-symbols-outlined text-base" aria-hidden="true">bolt</span>${destaque.custo} créditos</span>
    </div>
  </div>
  <div class="flex items-center gap-space-sm flex-shrink-0">
    <a href="/clipe?id=${encodeURIComponent(destaque.id)}" class="px-space-lg py-3.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-white font-label-lg text-label-lg shadow-[0_0_28px_rgba(160,120,255,0.45)] hover:shadow-[0_0_36px_rgba(255,176,205,0.6)] hover:scale-[1.02] transition-all flex items-center gap-space-sm">
      <span class="material-symbols-outlined text-xl" aria-hidden="true">star</span><span>Estrelar este clipe</span>
    </a>
  </div>
</div>`

function render() {
  const lista = filtrarClipes(clipes, { q: busca.value, categoria, ordem: ordem.value })
  $('grade').innerHTML = lista.map(card).join('')
  $('grade').hidden = !lista.length
  $('vazio').hidden = !!lista.length
  $('contagem').textContent = `${lista.length} ${lista.length === 1 ? 'clipe' : 'clipes'}`
  for (const b of $('chips').children) {
    const ativo = (b.dataset.categoria || null) === categoria
    b.setAttribute('aria-pressed', ativo)
    b.classList.remove(...(ativo ? INATIVO : ATIVO))
    b.classList.add(...(ativo ? ATIVO : INATIVO))
  }
}

$('chips').addEventListener('click', (e) => {
  const b = e.target.closest('button')
  if (!b) return
  categoria = b.dataset.categoria || null
  render()
})
busca.addEventListener('input', render)
ordem.addEventListener('change', render)
$('limpar').addEventListener('click', () => {
  busca.value = ''
  categoria = null
  render()
  busca.focus()
})

if (/Mac|iPhone|iPad/.test(navigator.platform)) document.querySelector('[data-tecla-mod]').textContent = '⌘'
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    busca.focus()
    busca.select()
  }
})

busca.value = param('q') ?? ''
render()
