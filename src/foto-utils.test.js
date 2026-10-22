import { describe, it, expect } from 'vitest'
import { destinoSeguro, quebrarLinhas } from './foto-utils.js'

describe('quebrarLinhas', () => {
  const medir = (t) => t.length // 1 por caractere
  it('quebra entre palavras sem passar do máximo', () => {
    expect(quebrarLinhas('eu sou o protagonista', 10, medir)).toEqual(['eu sou o', 'protagonista'])
  })
  it('palavra maior que o máximo fica numa linha só', () => {
    expect(quebrarLinhas('supercalifragilístico', 5, medir)).toEqual(['supercalifragilístico'])
  })
  it('texto vazio ou só espaços não gera linha', () => {
    expect(quebrarLinhas('   ', 10, medir)).toEqual([])
  })
})

describe('destinoSeguro', () => {
  it('aceita caminho interno', () => {
    expect(destinoSeguro('/clipe?id=abc')).toBe('/clipe?id=abc')
  })
  it('recusa outro site e cai no padrão', () => {
    for (const url of ['//evil.com', '/\\evil.com', '/\t/evil.com', '/\n/evil.com', '/\r/evil.com','https://evil.com', 'javascript:alert(1)', '', null]) {
      expect(destinoSeguro(url)).toBe('/inicio')
    }
  })
})
