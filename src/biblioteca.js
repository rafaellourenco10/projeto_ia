// Categorias da biblioteca (rótulo e ícone dos chips) e filtro/ordenação dos clipes.
import { esc } from './util.js'

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

export function filtrarClipes(clipes, { q = '', categoria = null, ordem = 'populares' } = {}) {
  const termo = normalizar(q)
  return clipes
    .filter((c) => !categoria || c.categoria === categoria)
    .filter((c) => !termo || normalizar(`${c.titulo} ${c.genero} ${CATEGORIAS[c.categoria]?.nome}`).includes(termo))
    .sort(ORDENS[ordem] ?? ORDENS.populares)
}

// Card 9:16 compacto, usado em "semelhantes" e "recomendados".
export const miniCard = (c) => `<a href="/clipe?id=${encodeURIComponent(c.id)}" class="group relative rounded-2xl overflow-hidden bg-surface-container-low shadow-lg md:hover:shadow-[0_12px_40px_-10px_rgba(139,92,246,0.35)] transition-all duration-300 flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
  <div class="relative w-full aspect-[9/16] overflow-hidden bg-surface-container-lowest">
    <img alt="" loading="lazy" src="${c.img}" class="w-full h-full object-cover transition-all duration-500 md:group-hover:scale-105 md:group-hover:brightness-110"/>
    <div class="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/30 to-transparent"></div>
    <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-secondary font-label-sm text-label-sm flex items-center gap-1 whitespace-nowrap shadow-md">
      <span class="material-symbols-outlined text-xs" aria-hidden="true">bolt</span>${c.custo}<span class="sr-only sm:not-sr-only"> créditos</span>
    </span>
    <div class="absolute bottom-0 inset-x-0 p-space-sm flex flex-col gap-1">
      <span class="font-label-md text-label-md text-on-surface line-clamp-1 md:group-hover:text-primary transition-colors">${esc(c.titulo)}</span>
      <span class="text-outline font-label-sm text-label-sm">${esc(c.genero)} • ${c.duracaoSeg} s</span>
    </div>
  </div>
</a>`
