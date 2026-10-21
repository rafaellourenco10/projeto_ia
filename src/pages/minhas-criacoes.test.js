// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'

afterEach(() => vi.useRealTimers())

// O tick do shell fecha o job antes do tick da página; o card tem de virar "Pronto" mesmo assim.
it('card gerando vira pronto quando o job termina', async () => {
  vi.useFakeTimers()
  const html = readFileSync('minhas-criacoes.html', 'utf8')
  document.body.innerHTML = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1].replace(/<script[\s\S]*?<\/script>/g, '')
  const job = { id: 'j1', tipo: 'clipe', titulo: 'T', img: '/a.jpg', proporcao: '9:16', custo: 5, status: 'gerando', criadoEm: Date.now() - 19500 }
  localStorage.setItem('selfiemovie:v1', JSON.stringify({ usuario: { nome: 'Ana', email: 'a@x' }, logado: true, plano: null, saldo: 10, foto: 'x', consentimento: true, criacoes: [job], compras: [] }))
  await import('./minhas-criacoes.js')
  await vi.advanceTimersByTimeAsync(10)
  expect(document.querySelector('[data-pct="j1"]')).not.toBeNull()

  await vi.advanceTimersByTimeAsync(3000)
  expect(JSON.parse(localStorage.getItem('selfiemovie:v1')).criacoes[0].status).toBe('pronto')
  expect(document.querySelector('[data-pct="j1"]')).toBeNull()
  expect(document.querySelector('a[href="/resultado?job=j1"]')).not.toBeNull()
})
