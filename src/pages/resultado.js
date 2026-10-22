import '../main.css'
import { montarShell } from '../shell.js'
import * as store from '../store.js'
import * as api from '../api.js'
import { miniCard } from '../biblioteca.js'
import { esc, param, debug, avisar, compartilhar, MSG_SEM_ESPACO } from '../util.js'
import clipes from '../data/clips.json'

montarShell({ rota: 'minhas-criacoes' })

const $ = (id) => document.getElementById(id)
const jobId = param('job')
const s = jobId && (await api.statusJob(jobId))

if (!s) $('nao-encontrado').hidden = false
else if (s.status !== 'pronto') location.replace(`/gerando?job=${encodeURIComponent(jobId)}`)
else mostrar(s.criacao)

function mostrar(c) {
  const clipe = c.clipId ? clipes.find((x) => x.id === c.clipId) : null
  const ehFoto = c.tipo === 'foto'
  document.title = `${c.titulo} · SelfieMovie`
  $('conteudo').hidden = false
  $('faixa').textContent = ehFoto ? 'Sua foto está pronta!' : 'Seu vídeo está pronto!'
  $('tipo').textContent = c.tipo === 'clipe' ? 'Clipe' : ehFoto ? 'Foto' : 'Vídeo'
  $('genero').textContent = clipe ? `• ${clipe.genero}` : ''
  $('titulo').textContent = c.titulo
  $('descricao').textContent = c.prompt ?? `Você como protagonista em uma cena de ${clipe?.genero.toLowerCase() ?? 'cinema'}.`
  document.querySelectorAll('[data-custo]').forEach((el) => (el.textContent = c.custo))

  // Player: poster no <video> (foto vira <img>), com 9:16 / 16:9.
  $('quadro').innerHTML = ehFoto
    ? `<img alt="${esc(c.titulo)}" src="${c.img}" class="w-full h-full object-cover"/>`
    : `<video poster="${c.img}" class="w-full h-full object-cover" muted playsinline preload="none" aria-label="Prévia do vídeo"></video>`
  function setProporcao(p) {
    $('quadro').classList.toggle('aspect-[9/16]', p === '9:16')
    $('quadro').classList.toggle('max-w-xs', p === '9:16')
    $('quadro').classList.toggle('aspect-video', p === '16:9')
    for (const b of document.querySelectorAll('[data-proporcao]')) {
      const ativo = b.dataset.proporcao === p
      b.setAttribute('aria-pressed', ativo)
      ;['bg-surface-container-high', 'text-primary', 'font-bold'].forEach((k) => b.classList.toggle(k, ativo))
    }
  }
  document.querySelectorAll('[data-proporcao]').forEach((b) => b.addEventListener('click', () => setProporcao(b.dataset.proporcao)))
  setProporcao(c.proporcao)

  const duracao = clipe?.duracaoSeg ?? c.duracao
  const dados = [
    duracao && ['Duração', `${duracao} s`],
    ['Qualidade', 'HD'],
    ['Criado em', new Date(c.criadoEm).toLocaleDateString('pt-BR')],
  ].filter(Boolean)
  $('dados').innerHTML = dados
    .map(([k, v]) => `<div class="p-space-sm rounded-xl bg-surface-container/70 flex flex-col gap-0.5"><dt class="font-label-sm text-label-sm text-outline">${k}</dt><dd class="font-label-md text-label-md text-on-surface">${v}</dd></div>`)
    .join('')

  // Baixar: na fase 1 o arquivo é a imagem do poster.
  $('btn-baixar').href = c.img
  $('btn-baixar').setAttribute('download', `selfiemovie-${c.id}.jpg`)
  $('btn-baixar-texto').textContent = ehFoto ? 'Baixar foto' : 'Baixar vídeo'

  $('btn-compartilhar').addEventListener('click', () => compartilhar(c.titulo))

  // Avaliação: radios nativos (setas do teclado funcionam), estrelas pintadas até a nota.
  $('estrelas').innerHTML = [1, 2, 3, 4, 5]
    .map(
      (n) => `<input type="radio" name="nota" id="nota-${n}" value="${n}" class="sr-only" ${c.avaliacao === n ? 'checked' : ''}/>
<label for="nota-${n}" class="w-9 h-9 flex items-center justify-center rounded-lg text-secondary cursor-pointer hover:scale-125 transition-transform [input:focus-visible+&]:ring-2 [input:focus-visible+&]:ring-primary">
  <span class="material-symbols-outlined text-2xl" aria-hidden="true" data-estrela="${n}">star</span><span class="sr-only">${n} ${n === 1 ? 'estrela' : 'estrelas'}</span>
</label>`,
    )
    .join('')
  const pintar = (nota) =>
    document.querySelectorAll('[data-estrela]').forEach((el) => {
      el.style.fontVariationSettings = `'FILL' ${Number(el.dataset.estrela) <= nota ? 1 : 0}`
    })
  pintar(c.avaliacao ?? 0)
  $('estrelas').addEventListener('change', (e) => {
    const nota = Number(e.target.value)
    if (!store.updateCriacao(c.id, { avaliacao: nota })) {
      e.target.checked = false
      const salva = store.getCriacao(c.id)?.avaliacao ?? 0
      if (salva) $(`nota-${salva}`).checked = true
      pintar(salva)
      return avisar(MSG_SEM_ESPACO)
    }
    pintar(nota)
    avisar('Obrigado pela avaliação!')
  })

  // Dois cliques: o primeiro arma, o segundo apaga.
  $('btn-apagar').addEventListener('click', (e) => {
    const btn = e.currentTarget
    if (!btn.dataset.confirmar) {
      btn.dataset.confirmar = '1'
      $('btn-apagar-texto').textContent = 'Confirmar: apagar esta criação'
      return
    }
    delete btn.dataset.confirmar
    if (store.removerCriacao(c.id)) return location.replace('/minhas-criacoes')
    $('btn-apagar-texto').textContent = 'Apagar'
    avisar(store.getCriacao(c.id) ? MSG_SEM_ESPACO : 'Esta criação não pode ser apagada agora. Recarregue a página.')
  })

  $('btn-variacao').addEventListener('click', async () => {
    $('btn-variacao').disabled = true
    try {
      const { jobId: novo } = await api.refazer(c.id)
      location.href = `/gerando?job=${novo}${debug() ? '&debug' : ''}`
    } catch (e) {
      $('btn-variacao').disabled = false
      $('msg').classList.remove('hidden')
      $('msg').innerHTML =
        e.message === 'SEM_SALDO'
          ? 'Saldo insuficiente. <a class="underline" href="/creditos-planos">Comprar créditos</a>'
          : e.message === 'SEM_FOTO'
            ? 'Envie sua foto primeiro. <a class="underline" href="/perfil-rosto/foto">Enviar foto</a>'
            : e.message === 'SEM_ESPACO'
              ? MSG_SEM_ESPACO
              : 'Não foi possível gerar a variação.'
    }
  })

  if (c.prompt) {
    $('link-editar').hidden = false
    const dadosPedido = { prompt: c.prompt, modo: c.tipo, estilo: c.estilo, duracao: c.duracao, proporcao: c.proporcao }
    $('link-editar').href = `/criar-com-texto?${new URLSearchParams(Object.entries(dadosPedido).filter(([, v]) => v != null))}`
  }

  const foto = store.getFoto()
  $('rosto').innerHTML = foto
    ? `<img alt="" class="w-full h-full object-cover" src="${foto}"/>`
    : '<span class="material-symbols-outlined text-sm text-on-surface-variant" aria-hidden="true">face</span>'
  $('rosto-nome').textContent = store.getUsuario()?.nome ?? ''
  $('link-foto').href = `/perfil-rosto/foto?voltar=${encodeURIComponent(location.pathname + location.search)}`

  // Recomendados: mesma categoria do clipe primeiro, depois os mais populares.
  const ordem = [...clipes].sort((a, b) => (b.categoria === clipe?.categoria) - (a.categoria === clipe?.categoria) || b.popularidade - a.popularidade)
  $('recomendados').innerHTML = ordem.filter((x) => x.id !== c.clipId).slice(0, 4).map(miniCard).join('')
}
