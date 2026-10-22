import '../main.css'
import { montarShell } from '../shell.js'
import * as store from '../store.js'
import * as api from '../api.js'
import { esc, debug, avisar, MSG_SEM_ESPACO } from '../util.js'

montarShell({ rota: 'minhas-criacoes' })

const $ = (id) => document.getElementById(id)
let aba = 'todos'
let simularVazia = false

const ehDaAba = { todos: () => true, videos: (c) => c.tipo !== 'foto', fotos: (c) => c.tipo === 'foto' }
const ATIVO = ['bg-surface-container-high', 'text-primary', 'font-bold', 'shadow-md']
const INATIVO = ['text-on-surface-variant', 'hover:text-on-surface', 'hover:bg-surface-container']

const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })
function quando(ms) {
  const min = Math.round((ms - Date.now()) / 60000)
  if (min > -1) return 'Agora'
  if (min > -60) return rtf.format(min, 'minute')
  if (min > -1440) return rtf.format(Math.round(min / 60), 'hour')
  return rtf.format(Math.round(min / 1440), 'day')
}

const rotuloTipo = (c) => (c.tipo === 'clipe' ? 'Clipe' : c.tipo === 'foto' ? 'Foto' : 'Vídeo')
const rodape = (c, direita) => `<div class="p-space-sm flex flex-col gap-1">
  <div class="flex items-center justify-between gap-1">
    <span class="font-label-sm text-label-sm text-tertiary uppercase tracking-wider font-bold">${rotuloTipo(c)}</span>
    ${direita}
  </div>
  <h2 class="font-label-lg text-label-lg text-on-surface font-bold truncate">${esc(c.titulo)}</h2>
  <span class="font-body-sm text-body-sm text-on-surface-variant">${c.proporcao}${c.duracao ? ` • ${c.duracao} s` : ''}</span>
</div>`
const CARD = 'group relative flex flex-col bg-surface-container-low rounded-2xl overflow-hidden shadow-lg transition-all duration-300'
const LINK = 'md:hover:scale-[1.02] md:hover:shadow-[0_12px_40px_-10px_rgba(160,120,255,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'

function card(c, s) {
  if (c.status === 'pronto')
    return `<a href="/resultado?job=${c.id}" class="${CARD} ${LINK}">
  <div class="relative aspect-[9/14] w-full overflow-hidden bg-surface-container-lowest">
    <img alt="" loading="lazy" src="${c.img}" class="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-105"/>
    <span class="absolute top-space-sm left-space-sm px-2.5 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-300 font-label-sm text-label-sm font-bold flex items-center gap-1 shadow-md"><span class="material-symbols-outlined text-xs" aria-hidden="true">check_circle</span>Pronto</span>
  </div>
  ${rodape(c, `<span class="font-label-sm text-label-sm text-outline">${quando(c.criadoEm)}</span>`)}
</a>`
  if (c.status === 'gerando')
    return `<a href="/gerando?job=${c.id}" class="${CARD} ${LINK}">
  <div class="relative aspect-[9/14] w-full overflow-hidden bg-scrim">
    <img alt="" loading="lazy" src="${c.img}" class="w-full h-full object-cover opacity-60 blur-[1px]"/>
    <div class="absolute inset-0 bg-primary-container/20 flex flex-col items-center justify-center p-space-md text-center gap-space-sm">
      <div class="w-14 h-14 rounded-full border-4 border-primary-fixed-dim/20 border-t-primary-fixed-dim animate-spin" aria-hidden="true"></div>
      <span class="font-headline-sm text-headline-sm text-primary-fixed-dim font-bold" data-pct="${c.id}">${s?.progresso ?? 0}%</span>
    </div>
    <span class="absolute top-space-sm left-space-sm px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold flex items-center gap-1.5 shadow-[0_0_16px_rgba(160,120,255,0.4)]"><span class="material-symbols-outlined text-xs animate-spin" aria-hidden="true">progress_activity</span>Gerando</span>
    <div class="absolute inset-x-0 bottom-0 h-1.5 bg-surface-container-highest"><div class="h-full bg-gradient-to-r from-tertiary via-primary to-secondary transition-all duration-500" style="width: ${s?.progresso ?? 0}%" data-barra="${c.id}"></div></div>
  </div>
  ${rodape(c, '<span class="font-label-sm text-label-sm text-tertiary font-bold">Processando</span>')}
</a>`
  return `<div class="${CARD}">
  <div class="relative aspect-[9/14] w-full overflow-hidden bg-surface-container-lowest">
    <img alt="" loading="lazy" src="${c.img}" class="w-full h-full object-cover grayscale opacity-30"/>
    <div class="absolute inset-0 bg-surface-container-lowest/85 flex flex-col items-center justify-center p-space-sm text-center gap-space-xs">
      <span class="w-11 h-11 rounded-full bg-error-container text-on-error-container flex items-center justify-center shadow-lg"><span class="material-symbols-outlined text-2xl" aria-hidden="true">error_outline</span></span>
      <span class="font-label-md text-label-md text-error font-bold">Falhou</span>
      <p class="font-body-sm text-body-sm text-on-surface-variant">Crédito devolvido</p>
      <button type="button" data-refazer="${c.id}" class="mt-space-xs px-space-sm py-2 rounded-xl bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-on-secondary font-label-sm text-label-sm font-bold flex items-center gap-1.5 transition-all shadow-md disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><span class="material-symbols-outlined text-sm" aria-hidden="true">refresh</span>Tentar de novo</button>
      <button type="button" data-remover="${c.id}" class="px-space-sm py-1.5 rounded-xl text-on-surface-variant hover:text-error font-label-sm text-label-sm font-bold flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><span class="material-symbols-outlined text-sm" aria-hidden="true">delete</span><span>Remover</span></button>
    </div>
  </div>
  ${rodape(c, `<span class="font-label-sm text-label-sm text-outline">${quando(c.criadoEm)}</span>`)}
</div>`
}

