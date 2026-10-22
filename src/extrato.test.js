import { describe, expect, it } from 'vitest'
import { extrato } from './extrato.js'

describe('extrato', () => {
  it('junta compras, criações e bônus, mais recente primeiro', () => {
    const estado = {
      compras: [{ descricao: 'Pacote de 20 créditos', creditos: 20, preco: 15, data: 300 }],
      criacoes: [
        { titulo: 'Agente', status: 'pronto', custo: 5, criadoEm: 400 },
        { titulo: 'Dragão', status: 'falhou', custo: 8, criadoEm: 200 },
        { titulo: 'Gerando', status: 'gerando', custo: 5, criadoEm: 500 },
        { titulo: 'Refeito', status: 'pronto', custo: 0, criadoEm: 450 },
      ],
      bonus: [{ descricao: 'Bônus de cadastro', creditos: 10, data: 100 }],
    }
    expect(extrato(estado)).toEqual([
      { descricao: 'Refeito', detalhe: 'Refazer grátis', creditos: 0, data: 450 },
      { descricao: 'Agente', detalhe: 'Criação pronta', creditos: -5, data: 400 },
      { descricao: 'Pacote de 20 créditos', detalhe: 'Compra', creditos: 20, data: 300 },
      { descricao: 'Dragão', detalhe: 'Falhou, devolvido', creditos: 0, data: 200 },
      { descricao: 'Bônus de cadastro', detalhe: 'Bônus', creditos: 10, data: 100 },
    ])
  })

  it('estado antigo sem bônus nem conta', () => {
    expect(extrato({ compras: [], criacoes: [] })).toEqual([])
    expect(extrato(null)).toEqual([])
  })
})
