import '../main.css'
import * as store from '../store.js'
import { CUSTOS } from '../creditos.js'
import { avisar } from '../util.js'

if (store.getUsuario()) location.replace('/inicio')

const $ = (id) => document.getElementById(id)
const form = $('form-auth')
const erro = $('erro')
const ATIVA = 'bg-surface-container-high text-on-surface shadow-md'
const INATIVA = 'text-outline hover:text-on-surface hover:bg-surface-container-high/50'
let modo = 'login'

document.querySelector('[data-bonus]').textContent = CUSTOS.bonusCadastro

function setModo(novo) {
  modo = novo
  const cadastro = modo === 'cadastro'
  for (const [aba, ativa] of [[$('aba-cadastro'), cadastro], [$('aba-login'), !cadastro]]) {
    aba.setAttribute('aria-selected', ativa)
    aba.tabIndex = ativa ? 0 : -1
    aba.className = `py-2.5 px-4 rounded-lg font-label-lg text-label-lg transition-all duration-200 ${ativa ? ATIVA : INATIVA}`
  }
  form.setAttribute('aria-labelledby', cadastro ? 'aba-cadastro' : 'aba-login')
  $('grupo-nome').hidden = !cadastro
  $('bonus').hidden = !cadastro
  $('btn-esqueci').hidden = cadastro
  $('senha').autocomplete = cadastro ? 'new-password' : 'current-password'
  $('txt-enviar').textContent = cadastro ? `Criar conta e ganhar ${CUSTOS.bonusCadastro} créditos` : 'Entrar'
  erro.classList.add('hidden')
  history.replaceState(null, '', cadastro ? '#cadastro' : location.pathname)
}

$('aba-cadastro').addEventListener('click', () => setModo('cadastro'))
$('aba-login').addEventListener('click', () => setModo('login'))
document.querySelector('[role=tablist]').addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
  setModo(modo === 'cadastro' ? 'login' : 'cadastro')
  $(modo === 'cadastro' ? 'aba-cadastro' : 'aba-login').focus()
})
setModo(location.hash === '#cadastro' ? 'cadastro' : 'login')

$('btn-olho').addEventListener('click', (e) => {
  const mostrar = $('senha').type === 'password'
  $('senha').type = mostrar ? 'text' : 'password'
  e.currentTarget.setAttribute('aria-pressed', mostrar)
  e.currentTarget.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha')
  e.currentTarget.querySelector('span').textContent = mostrar ? 'visibility_off' : 'visibility'
})

$('btn-google').addEventListener('click', () => avisar('Entrar com o Google estará disponível em breve.'))
$('btn-esqueci').addEventListener('click', () => avisar('Recuperação de senha estará disponível em breve.'))

function falhar(msg, campo) {
  erro.textContent = msg
  erro.classList.remove('hidden')
  campo.focus()
}

form.addEventListener('submit', (e) => {
  e.preventDefault()
  const nome = $('nome').value.trim()
  const email = $('email').value.trim().toLowerCase()
  if (modo === 'cadastro' && nome.length < 2) return falhar('Digite seu nome.', $('nome'))
  if (!email || !$('email').checkValidity()) return falhar('Digite um e-mail válido.', $('email'))
  if ($('senha').value.length < 8) return falhar('A senha precisa ter pelo menos 8 caracteres.', $('senha'))
  // Fase 1: a senha não é guardada nem conferida; o login é simulado.
  try {
    if (modo === 'cadastro') {
      store.cadastrar({ nome, email })
      location.href = '/perfil-rosto/foto'
    } else {
      store.entrar({ email })
      location.href = '/inicio'
    }
  } catch {
    // CONTA_EXISTENTE: só uma conta por navegador na fase 1.
    falhar(modo === 'cadastro'
      ? 'Já existe uma conta salva neste navegador. Entre com ela ou exclua-a no Perfil.'
      : 'Este e-mail não é o da conta salva neste navegador. Confira o e-mail.', $('email'))
  }
})
