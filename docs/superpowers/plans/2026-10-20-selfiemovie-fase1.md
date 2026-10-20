# SelfieMovie Fase 1 — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** App SelfieMovie inteiro navegável e responsivo (front-end puro, dados simulados), portado das telas do Stitch.

**Architecture:** Vite multi-page com HTML + JS puros. Cada rota é um `.html` na raiz que carrega `src/pages/<rota>.js`. Um shell JS comum (`src/shell.js`) injeta sidebar/header/bottom nav. Estado em `localStorage` via `src/store.js`; geração simulada em `src/api.js` (único arquivo a trocar na fase 2).

**Tech Stack:** Vite (vanilla), Tailwind CSS v3 + PostCSS + Autoprefixer, Vitest + happy-dom, Google Fonts (Plus Jakarta Sans, Material Symbols Outlined).

**Spec:** `docs/superpowers/specs/2026-10-20-selfiemovie-design.md` (ler inteiro antes de qualquer tarefa; seções 4 e 5 valem para todas).

## Global Constraints

- Sem chave de API, servidor, login real ou pagamento real. Nada de `fetch` para serviços externos.
- Tokens Tailwind: copiar o objeto `theme.extend` do `<script id="tailwind-config">` dos HTMLs do Stitch (idêntico nas 9 telas). `darkMode: "class"`. O `DESIGN.md` não é fonte de cor.
- Rotas (links sempre sem `.html`): `/`, `/entrar`, `/perfil-rosto/foto`, `/inicio`, `/clipe?id=`, `/criar-com-texto`, `/gerando?job=`, `/resultado?job=`, `/minhas-criacoes`, `/creditos-planos`, `/perfil-rosto`, `/ajuda-faq`, `/termos`, `/privacidade`.
- Arquivos: `index.html`, `entrar.html`, `perfil-rosto/foto.html`, `inicio.html`, `clipe.html`, `criar-com-texto.html`, `gerando.html`, `resultado.html`, `minhas-criacoes.html`, `creditos-planos.html`, `perfil-rosto.html`, `ajuda-faq.html`, `termos.html`, `privacidade.html`.
- Créditos: clipe 5; texto→vídeo 5 s = 5; texto→vídeo 10 s = 8; texto→foto 2; bônus de cadastro 10. Planos: Básico R$ 29 / 50 créditos, Pro Creator R$ 69 / 180 créditos (destaque), Ultra Studio R$ 149 / 500 créditos.
- Correções da seção 5 do spec em toda tela portada: sem 4K/UHD/Dolby/"Fidelidade 99,4%"/VRAM/ISO/latência/"SelfieVision"/"846 vetores"/"Cluster neural"/HEVC/ProRes/"5 GB" (usar "HD", "Pronto", "Processando"); foto fica salva até o usuário apagar; consentimento obrigatório; botões de simulação só com `?debug`; nome e saldo sempre do store.
- Breakpoint: bottom nav fixa só abaixo de `md`; sidebar `w-72` a partir de `md`.
- Verificação de cada tarefa: `npm run build` passa, página abre sem erro no console em 390 px e 1440 px (chrome-devtools), um commit por tarefa (commits extras em avanços grandes são bem-vindos).
- `telas/` é só referência: nunca editar.

## Review Focus

1. Foto grande estoura a cota do `localStorage` → mensagem "Não foi possível salvar a foto, tente outra imagem" sem perder a foto anterior. Teste em Task 2.
2. URL com id inexistente (`/clipe?id=xyz`, `/gerando?job=xyz`, `/resultado?job=xyz`) → estado "não encontrado" com link para `/inicio`, nunca tela quebrada. Teste de `statusJob` desconhecido em Task 2; checagem manual em Tasks 8, 10, 11.
3. Recarregar `/gerando` no meio do job ou voltar depois → progresso continua pelo relógio, não reinicia. Teste em Task 2.
4. Clique duplo em "Gerar" com saldo para um só job → segundo pedido recusado com `SEM_SALDO`, sem saldo negativo. Teste em Task 2; botão desabilita no clique em Tasks 8 e 9.
5. Rota interna aberta sem usuário (aba anônima) → redireciona para `/entrar`. Checagem manual em Task 3.

---

### Task 0: Base do projeto

