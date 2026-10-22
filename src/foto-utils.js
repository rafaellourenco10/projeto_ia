// Reduz uma imagem (arquivo ou frame da câmera) para no máximo `max` px no maior lado e devolve um dataURL JPEG.
export async function reduzirImagem(fonte, max = 1024) {
  let origem = fonte
  if (fonte instanceof Blob) {
    try {
      origem = await createImageBitmap(fonte)
    } catch {
      throw new Error('FORMATO') // ex.: HEIC fora do Safari
    }
  }
  const w = origem.videoWidth || origem.width
  const h = origem.videoHeight || origem.height
  if (!w || !h) throw new Error('FORMATO')
  const escala = Math.min(1, max / Math.max(w, h))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(w * escala)
  canvas.height = Math.round(h * escala)
  canvas.getContext('2d').drawImage(origem, 0, 0, canvas.width, canvas.height)
  origem.close?.()
  return canvas.toDataURL('image/jpeg', 0.85)
}

// Só aceita caminhos internos em ?voltar= (evita redirecionar para outro site).
// Usa o próprio parser de URL: ele ignora tab/quebra de linha e trata "/\" como "//",
// então qualquer truque que saia da origem é recusado.
export function destinoSeguro(url, padrao = '/inicio') {
  if (!url) return padrao
  const base = 'https://selfiemovie.invalid'
  try {
    const u = new URL(url, base)
    return u.origin === base ? u.pathname + u.search + u.hash : padrao
  } catch {
    return padrao
  }
}

const carregar = (src) =>
  new Promise((ok, falha) => {
    const img = new Image()
    img.onload = () => ok(img)
    img.onerror = falha
    img.src = src
  })

// Quebra o texto em linhas que cabem em `max`, medindo com `medir` (o measureText do canvas).
export function quebrarLinhas(texto, max, medir) {
  const linhas = []
  let linha = ''
  for (const palavra of texto.trim().split(/\s+/)) {
    const tentativa = linha ? `${linha} ${palavra}` : palavra
    if (linha && medir(tentativa) > max) {
      linhas.push(linha)
      linha = palavra
    } else linha = tentativa
  }
  return linha ? [...linhas, linha] : linhas
}

// Imagem para baixar: as fontes lado a lado em altura HD, a legenda embaixo e, se pedido, a marca d'água no canto.
// Altura fixa para o texto sair legível mesmo com as imagens pequenas da fase 1.
export async function montarImagem(fontes, { marca = false, legenda = '', altura = 1080 } = {}) {
  const imgs = await Promise.all(fontes.map(carregar))
  const larguras = imgs.map((i) => Math.round((i.naturalWidth / i.naturalHeight) * altura))
  const canvas = document.createElement('canvas')
  canvas.width = larguras.reduce((a, b) => a + b, 0)
  canvas.height = altura
  const g = canvas.getContext('2d')
  let x = 0
  imgs.forEach((img, i) => {
    g.drawImage(img, x, 0, larguras[i], altura)
    x += larguras[i]
  })
  const u = altura / 100
  if (legenda.trim()) {
    g.font = `700 ${4.5 * u}px "Plus Jakarta Sans", sans-serif`
    g.textAlign = 'center'
    g.textBaseline = 'bottom'
    g.lineJoin = 'round'
    g.lineWidth = u
    g.strokeStyle = 'rgba(0,0,0,0.8)'
    g.fillStyle = '#fff'
    const max = canvas.width - 10 * u
    quebrarLinhas(legenda, max, (t) => g.measureText(t).width)
      .reverse()
      .forEach((linha, i) => {
        const y = altura - 8 * u - i * 5.5 * u
        g.strokeText(linha, canvas.width / 2, y, max)
        g.fillText(linha, canvas.width / 2, y, max)
      })
  }
  if (marca) {
    g.font = `800 ${3.2 * u}px "Plus Jakarta Sans", sans-serif`
    g.textAlign = 'right'
    g.textBaseline = 'bottom'
    g.shadowColor = 'rgba(0,0,0,0.6)'
    g.shadowBlur = u
    g.fillStyle = 'rgba(255,255,255,0.75)'
    g.fillText('SelfieMovie', canvas.width - 2 * u, altura - 2 * u)
  }
  return new Promise((ok, falha) => canvas.toBlob((b) => (b ? ok(b) : falha(new Error('CANVAS'))), 'image/jpeg', 0.9))
}

export function baixarArquivo(blob, nome) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
