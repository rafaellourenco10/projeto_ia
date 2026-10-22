// API simulada. Imita o fluxo assíncrono da Higgsfield (POST → request_id → status).
// Na fase 2, só este arquivo troca para chamar o servidor.
import * as store from './store.js'
import { custo } from './creditos.js'
import clips from './data/clips.json'

export const FASES = ['Na fila...', 'Detectando traços faciais...', 'Adequando iluminação da cena...', 'Finalizando renderização...']
export const DURACAO_MS = 20000
export const DURACAO_PLANO_MS = 10000 // quem tem plano entra na fila prioritária

// Também é a prévia de cada estilo no /criar-com-texto.
export const IMG_ESTILO = {
  cinematic: '/img/resultado-agente.jpg',
  realistic: '/img/criacao-surfista.jpg',
  cyberpunk: '/img/criacao-neo-tokyo.jpg',
  vintage: '/img/criacao-imperatriz.jpg',
  noir: '/img/clipe-detetive-noir.jpg',
  fantasia: '/img/clipe-guardiao-reino.jpg',
}

function criar(dados) {
  if (!store.getFoto()) throw new Error('SEM_FOTO')
  if (store.getSaldoDisponivel() < dados.custo) throw new Error('SEM_SALDO')
  const c = {
    ...dados,
    id: crypto.randomUUID().slice(0, 8),
    status: 'gerando',
    criadoEm: Date.now(),
    duracaoMs: store.getPlano() ? DURACAO_PLANO_MS : DURACAO_MS,
    falhar: new URLSearchParams(location.search).get('debug') === 'falha',
  }
  if (!store.addCriacao(c)) throw new Error('SEM_ESPACO')
  return { jobId: c.id }
}

export async function gerarClipe(clipId, { proporcao = '9:16' } = {}) {
  const clip = clips.find((c) => c.id === clipId)
  if (!clip) throw new Error('CLIPE_INEXISTENTE')
  return criar({ tipo: 'clipe', clipId, titulo: clip.titulo, img: clip.img, proporcao, custo: custo({ tipo: 'clipe' }) })
}

export async function gerarComTexto({ modo, prompt, estilo = 'cinematic', duracao = 5, proporcao = '9:16' }) {
  const tipo = modo === 'foto' ? 'foto' : 'video'
  const titulo = prompt.length > 60 ? prompt.slice(0, 57) + '...' : prompt
  return criar({
    tipo, prompt, estilo, proporcao, titulo,
    duracao: tipo === 'video' ? duracao : undefined,
    img: IMG_ESTILO[estilo] ?? IMG_ESTILO.cinematic,
    custo: custo({ tipo, duracao }),
  })
}

// Refaz o mesmo pedido ("Tentar de novo" e "Gerar variação").
export function refazer(jobId) {
  const c = store.getCriacao(jobId)
  if (!c) return Promise.reject(new Error('JOB_INEXISTENTE'))
  if (c.tipo === 'clipe') return gerarClipe(c.clipId, { proporcao: c.proporcao })
  return gerarComTexto({ modo: c.tipo, prompt: c.prompt, estilo: c.estilo, duracao: c.duracao, proporcao: c.proporcao })
}

// O progresso sai do relógio, então recarregar a página não reinicia o job.
export async function statusJob(jobId, agora = Date.now()) {
  let c = store.getCriacao(jobId)
  if (!c) return null
  const decorrido = agora - c.criadoEm
  const total = c.duracaoMs ?? DURACAO_MS // criações de antes da fila prioritária não têm o campo
  if (c.status === 'gerando' && decorrido >= total) {
    store.concluirCriacao(jobId, !c.falhar)
    c = store.getCriacao(jobId)
  }
  if (c.status !== 'gerando') return { status: c.status, fase: FASES.length - 1, progresso: 100, restanteSeg: 0, criacao: c }
  return {
    status: 'gerando',
    fase: Math.min(FASES.length - 1, Math.floor(decorrido / (total / FASES.length))),
    progresso: Math.min(99, Math.floor((decorrido / total) * 100)),
    restanteSeg: Math.ceil((total - decorrido) / 1000),
    criacao: c,
  }
}

// Fecha todo job vencido, mesmo que o usuário esteja em outra tela.
export async function fecharVencidos(agora = Date.now()) {
  for (const c of store.getCriacoes()) {
    if (c.status === 'gerando') await statusJob(c.id, agora)
  }
}
