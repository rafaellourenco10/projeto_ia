import { describe, expect, it } from 'vitest'
import { desafioDaSemana } from './desafios.js'
import desafios from './data/desafios.json'
import clips from './data/clips.json'

describe('desafio da semana', () => {
  it('a mesma semana (segunda a domingo) devolve o mesmo desafio', () => {
    const seg = desafioDaSemana(new Date(2026, 9, 19, 0, 5))
    const dom = desafioDaSemana(new Date(2026, 9, 25, 23, 50))
    expect(dom.id).toBe(seg.id)
    expect(seg.inicio).toBe(new Date(2026, 9, 19).getTime())
    expect(seg.fim).toBe(new Date(2026, 9, 26).getTime())
  })

  it('a semana seguinte troca e a lista gira', () => {
    const ids = Array.from({ length: desafios.length + 1 }, (_, i) => desafioDaSemana(new Date(2026, 9, 19 + 7 * i)).id)
    expect(ids[1]).not.toBe(ids[0])
    expect(new Set(ids.slice(0, desafios.length)).size).toBe(desafios.length)
    expect(ids[desafios.length]).toBe(ids[0])
  })

  it('todo desafio usa clipes que existem', () => {
    expect(desafios.length).toBeGreaterThanOrEqual(6)
    for (const d of desafios) expect(d.clipIds.every((id) => clips.some((c) => c.id === id))).toBe(true)
  })
})
