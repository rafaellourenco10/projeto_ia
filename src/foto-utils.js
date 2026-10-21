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
// O navegador trata "/\" como "//", então os dois são recusados.
export const destinoSeguro = (url, padrao = '/inicio') => (url && /^\/(?![/\\])/.test(url) ? url : padrao)
