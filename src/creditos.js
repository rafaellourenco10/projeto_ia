// Tabela única de créditos (spec seção 4). Toda tela lê daqui.
export const CUSTOS = { clipe: 5, video5: 5, video10: 8, foto: 2, bonusCadastro: 10, bonusDiario: 2, bonusSemana: 5 }

export function custo({ tipo, duracao = 5 }) {
  if (tipo === 'foto') return CUSTOS.foto
  if (tipo === 'video') return duracao === 10 ? CUSTOS.video10 : CUSTOS.video5
  return CUSTOS.clipe
}

export const PLANOS = [
  { id: 'basico', nome: 'Básico', preco: 29, creditos: 50, descricao: 'Para testar e criar seus primeiros vídeos.' },
  { id: 'pro', nome: 'Pro Creator', preco: 69, creditos: 180, destaque: true, descricao: 'Para criadores de conteúdo que postam toda semana.' },
  { id: 'ultra', nome: 'Ultra Studio', preco: 149, creditos: 500, descricao: 'Para quem publica todo dia ou cria para clientes.' },
]

// Valores escolhidos na fase 1, revisáveis antes do pagamento real.
export const PACOTES = [
  { id: 'p20', creditos: 20, preco: 15 },
  { id: 'p60', creditos: 60, preco: 39 },
  { id: 'p150', creditos: 150, preco: 89 },
]

export const reais = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
