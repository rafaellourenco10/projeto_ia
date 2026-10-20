// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest'
import * as store from './store.js'
import { gerarClipe, gerarComTexto, statusJob, DURACAO_MS } from './api.js'

function usuarioComFoto(saldo) {
  store.cadastrar({ nome: 'Ana', email: 'ana@x.com' })
  store.adicionarCreditos(saldo - store.getSaldo())
  store.salvarFoto('data:image/jpeg;base64,AAA')
  store.setConsentimento(true)
}

beforeEach(() => {
  localStorage.clear()
  history.replaceState(null, '', '/')
})

describe('api simulada', () => {
  it('reserva no início e debita só no sucesso, uma vez', async () => {
    usuarioComFoto(10)
    const { jobId } = await gerarClipe('agente-secreto', { proporcao: '9:16' })
    expect(store.getSaldoDisponivel()).toBe(5)
    expect(store.getSaldo()).toBe(10)
    const t0 = store.getCriacao(jobId).criadoEm
    expect((await statusJob(jobId, t0 + DURACAO_MS)).status).toBe('pronto')
    expect(store.getSaldo()).toBe(5)
    await statusJob(jobId, t0 + DURACAO_MS + 5000)
    expect(store.getSaldo()).toBe(5)
    expect(store.getSaldoDisponivel()).toBe(5)
  })

  it('falha devolve a reserva', async () => {
    usuarioComFoto(10)
    history.replaceState(null, '', '/clipe?debug=falha')
    const { jobId } = await gerarClipe('agente-secreto', { proporcao: '9:16' })
    const t0 = store.getCriacao(jobId).criadoEm
    expect((await statusJob(jobId, t0 + DURACAO_MS)).status).toBe('falhou')
    expect(store.getSaldo()).toBe(10)
    expect(store.getSaldoDisponivel()).toBe(10)
  })

  it('segundo pedido sem saldo disponível é recusado', async () => {
    usuarioComFoto(5)
    await gerarClipe('agente-secreto', { proporcao: '9:16' })
    await expect(gerarClipe('agente-secreto', { proporcao: '9:16' })).rejects.toThrow('SEM_SALDO')
    expect(store.getSaldoDisponivel()).toBe(0)
  })

  it('sem foto é recusado', async () => {
    store.cadastrar({ nome: 'Ana', email: 'ana@x.com' })
    await expect(gerarClipe('agente-secreto', { proporcao: '9:16' })).rejects.toThrow('SEM_FOTO')
  })

  it('clipe inexistente é recusado', async () => {
    usuarioComFoto(10)
    await expect(gerarClipe('nao-existe', { proporcao: '9:16' })).rejects.toThrow('CLIPE_INEXISTENTE')
  })

  it('texto para vídeo de 10 s reserva 8 créditos', async () => {
    usuarioComFoto(10)
    await gerarComTexto({ modo: 'video', prompt: 'eu surfando', estilo: 'cinematic', duracao: 10, proporcao: '16:9' })
    expect(store.getSaldoDisponivel()).toBe(2)
  })

  it('progresso segue o relógio, mesmo depois de recarregar', async () => {
    usuarioComFoto(10)
    const { jobId } = await gerarClipe('agente-secreto', { proporcao: '9:16' })
    const t0 = store.getCriacao(jobId).criadoEm
    const s = await statusJob(jobId, t0 + 7000)
    expect(s.status).toBe('gerando')
    expect(s.fase).toBe(1)
    expect(s.progresso).toBe(35)
    expect(s.restanteSeg).toBe(13)
  })

  it('job desconhecido devolve null', async () => {
    expect(await statusJob('xyz')).toBeNull()
  })
})
