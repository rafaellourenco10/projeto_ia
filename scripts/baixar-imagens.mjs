// One-off: baixa as imagens do Stitch (lh3.googleusercontent.com) para public/img/ com nomes legíveis.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'

const nomes = {
  _6shhw: 'logo', '1P532w': 'avatar-exemplo',
  qSdK8g: 'clipe-fuga-noturna', ep5pWg: 'clipe-detetive-cyberpunk', yAcksw: 'clipe-guardiao-reino',
  ufkhcw: 'clipe-noite-de-estreia', O3sokQ: 'clipe-horizonte-alienigena',
  lPX9cA: 'banner-cinema', vdZQQQ: 'clipe-agente-secreto', RDdQ6g: 'clipe-explorador',
  pKlomQ: 'clipe-danca-festival', VIxA1g: 'clipe-trono-de-cinzas', bpeCsA: 'clipe-piloto-corrida',
  yz_AQg: 'clipe-ferias-santorini', D2hQNw: 'clipe-duelo-cerejeiras', '9TftyQ': 'clipe-trapalhao-cozinha',
  LxiPkQ: 'landing-hero', aLBsKQ: 'landing-selfie', CAEIYw: 'landing-agente-secreto',
  ilyb2g: 'landing-astronauta', xja3ug: 'landing-danca', c6bzgA: 'landing-guerreiro',
  W609lA: 'criacao-agente-iate', '25o5yg': 'criacao-surfista', RLYFJw: 'criacao-neo-tokyo',
  OlD2nw: 'criacao-piloto-box', dVgaQw: 'criacao-imperatriz', XRoLxg: 'criacao-astronauta-marte',
  gNVEfw: 'resultado-agente', cNMuww: 'clipe-piloto-orbital', 'Fy-_Iw': 'clipe-detetive-noir',
  LqBy2Q: 'clipe-campeao-podio', sRfw2w: 'clipe-herdeira-trono', XjDfuQ: 'foto-retrato-exemplo',
}
const ext = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' }

const urls = new Set()
for (const d of readdirSync('telas')) {
  const f = `telas/${d}/code.html`
  if (existsSync(f)) for (const u of readFileSync(f, 'utf8').match(/https:\/\/lh3\.googleusercontent\.com\/[^"')\s]+/g) ?? []) urls.add(u)
}
const mapa = {}
for (const u of urls) {
  const nome = nomes[u.slice(-6)]
  if (!nome) throw new Error(`sem nome para ${u.slice(-20)}`)
  const r = await fetch(u)
  if (!r.ok) throw new Error(`${r.status} em ${nome}`)
  const arq = `${nome}.${ext[r.headers.get('content-type')] ?? 'jpg'}`
  writeFileSync(`public/img/${arq}`, Buffer.from(await r.arrayBuffer()))
  mapa[u] = `/img/${arq}`
  console.log(arq)
}
writeFileSync('scripts/mapa-imagens.json', JSON.stringify(mapa, null, 2))
