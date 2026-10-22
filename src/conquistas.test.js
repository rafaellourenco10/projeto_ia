import { describe, expect, it } from 'vitest'
import { conquistas } from './conquistas.js'

const feitas = (estado) => conquistas(estado).filter((c) => c.feita).map((c) => c.id)
const pronto = (extra) => ({ tipo: 'clipe', status: 'pronto', ...extra })

describe('conquistas', () => {
  it('estado novo não tem nenhuma e mostra o que falta', () => {
    const lista = conquistas({ criacoes: [], rostos: [] })
    expect(lista).toHaveLength(7)
    expect(lista.every((c) => !c.feita && c.falta)).toBe(true)
    expect(feitas(null)).toEqual([])
  })

  it('conta só criações prontas', () => {
    expect(feitas({ criacoes: [pronto({ status: 'falhou' }), pronto({ status: 'gerando', tipo: 'video' })] })).toEqual([])
    expect(feitas({ criacoes: [pronto(), pronto({ tipo: 'foto' })] })).toEqual(['primeiro-clipe', 'primeiro-texto'])
  })

  it('dupla, legenda, 5 prontas, 3 rostos e 7 dias', () => {
    const estado = {
      criacoes: [pronto({ rostos: ['a', 'b'], legenda: 'oi' }), pronto(), pronto(), pronto(), pronto({ legenda: '  ' })],
      rostos: [{}, {}, {}],
      melhorSequencia: 7,
    }
    expect(feitas(estado)).toEqual(['primeiro-clipe', 'primeira-dupla', 'cinco-prontas', 'tres-rostos', 'sete-dias', 'primeira-legenda'])
  })

  it('mostra quanto falta nas de contagem', () => {
    const lista = conquistas({ criacoes: [pronto(), pronto()], foto: 'data:x', sequencia: 3 })
    expect(lista.find((c) => c.id === 'cinco-prontas').falta).toBe('Faltam 3 criações')
    expect(lista.find((c) => c.id === 'tres-rostos').falta).toBe('Faltam 2 rostos')
    expect(lista.find((c) => c.id === 'sete-dias').falta).toBe('Faltam 4 dias seguidos')
  })
})
