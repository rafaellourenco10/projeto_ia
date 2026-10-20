// Extrai o <body> de uma tela do Stitch, com imagens locais e links reais, um elemento por linha.
// Uso: node scripts/extrair-tela.mjs <pasta-em-telas> > saida.html
import { readFileSync } from 'node:fs'

const mapa = JSON.parse(readFileSync('scripts/mapa-imagens.json', 'utf8'))
let s = readFileSync(`telas/${process.argv[2]}/code.html`, 'utf8')
s = s.slice(s.indexOf('<body'), s.lastIndexOf('</body>'))
s = s.replace(/<body[^>]*>/, '')
for (const [url, local] of Object.entries(mapa)) s = s.split(url).join(local)
s = s.replace(/data-path="([^"]+)" href="#"/g, 'href="/$1"').replace(/href="#" data-path="([^"]+)"/g, 'href="/$1"')
process.stdout.write(s.replace(/></g, '>\n<'))
