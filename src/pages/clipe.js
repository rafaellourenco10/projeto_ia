import '../main.css'
import { montarShell } from '../shell.js'
import * as store from '../store.js'
import * as api from '../api.js'
import { custo as calcularCusto } from '../creditos.js'
import { CATEGORIAS, miniCard } from '../biblioteca.js'
import { esc, param, debug, MSG_SEM_ESPACO } from '../util.js'
import clipes from '../data/clips.json'

montarShell({ rota: 'inicio' })

const $ = (id) => document.getElementById(id)
const clipe = clipes.find((c) => c.id === param('id'))

if (!clipe) {
  $('nao-encontrado').hidden = false
} else {
  document.title = `${clipe.titulo} · SelfieMovie`
  $('conteudo').hidden = false
  preencher()
}

function preencher() {
  const custo = calcularCusto({ tipo: 'clipe' })
  const categoria = CATEGORIAS[clipe.categoria]?.nome ?? ''
  let proporcao = '9:16'

  $('video').poster = clipe.img
  $('titulo').textContent = clipe.titulo
  $('descricao').textContent = `Coloque seu rosto nesta cena de ${clipe.genero.toLowerCase()}. Você envia a foto, e o clipe fica pronto com você como protagonista.`
  $('duracao').textContent = `${clipe.duracaoSeg} s`
  const selo = 'px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm'
  $('selos').innerHTML =
    (clipe.popularidade >= 90
      ? `<span class="px-space-sm py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm flex items-center gap-1 shadow-[0_0_12px_rgba(170,2,102,0.3)]"><span class="material-symbols-outlined text-xs" aria-hidden="true">local_fire_department</span>Popular</span>`
      : '') + `<span class="${selo}">${esc(categoria)}</span><span class="${selo}">${esc(clipe.genero)}</span>`
  document.querySelectorAll('[data-custo]').forEach((el) => (el.textContent = custo))

  // Proporção: muda o aspect-ratio do player e vai junto no pedido.
  const ATIVO = ['bg-surface-container-high', 'text-primary', 'font-bold']
  function setProporcao(p) {
    proporcao = p
    $('video-frame').classList.toggle('aspect-[9/16]', p === '9:16')
    $('video-frame').classList.toggle('max-w-xs', p === '9:16')
    $('video-frame').classList.toggle('aspect-video', p === '16:9')
    $('formato').textContent = p
    for (const b of [$('btn-916'), $('btn-169')]) {
      const ativo = b.dataset.proporcao === p
      b.setAttribute('aria-pressed', ativo)
      ATIVO.forEach((c) => b.classList.toggle(c, ativo))
    }
  }
  $('btn-916').addEventListener('click', () => setProporcao('9:16'))
  $('btn-169').addEventListener('click', () => setProporcao('16:9'))
  setProporcao('9:16')

  // Rosto: foto do store ou convite para enviar.
  const foto = store.getFoto()
  $('link-foto').href = `/perfil-rosto/foto?voltar=${encodeURIComponent(location.pathname + location.search)}`
  $('rosto-nome').textContent = store.getUsuario()?.nome ?? ''
  if (foto) {
    $('rosto-foto').innerHTML = `<img alt="Sua foto" class="w-full h-full object-cover" src="${foto}"/>`
    $('rosto-texto').textContent = 'Sua foto será usada neste clipe'
    $('rosto-status').innerHTML = '<span class="material-symbols-outlined text-xs text-tertiary" aria-hidden="true">check_circle</span><span class="text-tertiary">Pronto</span>'
  } else {
    $('rosto-foto').innerHTML = '<span class="material-symbols-outlined text-on-surface-variant" aria-hidden="true">face</span>'
    $('rosto-texto').textContent = 'Você ainda não enviou sua foto'
    $('rosto-status').innerHTML = '<span class="material-symbols-outlined text-xs text-secondary" aria-hidden="true">error</span><span class="text-secondary">Falta a foto</span>'
    $('link-foto-texto').textContent = 'Enviar'
  }

  // Saldo, "restarão" e o que o botão faz.
  const disponivel = store.getSaldoDisponivel()
  $('restarao').innerHTML =
    disponivel >= custo
      ? `Restarão: <strong class="text-tertiary font-label-md">${disponivel - custo} créditos</strong>`
      : `Faltam: <strong class="text-secondary font-label-md">${custo - disponivel} créditos</strong>`
  $('btn-gerar-texto').textContent = !foto
    ? 'Enviar minha foto para gerar'
    : disponivel < custo
      ? 'Comprar créditos para gerar'
      : `Gerar com meu rosto (${custo} créditos)`

  $('btn-gerar').addEventListener('click', async () => {
    if (!store.getFoto()) return (location.href = $('link-foto').href)
    if (store.getSaldoDisponivel() < custo) return (location.href = '/creditos-planos')
    $('btn-gerar').disabled = true
    try {
      const { jobId } = await api.gerarClipe(clipe.id, { proporcao })
      location.href = `/gerando?job=${jobId}${debug() ? '&debug' : ''}`
    } catch (e) {
      $('btn-gerar').disabled = false
      $('msg').classList.remove('hidden')
      $('msg').textContent = e.message === 'SEM_SALDO' ? 'Saldo insuficiente para este clipe.' : e.message === 'SEM_ESPACO' ? MSG_SEM_ESPACO : 'Não foi possível começar a geração. Tente de novo.'
    }
  })

  // Semelhantes: mesma categoria, até 4, sem o próprio.
  const semelhantes = clipes.filter((c) => c.categoria === clipe.categoria && c.id !== clipe.id).slice(0, 4)
  $('semelhantes-secao').hidden = !semelhantes.length
  $('semelhantes-categoria').textContent = `Mais ${categoria}`
  $('semelhantes').innerHTML = semelhantes.map(miniCard).join('')
}