**Files:**
- Create: `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `vercel.json`, `src/main.css`, `index.html` (página de teste, substituída na Task 4), pastas `src/pages/`, `src/data/`, `public/img/`
- Modify: `.gitignore` (adicionar `dist/`)

**Interfaces:**
- Produces: `src/main.css` (importado por todo `src/pages/*.js`); `vite.config.js` que encontra sozinho todo `*.html` da raiz e de `perfil-rosto/` (via `globSync` de `node:fs`), então tarefas futuras só criam o HTML. Sem utilitários CSS próprios: as telas do Stitch já usam só classes Tailwind (ex.: CTA `bg-gradient-to-r from-primary-container to-secondary-container`, ícone preenchido com `style="font-variation-settings: 'FILL' 1;"`).

- [x] Step 1: Scaffold Vite vanilla na raiz (sem sobrescrever arquivos existentes); instalar `tailwindcss@3 postcss autoprefixer` e `vitest happy-dom` como devDependencies. Remover o boilerplate do template (counter, logos).
- [x] Step 2: `tailwind.config.js` com `content: ['./*.html','./perfil-rosto/*.html','./src/**/*.js']` e o `theme.extend` copiado do Stitch.
- [x] Step 3: `src/main.css` com `@tailwind base/components/utilities` e o `<style>` base dos HTMLs do Stitch.
- [x] Step 4: `index.html` de teste: link das Google Fonts (Plus Jakarta Sans 400–800 + Material Symbols Outlined), `<html class="dark" lang="pt-BR">`, um título `font-display-hero`, amostras `bg-primary`/`bg-secondary`/`bg-tertiary`, um ícone `movie` e um botão com o gradiente do CTA.
- [x] Step 5: `vercel.json` = `{ "cleanUrls": true }`. Scripts `dev`, `build`, `preview`, `test` (`vitest run`).
- [x] Step 6: Rodar `npm run build`. Esperado: sucesso, CSS gerado contém `.bg-primary`. Rodar `npm run dev` e abrir `/` em 390 e 1440 px: fonte Jakarta, cores e ícone visíveis, console limpo. Conferir se o dev server resolve `/algo` → `algo.html` (criar `teste.html` temporário; se não resolver, adicionar um middleware mínimo em `vite.config.js`).
- [x] Step 7: Commit `chore: scaffold Vite + Tailwind v3 base`.

### Task 1: Assets

**Files:**
- Create: `public/img/*` (34 imagens únicas), `src/data/clips.json`, `scripts/baixar-imagens.mjs` (one-off, pode ser apagado depois)

**Interfaces:**
- Produces: `src/data/clips.json` = array de `{ id: string, titulo: string, categoria: string, duracaoSeg: number, custo: 5, img: "/img/<nome>.jpg", popularidade: number, criadoEm: "YYYY-MM-DD", destaque?: true }`. Categorias e títulos tirados de `in_cio_biblioteca_de_clipes` e dos "semelhantes" de `detalhe_do_clipe_agente_secreto`. Títulos de marca/famoso (007, F1 Petronas, Red Bull, Silverstone, Cannes) viram nomes genéricos ("Agente Secreto", "Piloto de Corrida").
- Produces: `public/img/` com nomes legíveis derivados do `alt`/contexto (`clipe-agente-secreto.jpg`, `hero-landing.jpg`, `avatar-exemplo.jpg`...) e um mapa `url → arquivo` usado pelas tarefas de porte.

- [ ] Step 1: Script baixa cada URL `lh3.googleusercontent.com` única dos 9 `code.html` e grava em `public/img/` com nome legível; imprime o mapa url→arquivo em `scripts/mapa-imagens.json`.
- [ ] Step 2: Montar `clips.json`.
- [ ] Step 3: Verificar: `grep -r googleusercontent --include=*.html --include=*.js --include=*.json . --exclude-dir=telas --exclude-dir=node_modules --exclude-dir=scripts` → vazio.
- [ ] Step 4: Commit `feat: assets locais e catálogo de clipes`.

### Task 2: Store e API simulada (TDD)

**Files:**
- Create: `src/creditos.js`, `src/store.js`, `src/api.js`, `src/store.test.js`, `src/api.test.js`

