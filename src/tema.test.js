// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { globSync, readFileSync } from 'node:fs'

// O script de tema mora inline no <head> de cada página; o teste lê direto dos HTML.
const paginas = globSync(['*.html', 'perfil-rosto/*.html'])
const scripts = paginas.map((p) => readFileSync(p, 'utf8').match(/<script>(\(window\.aplicarTema=[^<]*)<\/script>/)?.[1])

let mq
function rodar({ tema, claroNoSistema = false }) {
  if (tema) localStorage.setItem('selfiemovie:tema', tema)
  delete window.temaMq // cada rodar() simula uma página nova
  mq = { matches: claroNoSistema }
  vi.spyOn(window, 'matchMedia').mockReturnValue(mq)
  new Function(scripts[0])()
  return document.documentElement.className
}

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('script de tema', () => {
  it('é o mesmo nas 14 páginas', () => {
    expect(paginas).toHaveLength(14)
    expect(new Set(scripts).size).toBe(1)
    expect(scripts[0]).toBeTruthy()
  })

  it('aplica escuro por padrão e claro quando escolhido', () => {
    expect(rodar({})).toBe('dark')
    expect(rodar({ tema: 'claro' })).toBe('light')
    expect(rodar({ tema: 'escuro', claroNoSistema: true })).toBe('dark')
  })

  it('em sistema segue prefers-color-scheme', () => {
    expect(rodar({ tema: 'sistema', claroNoSistema: true })).toBe('light')
    expect(rodar({ tema: 'sistema', claroNoSistema: false })).toBe('dark')
  })

  it('aplicarTema(valor) ignora o storage (gravação que falhou)', () => {
    rodar({ tema: 'escuro' })
    window.aplicarTema('claro')
    expect(document.documentElement.className).toBe('light')
  })

  it('escolha depois de sistema não é desfeita quando o sistema muda', () => {
    rodar({ tema: 'sistema', claroNoSistema: true })
    window.aplicarTema('escuro')
    mq.matches = true
    mq.onchange()
    expect(window.matchMedia).toHaveBeenCalledTimes(1) // uma só MediaQueryList
    expect(document.documentElement.className).toBe('dark')
  })

  it('sem matchMedia o script ainda aplica o tema', () => {
    delete window.temaMq
    vi.spyOn(window, 'matchMedia').mockImplementation(() => { throw new Error('sem matchMedia') })
    localStorage.setItem('selfiemovie:tema', 'claro')
    new Function(scripts[0])()
    expect(document.documentElement.className).toBe('light')
    localStorage.setItem('selfiemovie:tema', 'sistema')
    new Function(scripts[0])()
    expect(document.documentElement.className).toBe('dark')
  })

  it('valor desconhecido cai no escuro', () => {
    expect(rodar({ tema: 'foo', claroNoSistema: true })).toBe('dark')
  })

  it('storage indisponível cai no escuro', () => {
    localStorage.setItem('selfiemovie:tema', 'claro') // se o spy não pegar, o resultado vira light
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => { throw new Error('bloqueado') })
    expect(rodar({})).toBe('dark')
    expect(localStorage.getItem).toHaveBeenCalled()
  })
})
