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

// Imagem para baixar: as fontes lado a lado na altura da menor (sem ampliar) e, se pedido, a marca d'água no canto.
export async function montarImagem(fontes, { marca = false } = {}) {
  const imgs = await Promise.all(fontes.map(carregar))
  const altura = Math.min(...imgs.map((i) => i.naturalHeight))
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
