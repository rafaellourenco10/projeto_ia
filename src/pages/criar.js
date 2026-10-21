import '../main.css'
import { montarShell } from '../shell.js'
import * as store from '../store.js'
import * as api from '../api.js'
import { CUSTOS, custo } from '../creditos.js'
import { debug } from '../util.js'

montarShell({ rota: 'criar-com-texto' })

const $ = (id) => document.getElementById(id)
const prompt = $('prompt')
const estado = { modo: 'video', estilo: 'cinematic', duracao: '5', proporcao: '9:16' }

const SUGESTOES = [
  'eu descendo uma montanha nevada de esqui ao pôr do sol, com neve voando na câmera',
  'eu como comandante de uma nave espacial, olhando Saturno pela janela da ponte',
  'eu pilotando uma moto clássica na chuva em uma cidade cheia de neon à noite',
  'eu chegando a um festival de cinema sob flashes de fotógrafos, em roupa de gala',
  'eu surfando uma onda gigante no Havaí ao pôr do sol, em câmera lenta',
  'eu dançando em um telhado de Nova York ao amanhecer, com a cidade ao fundo',
  'eu explorando ruínas antigas na selva com uma lanterna, estilo filme de aventura',
]

// Classes de selecionado por grupo de botões (o modo usa o gradiente do CTA).
const ATIVO = {
  modo: ['bg-gradient-to-r', 'from-primary-container', 'to-secondary-container', 'text-on-surface', 'shadow-[0_0_20px_rgba(160,120,255,0.4)]'],
  outro: ['bg-surface-container-high', 'shadow-[0_0_18px_rgba(208,188,255,0.25)]', 'ring-1', 'ring-primary/40'],
}
const INATIVO = {
  modo: ['text-on-surface-variant', 'hover:text-on-surface', 'hover:bg-surface-container-high/40'],
  outro: ['bg-surface-container/50', 'hover:bg-surface-container-high/70'],
}

document.querySelector('[data-custo-video5]').textContent = CUSTOS.video5
document.querySelector('[data-custo-video10]').textContent = CUSTOS.video10

// Rosto
const foto = store.getFoto()
$('rosto-nome').textContent = store.getUsuario()?.nome ?? ''
if (foto) {
  $('rosto-foto').innerHTML = `<img alt="Sua foto" class="w-full h-full object-cover" src="${foto}"/>`
  $('rosto-texto').textContent = 'Sua foto será usada nesta criação'
} else {
  $('rosto-foto').innerHTML = '<span class="material-symbols-outlined text-on-surface-variant text-3xl" aria-hidden="true">face</span>'
  $('rosto-texto').textContent = 'Você ainda não enviou sua foto'
  $('link-foto-texto').textContent = 'Enviar'
}

function render() {
  const total = custo({ tipo: estado.modo, duracao: Number(estado.duracao) })
  const disponivel = store.getSaldoDisponivel()
  const texto = prompt.value.trim()

  for (const b of document.querySelectorAll('[data-grupo]')) {
    const tipo = b.dataset.grupo === 'modo' ? 'modo' : 'outro'
    const ativo = estado[b.dataset.grupo] === b.dataset.valor
    b.setAttribute('aria-pressed', ativo)
    b.classList.remove(...(ativo ? INATIVO : ATIVO)[tipo])
    b.classList.add(...(ativo ? ATIVO : INATIVO)[tipo])
    b.querySelector('[data-check]')?.classList.toggle('opacity-0', !ativo)
  }
  $('bloco-duracao').hidden = estado.modo === 'foto'

  $('contador').textContent = `${prompt.value.length}/500`
  $('resumo-tipo').textContent = estado.modo === 'foto' ? 'Foto' : `Vídeo de ${estado.duracao} s`
  $('resumo-estilo').textContent = document.querySelector(`[data-grupo="estilo"][data-valor="${estado.estilo}"] [data-nome]`).textContent
  $('resumo-proporcao').textContent = estado.proporcao
  document.querySelectorAll('[data-total]').forEach((el) => (el.textContent = total))
  $('restarao').textContent = disponivel >= total ? `Restarão ${disponivel - total}` : `Faltam ${total - disponivel}`
  $('btn-gerar-texto').textContent = `Gerar ${estado.modo === 'foto' ? 'foto' : 'vídeo'} (${total} créditos)`

  // O botão só libera com texto, foto e saldo; o motivo aparece embaixo.
  const motivo = !texto
    ? 'Escreva o que você quer na cena para continuar.'
    : !store.getFoto()
      ? `Envie sua foto primeiro. <a class="text-primary underline" href="${$('link-foto').getAttribute('href')}">Enviar foto</a>`
      : disponivel < total
        ? 'Saldo insuficiente. <a class="text-primary underline" href="/creditos-planos">Comprar créditos</a>'
        : ''
  $('btn-gerar').disabled = !!motivo
  $('motivo').innerHTML = motivo
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-grupo]')
  if (!b) return
  estado[b.dataset.grupo] = b.dataset.valor
  render()
})
prompt.addEventListener('input', render)
$('btn-sugestao').addEventListener('click', () => {
  const outras = SUGESTOES.filter((s) => s !== prompt.value)
  prompt.value = outras[Math.floor(Math.random() * outras.length)]
  render()
})
$('btn-limpar').addEventListener('click', () => {
  prompt.value = ''
  render()
  prompt.focus()
})

$('btn-gerar').addEventListener('click', async () => {
  $('btn-gerar').disabled = true
  try {
    const { jobId } = await api.gerarComTexto({
      modo: estado.modo,
      prompt: prompt.value.trim(),
      estilo: estado.estilo,
      duracao: Number(estado.duracao),
      proporcao: estado.proporcao,
    })
    location.href = `/gerando?job=${jobId}${debug() ? '&debug' : ''}`
  } catch (e) {
    render()
    $('motivo').textContent = e.message === 'SEM_SALDO' ? 'Saldo insuficiente.' : 'Não foi possível começar a geração. Tente de novo.'
  }
})

render()
