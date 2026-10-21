// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from 'vitest'
import { montarShell } from './shell.js'
import * as store from './store.js'

afterEach(() => vi.useRealTimers())

it('o intervalo do shell fecha o job que venceu', async () => {
  vi.useFakeTimers()
  document.body.innerHTML = '<main></main>'
  const job = { id: 'j1', tipo: 'clipe', titulo: 'T', img: '/a.jpg', proporcao: '9:16', custo: 5, status: 'gerando', criadoEm: Date.now() - 19500 }
  localStorage.setItem('selfiemovie:v1', JSON.stringify({ usuario: { nome: 'Ana', email: 'a@x' }, logado: true, plano: null, saldo: 10, foto: 'x', consentimento: true, criacoes: [job], compras: [] }))
  montarShell({ rota: 'inicio' })
  await vi.advanceTimersByTimeAsync(10)
  expect(store.getCriacao('j1').status).toBe('gerando')
  await vi.advanceTimersByTimeAsync(1000)
  expect(store.getCriacao('j1').status).toBe('pronto')
})
