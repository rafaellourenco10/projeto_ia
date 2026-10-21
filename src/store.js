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

const novoEstado = (usuario, saldo, plano = null) => ({ usuario, logado: true, plano, saldo, foto: null, consentimento: false, criacoes: [], compras: [] })

export function onChange(fn) {
  ouvintes.add(fn)
  window.addEventListener('storage', (e) => e.key === CHAVE && fn())
}

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

export const registrarCompra = (compra) => alterar((e) => e.compras.unshift({ ...compra, data: Date.now() }))
export const getCompras = () => ler()?.compras ?? []

// Foto (fica salva até o usuário apagar)
export const getFoto = () => ler()?.foto ?? null
export const salvarFoto = (dataUrl) => alterar((e) => (e.foto = dataUrl))
export const apagarFoto = () =>
  alterar((e) => {
    e.foto = null
    e.consentimento = false
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

// Fecha um job uma única vez: sucesso debita, falha só libera a reserva.
export function concluirCriacao(id, sucesso) {
  alterar((e) => {
    const c = e.criacoes.find((x) => x.id === id)
    if (!c || c.status !== 'gerando') return
    c.status = sucesso ? 'pronto' : 'falhou'
    if (sucesso) e.saldo -= c.custo
  })
}
