// 404: página pública, sem shell. Logado volta para a biblioteca.
import '../main.css'
import { getUsuario } from '../store.js'

if (getUsuario()) {
  document.getElementById('link-voltar').href = '/inicio'
  document.getElementById('link-voltar-texto').textContent = 'Ir para a biblioteca'
}
