// Selos do Perfil, calculados do estado salvo (nada novo é gravado além de `melhorSequencia`).
const falta = (n, um, varios) => (n === 1 ? `Falta 1 ${um}` : `Faltam ${n} ${varios}`)

export function conquistas(e) {
  const prontas = (e?.criacoes ?? []).filter((c) => c.status === 'pronto')
  const rostos = e?.rostos?.length ?? (e?.foto ? 1 : 0) // estado antigo só tem `foto`
  const dias = e?.sequencia ?? 0
  const lista = [
    ['primeiro-clipe', 'Primeiro clipe', 'movie', prontas.some((c) => c.tipo === 'clipe'), 'Estrele um clipe da biblioteca'],
    ['primeiro-texto', 'Criou com texto', 'auto_awesome', prontas.some((c) => c.tipo !== 'clipe'), 'Crie um vídeo ou foto com texto'],
    ['primeira-dupla', 'Dupla dinâmica', 'group', prontas.some((c) => c.rostos?.length === 2), 'Faça um clipe em dupla'],
    ['cinco-prontas', '5 criações', 'collections', prontas.length >= 5, falta(5 - prontas.length, 'criação', 'criações')],
    ['tres-rostos', '3 rostos salvos', 'face', rostos >= 3, falta(3 - rostos, 'rosto', 'rostos')],
    ['sete-dias', '7 dias seguidos', 'local_fire_department', Math.max(e?.melhorSequencia ?? 0, dias) >= 7, falta(7 - dias, 'dia seguido', 'dias seguidos')],
    ['primeira-legenda', 'Primeira legenda', 'subtitles', prontas.some((c) => c.legenda?.trim()), 'Escreva uma legenda no resultado'],
  ]
  return lista.map(([id, nome, icone, feita, oQueFalta]) => ({ id, nome, icone, feita, falta: feita ? null : oQueFalta }))
}
