// Estado do app no localStorage (fase 1: sem servidor). Uma chave só.
import { CUSTOS } from './creditos.js'

const CHAVE = 'selfiemovie:v1'
const ouvintes = new Set()

function ler() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) ?? null
  } catch {
    return null
  }
}

// Devolve false se o navegador recusar a gravação (cota cheia, modo privado).
function gravar(estado) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado))
  } catch {
    return false
  }
  ouvintes.forEach((fn) => fn())
  return true
}

function alterar(fn) {
  const estado = ler()
  if (!estado) return false
  fn(estado)
  return gravar(estado)
}

const novoEstado = (usuario, saldo, plano = null) => ({ usuario, logado: true, plano, saldo, rostos: [], rostoAtivo: null, consentimento: false, criacoes: [], compras: [] })

export function onChange(fn) {
  ouvintes.add(fn)
  window.addEventListener('storage', (e) => e.key === CHAVE && fn())
}

// Estado inteiro, só para leitura (funções puras como conquistas e extrato).
export const getEstado = () => ler()

// Conta
export const getUsuario = () => {
  const e = ler()
  return e?.logado ? e.usuario : null
}

// E-mail da conta guardada, mesmo deslogada (a tela de entrar mostra quando recusa outra conta).
export const getEmailSalvo = () => ler()?.usuario.email ?? null

// Fase 1 guarda uma conta por navegador: trocar de conta apagaria fotos, criações e créditos.
export function cadastrar({ nome, email }) {
  if (ler()) throw new Error('CONTA_EXISTENTE')
  gravar(novoEstado({ nome, email }, CUSTOS.bonusCadastro))
  return getUsuario()
}

export function entrar({ email }) {
  const e = ler()
  if (e && e.usuario.email !== email) throw new Error('CONTA_EXISTENTE')
  if (e) {
    e.logado = true
    gravar(e)
  } else {
    gravar(novoEstado({ nome: 'Camila Silva', email }, 45, 'Pro Creator'))
  }
  return getUsuario()
}

export const getPlano = () => ler()?.plano ?? null
export const setPlano = (nome) => alterar((e) => (e.plano = nome))

export const sair = () => alterar((e) => (e.logado = false))

export function excluirConta() {
  localStorage.removeItem(CHAVE)
  ouvintes.forEach((fn) => fn())
}

// Créditos: criações "gerando" reservam o custo; o débito só acontece no sucesso.
export const getSaldo = () => ler()?.saldo ?? 0

export function getSaldoDisponivel() {
  const e = ler()
  if (!e) return 0
  return e.saldo - e.criacoes.filter((c) => c.status === 'gerando').reduce((s, c) => s + c.custo, 0)
}

export const adicionarCreditos = (n) => alterar((e) => (e.saldo += n))

// Créditos grátis uma vez por dia, contando o dia no fuso de quem usa ('sv' dá AAAA-MM-DD).
const diaLocal = (d = new Date()) => d.toLocaleDateString('sv')
export const bonusDiarioDisponivel = (d) => {
  const e = ler()
  return !!e && e.bonusDiario !== diaLocal(d)
}
// Sequência: +1 se o último bônus foi ontem, senão volta a 1. Todo 7º dia seguido vale o bônus da semana.
export function proximoBonus(e, d) {
  const ontem = new Date(d ?? Date.now())
  ontem.setDate(ontem.getDate() - 1)
  const sequencia = e?.bonusDiario === diaLocal(ontem) ? (e.sequencia ?? 1) + 1 : 1
  return { creditos: sequencia % 7 === 0 ? CUSTOS.bonusSemana : CUSTOS.bonusDiario, sequencia }
}
export function pegarBonusDiario(d) {
  if (!bonusDiarioDisponivel(d)) return false
  const { creditos, sequencia } = proximoBonus(ler(), d)
  return alterar((e) => {
    e.saldo += creditos
    e.bonusDiario = diaLocal(d)
    e.sequencia = sequencia
    e.melhorSequencia = Math.max(e.melhorSequencia ?? 0, sequencia) // a conquista de 7 dias não some quando a sequência quebra
  })
}

