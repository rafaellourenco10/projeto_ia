import '../main.css'
import { montarShell } from '../shell.js'
import * as store from '../store.js'
import { CUSTOS, PLANOS, PACOTES, reais } from '../creditos.js'
import { avisar, debug } from '../util.js'

montarShell({ rota: 'creditos-planos' })

const $ = (id) => document.getElementById(id)
const clipes = (creditos) => Math.floor(creditos / CUSTOS.clipe)

function atualizar() {
  const plano = store.getPlano()
  $('plano-atual').textContent = plano ? `Plano atual: ${plano}` : 'Sem plano ativo'
  const n = clipes(store.getSaldoDisponivel())
  $('capacidade').textContent = `${n} ${n === 1 ? 'clipe' : 'clipes'}`
}
store.onChange(atualizar)
atualizar()

// Mesmos itens da landing: só o que a fase 1 entrega.
const itens = (p) => [
  `Até ${clipes(p.creditos)} clipes da biblioteca por mês`,
  'Vídeo e foto a partir de texto',
  'Resultados em HD, 9:16 ou 16:9',
  'Créditos devolvidos se a geração falhar',
]

$('lista-planos').innerHTML = PLANOS.map(
  (p) => `<div class="relative flex flex-col justify-between rounded-xl p-space-lg ${p.destaque ? 'bg-gradient-to-b from-surface-container-high via-surface-container to-surface-container shadow-2xl md:scale-[1.02] z-10' : 'bg-surface-container shadow-md'}">
  ${p.destaque ? `<div class="absolute -inset-0.5 bg-gradient-to-r from-primary-container via-secondary-container to-secondary rounded-xl blur-sm opacity-50 -z-10"></div>
  <span class="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-space-md py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-on-primary-fixed font-label-sm text-label-sm font-extrabold shadow-lg uppercase tracking-wider whitespace-nowrap"><span class="material-symbols-outlined text-[15px]" aria-hidden="true" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>Mais popular</span>` : ''}
  <div class="flex flex-col gap-space-md">
    <div class="flex flex-col gap-1">
      <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">${p.nome}</h3>
      <p class="font-body-sm text-body-sm text-on-surface-variant md:min-h-[40px]">${p.descricao}</p>
    </div>
    <div class="flex flex-col gap-1">
      <p class="flex items-baseline gap-1"><span class="font-headline-lg text-headline-lg font-extrabold text-on-surface tracking-tight">${reais(p.preco)}</span><span class="font-body-sm text-body-sm text-outline">/ mês</span></p>
      <p class="font-label-md text-label-md font-bold ${p.destaque ? 'text-secondary' : 'text-primary'}">${p.creditos} créditos por mês</p>
    </div>
    <div class="h-px w-full bg-surface-container-highest"></div>
    <ul class="flex flex-col gap-space-sm font-body-sm text-body-sm ${p.destaque ? 'text-on-surface' : 'text-on-surface-variant'}">
      ${itens(p).map((i) => `<li class="flex items-start gap-2"><span class="material-symbols-outlined text-[18px] text-tertiary shrink-0" aria-hidden="true">check_circle</span><span>${i}</span></li>`).join('')}
    </ul>
  </div>
  <button type="button" data-plano="${p.id}" class="mt-space-lg w-full py-space-sm px-space-md rounded-lg font-label-lg text-label-lg font-bold transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${p.destaque ? 'bg-gradient-to-r from-primary-container to-secondary-container hover:brightness-110 text-on-surface shadow-[0_0_24px_rgba(160,120,255,0.4)]' : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'}">
    <span>Assinar ${p.nome}</span><span class="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
  </button>
</div>`,
).join('')

$('lista-pacotes').innerHTML = PACOTES.map(
  (p, i) => `<div class="relative flex flex-col justify-between rounded-xl p-space-md transition-all ${i === 1 ? 'bg-surface-container shadow-md' : 'bg-surface-container-low'}">
  ${i === 1 ? '<span class="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold tracking-wide uppercase">Melhor valor</span>' : ''}
  <div class="flex items-start justify-between gap-space-sm">
    <div class="flex flex-col">
      <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">${p.creditos} créditos</h3>
      <span class="font-body-sm text-body-sm ${i === 1 ? 'text-secondary' : 'text-on-surface-variant'}">≈ ${clipes(p.creditos)} clipes</span>
    </div>
    <span class="font-headline-sm text-headline-sm font-extrabold ${i === 1 ? 'text-secondary' : 'text-primary'}">${reais(p.preco)}</span>
  </div>
  <button type="button" data-pacote="${p.id}" aria-label="Comprar ${p.creditos} créditos" class="mt-space-md w-full py-2 px-space-sm rounded-lg font-label-md text-label-md font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${i === 1 ? 'bg-secondary hover:bg-secondary-fixed text-on-secondary' : 'bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface'}">Comprar</button>
</div>`,
).join('')

const LINHAS = [
  ['movie', 'Clipe da biblioteca', 'Você no lugar do protagonista', CUSTOS.clipe],
  ['videocam', 'Vídeo de 5 s', 'Criado a partir do seu texto', CUSTOS.video5],
  ['theaters', 'Vídeo de 10 s', 'Cena mais longa a partir do texto', CUSTOS.video10],
  ['portrait', 'Foto', 'Imagem a partir do seu texto', CUSTOS.foto],
]
$('tabela-custos').innerHTML = LINHAS.map(
  ([icone, nome, desc, n]) => `<tr>
  <td class="py-space-sm"><div class="flex items-center gap-space-sm">
    <div class="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0"><span class="material-symbols-outlined text-[20px]" aria-hidden="true">${icone}</span></div>
    <div class="flex flex-col"><span class="font-semibold text-on-surface">${nome}</span><span class="font-body-sm text-body-sm text-outline">${desc}</span></div>
  </div></td>
  <td class="py-space-sm text-right whitespace-nowrap"><span class="font-headline-sm text-headline-sm font-bold text-tertiary">${n}</span><span class="font-label-sm text-label-sm text-outline ml-1">créditos</span></td>
</tr>`,
).join('')

// Fase 1: sem pagamento real. Com ?debug a compra credita na hora, para testar o fluxo.
document.querySelector('main').addEventListener('click', (e) => {
  const b = e.target.closest('[data-plano], [data-pacote]')
  if (!b) return
  if (!debug()) return avisar('Pagamento disponível em breve')
  const plano = PLANOS.find((p) => p.id === b.dataset.plano)
  const item = plano ?? PACOTES.find((p) => p.id === b.dataset.pacote)
  store.adicionarCreditos(item.creditos)
  if (plano) store.setPlano(plano.nome)
  store.registrarCompra({ descricao: plano ? `Plano ${plano.nome}` : `Pacote de ${item.creditos} créditos`, creditos: item.creditos, preco: item.preco })
  avisar(`+${item.creditos} créditos (simulação)`)
})
