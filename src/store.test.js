// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as store from './store.js'
import { custo } from './creditos.js'

beforeEach(() => localStorage.clear())

describe('store', () => {
  it('setPlano grava o plano', () => {
    store.cadastrar({ nome: 'Ana', email: 'ana@x.com' })
    expect(store.setPlano('Pro Creator')).toBe(true)
    expect(store.getPlano()).toBe('Pro Creator')
  })

  it('comprar grava créditos, plano e compra juntos', () => {
    store.cadastrar({ nome: 'Ana', email: 'ana@x.com' })
    const S = store.getSaldo()
    expect(store.comprar({ creditos: 100, plano: 'Pro Creator', descricao: 'Plano Pro Creator', preco: 'R$ 49,90' })).toBe(true)
    expect(store.getSaldo()).toBe(S + 100)
    expect(store.getPlano()).toBe('Pro Creator')
    expect(store.getCompras()[0].descricao).toBe('Plano Pro Creator')
  })

  it('comprar não muda nada quando o navegador não grava', () => {
    store.cadastrar({ nome: 'Ana', email: 'ana@x.com' })
    const S = store.getSaldo()
    const spy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    expect(store.comprar({ creditos: 100, plano: 'Pro Creator', descricao: 'Plano Pro Creator', preco: 'R$ 49,90' })).toBe(false)
    spy.mockRestore()
    expect(store.getSaldo()).toBe(S)
    expect(store.getPlano()).toBe(null)
    expect(store.getCompras()).toHaveLength(0)
  })

  it('cadastro ganha o bônus de 10 créditos', () => {
    store.cadastrar({ nome: 'Ana', email: 'ana@x.com' })
    expect(store.getSaldo()).toBe(10)
    expect(store.getUsuario()).toEqual({ nome: 'Ana', email: 'ana@x.com' })
  })

  it('entrar sem conta cria o usuário demo com 45 créditos', () => {
    store.entrar({ email: 'demo@x.com' })
    expect(store.getUsuario().nome).toBe('Camila Silva')
    expect(store.getSaldo()).toBe(45)
  })

  it('entrar com o e-mail cadastrado mantém a conta', () => {
    store.cadastrar({ nome: 'Ana', email: 'ana@x.com' })
    store.entrar({ email: 'ana@x.com' })
    expect(store.getUsuario().nome).toBe('Ana')
    expect(store.getSaldo()).toBe(10)
  })

  it('entrar com outro e-mail não apaga a conta salva', () => {
    store.cadastrar({ nome: 'Ana', email: 'ana@x.com' })
    store.salvarFoto('data:image/jpeg;base64,AAA')
    store.sair()
    expect(() => store.entrar({ email: 'outro@x.com' })).toThrow('CONTA_EXISTENTE')
    store.entrar({ email: 'ana@x.com' })
    expect(store.getFoto()).toBe('data:image/jpeg;base64,AAA')
  })

  it('getEmailSalvo mostra a conta salva mesmo deslogado', () => {
    expect(store.getEmailSalvo()).toBe(null)
    store.cadastrar({ nome: 'Ana', email: 'ana@x.com' })
    store.sair()
    expect(store.getEmailSalvo()).toBe('ana@x.com')
  })

  it('cadastrar de novo não apaga a conta salva', () => {
    store.cadastrar({ nome: 'Ana', email: 'ana@x.com' })
    store.salvarFoto('data:image/jpeg;base64,AAA')
    store.sair()
    expect(() => store.cadastrar({ nome: 'Bia', email: 'bia@x.com' })).toThrow('CONTA_EXISTENTE')
    store.entrar({ email: 'ana@x.com' })
    expect(store.getUsuario().nome).toBe('Ana')
    expect(store.getFoto()).toBe('data:image/jpeg;base64,AAA')
  })

  it('salvarFoto devolve false e mantém a foto anterior quando a cota estoura', () => {
    store.cadastrar({ nome: 'Ana', email: 'ana@x.com' })
    store.salvarFoto('data:image/jpeg;base64,AAA')
    const espiao = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('cheio', 'QuotaExceededError')
    })
    expect(store.salvarFoto('data:image/jpeg;base64,BBB')).toBe(false)
    espiao.mockRestore()
    expect(store.getFoto()).toBe('data:image/jpeg;base64,AAA')
  })

  it('apagar a foto zera o consentimento', () => {
    store.cadastrar({ nome: 'Ana', email: 'ana@x.com' })
    store.salvarFoto('data:image/jpeg;base64,AAA')
    store.setConsentimento(true)
    store.apagarFoto()
    expect(store.getFoto()).toBeNull()
    expect(store.getConsentimento()).toBe(false)
  })
})

