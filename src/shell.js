// Shell das rotas internas: sidebar (desktop), header e bottom nav (celular).
// Markup portado de telas/in_cio_biblioteca_de_clipes. A página só escreve o <main>.
import * as store from './store.js'
import { esc } from './util.js'

const LINKS = [
  { rota: 'inicio', icone: 'movie', nome: 'Início', curto: 'Início' },
  { rota: 'criar-com-texto', icone: 'magic_button', nome: 'Criar com Texto', curto: 'Criar' },
  { rota: 'minhas-criacoes', icone: 'video_library', nome: 'Minhas Criações', curto: 'Criações' },
  { rota: 'creditos-planos', icone: 'diamond', nome: 'Créditos & Planos' },
  { rota: 'perfil-rosto', icone: 'face', nome: 'Perfil & Rosto', curto: 'Perfil' },
]

const ATIVO_SIDE = 'bg-surface-container-high !text-primary font-bold shadow-[0_0_16px_rgba(208,188,255,0.15)]'

function avatar(tamanho) {
  const foto = store.getFoto()
  return foto
    ? `<img alt="Sua foto" class="${tamanho} rounded-full object-cover" src="${foto}"/>`
    : `<span class="${tamanho} rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant"><span class="material-symbols-outlined text-lg" aria-hidden="true">face</span></span>`
}

function sidebar(rota) {
  const u = store.getUsuario()
  const links = LINKS.map(
    (l) => `<a href="/${l.rota}" ${l.rota === rota ? 'aria-current="page"' : ''} class="flex items-center gap-space-sm px-space-md py-3 rounded-xl text-on-surface-variant font-label-md text-label-md hover:bg-surface-container hover:text-on-surface transition-all ${l.rota === rota ? ATIVO_SIDE : ''}"><span class="material-symbols-outlined" aria-hidden="true">${l.icone}</span>${l.nome}</a>`,
  ).join('')
  return `
<aside class="hidden md:flex fixed left-0 top-0 h-full w-72 bg-surface-container-lowest/90 backdrop-blur-2xl z-50 flex-col justify-between py-space-md shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
  <div class="flex flex-col gap-space-md">
    <a href="/inicio" class="px-space-md flex items-center gap-space-sm">
      <img alt="" class="h-8 w-8 object-contain" src="/img/logo.png"/>
      <span class="font-headline-sm text-headline-sm text-on-surface tracking-tight">SelfieMovie</span>
    </a>
    <div class="mx-space-md p-space-sm rounded-xl bg-surface-container/60 backdrop-blur-md flex items-center justify-between shadow-[0_0_20px_rgba(160,120,255,0.15)]">
      <div class="flex items-center gap-space-xs">
        <span class="material-symbols-outlined text-secondary text-lg" aria-hidden="true">auto_awesome</span>
        <div class="flex flex-col">
          <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Saldo</span>
          <span class="font-label-md text-label-md text-on-surface"><span data-saldo>${store.getSaldoDisponivel()}</span> créditos</span>
        </div>
      </div>
      <a href="/creditos-planos" class="px-space-sm py-1 rounded-lg bg-secondary-container text-on-secondary-container font-label-sm text-label-sm hover:bg-secondary hover:text-on-secondary transition-all flex items-center gap-1 shadow-[0_0_12px_rgba(170,2,102,0.4)]"><span class="material-symbols-outlined text-xs" aria-hidden="true">add</span>Recarregar</a>
    </div>
    <nav aria-label="Principal" class="flex flex-col gap-1 px-space-sm">${links}</nav>
  </div>
  <div class="px-space-md">
    <div class="p-space-sm rounded-xl bg-surface-container-low/70 flex items-center justify-between gap-space-sm">
      <div class="flex items-center gap-space-sm min-w-0">
        <span data-avatar>${avatar('w-8 h-8')}</span>
        <div class="flex flex-col min-w-0">
          <span class="font-label-md text-label-md text-on-surface truncate">${esc(u?.nome)}</span>
          <span class="font-label-sm text-label-sm text-tertiary truncate">${esc(store.getPlano() ?? 'Sem plano')}</span>
        </div>
      </div>
      <a href="/perfil-rosto" title="Configurações" aria-label="Configurações" class="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"><span class="material-symbols-outlined text-lg" aria-hidden="true">settings</span></a>
    </div>
  </div>
</aside>`
}

