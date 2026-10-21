import '../main.css'
import { montarShell } from '../shell.js'
import { CUSTOS } from '../creditos.js'
import { avisar } from '../util.js'

montarShell({ rota: 'ajuda-faq' })

const $ = (id) => document.getElementById(id)

document.querySelectorAll('[data-bonus]').forEach((el) => (el.textContent = CUSTOS.bonusCadastro))
$('lista-custos').innerHTML = [
  ['Clipe da biblioteca', CUSTOS.clipe],
  ['Vídeo de 5 s', CUSTOS.video5],
  ['Vídeo de 10 s', CUSTOS.video10],
  ['Foto', CUSTOS.foto],
]
  .map(([nome, n]) => `<li class="p-space-sm rounded-xl bg-surface-container-high flex items-center justify-between"><span class="text-on-surface">${nome}</span><span class="font-bold text-tertiary">${n} créditos</span></li>`)
  .join('')

// Atalhos do topo: abrem a pergunta do link.
document.querySelectorAll('a[href^="#faq-"]').forEach((a) => a.addEventListener('click', () => ($(a.hash.slice(1)).open = true)))

// Busca sem acento e sem caixa; abre as perguntas que batem.
const normalizar = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
const itens = [...document.querySelectorAll('#faq details')]
$('busca-faq').addEventListener('input', (e) => {
  const termo = normalizar(e.target.value.trim())
  let algum = false
  for (const d of itens) {
    const bate = !termo || normalizar(d.textContent).includes(termo)
    d.hidden = !bate
    if (termo) d.open = bate
    algum ||= bate
  }
  $('faq-vazio').hidden = algum
})

$('suporte').addEventListener('click', () => avisar('Atendimento disponível em breve'))
