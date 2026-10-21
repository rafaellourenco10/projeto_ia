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
