import '../main.css'
import { montarShell } from '../shell.js'
import * as store from '../store.js'
import { reduzirImagem, destinoSeguro } from '../foto-utils.js'
import { param } from '../util.js'

montarShell({ rota: 'perfil-rosto' })

const $ = (id) => document.getElementById(id)
const destino = destinoSeguro(param('voltar'))
let stream = null
let fotoAtual = null // dataURL da prévia (ainda não salva)

document.querySelectorAll('main [data-saldo]').forEach((el) => (el.textContent = store.getSaldoDisponivel()))
$('link-depois').href = destino

function mensagem(texto) {
  $('msg').textContent = texto ?? ''
  $('msg').classList.toggle('hidden', !texto)
}

function pararCamera() {
  stream?.getTracks().forEach((t) => t.stop())
  stream = null
  $('video').hidden = true
  $('acoes-camera').hidden = true
}

function mostrar(estado) {
  // estado: 'vazio' | 'camera' | 'preview'
  $('vazio').hidden = estado !== 'vazio'
  $('preview').hidden = estado !== 'preview'
  $('acoes-preview').hidden = estado !== 'preview'
  if (estado !== 'camera') pararCamera()
}

function atualizarUsar() {
  $('btn-usar').disabled = !(fotoAtual && $('consentimento').checked)
}

function mostrarPreview(dataUrl, consentido = false) {
  fotoAtual = dataUrl
  $('preview').src = dataUrl
  $('consentimento').checked = consentido
  mostrar('preview')
  atualizarUsar()
}

// Câmera negada ou ausente: avisa e destaca a galeria.
function semCamera(texto) {
  mensagem(texto)
  $('btn-galeria').classList.add('ring-2', 'ring-secondary')
  $('btn-galeria').focus()
}

async function abrirCamera() {
  mensagem()
  if (!navigator.mediaDevices?.getUserMedia) {
    // Celular sem getUserMedia (ou página sem HTTPS): usa a câmera do sistema.
    $('arquivo-camera').click()
    return
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 } }, audio: false })
  } catch (e) {
    if (e.name === 'NotAllowedError') semCamera('Você não liberou o acesso à câmera. Libere nas configurações do navegador ou escolha uma foto da galeria.')
    else semCamera('Não encontramos uma câmera disponível. Escolha uma foto da galeria.')
    return
  }
  $('video').srcObject = stream
  $('video').hidden = false
  $('vazio').hidden = true
  $('preview').hidden = true
  $('acoes-preview').hidden = true
  $('acoes-camera').hidden = false
  $('btn-capturar').focus()
}

async function usarArquivo(arquivo) {
  mensagem()
  if (!arquivo) return
  if (!arquivo.type.startsWith('image/')) return mensagem('Esse arquivo não é uma imagem. Use JPG ou PNG.')
  try {
    mostrarPreview(await reduzirImagem(arquivo))
  } catch {
    mensagem('Formato não suportado, use JPG ou PNG.')
  }
}

$('btn-camera').addEventListener('click', abrirCamera)
$('btn-galeria').addEventListener('click', () => $('arquivo').click())
$('arquivo').addEventListener('change', (e) => usarArquivo(e.target.files[0]))
$('arquivo-camera').addEventListener('change', (e) => usarArquivo(e.target.files[0]))

$('btn-capturar').addEventListener('click', async () => {
  const dataUrl = await reduzirImagem($('video'))
  mostrarPreview(dataUrl)
})
$('btn-cancelar-camera').addEventListener('click', () => mostrar(fotoAtual ? 'preview' : 'vazio'))
$('btn-trocar').addEventListener('click', () => {
  fotoAtual = null
  $('consentimento').checked = false
  atualizarUsar()
  mostrar('vazio')
  $('btn-camera').focus()
})
$('consentimento').addEventListener('change', atualizarUsar)

$('btn-usar').addEventListener('click', () => {
  if (!store.salvarFoto(fotoAtual)) return mensagem('Não foi possível salvar a foto. Tente outra imagem.')
  store.setConsentimento(true)
  location.href = destino
})

// Arrastar e soltar (desktop)
const visor = $('visor')
for (const alvo of [visor, $('btn-galeria')]) {
  alvo.addEventListener('dragover', (e) => {
    e.preventDefault()
    visor.classList.add('ring-2', 'ring-secondary')
  })
  alvo.addEventListener('dragleave', () => visor.classList.remove('ring-2', 'ring-secondary'))
  alvo.addEventListener('drop', (e) => {
    e.preventDefault()
    visor.classList.remove('ring-2', 'ring-secondary')
    usarArquivo(e.dataTransfer.files[0])
  })
}

window.addEventListener('pagehide', pararCamera)

const salva = store.getFoto()
if (salva) mostrarPreview(salva, store.getConsentimento())
else mostrar('vazio')
