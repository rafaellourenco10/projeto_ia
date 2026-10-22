// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as store from './store.js'
import { desafioDaSemana } from './desafios.js'
import clips from './data/clips.json'
import { gerarClipe, gerarComTexto, refazer, statusJob, fecharVencidos, DURACAO_MS, DURACAO_PLANO_MS } from './api.js'

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

  it('clipe em dupla exige dois rostos salvos diferentes', async () => {
    usuarioComFoto(10)
    const [r1] = store.getRostos()
    await expect(gerarClipe('noite-de-estreia')).rejects.toThrow('SEM_SEGUNDO_ROSTO')
    await expect(gerarClipe('noite-de-estreia', { rostos: [r1.id, r1.id] })).rejects.toThrow('SEM_SEGUNDO_ROSTO')
    await expect(gerarClipe('noite-de-estreia', { rostos: [r1.id, 'outro'] })).rejects.toThrow('SEM_SEGUNDO_ROSTO')
    store.salvarFoto('data:image/jpeg;base64,BBB', { novo: true })
    const r2 = store.getRostoAtivo()
    const { jobId } = await gerarClipe('noite-de-estreia', { rostos: [r2.id, r1.id] })
    expect(store.getCriacao(jobId).rostos).toEqual([r2.id, r1.id])
    const { jobId: outro } = await refazer(jobId)
    expect(store.getCriacao(outro).rostos).toEqual([r2.id, r1.id])
  })

  it('refazer grátis custa zero, não debita e vale uma vez', async () => {
    usuarioComFoto(5)
    const { jobId } = await gerarClipe('agente-secreto')
    await statusJob(jobId, store.getCriacao(jobId).criadoEm + DURACAO_MS)
    expect(store.getSaldo()).toBe(0)
    const { jobId: novo } = await refazer(jobId, { gratis: true })
    expect(store.getCriacao(novo).custo).toBe(0)
    expect(store.getCriacao(jobId).refazerGratisUsado).toBe(true)
    await statusJob(novo, store.getCriacao(novo).criadoEm + DURACAO_MS)
    expect(store.getCriacao(novo).status).toBe('pronto')
    expect(store.getSaldo()).toBe(0)
    await expect(refazer(jobId, { gratis: true })).rejects.toThrow('GRATIS_USADO')
    await expect(refazer(novo, { gratis: true })).rejects.toThrow('GRATIS_USADO') // o refazer grátis não gera outro
  })

  it('criação com clipe ou estilo do tema entra no desafio da semana', async () => {
    usuarioComFoto(20)
    const des = desafioDaSemana()
    const doTema = clips.find((c) => des.clipIds.includes(c.id) && c.pessoas !== 2)
    const fora = clips.find((c) => !des.clipIds.includes(c.id) && c.pessoas !== 2)
    expect(store.getCriacao((await gerarClipe(doTema.id)).jobId).desafio).toBe(des.id)
    expect(store.getCriacao((await gerarClipe(fora.id)).jobId).desafio).toBeUndefined()
    expect(store.getCriacao((await gerarComTexto({ modo: 'foto', prompt: 'x', estilo: des.estilo })).jobId).desafio).toBe(des.id)
  })

  it('clipe solo ignora rostos', async () => {
    usuarioComFoto(10)
    const { jobId } = await gerarClipe('agente-secreto', { rostos: ['x', 'y'] })
    expect(store.getCriacao(jobId).rostos).toBeUndefined()
  })

  it('com plano a geração leva metade do tempo', async () => {
    usuarioComFoto(10)
    store.setPlano('Pro Creator')
    const { jobId } = await gerarClipe('agente-secreto')
    const t0 = store.getCriacao(jobId).criadoEm
    expect((await statusJob(jobId, t0 + 5000)).progresso).toBe(50)
    expect((await statusJob(jobId, t0 + DURACAO_PLANO_MS)).status).toBe('pronto')
  })

  it('criação antiga sem duracaoMs usa o tempo padrão', async () => {
    usuarioComFoto(10)
    const { jobId } = await gerarClipe('agente-secreto')
    store.updateCriacao(jobId, { duracaoMs: undefined })
    const t0 = store.getCriacao(jobId).criadoEm
    expect((await statusJob(jobId, t0 + DURACAO_PLANO_MS)).status).toBe('gerando')
    expect((await statusJob(jobId, t0 + DURACAO_MS)).status).toBe('pronto')
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

  it('gerarClipe recusa com SEM_ESPACO quando o navegador não grava', async () => {
    usuarioComFoto(10)
    const spy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('QuotaExceededError') })
    await expect(gerarClipe('agente-secreto')).rejects.toThrow('SEM_ESPACO')
    spy.mockRestore()
    expect(store.getCriacoes()).toHaveLength(0)
  })

  it('fecharVencidos fecha só os jobs vencidos, uma vez', async () => {
    usuarioComFoto(10)
    vi.useFakeTimers()
    const t0 = Date.now()
    const a = await gerarClipe('agente-secreto')
    vi.setSystemTime(t0 + 15000)
    const b = await gerarClipe('agente-secreto')
    await fecharVencidos(t0 + 20000)
    vi.useRealTimers()
    expect(store.getCriacao(a.jobId).status).toBe('pronto')
    expect(store.getCriacao(b.jobId).status).toBe('gerando')
    expect(store.getSaldo()).toBe(5)
    await fecharVencidos(t0 + 20000)
    expect(store.getSaldo()).toBe(5)
  })
})
