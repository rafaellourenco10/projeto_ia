import { describe, it, expect } from 'vitest'
import { destinoSeguro } from './foto-utils.js'

describe('destinoSeguro', () => {
  it('aceita caminho interno', () => {
    expect(destinoSeguro('/clipe?id=abc')).toBe('/clipe?id=abc')
  })
  it('recusa outro site e cai no padrão', () => {
    for (const url of ['//evil.com', '/\\evil.com', 'https://evil.com', 'javascript:alert(1)', '', null]) {
      expect(destinoSeguro(url)).toBe('/inicio')
    }
  })
})
