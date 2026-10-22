// Desafio da semana: troca toda segunda-feira (dia local) e gira na lista.
import desafios from './data/desafios.json'

export function desafioDaSemana(d = new Date()) {
  const inicio = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7))
  const fim = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + 7)
  // Conta semanas pelo calendário (UTC do dia), sem depender do horário de verão.
  const semana = Math.floor((Date.UTC(inicio.getFullYear(), inicio.getMonth(), inicio.getDate()) / 864e5 + 3) / 7)
  return { ...desafios[semana % desafios.length], inicio: inicio.getTime(), fim: fim.getTime() }
}

// Criação que entra no desafio: clipe do tema ou texto no estilo do tema.
export const entraNoDesafio = (des, c) => (c.tipo === 'clipe' ? des.clipIds.includes(c.clipId) : c.estilo === des.estilo)