**Interfaces:**
- `src/creditos.js`: `CUSTOS = { clipe: 5, video5: 5, video10: 8, foto: 2, bonusCadastro: 10 }`; `custo({ tipo: 'clipe'|'video'|'foto', duracao?: 5|10 }) -> number`; `PLANOS` (3 planos da Global Constraints); `PACOTES` (avulsos: 20 créditos R$ 15, 60 créditos R$ 39, 150 créditos R$ 89 — valores do Claude, revisáveis).
- `src/store.js` (chave única `selfiemovie:v1` no `localStorage`):
  - `getUsuario() -> { nome, email } | null`
  - `cadastrar({ nome, email }) -> usuario` — saldo = `CUSTOS.bonusCadastro`.
  - `entrar({ email }) -> usuario` — mantém usuário existente com o mesmo e-mail; senão cria usuário demo `{ nome: 'Camila Silva', email }` com saldo 45.
  - `sair()`, `excluirConta()` (apaga tudo).
  - `getSaldo() -> number` (saldo contábil), `getSaldoDisponivel() -> number` (= saldo − custo das criações com status `gerando`), `adicionarCreditos(n)`.
  - `getFoto() -> string|null` (dataURL), `salvarFoto(dataUrl) -> boolean` (false se a cota estourar; não apaga a foto anterior), `apagarFoto()`. `getConsentimento() -> boolean`, `setConsentimento(bool)`. Apagar foto zera o consentimento.
  - `getCriacoes() -> Criacao[]` (mais recente primeiro), `getCriacao(id)`, `addCriacao(c)`, `updateCriacao(id, patch)`.
  - `Criacao = { id, tipo: 'clipe'|'video'|'foto', titulo, img, custo, proporcao: '9:16'|'16:9', status: 'gerando'|'pronto'|'falhou', criadoEm: ms, falhar: boolean, clipId?, prompt?, estilo?, duracao?, avaliacao? }`
  - `onChange(fn)` — avisa o shell para atualizar o saldo.
- Regra de crédito: iniciar reserva (reduz o disponível), sucesso debita o saldo, falha só libera a reserva ("crédito devolvido").
- `src/api.js`:
  - `FASES = ['Na fila...', 'Detectando traços faciais...', 'Adequando iluminação da cena...', 'Finalizando renderização...']`, `DURACAO_MS = 20000` (4 fases de 5 s).
  - `gerarClipe(clipId, { proporcao }) -> Promise<{ jobId }>`; `gerarComTexto({ modo: 'video'|'foto', prompt, estilo, duracao, proporcao }) -> Promise<{ jobId }>`. Rejeitam com `Error('SEM_FOTO')`, `Error('SEM_SALDO')` ou `Error('CLIPE_INEXISTENTE')`. `falhar = location.search` contém `debug=falha`.
  - `statusJob(jobId, agora = Date.now()) -> Promise<{ status, fase: 0..3, progresso: 0..100, restanteSeg, criacao } | null>`; calcula pelo `criadoEm`; ao atingir o fim grava `pronto` (debita) ou `falhou` uma única vez (idempotente).

- [ ] Step 1: Testes (`// @vitest-environment happy-dom`, `localStorage.clear()` em `beforeEach`):
  - `cadastrar` → `getSaldo() === 10`; `entrar` sem usuário → nome `'Camila Silva'`, saldo 45.
  - `custo({tipo:'video',duracao:10}) === 8`, `custo({tipo:'foto'}) === 2`, `custo({tipo:'clipe'}) === 5`.
  - Com foto e saldo 10: `gerarClipe` → `getSaldoDisponivel() === 5`, `getSaldo() === 10`; `statusJob(id, t0+20000)` → `pronto`, `getSaldo() === 5`; chamar de novo não debita outra vez.
  - Com `falhar: true`: fim → `falhou`, `getSaldo() === 10`, `getSaldoDisponivel() === 10`.
  - Saldo 5: dois `gerarClipe` seguidos → o segundo rejeita `SEM_SALDO`.
  - Sem foto → rejeita `SEM_FOTO`.
  - `statusJob(id, t0+7000)` → `fase === 1`, `progresso === 35`.
  - `statusJob('xyz')` → `null`.
  - `salvarFoto` com `setItem` lançando `QuotaExceededError` → `false` e `getFoto()` igual à anterior.
- [ ] Step 2: `npm test` → falha (módulos inexistentes).
- [ ] Step 3: Implementar `creditos.js`, `store.js`, `api.js`.
- [ ] Step 4: `npm test` → tudo passa.
- [ ] Step 5: Commit `feat: store e API simulada com reserva de créditos`.

### Task 3: Shell compartilhado

**Files:**
- Create: `src/shell.js`, página provisória `inicio.html` + `src/pages/inicio.js` para testar

