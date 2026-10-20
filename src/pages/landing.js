import '../main.css'
import { CUSTOS, PLANOS, reais } from '../creditos.js'
import { getUsuario } from '../store.js'

const EXEMPLOS = [
  { titulo: 'Agente Secreto no Cassino', img: '/img/landing-agente-secreto.jpg', alt: 'Homem de smoking em um cassino à noite', selo: 'Popular', filtro: 'cinema', duracao: '00:18' },
  { titulo: 'Explorador Intergaláctico', img: '/img/landing-astronauta.jpg', alt: 'Astronauta em um planeta alienígena roxo', selo: 'Novo', filtro: 'aventura', duracao: '00:25' },
  { titulo: 'Dançarino em Festival', img: '/img/landing-danca.jpg', alt: 'Dançarina em palco de festival com lasers', selo: 'Em alta', filtro: 'danca', duracao: '00:15' },
  { titulo: 'Guerreiro do Trono de Cinzas', img: '/img/landing-guerreiro.jpg', alt: 'Guerreiro de armadura em campo de batalha medieval', selo: 'Épico', filtro: 'cinema', duracao: '00:20' },
]

const logado = !!getUsuario()
const destinoCta = logado ? '/inicio' : '/entrar#cadastro'

document.querySelectorAll('[data-custo]').forEach((el) => (el.textContent = CUSTOS[el.dataset.custo]))
document.getElementById('ano').textContent = new Date().getFullYear()
document.querySelectorAll('[data-cta="cadastro"]').forEach((a) => (a.href = destinoCta))
if (logado) {
  document.querySelectorAll('[data-cta="entrar"]').forEach((a) => {
    a.href = '/inicio'
    a.textContent = 'Abrir o app'
  })
}

// Galeria com filtros
const galeria = document.getElementById('galeria')
galeria.innerHTML = EXEMPLOS.map(
  (e) => `
<a href="${destinoCta}" data-grupo="${e.filtro}" class="group relative rounded-2xl overflow-hidden bg-surface-container-low shadow-md transition-all duration-300 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
  <div class="relative aspect-[9/16] w-full bg-surface-container overflow-hidden">
    <img src="${e.img}" alt="${e.alt}" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
    <div class="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-black/30"></div>
    <span class="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-secondary-container/90 text-on-secondary-container font-label-sm text-label-sm font-bold">${e.selo}</span>
    <span class="absolute top-3 right-3 bg-surface-container-lowest/80 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 font-label-sm text-label-sm text-secondary">
      <span class="material-symbols-outlined text-xs" aria-hidden="true" style="font-variation-settings: 'FILL' 1;">bolt</span>${CUSTOS.clipe}<span class="sr-only"> créditos</span>
    </span>
    <span class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
      <span class="w-12 h-12 rounded-full bg-on-surface/90 text-surface-container-lowest flex items-center justify-center shadow-lg scale-90 group-hover:scale-100 transition-transform">
        <span class="material-symbols-outlined text-2xl" aria-hidden="true" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
      </span>
    </span>
    <span class="absolute bottom-3 inset-x-3 text-on-surface">
      <span class="block font-headline-sm text-sm font-bold truncate">${e.titulo}</span>
      <span class="block text-on-surface-variant font-label-sm text-label-sm mt-1">${e.duracao} • HD</span>
    </span>
  </div>
</a>`,
).join('')

const botoes = document.querySelectorAll('[data-filtro]')
function filtrar(filtro) {
  botoes.forEach((b) => {
    const ativo = b.dataset.filtro === filtro
    b.setAttribute('aria-pressed', ativo)
    b.className = `px-4 py-1.5 rounded-full font-label-md text-label-md transition-colors ${ativo ? 'bg-primary/20 text-on-surface font-semibold' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'}`
  })
  galeria.querySelectorAll('[data-grupo]').forEach((c) => (c.hidden = filtro !== 'todos' && c.dataset.grupo !== filtro))
}
botoes.forEach((b) => b.addEventListener('click', () => filtrar(b.dataset.filtro)))
filtrar('todos')

// Planos
document.getElementById('lista-planos').innerHTML = PLANOS.map((p) => {
  const itens = [
    `Até ${Math.floor(p.creditos / CUSTOS.clipe)} clipes da biblioteca por mês`,
    'Vídeo e foto a partir de texto',
    'Resultados em HD, 9:16 ou 16:9',
    'Créditos devolvidos se a geração falhar',
  ]
  const lista = itens
    .map((i) => `<li class="flex items-start gap-2"><span class="material-symbols-outlined ${p.destaque ? 'text-secondary' : 'text-tertiary'} text-sm mt-0.5" aria-hidden="true">check_circle</span><span>${i}</span></li>`)
    .join('')
  return `
<div class="relative ${p.destaque ? 'bg-gradient-to-b from-surface-container to-surface-container-low shadow-2xl md:scale-105 z-10' : 'bg-surface-container-low shadow-md'} p-space-lg rounded-2xl flex flex-col justify-between">
  ${p.destaque ? '<div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-surface-container-lowest px-3 py-1 rounded-full font-label-sm text-label-sm font-extrabold uppercase tracking-wider shadow-md whitespace-nowrap">Mais popular</div>' : ''}
  <div>
    <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">${p.nome}</h3>
    <p class="text-on-surface-variant font-body-sm text-body-sm mt-1">${p.descricao}</p>
    <p class="mt-space-md flex items-baseline gap-1">
      <span class="text-on-surface font-display-hero-mobile text-display-hero-mobile font-extrabold">${reais(p.preco)}</span>
      <span class="text-on-surface-variant font-body-sm text-body-sm">/mês</span>
    </p>
    <p class="mt-2 ${p.destaque ? 'text-secondary' : 'text-primary'} font-label-md text-label-md flex items-center gap-1">
      <span class="material-symbols-outlined text-base" aria-hidden="true">bolt</span><span><strong>${p.creditos} créditos</strong> mensais</span>
    </p>
    <ul class="mt-space-md space-y-2 ${p.destaque ? 'text-on-surface' : 'text-on-surface-variant'} font-body-sm text-body-sm">${lista}</ul>
  </div>
  <a href="${destinoCta}" class="mt-space-lg w-full py-3 rounded-xl font-label-lg text-label-lg text-center transition-all ${p.destaque ? 'bg-gradient-to-r from-primary via-primary-container to-secondary text-surface-container-lowest font-bold shadow-lg hover:scale-[1.02]' : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold'}">
    ${p.destaque ? 'Assinar Pro' : `Escolher ${p.nome.split(' ')[0]}`}
  </a>
</div>`
}).join('')
