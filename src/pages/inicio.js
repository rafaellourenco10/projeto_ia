import '../main.css'
import { montarShell } from '../shell.js'
import * as store from '../store.js'
import { esc, param, avisar, MSG_SEM_ESPACO } from '../util.js'
import { CUSTOS } from '../creditos.js'
import { CATEGORIAS, filtrarClipes, miniCard, ehNovo, SELO_NOVO, SELO_DUPLA } from '../biblioteca.js'
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

const FAV = '__favoritos'
const chips = [[FAV, { nome: 'Favoritos', icone: 'favorite' }], [null, { nome: 'Todos', icone: 'auto_awesome' }], ...Object.entries(CATEGORIAS)]
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
    <div class="absolute inset-0 bg-gradient-to-t from-scrim via-scrim/30 to-black/40 pointer-events-none"></div>
    <div class="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1 z-10">
      ${ehNovo(c) ? SELO_NOVO : c.popularidade >= 90 ? '<span class="px-2 py-0.5 rounded-md bg-gradient-to-r from-secondary-container to-primary-container text-on-primary-container dark:text-white font-label-sm text-label-sm shadow-md">Popular</span>' : '<span></span>'}
      <span class="px-2 py-0.5 rounded-full bg-surface-container-lowest/85 backdrop-blur-md text-secondary font-label-sm text-label-sm flex items-center gap-1 whitespace-nowrap shadow-md">
        <span class="material-symbols-outlined text-xs" aria-hidden="true" style="font-variation-settings: 'FILL' 1;">star</span>${c.custo}<span class="sr-only sm:not-sr-only"> créditos</span>
      </span>
    </div>
    <span class="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-lowest/80 backdrop-blur-md text-on-surface font-label-sm text-label-sm">
      <span class="material-symbols-outlined text-xs" aria-hidden="true">timer</span><span class="sr-only">Duração</span>${duracao(c.duracaoSeg)}
    </span>
    ${c.pessoas === 2 ? `<span class="absolute bottom-2.5 right-2.5 z-10">${SELO_DUPLA}</span>` : ''}
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
<div class="absolute inset-0 bg-gradient-to-r from-scrim via-scrim/80 to-transparent"></div>
<div class="relative z-10 p-space-md md:p-space-xl flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
  <div class="flex flex-col gap-space-xs max-w-2xl">
    <div class="inline-flex items-center gap-space-xs w-max px-space-sm py-1 rounded-full bg-secondary-container/80 text-on-secondary-container backdrop-blur-md shadow-[0_0_16px_rgba(170,2,102,0.5)]">
      <span class="material-symbols-outlined text-xs" aria-hidden="true">local_fire_department</span>
      <span class="font-label-sm text-label-sm uppercase tracking-wide">Novidade da semana</span>
    </div>
    <h2 class="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg text-white tracking-tight mt-1">${esc(destaque.titulo)}</h2>
    <p class="font-body-md text-body-md text-white/80">Seja o protagonista desta cena de ${esc(destaque.genero.toLowerCase())}. Envie sua foto e receba o clipe com o seu rosto.</p>
    <div class="flex items-center gap-space-md mt-space-sm">
      <span class="flex items-center gap-1 font-label-sm text-label-sm text-tertiary-fixed-dim"><span class="material-symbols-outlined text-base" aria-hidden="true">hd</span>HD</span>
      <span class="text-white/50 text-xs" aria-hidden="true">•</span>
      <span class="flex items-center gap-1 font-label-sm text-label-sm text-secondary-fixed-dim"><span class="material-symbols-outlined text-base" aria-hidden="true">bolt</span>${destaque.custo} créditos</span>
    </div>
  </div>
  <div class="flex items-center gap-space-sm flex-shrink-0">
    <a href="/clipe?id=${encodeURIComponent(destaque.id)}" class="px-space-lg py-3.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container dark:text-white font-label-lg text-label-lg shadow-[0_0_28px_rgba(160,120,255,0.45)] hover:shadow-[0_0_36px_rgba(255,176,205,0.6)] hover:scale-[1.02] transition-all flex items-center gap-space-sm">
      <span class="material-symbols-outlined text-xl" aria-hidden="true">star</span><span>Estrelar este clipe</span>
    </a>
  </div>
</div>`

$('em-alta-lista').innerHTML = filtrarClipes(clipes)
  .slice(0, 6)
  .map((c) => `<div class="w-36 md:w-44 shrink-0">${miniCard(c)}</div>`)
  .join('')

// Dia N de 7 da sequência; o 7º dia vale o bônus da semana.
const bonus = store.proximoBonus(store.getEstado())
const diaSemana = ((bonus.sequencia - 1) % 7) + 1
document.querySelector('[data-bonus-diario]').textContent = bonus.creditos
$('bonus-dia').textContent = `Dia ${diaSemana} de 7 · ${diaSemana === 7 ? 'hoje vale' : 'o 7º dia vale'} +${CUSTOS.bonusSemana}`
$('bonus-bolinhas').innerHTML = Array.from({ length: 7 }, (_, i) => `<span class="w-2 h-2 rounded-full ${i < diaSemana ? 'bg-secondary' : 'bg-outline-variant'}"></span>`).join('')
$('bonus').hidden = !store.bonusDiarioDisponivel()
$('btn-bonus').addEventListener('click', () => {
  if (!store.pegarBonusDiario()) return avisar(store.bonusDiarioDisponivel() ? MSG_SEM_ESPACO : 'Você já pegou os créditos de hoje')
  $('bonus').hidden = true
  avisar(`+${bonus.creditos} créditos no seu saldo`)
})

let gradeHtml = null

function render() {
  const fav = categoria === FAV
  const lista = filtrarClipes(clipes, { q: busca.value, categoria: fav ? null : categoria, ordem: ordem.value, ids: fav ? store.getFavoritos() : null })
  const semFavoritos = fav && !store.getFavoritos().length
  $('destaque').hidden = fav // em Favoritos só aparece a lista do usuário; um destaque favorito já está na grade
  $('em-alta').hidden = !!(categoria || busca.value.trim())
  $('vazio-titulo').textContent = semFavoritos ? 'Nenhum favorito ainda' : 'Nenhum clipe encontrado'
  $('vazio-texto').textContent = semFavoritos ? 'Você ainda não favoritou nenhum clipe. Toque no coração na página do clipe.' : 'Tente outra palavra ou outra categoria.'
  $('vazio-icone').textContent = semFavoritos ? 'favorite' : 'search_off'
  $('limpar-texto').textContent = semFavoritos ? 'Ver todos os clipes' : 'Limpar filtros'
  const html = lista.map(card).join('')
  // Trocar o HTML tira o foco do card; só troca quando a grade mudou de fato.
  if (html !== gradeHtml) $('grade').innerHTML = gradeHtml = html
  $('grade').hidden = !lista.length
  $('vazio').hidden = !!lista.length
  $('contagem').textContent = `${lista.length} ${lista.length === 1 ? 'clipe' : 'clipes'}`
  for (const b of $('chips').children) {
    const ativo = (b.dataset.categoria === '' ? null : b.dataset.categoria) === categoria
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
store.onChange(render)
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
