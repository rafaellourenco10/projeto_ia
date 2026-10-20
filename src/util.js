// Escapa texto vindo do usuário antes de entrar em innerHTML.
export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export const param = (nome) => new URLSearchParams(location.search).get(nome)
export const debug = () => new URLSearchParams(location.search).has('debug')

// Aviso flutuante curto (substitui alert()).
export function avisar(msg) {
  let el = document.getElementById('aviso')
  if (!el) {
    el = document.createElement('div')
    el.id = 'aviso'
    el.setAttribute('role', 'status')
    el.className =
      'fixed left-1/2 -translate-x-1/2 bottom-24 md:bottom-8 z-[60] px-space-md py-space-sm rounded-xl bg-surface-container-highest text-on-surface font-label-md text-label-md shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-opacity opacity-0 pointer-events-none'
    document.body.append(el)
  }
  el.textContent = msg
  el.classList.remove('opacity-0')
  clearTimeout(el._t)
  el._t = setTimeout(() => el.classList.add('opacity-0'), 3000)
}