// Uma gravação só: se o navegador recusar, saldo, plano e histórico ficam como estavam.
export const comprar = ({ creditos, plano = null, descricao, preco }) =>
  alterar((e) => {
    e.saldo += creditos
    if (plano) e.plano = plano
    e.compras.unshift({ descricao, creditos, preco, data: Date.now() })
  })
export const getCompras = () => ler()?.compras ?? []

// Rostos (ficam salvos até o usuário apagar). A "foto" é a do rosto ativo.
// Estado de antes dos rostos só tem `foto`: na leitura ele vira o primeiro rosto.
export const MAX_ROSTOS = 3
const rostosDe = (e) => e?.rostos ?? (e?.foto ? [{ id: 'r1', nome: e.usuario.nome, foto: e.foto }] : [])
const ativoDe = (e) => {
  const r = rostosDe(e)
  return r.find((x) => x.id === e?.rostoAtivo) ?? r[0] ?? null
}
// Passa o estado antigo para `rostos` antes de alterar.
function normalizarRostos(e) {
  e.rostos = rostosDe(e)
  delete e.foto
}

export const getRostos = () => rostosDe(ler())
export const getRostoAtivo = () => ativoDe(ler())
export const getFoto = () => getRostoAtivo()?.foto ?? null

// Troca a foto do rosto ativo; com `novo`, adiciona um rosto e o deixa ativo.
export function salvarFoto(dataUrl, { novo = false } = {}) {
  if (novo && getRostos().length >= MAX_ROSTOS) return false
  return alterar((e) => {
    normalizarRostos(e)
    let rosto = novo ? null : e.rostos.find((x) => x.id === ativoDe(e)?.id)
    if (!rosto) {
      rosto = { id: crypto.randomUUID().slice(0, 8), nome: e.rostos.length ? `Rosto ${e.rostos.length + 1}` : e.usuario.nome }
      e.rostos.push(rosto)
    }
    rosto.foto = dataUrl
    e.rostoAtivo = rosto.id
  })
}

export const usarRosto = (id) =>
  getRostos().some((r) => r.id === id) &&
  alterar((e) => {
    normalizarRostos(e)
    e.rostoAtivo = id
  })

// Apaga o rosto ativo; o consentimento só cai quando não sobra nenhum.
export const apagarFoto = () =>
  alterar((e) => {
    const ativo = ativoDe(e)
    normalizarRostos(e)
    e.rostos = e.rostos.filter((r) => r.id !== ativo?.id)
    e.rostoAtivo = e.rostos[0]?.id ?? null
    if (!e.rostos.length) e.consentimento = false
  })
export const getConsentimento = () => ler()?.consentimento ?? false
export const setConsentimento = (v) => alterar((e) => (e.consentimento = !!v))

// Criações
export const getCriacoes = () => ler()?.criacoes ?? []
export const getCriacao = (id) => getCriacoes().find((c) => c.id === id) ?? null
export const addCriacao = (c) => alterar((e) => e.criacoes.unshift(c))
export const updateCriacao = (id, patch) =>
  alterar((e) => {
    const c = e.criacoes.find((x) => x.id === id)
    if (c) Object.assign(c, patch)
  })

// Favoritos (ids de clipe). Estado salvo antes da fase 1.5 não tem o campo.
export const getFavoritos = () => ler()?.favoritos ?? []

// Devolve o novo estado (true = favoritado); se não gravar, devolve o estado anterior.
export function alternarFavorito(clipId) {
  const antes = getFavoritos().includes(clipId)
  const ok = alterar((e) => {
    const f = e.favoritos ?? []
    e.favoritos = antes ? f.filter((x) => x !== clipId) : [...f, clipId]
  })
  return ok ? !antes : antes
}

// Só apaga o que não está gerando: o crédito de um job em andamento está reservado.
export function removerCriacao(id) {
  const c = getCriacao(id)
  if (!c || c.status === 'gerando') return false
  return alterar((e) => (e.criacoes = e.criacoes.filter((x) => x.id !== id)))
}

// Fecha um job uma única vez: sucesso debita, falha só libera a reserva.
export function concluirCriacao(id, sucesso) {
  alterar((e) => {
    const c = e.criacoes.find((x) => x.id === id)
    if (!c || c.status !== 'gerando') return
    c.status = sucesso ? 'pronto' : 'falhou'
    if (sucesso) e.saldo -= c.custo
  })
}