**Interfaces:**
- Consumes: `store.getUsuario`, `getSaldoDisponivel`, `getFoto`, `onChange`.
- Produces: `montarShell({ rota: 'inicio'|'criar-com-texto'|'minhas-criacoes'|'creditos-planos'|'perfil-rosto'|'ajuda-faq'|null, exigirLogin = true }) -> HTMLElement` (o `<main>` onde a página renderiza). Sem usuário e `exigirLogin` → `location.replace('/entrar')`. Marca `aria-current="page"` no link ativo. Markup copiado da sidebar/header/bottom nav do `in_cio_biblioteca_de_clipes`, com `href` reais no lugar de `data-path`.
- Header: busca (só na rota `inicio` age; nas outras leva a `/inicio?q=`), badge de saldo (link para `/creditos-planos`), ajuda, "Novo Vídeo" (→ `/criar-com-texto`), avatar com a foto do store ou ícone.

- [ ] Step 1: Implementar `shell.js`; `inicio.js` provisório só monta o shell com um texto.
- [ ] Step 2: Verificar em 390/1440: sidebar só ≥ md, bottom nav só < md, rota ativa destacada, saldo e nome do store. Aba sem usuário → `/entrar`.
- [ ] Step 3: Commit `feat: shell compartilhado`.

### Tasks 4–12: Porte das telas

Mesmo procedimento para cada uma: copiar o markup do `code.html` correspondente para o HTML da rota (ou para template string no JS da página quando houver lista dinâmica), trocar URLs de imagem pelo mapa da Task 1, remover sidebar/header/bottom nav duplicados (o shell faz isso), aplicar a seção 5, ligar ao store/api. Cada tarefa: build, 390/1440, console limpo, commit `feat: tela <nome>`.

**Task 4 — Landing (`index.html`, `src/pages/landing.js`)**: sem shell (header próprio da landing). Hero com `<video poster>` (sem `src`), 3 passos, galeria com filtros funcionando por categoria, planos de `PLANOS`, FAQ com `<details>`, CTA final. Todo CTA → `/entrar` (ou `/inicio` se já houver usuário). Textos de crédito batendo com `CUSTOS`.

**Task 5 — Login/Cadastro (`entrar.html`, `src/pages/entrar.js`)**: abas com `role="tablist"`; `#cadastro` na URL abre a aba Criar conta. Senha com mostrar/ocultar, mínimo 8 caracteres com mensagem inline; e-mail via `type="email"` + `checkValidity()`. Google: botão visual que mostra aviso "em breve". Cadastro → `store.cadastrar` → `/perfil-rosto/foto`; login → `store.entrar` → `/inicio`.

**Task 6 — Sua foto (`perfil-rosto/foto.html`, `src/pages/foto.js`, `src/foto-utils.js`)**: `reduzirImagem(file|Blob|HTMLVideoElement, max = 1024) -> Promise<string>` (JPEG 0,85 via canvas). Câmera: `getUserMedia({ video: { facingMode: 'user' } })` com guia oval e botão capturar; erro/negado/ausente → mensagem + destaque na galeria; no celular sem `getUserMedia` usar `<input capture="user">`. Galeria: input file + drag-and-drop. Imagem que não decodifica (ex.: HEIC) → mensagem "Formato não suportado, use JPG ou PNG". Preview com "Trocar foto" e "Usar esta foto" desabilitado até o checkbox de consentimento (texto exato do spec). Salvar → `salvarFoto` (tratar `false`) + `setConsentimento(true)` → volta ao `?voltar=` ou `/inicio`. Texto de privacidade: "Sua foto fica salva na sua conta até você apagá-la no Perfil."

**Task 7 — Início/Biblioteca (`inicio.html`, `src/pages/inicio.js`)**: dados de `clips.json`. Busca com Ctrl/Cmd+K focando o campo e `?q=` inicial; chips de categoria; ordenação populares/recentes/custo; banner com o clipe `destaque`; grid 9:16; hover (≥ md) só zoom + brilho; card é `<a href="/clipe?id=">`; estado vazio com "Limpar filtros".

**Task 8 — Detalhe (`clipe.html`, `src/pages/clipe.js`)**: `id` inválido → estado não encontrado. Player `<video poster>` com alternância 9:16/16:9 (muda `aspect-ratio`). Foto do store com link "Trocar" → `/perfil-rosto/foto?voltar=<url atual>`. Custo, saldo disponível e "restarão". Botão gerar: sem foto → foto; disponível < custo → `/creditos-planos`; senão desabilita, `api.gerarClipe` → `/gerando?job=`. Semelhantes = mesma categoria, até 4, sem o próprio.

