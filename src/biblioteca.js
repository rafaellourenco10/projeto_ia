// Categorias da biblioteca (rótulo e ícone dos chips) e filtro/ordenação dos clipes.
import { esc } from './util.js'
import clipes from './data/clips.json'

export const CATEGORIAS = {
  danca: { nome: 'Dança', icone: 'graphic_eq' },
  aventura: { nome: 'Aventura', icone: 'explore' },
  viagem: { nome: 'Viagem', icone: 'flight' },
  esportes: { nome: 'Esportes', icone: 'sports_motorsports' },
  filme: { nome: 'Filme', icone: 'theaters' },
  engracado: { nome: 'Engraçado', icone: 'mood' },
  romantico: { nome: 'Romântico', icone: 'favorite' },
}

// Minúsculas e sem acento, para "danca" achar "Dança".
const normalizar = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

const ORDENS = {
  populares: (a, b) => b.popularidade - a.popularidade,
  recentes: (a, b) => b.criadoEm.localeCompare(a.criadoEm),
  custo: (a, b) => a.custo - b.custo || b.popularidade - a.popularidade,
}

export function filtrarClipes(clipes, { q = '', categoria = null, ordem = 'populares', ids = null } = {}) {
  const termo = normalizar(q)
  return clipes
    .filter((c) => !ids || ids.includes(c.id))
    .filter((c) => !categoria || c.categoria === categoria)
    .filter((c) => !termo || normalizar(`${c.titulo} ${c.genero} ${CATEGORIAS[c.categoria]?.nome}`).includes(termo))
    .sort(ORDENS[ordem] ?? ORDENS.populares)
}

// Os 3 clipes mais recentes ganham o selo "Novo".
export const novos = (lista) => filtrarClipes(lista, { ordem: 'recentes' }).slice(0, 3).map((c) => c.id)
const NOVOS = novos(clipes)
export const ehNovo = (c) => NOVOS.includes(c.id)
export const SELO_NOVO = '<span class="px-2 py-0.5 rounded-md bg-tertiary-container text-on-tertiary-container font-label-sm text-label-sm shadow-md">Novo</span>'

// Card 9:16 compacto, usado em "semelhantes", "recomendados" e "Em alta".
export const miniCard = (c) => `<a href="/clipe?id=${encodeURIComponent(c.id)}" class="group relative rounded-2xl overflow-hidden bg-surface-container-low shadow-lg md:hover:shadow-[0_12px_40px_-10px_rgba(139,92,246,0.35)] transition-all duration-300 flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
  <div class="relative w-full aspect-[9/16] overflow-hidden bg-surface-container-lowest">
    <img alt="" loading="lazy" src="${c.img}" class="w-full h-full object-cover transition-all duration-500 md:group-hover:scale-105 md:group-hover:brightness-110"/>
    <div class="absolute inset-0 bg-gradient-to-t from-scrim via-scrim/30 to-transparent"></div>
    ${ehNovo(c) ? `<span class="absolute top-2.5 left-2.5">${SELO_NOVO}</span>` : ''}
    <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-secondary font-label-sm text-label-sm flex items-center gap-1 whitespace-nowrap shadow-md">
      <span class="material-symbols-outlined text-xs" aria-hidden="true">bolt</span>${c.custo}<span class="sr-only sm:not-sr-only"> créditos</span>
    </span>
    <div class="absolute bottom-0 inset-x-0 p-space-sm flex flex-col gap-1">
      <span class="font-label-md text-label-md text-white line-clamp-1 md:group-hover:text-primary-fixed-dim transition-colors">${esc(c.titulo)}</span>
      <span class="text-white/70 font-label-sm text-label-sm">${esc(c.genero)} • ${c.duracaoSeg} s</span>
    </div>
  </div>
</a>`
