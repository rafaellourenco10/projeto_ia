// Termos e Privacidade: páginas públicas, sem shell.
import '../main.css'
import { CUSTOS } from '../creditos.js'

document.querySelectorAll('[data-bonus]').forEach((el) => (el.textContent = CUSTOS.bonusCadastro))
const custos = document.getElementById('lista-custos')
if (custos)
  custos.innerHTML = [
    ['Clipe da biblioteca', CUSTOS.clipe],
    ['Vídeo de 5 s', CUSTOS.video5],
    ['Vídeo de 10 s', CUSTOS.video10],
    ['Foto', CUSTOS.foto],
  ]
    .map(([nome, n]) => `<li class="p-space-sm rounded-lg bg-surface-container-low text-center flex flex-col"><span class="font-headline-sm text-headline-sm text-tertiary font-bold">${n}</span><span class="font-label-sm text-label-sm">${nome}</span></li>`)
    .join('')

// Índice sempre aberto no desktop; no celular começa fechado.
const indice = document.querySelector('[data-indice]')
const desktop = matchMedia('(min-width: 1024px)')
const ajustar = () => (indice.open = desktop.matches)
desktop.addEventListener('change', ajustar)
ajustar()
indice.querySelector('summary').addEventListener('click', (e) => desktop.matches && e.preventDefault())
indice.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => (indice.open = desktop.matches)))

// "Voltar" volta para a página anterior do site; sem ela, vai para a landing.
document.querySelector('[data-voltar]').addEventListener('click', (e) => {
  if (document.referrer.startsWith(location.origin) && history.length > 1) {
    e.preventDefault()
    history.back()
  }
})