describe('rostos', () => {
  it('estado antigo com só `foto` vira o primeiro rosto', () => {
    localStorage.setItem('selfiemovie:v1', JSON.stringify({ usuario: { nome: 'Ana', email: 'a@x' }, logado: true, saldo: 10, foto: 'F1', consentimento: true, criacoes: [], compras: [] }))
    expect(store.getRostos()).toEqual([{ id: 'r1', nome: 'Ana', foto: 'F1' }])
    expect(store.getFoto()).toBe('F1')
    expect(store.salvarFoto('F2', { novo: true })).toBe(true)
    expect(store.getRostos().map((r) => r.foto)).toEqual(['F1', 'F2'])
    expect(store.usarRosto('r1')).toBe(true)
    expect(store.getFoto()).toBe('F1')
  })

  it('adiciona até 3, troca o ativo e salvar sem `novo` troca só a foto do ativo', () => {
    store.cadastrar({ nome: 'Ana', email: 'ana@x.com' })
    store.salvarFoto('F1')
    store.salvarFoto('F2', { novo: true })
    store.salvarFoto('F3', { novo: true })
    expect(store.salvarFoto('F4', { novo: true })).toBe(false)
    expect(store.getRostos().map((r) => r.nome)).toEqual(['Ana', 'Rosto 2', 'Rosto 3'])
    expect(store.getFoto()).toBe('F3')
    const [primeiro] = store.getRostos()
    expect(store.usarRosto(primeiro.id)).toBe(true)
    store.salvarFoto('F1b')
    expect(store.getRostos().map((r) => r.foto)).toEqual(['F1b', 'F2', 'F3'])
    expect(store.usarRosto('nao-existe')).toBe(false)
  })

  it('apagar tira só o rosto ativo e mantém o consentimento enquanto sobrar rosto', () => {
    store.cadastrar({ nome: 'Ana', email: 'ana@x.com' })
    store.salvarFoto('F1')
    store.salvarFoto('F2', { novo: true })
    store.setConsentimento(true)
    store.apagarFoto()
    expect(store.getRostos().map((r) => r.foto)).toEqual(['F1'])
    expect(store.getFoto()).toBe('F1')
    expect(store.getConsentimento()).toBe(true)
    store.apagarFoto()
    expect(store.getFoto()).toBeNull()
    expect(store.getConsentimento()).toBe(false)
  })
})

describe('bônus diário', () => {
  it('soma uma vez por dia e volta no dia seguinte', () => {
    store.cadastrar({ nome: 'Ana', email: 'ana@x.com' })
    const S = store.getSaldo()
    const hoje = new Date(2026, 9, 21, 23, 50)
    expect(store.pegarBonusDiario(hoje)).toBe(true)
    expect(store.getSaldo()).toBe(S + 2)
    expect(store.bonusDiarioDisponivel(hoje)).toBe(false)
    expect(store.pegarBonusDiario(new Date(2026, 9, 21, 8))).toBe(false)
    expect(store.getSaldo()).toBe(S + 2)
    expect(store.pegarBonusDiario(new Date(2026, 9, 22, 0, 5))).toBe(true)
    expect(store.getSaldo()).toBe(S + 4)
  })

  it('não conta o dia quando o navegador não grava, nem sem conta', () => {
    expect(store.pegarBonusDiario()).toBe(false)
    store.cadastrar({ nome: 'Ana', email: 'ana@x.com' })
    const spy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    try {
      expect(store.pegarBonusDiario()).toBe(false)
    } finally {
      spy.mockRestore()
    }
    expect(store.bonusDiarioDisponivel()).toBe(true)
  })
})

describe('custo', () => {
  it('segue a tabela única', () => {
    expect(custo({ tipo: 'clipe' })).toBe(5)
    expect(custo({ tipo: 'video', duracao: 5 })).toBe(5)
    expect(custo({ tipo: 'video', duracao: 10 })).toBe(8)
    expect(custo({ tipo: 'foto' })).toBe(2)
  })

  it('cadastrar devolve null quando o navegador não grava', () => {
    const spy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('QuotaExceededError') })
    expect(store.cadastrar({ nome: 'Ana', email: 'ana@x.com' })).toBe(null)
    spy.mockRestore()
  })

  it('removerCriacao apaga criação pronta', () => {
    store.cadastrar({ nome: 'Ana', email: 'ana@x.com' })
    store.addCriacao({ id: 'a', status: 'pronto', custo: 3 })
    expect(store.removerCriacao('a')).toBe(true)
    expect(store.getCriacao('a')).toBeNull()
    expect(store.getSaldo()).toBe(10)
  })

  it('removerCriacao recusa criação gerando', () => {
    store.cadastrar({ nome: 'Ana', email: 'ana@x.com' })
    store.addCriacao({ id: 'a', status: 'gerando', custo: 3 })
    expect(store.removerCriacao('a')).toBe(false)
    expect(store.getCriacao('a')).not.toBeNull()
    expect(store.getSaldoDisponivel()).toBe(7)
  })
})

describe('favoritos', () => {
  it('alternarFavorito liga e desliga', () => {
    store.cadastrar({ nome: 'Ana', email: 'ana@x.com' })
    expect(store.alternarFavorito('a')).toBe(true)
    expect(store.getFavoritos()).toEqual(['a'])
    expect(store.alternarFavorito('a')).toBe(false)
    expect(store.getFavoritos()).toEqual([])
  })

  it('estado antigo sem favoritos', () => {
    store.cadastrar({ nome: 'Ana', email: 'ana@x.com' })
    const e = JSON.parse(localStorage.getItem('selfiemovie:v1'))
    delete e.favoritos
    localStorage.setItem('selfiemovie:v1', JSON.stringify(e))
    expect(store.getFavoritos()).toEqual([])
    expect(store.alternarFavorito('a')).toBe(true)
  })

  it('sem espaço: não muda e devolve o estado anterior', () => {
    store.cadastrar({ nome: 'Ana', email: 'ana@x.com' })
    const spy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('cota')
    })
    expect(store.alternarFavorito('a')).toBe(false)
    spy.mockRestore()
    expect(store.getFavoritos()).toEqual([])
  })
})
