import { describe, it, expect } from 'vitest'
import { filtrarClipes } from './biblioteca.js'
import clipes from './data/clips.json'

describe('filtrarClipes', () => {
  it('busca ignora acento e maiúsculas', () => {
    const r = filtrarClipes(clipes, { q: 'DANCA' })
    expect(r.map((c) => c.id)).toContain('danca-festival')
    expect(r.every((c) => c.categoria === 'danca' || /dan[cç]a/i.test(c.titulo + c.genero))).toBe(true)
  })
  it('filtra por categoria', () => {
    const r = filtrarClipes(clipes, { categoria: 'esportes' })
    expect(r.length).toBeGreaterThan(0)
    expect(r.every((c) => c.categoria === 'esportes')).toBe(true)
  })
  it('ordena por popularidade e por data', () => {
    expect(filtrarClipes(clipes)[0].id).toBe('agente-secreto')
    expect(filtrarClipes(clipes, { ordem: 'recentes' })[0].id).toBe('piloto-orbital')
  })
  it('não muda o array original e devolve vazio sem resultado', () => {
    const antes = clipes.map((c) => c.id)
    expect(filtrarClipes(clipes, { q: 'zzz' })).toEqual([])
    filtrarClipes(clipes, { ordem: 'recentes' })
    expect(clipes.map((c) => c.id)).toEqual(antes)
  })
})