// Atualiza os jobs em andamento pelo relógio; o que terminou muda de card.
async function sincronizar() {
  const status = {}
  for (const c of store.getCriacoes().filter((c) => c.status === 'gerando')) status[c.id] = await api.statusJob(c.id)
  return status
}

async function render() {
  const status = await sincronizar()
  const todas = simularVazia ? [] : store.getCriacoes()
  const lista = todas.filter(ehDaAba[aba])
  if ($('ordem').value === 'antigos') lista.reverse()

  $('total').textContent = `${todas.length} ${todas.length === 1 ? 'criação salva' : 'criações salvas'}`
  for (const k of Object.keys(ehDaAba)) document.querySelector(`[data-conta="${k}"]`).textContent = todas.filter(ehDaAba[k]).length
  for (const b of document.querySelectorAll('[data-aba]')) {
    const ativo = b.dataset.aba === aba
    b.setAttribute('aria-pressed', ativo)
    b.classList.remove(...(ativo ? INATIVO : ATIVO))
    b.classList.add(...(ativo ? ATIVO : INATIVO))
  }
  $('grade').innerHTML = lista.map((c) => card(c, status[c.id])).join('')
  $('grade').hidden = !lista.length
  $('vazio').hidden = !!lista.length
  $('vazio-titulo').textContent = todas.length ? 'Nada nesta aba ainda' : 'Você ainda não tem criações'
}

// A cada 1 s: só mexe no % dos cards "gerando". Quem fecha o job grava no store, e o onChange redesenha.
setInterval(async () => {
  const antes = store.getCriacoes().filter((c) => c.status === 'gerando').length
  if (!antes || simularVazia) return
  const status = await sincronizar()
  for (const [id, s] of Object.entries(status)) {
    const pct = document.querySelector(`[data-pct="${id}"]`)
    if (pct) pct.textContent = `${s.progresso}%`
    const barra = document.querySelector(`[data-barra="${id}"]`)
    if (barra) barra.style.width = `${s.progresso}%`
  }
}, 1000)

document.querySelectorAll('[data-aba]').forEach((b) =>
  b.addEventListener('click', () => {
    aba = b.dataset.aba
    render()
  }),
)
$('ordem').addEventListener('change', render)
store.onChange(render)
$('grade').addEventListener('click', async (e) => {
  const r = e.target.closest('[data-remover]')
  if (r) {
    if (!r.dataset.confirmar) {
      r.dataset.confirmar = '1'
      r.lastElementChild.textContent = 'Confirmar: remover'
      return
    }
    delete r.dataset.confirmar
    if (store.removerCriacao(r.dataset.remover)) return render()
    r.lastElementChild.textContent = 'Remover'
    return avisar(store.getCriacao(r.dataset.remover) ? MSG_SEM_ESPACO : 'Não foi possível remover agora. Recarregue a página.')
  }
  const b = e.target.closest('[data-refazer]')
  if (!b) return
  b.disabled = true
  try {
    const { jobId } = await api.refazer(b.dataset.refazer)
    location.href = `/gerando?job=${jobId}`
  } catch (err) {
    if (err.message === 'SEM_FOTO') return (location.href = '/perfil-rosto/foto?voltar=%2Fminhas-criacoes')
    if (err.message === 'SEM_SALDO') return (location.href = '/creditos-planos')
    // Um rosto da dupla foi apagado: escolhe de novo na página do clipe.
    if (err.message === 'SEM_SEGUNDO_ROSTO') return (location.href = `/clipe?id=${encodeURIComponent(store.getCriacao(b.dataset.refazer).clipId)}`)
    b.disabled = false
    avisar(err.message === 'SEM_ESPACO' ? MSG_SEM_ESPACO : 'Não foi possível tentar de novo. Recarregue a página.')
  }
})

if (debug()) {
  $('sim-vazia').hidden = false
  $('sim-vazia').addEventListener('click', () => {
    simularVazia = !simularVazia
    $('sim-vazia-texto').textContent = simularVazia ? 'Mostrar galeria' : 'Simular galeria vazia'
    render()
  })
}

render()