function header() {
  return `
<header class="fixed top-0 left-0 md:left-72 right-0 h-16 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.3)] z-40 flex items-center justify-between gap-space-sm px-gutter-mobile md:px-gutter">
  <a href="/inicio" class="flex items-center gap-space-sm md:hidden">
    <img alt="" class="h-7 w-7 object-contain" src="/img/logo.png"/>
    <span class="font-headline-sm text-headline-sm text-on-surface tracking-tight">SelfieMovie</span>
  </a>
  <form action="/inicio" role="search" class="hidden sm:flex items-center flex-1 max-w-md">
    <label class="w-full flex items-center gap-space-xs px-space-md py-2 rounded-xl bg-surface-container-low/90 text-on-surface-variant focus-within:ring-2 focus-within:ring-primary">
      <span class="material-symbols-outlined text-sm" aria-hidden="true">search</span>
      <span class="sr-only">Buscar clipes</span>
      <input id="busca" name="q" type="search" autocomplete="off" placeholder="Buscar clipes, estilos, categorias..." class="w-full bg-transparent border-0 p-0 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:ring-0 focus:outline-none"/>
    </label>
  </form>
  <div class="ml-auto flex items-center gap-space-sm">
    <a href="/creditos-planos" aria-label="Saldo de créditos" class="flex items-center gap-space-xs px-space-sm sm:px-space-md py-2 rounded-full bg-surface-container-high/80 text-on-surface hover:bg-surface-container-highest transition-colors">
      <span class="material-symbols-outlined text-secondary text-sm" aria-hidden="true">bolt</span><span class="font-label-md text-label-md" data-saldo>${store.getSaldoDisponivel()}</span>
    </a>
    <a href="/ajuda-faq" title="Ajuda" aria-label="Ajuda" class="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"><span class="material-symbols-outlined text-xl" aria-hidden="true">help</span></a>
    <a href="/criar-com-texto" aria-label="Novo vídeo" class="px-space-sm sm:px-space-md py-2 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md hover:bg-primary-fixed hover:text-on-primary-fixed transition-all flex items-center gap-space-xs shadow-[0_0_20px_rgba(160,120,255,0.4)]"><span class="material-symbols-outlined text-base" aria-hidden="true">movie_edit</span><span class="hidden sm:inline">Novo Vídeo</span></a>
    <a href="/perfil-rosto" aria-label="Perfil" class="md:hidden flex items-center" data-avatar>${avatar('w-8 h-8')}</a>
  </div>
</header>`
}

function bottomNav(rota) {
  const links = LINKS.filter((l) => l.curto).map(
    (l) => `<a href="/${l.rota}" ${l.rota === rota ? 'aria-current="page"' : ''} class="flex flex-col items-center gap-0.5 min-w-14 py-1 font-label-sm text-label-sm ${l.rota === rota ? 'text-primary font-bold' : 'text-on-surface-variant'}"><span class="material-symbols-outlined text-xl" aria-hidden="true" ${l.rota === rota ? `style="font-variation-settings: 'FILL' 1;"` : ''}>${l.icone}</span><span>${l.curto}</span></a>`,
  ).join('')
  return `<nav aria-label="Principal" class="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest/95 backdrop-blur-xl z-50 flex items-center justify-around px-gutter-mobile shadow-[0_-4px_24px_rgba(0,0,0,0.6)]">${links}</nav>`
}

// Envolve o <main> da página com o shell e devolve o <main>.
export function montarShell({ rota = null, exigirLogin = true } = {}) {
  const main = document.querySelector('main')
  if (exigirLogin && !store.getUsuario()) {
    location.replace('/entrar')
    return main
  }
  const coluna = document.createElement('div')
  coluna.className = 'md:pl-72 pt-16 pb-24 md:pb-8 min-h-screen'
  main.replaceWith(coluna)
  coluna.insertAdjacentHTML('afterbegin', header())
  coluna.append(main)
  document.body.insertAdjacentHTML('afterbegin', sidebar(rota))
  document.body.insertAdjacentHTML('beforeend', bottomNav(rota))

  const atualizar = () => {
    document.querySelectorAll('[data-saldo]').forEach((el) => (el.textContent = store.getSaldoDisponivel()))
    document.querySelectorAll('[data-avatar]').forEach((el) => (el.innerHTML = avatar('w-8 h-8')))
  }
  store.onChange(atualizar)
  atualizar() // também preenche os [data-saldo] que a página tem no <main>
  return main
}
