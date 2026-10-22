import '../main.css'
import { montarShell, avatar, seletorRostos } from '../shell.js'
import * as store from '../store.js'
import { reais, textoTeste } from '../creditos.js'
import { esc, avisar } from '../util.js'
import { conquistas } from '../conquistas.js'

montarShell({ rota: 'perfil-rosto' })

const $ = (id) => document.getElementById(id)
const dataCurta = (ms) => new Date(ms).toLocaleDateString('pt-BR')

function atualizar() {
  const u = store.getUsuario()
  if (!u) return
  $('conta-avatar').innerHTML = avatar('w-14 h-14')
  $('conta-nome').textContent = u.nome
  $('conta-email').textContent = u.email
  $('conta-plano').textContent = store.getPlano() ?? 'Sem plano ativo'
  const teste = store.getTeste()
  $('conta-teste').hidden = !teste
  if (teste) $('conta-teste').textContent = textoTeste(teste)

  const foto = store.getFoto()
  $('foto').hidden = !foto
  if (foto) $('foto').src = foto
  $('sem-foto').hidden = !!foto
  $('trocar-texto').textContent = foto ? 'Trocar foto' : 'Enviar foto'
  $('apagar-foto').hidden = !foto
  const rostos = store.getRostos()
  $('apagar-foto-texto').textContent = rostos.length > 1 ? 'Apagar este rosto' : 'Apagar minha foto'
  $('bloco-rostos').hidden = !foto
  $('rostos-contagem').textContent = `(${rostos.length} de ${store.MAX_ROSTOS})`
  $('add-rosto').hidden = rostos.length >= store.MAX_ROSTOS
  desenharRostos()

  const selos = conquistas(store.getEstado())
  $('conquistas-contagem').textContent = `(${selos.filter((c) => c.feita).length} de ${selos.length})`
  $('lista-conquistas').innerHTML = selos
    .map(
      (c) => `<li class="flex flex-col items-center text-center gap-1 p-space-sm rounded-xl ${c.feita ? 'bg-surface-container-high' : 'bg-surface-container-low/60'}">
  <span class="material-symbols-outlined text-3xl ${c.feita ? 'text-secondary' : 'text-outline'}" aria-hidden="true" ${c.feita ? `style="font-variation-settings: 'FILL' 1;"` : ''}>${c.icone}</span>
  <span class="font-label-md text-label-md text-on-surface font-semibold">${c.nome}</span>
  <span class="font-body-sm text-body-sm text-on-surface-variant">${c.feita ? 'Conquistada' : c.falta}</span>
</li>`,
    )
    .join('')

  const compras = store.getCompras()
  $('sem-compras').hidden = compras.length > 0
  $('lista-compras').innerHTML = compras
    .map(
      (c) => `<li class="flex items-center justify-between gap-space-md py-space-sm">
  <div class="flex flex-col min-w-0"><span class="font-label-lg text-label-lg text-on-surface font-semibold truncate">${esc(c.descricao)}</span><span class="font-body-sm text-body-sm text-outline">${dataCurta(c.data)} • +${c.creditos} créditos</span></div>
  <span class="font-label-lg text-label-lg text-on-surface font-bold whitespace-nowrap">${reais(c.preco)}</span>
</li>`,
    )
    .join('')
}
// Com um rosto só, o seletor fica escondido e o bloco mostra só o botão de adicionar.
const desenharRostos = seletorRostos($('rostos'))
store.onChange(atualizar)
atualizar()

// Confirmação na própria página (sem confirm()).
function alternar(botao, caixa, abrir) {
  $(caixa).hidden = !abrir
  $(botao).setAttribute('aria-expanded', abrir)
  ;(abrir ? $(caixa).querySelector('button') : $(botao)).focus()
}

$('apagar-foto').addEventListener('click', () => alternar('apagar-foto', 'confirma-foto', true))
$('apagar-foto-nao').addEventListener('click', () => alternar('apagar-foto', 'confirma-foto', false))
$('apagar-foto-sim').addEventListener('click', () => {
  $('confirma-foto').hidden = true
  store.apagarFoto()
  avisar('Sua foto foi apagada')
  $('trocar').focus()
})

// Tema fica fora da conta (vale na landing e no login). aplicarTema vem do script inline do <head>.
const TEMA = 'selfiemovie:tema'
let tema = 'escuro'
try { tema = localStorage.getItem(TEMA) || tema } catch {}
const radios = [...$('tema').elements]
;(radios.find((r) => r.value === tema) ?? radios[0]).checked = true
$('tema').addEventListener('change', (e) => {
  try { localStorage.setItem(TEMA, e.target.value) } catch {} // falhou: o tema vale só nesta página
  window.aplicarTema?.(e.target.value)
})

$('excluir').addEventListener('click', () => alternar('excluir', 'confirma-conta', true))
$('excluir-nao').addEventListener('click', () => alternar('excluir', 'confirma-conta', false))
$('excluir-sim').addEventListener('click', () => {
  store.excluirConta()
  location.replace('/')
})

$('sair').addEventListener('click', () => {
  store.sair()
  location.replace('/')
})
