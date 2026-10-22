import '../main.css'
import { montarShell } from '../shell.js'
import * as store from '../store.js'
import * as api from '../api.js'
import { param, debug, avisar, MSG_SEM_ESPACO } from '../util.js'

montarShell({ rota: 'minhas-criacoes' })

const $ = (id) => document.getElementById(id)
const jobId = param('job')
const CIRCUNFERENCIA = 596.9
let timer = null

function etapas(fase) {
  return api.FASES.map((nome, i) => {
    const feito = i < fase
    const atual = i === fase
    const icone = feito ? 'check' : atual ? 'sync' : 'radio_button_unchecked'
    const caixa = atual
      ? 'bg-surface-container-highest/90 relative overflow-hidden shadow-[0_0_24px_rgba(160,120,255,0.18)]'
      : feito ? 'bg-surface-container-high/60' : 'bg-surface-container-low/40'
    const bola = atual
      ? 'bg-primary-container text-on-primary-container shadow-[0_0_16px_rgba(160,120,255,0.6)]'
      : feito ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-highest text-outline'
    return `<li class="flex items-center gap-space-sm p-3.5 rounded-2xl transition-all ${caixa}">
  ${atual ? '<div class="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary via-secondary to-tertiary"></div>' : ''}
  <span class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${bola}"><span class="material-symbols-outlined text-base ${atual ? 'animate-spin' : ''}" aria-hidden="true">${icone}</span></span>
  <span class="flex-1 min-w-0 font-label-md text-label-md ${atual ? 'text-primary dark:text-primary-fixed font-bold' : feito ? 'text-on-surface' : 'text-outline'}">${nome.replace('...', '')}</span>
  <span class="font-label-sm text-label-sm ${atual ? 'text-primary font-bold' : feito ? 'text-tertiary' : 'text-outline'}">${feito ? 'Concluído' : atual ? 'Em andamento' : 'Pendente'}</span>
</li>`
  }).join('')
}

function mostrar(estado) {
  $('nao-encontrado').hidden = estado !== 'nao-encontrado'
  $('cabecalho').hidden = estado === 'nao-encontrado'
  $('ativo').hidden = estado !== 'ativo'
  $('falha').hidden = estado !== 'falha'
}

async function atualizar() {
  const s = await api.statusJob(jobId)
  if (!s) {
    clearInterval(timer)
    return mostrar('nao-encontrado')
  }
  if (s.status === 'pronto') {
    clearInterval(timer)
    return location.replace(`/resultado?job=${encodeURIComponent(jobId)}`)
  }
  const c = s.criacao
  $('subtitulo').textContent = c.tipo === 'foto' ? `Sua foto: ${c.titulo}` : `Seu vídeo: ${c.titulo}`
  if (s.status === 'falhou') {
    clearInterval(timer)
    $('chip').hidden = true
    $('titulo').textContent = 'A geração não deu certo'
    $('debug').hidden = true
    return mostrar('falha')
  }
  mostrar('ativo')
  $('titulo').textContent = c.tipo === 'foto' ? 'Gerando sua foto' : 'Gerando seu vídeo'
  $('arco').setAttribute('stroke-dashoffset', CIRCUNFERENCIA * (1 - s.progresso / 100))
  $('anel').setAttribute('aria-valuenow', s.progresso)
  $('pct').textContent = `${s.progresso}%`
  $('legenda').textContent = api.FASES[s.fase]
  $('restante').textContent = `Cerca de ${s.restanteSeg} s`
  $('dica-plano').hidden = !!store.getPlano()
  $('etapa').textContent = `Etapa ${s.fase + 1} de ${api.FASES.length}`
  $('etapas').innerHTML = etapas(s.fase)
}

$('btn-tentar').addEventListener('click', async () => {
  $('btn-tentar').disabled = true
  try {
    const { jobId: novo } = await api.refazer(jobId)
    location.replace(`/gerando?job=${novo}${debug() ? '&debug' : ''}`)
  } catch (e) {
    if (e.message === 'SEM_SEGUNDO_ROSTO') return location.replace(`/clipe?id=${encodeURIComponent(store.getCriacao(jobId).clipId)}`)
    $('btn-tentar').disabled = false
    $('erro-refazer').classList.remove('hidden')
    $('erro-refazer').innerHTML =
      e.message === 'SEM_SALDO'
        ? 'Saldo insuficiente. <a class="underline" href="/creditos-planos">Comprar créditos</a>'
        : e.message === 'SEM_FOTO'
          ? 'Envie sua foto primeiro. <a class="underline" href="/perfil-rosto/foto">Enviar foto</a>'
          : e.message === 'SEM_ESPACO'
            ? MSG_SEM_ESPACO
            : 'Não foi possível tentar de novo.'
  }
})

// Simulação (só com ?debug): termina o job agora, com falha ou sucesso.
if (debug()) {
  $('debug').hidden = false
  const terminar = (falhar) => {
    const c = store.getCriacao(jobId)
    if (c?.status === 'gerando' && !store.updateCriacao(jobId, { falhar, criadoEm: Date.now() - api.DURACAO_MS })) avisar(MSG_SEM_ESPACO)
    atualizar()
  }
  $('sim-falha').addEventListener('click', () => terminar(true))
  $('sim-sucesso').addEventListener('click', () => terminar(false))
}

atualizar()
timer = setInterval(atualizar, 500)
