// Categorias da biblioteca (rótulo e ícone dos chips) e filtro/ordenação dos clipes.
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