**Task 9 — Criar com texto (`criar-com-texto.html`, `src/pages/criar.js`)**: Vídeo/Foto (foto esconde duração), textarea `maxlength=500` com contador, "Sugestão da IA" sorteia de uma lista local, "Limpar", estilos, duração 5/10, proporção. Resumo mostra `custo(...)`. Gerar desabilitado com texto vazio (após `trim`), sem foto (com link para a foto) ou saldo insuficiente (com link para créditos). Sucesso → `/gerando?job=`.

**Task 10 — Gerando (`gerando.html`, `src/pages/gerando.js`)**: polling de `statusJob` a cada 500 ms; anel SVG com `progresso`, legenda `FASES[fase]`, `restanteSeg`, aviso "Você pode sair desta tela; o vídeo aparece em Minhas criações". `pronto` → `location.replace('/resultado?job=')`. `falhou` → estado de erro "Seus créditos foram devolvidos" + "Tentar de novo" (refaz o mesmo pedido). Job inexistente → não encontrado. Botões de simulação só com `?debug`.

**Task 11 — Resultado (`resultado.html`, `src/pages/resultado.js`)**: job inexistente ou não pronto → redireciona para `/gerando?job=` ou não encontrado. Player com poster e 9:16/16:9; Baixar (baixa a imagem poster, `download` attr); Compartilhar (`navigator.share`, senão `clipboard.writeText` + aviso "Link copiado"); estrelas salvam `avaliacao` (radiogroup acessível); "Gerar variação" repete o pedido; "Criar outro" → `/criar-com-texto`; recomendados de `clips.json`.

**Task 12 — Minhas criações (`minhas-criacoes.html`, `src/pages/minhas-criacoes.js`)**: abas Todos/Vídeos/Fotos (clipe conta como vídeo), ordenação recentes/antigos; card por status: pronto → `/resultado?job=`, gerando com % (atualiza a cada 1 s via `statusJob`) → `/gerando?job=`, falhou com "crédito devolvido". Estado vazio com CTAs para biblioteca e criar. "Simular galeria vazia" só com `?debug`.

### Task 13: Telas que faltam

- [ ] Step 1: **Perguntar ao usuário** se vai gerar Créditos & Planos, Perfil & Rosto, Ajuda/FAQ, Termos e Privacidade no Stitch. Se sim, esperar os arquivos em `telas/` e portar como nas Tasks 4–12.
- [ ] Step 2 (se não): montar com o design system:
  - `creditos-planos.html`: saldo, `PLANOS` (Pro em destaque), `PACOTES`; comprar abre aviso "Pagamento disponível em breve" (nada é cobrado). Em `?debug`, comprar chama `adicionarCreditos`.
  - `perfil-rosto.html`: dados da conta, foto com "Trocar" e "Apagar minha foto" (confirmação inline, não `confirm()`), histórico de compras vazio, "Sair" e "Excluir conta" (confirmação inline) → `/`.
  - `ajuda-faq.html`, `termos.html`, `privacidade.html`: texto simples; termos e privacidade com faixa "Rascunho — pendente de revisão jurídica". Privacidade descreve a regra da foto salva até ser apagada.
- [ ] Step 3: Links do rodapé da landing e do cadastro apontam para `/termos` e `/privacidade`. Commit.

### Task 14: Revisão final

- [ ] Fluxos completos em 390 e 1440 px: landing → cadastro → foto → biblioteca → detalhe → gerando → resultado → minhas criações; criar com texto; falha com `?debug=falha`; saldo insuficiente; apagar foto.
- [ ] Lighthouse (acessibilidade e performance) nas rotas principais; corrigir o que for < 90 em acessibilidade.
- [ ] Foco visível no teclado, `alt` em toda imagem, contraste; skill `web-design-guidelines`.
- [ ] `grep` final pelas palavras proibidas da seção 5 (`4K|UHD|Dolby|99,4|VRAM|ISO |SelfieVision|vetores|Cluster|HEVC|ProRes|5 GB|Camila`) fora de `telas/` e `src/store.js` → vazio.
- [ ] `npm test` e `npm run build` passam. Commit e push.
