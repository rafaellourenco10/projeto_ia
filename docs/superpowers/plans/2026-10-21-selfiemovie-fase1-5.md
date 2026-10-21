# SelfieMovie Fase 1.5: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fechar as pontas soltas da fase 1 e somar favoritos, apagar criação, notificação, convite, tema claro e um link público de demonstração, ainda sem servidor.

**Architecture:** Mesmo app Vite multi-page com HTML e JS puros. Estado continua no `localStorage` via `src/store.js`, e a geração continua simulada em `src/api.js`. O shell (`src/shell.js`) passa a fechar jobs vencidos em qualquer tela e a disparar a notificação.

**Tech Stack:** Vite (vanilla), Tailwind CSS v3, Vitest + happy-dom, Vercel (só na Task 9).

**Spec:** `docs/superpowers/specs/2026-10-20-selfiemovie-design.md` (seções 4 e 5 valem para todas as tasks). As features novas (Tasks 4 a 9) não estão no spec: as decisões delas estão neste plano e valem a partir da aprovação do usuário.

## Global Constraints

- Sem chave de API, servidor, login real ou pagamento real. Nada de `fetch` para serviços externos.
- Tudo da seção 5 do spec continua: nada de 4K/UHD/Dolby/"99,4%"/VRAM etc.; botões de simulação só com `?debug`; nome e saldo sempre do store.
- Uma conta por navegador (regra da revisão final da fase 1): `cadastrar`/`entrar` recusam com `CONTA_EXISTENTE`.
- Bottom nav fixa só abaixo de `md`; sidebar `w-72` a partir de `md`.
- Toda task: `npm test` e `npm run build` passam; página abre sem erro no console em 390 px (`emulate` "390x844x2,mobile,touch") e 1440 px; um commit por task; depois `graphify update .` com commit `chore` separado.
- Mensagem nova de erro sempre diz o próximo passo, nunca só o problema.
- Ações destrutivas usam o padrão de dois cliques já usado em `src/pages/entrar.js` (`dataset.confirmar`), nunca `confirm()`.
- Push para o GitHub só quando o usuário pedir.

## Review Focus

1. Navegador que recusa gravar (janela anônima do Safari, armazenamento cheio) → toda ação que grava mostra `MSG_SEM_ESPACO` e nada fica pela metade. Teste na Task 1.
2. Job que vence com o usuário em outra tela → saldo do header atualiza sozinho em até 1 s e o crédito não fica preso. Teste na Task 2.
3. Duas abas abertas quando o job vence → no máximo uma notificação por job (`tag: jobId`). Checagem manual na Task 6.
4. Estado salvo antes desta fase (sem `favoritos`, sem `codigoConvite`) → app abre sem erro e os campos novos começam vazios ou são criados na hora. Testes nas Tasks 5 e 7.
5. Tema claro com texto sobre imagem (cards, banner, hero) → texto continua legível, contraste AA. Checagem manual e Lighthouse na Task 8.

---

### Task 1: Avisar quando o navegador não salva

**Files:**
- Modify: `src/util.js`, `src/api.js:27`, `src/pages/entrar.js:69-75`, `src/pages/clipe.js:94`, `src/pages/criar.js:115`, `src/pages/gerando.js:80`, `src/pages/resultado.js:110`
- Test: `src/api.test.js`, `src/store.test.js`

**Interfaces:**
- Produces: `MSG_SEM_ESPACO` em `src/util.js` = `'Não foi possível salvar neste navegador. Libere espaço ou saia da janela anônima e tente de novo.'`. `criar()` em `src/api.js` lança `Error('SEM_ESPACO')` quando `store.addCriacao` devolve `false`.

- [ ] **Step 1: Testes que falham**
  - `api.test.js` › `gerarClipe recusa com SEM_ESPACO quando o navegador não grava`: cadastro + foto, depois `vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('QuotaExceededError') })` → `await expect(api.gerarClipe('agente-secreto')).rejects.toThrow('SEM_ESPACO')`; com o mock removido, `store.getCriacoes()` tem tamanho 0.
  - `store.test.js` › `cadastrar devolve null quando o navegador não grava`: mesmo mock → `expect(store.cadastrar({ nome: 'Ana', email: 'ana@x.com' })).toBe(null)`.
- [ ] **Step 2:** `npm test` → o teste de api falha (o de store já passa: `cadastrar` devolve `getUsuario()`, que já é `null`; registrar isso como fato, não como falha).
- [ ] **Step 3:** `criar()` checa o retorno de `addCriacao`. Em `entrar.js`, se `cadastrar`/`entrar` devolver `null`, chamar `falhar(MSG_SEM_ESPACO, $('email'))` e não navegar. Nas 4 páginas, o ramo genérico do `catch` usa `MSG_SEM_ESPACO` quando `e.message === 'SEM_ESPACO'`.
- [ ] **Step 4:** `npm test` → tudo passa. No navegador, simular com `localStorage.setItem = () => { throw 1 }` no console em `/clipe?id=agente-secreto` e clicar Gerar → mensagem aparece, botão volta a ficar ativo.
- [ ] **Step 5:** Commit `fix: avisar quando o navegador não consegue salvar`.

### Task 2: Shell sempre atual

**Files:**
- Modify: `src/api.js`, `src/shell.js:95-118`
- Test: `src/api.test.js`

**Interfaces:**
- Produces: `fecharVencidos(agora = Date.now()) -> Promise<Criacao[]>` em `src/api.js`: roda `statusJob` em toda criação `gerando` e devolve as que fecharam nesta chamada (status `pronto` ou `falhou`). A Task 6 usa o retorno.

- [ ] **Step 1: Teste que falha** `api.test.js` › `fecharVencidos fecha só os jobs vencidos, uma vez`: saldo 10, `vi.useFakeTimers()`, dois `gerarClipe` criados com `vi.setSystemTime(t0)` e `vi.setSystemTime(t0 + 15000)` → `fecharVencidos(t0 + 20000)` devolve 1 criação com `status: 'pronto'`; `store.getSaldo() === 5`; chamar de novo com o mesmo `agora` devolve `[]`.
- [ ] **Step 2:** `npm test` → falha (`fecharVencidos` não existe).
- [ ] **Step 3:** Implementar `fecharVencidos`. Em `montarShell`, depois de montar: chamar `fecharVencidos()` e repetir com `setInterval(..., 1000)`. Adicionar `addEventListener('pageshow', (e) => e.persisted && location.reload())` para o Voltar do navegador não mostrar página velha.
- [ ] **Step 4:** `npm test` passa. No navegador: gerar um clipe, ir para `/inicio` e esperar 20 s → badge de saldo cai 5 sem recarregar. Gerar outro, apertar Voltar no `/gerando` → `/clipe` volta com o botão ativo e saldo certo.
- [ ] **Step 5:** Commit `feat: shell fecha jobs vencidos e recarrega página restaurada pelo Voltar`.

### Task 3: Consertos pontuais

**Files:**
- Modify: `src/pages/foto.js:94-97`, `src/pages/minhas-criacoes.js:123-133`, `src/store.js`, `src/pages/creditos-planos.js:88-92`, `index.html:254`
- Test: `src/store.test.js`

**Interfaces:**
- Produces: `setPlano(nome: string) -> boolean` em `src/store.js` (grava o nome, ex.: `'Pro Creator'`; `getPlano()` já existe).

- [ ] **Step 1: Teste que falha** `store.test.js` › `setPlano grava o plano`: cadastro → `store.setPlano('Pro Creator')` → `store.getPlano() === 'Pro Creator'`.
- [ ] **Step 2:** `npm test` → falha.
- [ ] **Step 3:** Mudanças:
  - `store.setPlano` via `alterar`. Em `creditos-planos.js`, compra de plano em `?debug` chama `store.setPlano(plano.nome)` e atualiza o texto `#plano-atual`.
  - `foto.js`: captura em `try/catch`; no erro, `mensagem('A câmera ainda está abrindo. Espere a imagem aparecer e tente de novo.')`.
  - `minhas-criacoes.js`: `SEM_FOTO` → foto; `SEM_SALDO` → `/creditos-planos`; `SEM_ESPACO` → `avisar(MSG_SEM_ESPACO)`; outro erro → `avisar('Não foi possível tentar de novo. Recarregue a página.')`. Nos dois últimos, reativar o botão.
  - `index.html:254`: link "Central de Ajuda" → `/#faq` (igual às páginas legais).
- [ ] **Step 4:** `npm test` passa. Navegador: comprar plano com `?debug` → Perfil e sidebar mostram o plano.
- [ ] **Step 5:** Commit `fix: plano em debug, captura cedo, erros de refazer e link de ajuda`.

### Task 4: Apagar uma criação

**Files:**
- Modify: `src/store.js`, `resultado.html`, `src/pages/resultado.js`, `src/pages/minhas-criacoes.js`
- Test: `src/store.test.js`

**Interfaces:**
- Produces: `removerCriacao(id) -> boolean` em `src/store.js`: devolve `false` se a criação não existe ou está `gerando` (o crédito está reservado).

- [ ] **Step 1: Testes que falham** `store.test.js`:
  - `removerCriacao apaga criação pronta`: criação `pronto` → `removerCriacao(id) === true`, `getCriacao(id) === null`, saldo igual.
  - `removerCriacao recusa criação gerando`: criação `gerando` → `false`, ela continua lá, `getSaldoDisponivel()` igual.
- [ ] **Step 2:** `npm test` → falha.
- [ ] **Step 3:** `removerCriacao`. Em `/resultado`, botão "Apagar" (ícone `delete`) com dois cliques; o segundo diz "Confirmar: apagar esta criação" e leva a `location.replace('/minhas-criacoes')`. Em `/minhas-criacoes`, o card `falhou` ganha "Remover" ao lado de "Tentar de novo", com dois cliques, e a lista redesenha.
- [ ] **Step 4:** `npm test` passa. Navegador 390/1440: apagar pelo resultado e pelo card falho; contadores das abas atualizam.
- [ ] **Step 5:** Commit `feat: apagar criação`.

### Task 5: Favoritos

**Files:**
- Modify: `src/store.js`, `src/biblioteca.js:23-29`, `src/pages/inicio.js`, `inicio.html`, `clipe.html`, `src/pages/clipe.js`
- Test: `src/store.test.js`, `src/biblioteca.test.js`

**Interfaces:**
- Produces: `getFavoritos() -> string[]` (ids de clipe; `[]` em estado antigo sem o campo) e `alternarFavorito(clipId) -> boolean` (novo estado: `true` = favoritado) em `src/store.js`. `filtrarClipes(clipes, { q, categoria, ordem, ids = null })`: com `ids`, só clipes cujo `id` está na lista.

- [ ] **Step 1: Testes que falham**
  - `store.test.js` › `alternarFavorito liga e desliga`: `alternarFavorito('a') === true`, `getFavoritos()` = `['a']`, de novo → `false` e `[]`.
  - `store.test.js` › `estado antigo sem favoritos`: gravar no `localStorage` um estado sem `favoritos` → `getFavoritos()` = `[]` e `alternarFavorito('a') === true`.
  - `biblioteca.test.js` › `filtra por ids`: `filtrarClipes(clips, { ids: ['agente-secreto'] })` devolve só esse clipe.
- [ ] **Step 2:** `npm test` → falha.
- [ ] **Step 3:** Store e filtro. Em `/inicio`, chip "Favoritos" (ícone `favorite`) antes de "Todos" das categorias; estado vazio dele: "Você ainda não favoritou nenhum clipe. Toque no coração na página do clipe." Em `/clipe`, botão de coração com `aria-pressed` e `aria-label` "Favoritar"/"Remover dos favoritos" ao lado do título.
- [ ] **Step 4:** `npm test` passa. Navegador: favoritar 2 clipes, filtrar, desfavoritar.
- [ ] **Step 5:** Commit `feat: favoritos na biblioteca`.

### Task 6: Notificação quando fica pronto

**Files:**
- Modify: `src/shell.js`, `gerando.html`, `src/pages/gerando.js`

**Interfaces:**
- Consumes: `fecharVencidos()` da Task 2.

- [ ] **Step 1:** Em `/gerando`, botão "Me avise quando ficar pronto" (ícone `notifications`), só se `'Notification' in window` e `Notification.permission === 'default'`. Clique → `Notification.requestPermission()`; com `granted`, o botão vira o texto "Vamos avisar quando ficar pronto."; com `denied`, some.
- [ ] **Step 2:** No intervalo do shell, para cada criação devolvida por `fecharVencidos()`, se `Notification.permission === 'granted'` e `document.hidden`: `new Notification(pronto ? 'Seu vídeo está pronto' : 'A geração não deu certo', { body: c.titulo, icon: '/img/logo.png', tag: c.id })`; `onclick` foca a janela e abre `/resultado?job=` (pronto) ou `/gerando?job=` (falhou). Comentário: `// shortcut: só avisa com uma aba do app aberta; push de verdade precisa de servidor (fase 2).`
- [ ] **Step 3:** Verificar: permitir notificação, gerar, trocar de aba → notificação aparece uma vez; com duas abas do app abertas, uma notificação só.
- [ ] **Step 4:** Commit `feat: notificação do navegador quando a geração termina`.

### Task 7: Convide um amigo

**Files:**
- Modify: `src/creditos.js`, `src/store.js`, `src/pages/entrar.js`, `entrar.html`, `perfil-rosto.html`, `src/pages/perfil-rosto.js`, `src/pages/landing.js` (texto do bônus, se citar o valor)
- Test: `src/store.test.js`

**Interfaces:**
- Produces: `CUSTOS.bonusConvite = 5` em `src/creditos.js`. `cadastrar({ nome, email, convite })`: com `convite` não vazio, saldo = `bonusCadastro + bonusConvite`. `getCodigoConvite() -> string` (8 caracteres, criado na primeira chamada e salvo; estado antigo também ganha um).

- [ ] **Step 1: Testes que falham** `store.test.js`:
  - `cadastro com convite ganha 15`: `cadastrar({ nome, email, convite: 'abc12345' })` → `getSaldo() === 15`.
  - `código de convite é estável`: `getCodigoConvite()` tem 8 caracteres e é igual na segunda chamada.
- [ ] **Step 2:** `npm test` → falha.
- [ ] **Step 3:** Perfil ganha a seção "Convide amigos": texto "Quem criar conta pelo seu link ganha 5 créditos a mais.", o link `${location.origin}/entrar?ref=<código>#cadastro` e o botão Compartilhar (mesmo padrão de `resultado.js:65-75`: `navigator.share`, senão `clipboard` + "Link copiado"). Em `/entrar` com `?ref=`, a faixa de bônus mostra "+15 créditos (10 do cadastro + 5 do convite)" e o cadastro passa `convite`.
  Comentário: `// shortcut: quem convidou não ganha nada ainda; isso precisa de servidor (fase 2).`
- [ ] **Step 4:** `npm test` passa. Navegador: abrir o link de convite numa janela anônima → cadastro com 15.
- [ ] **Step 5:** Commit `feat: link de convite com bônus para quem chega`.

### Task 8: Tema claro

**Files:**
- Modify: `tailwind.config.js`, `src/main.css`, os 14 HTML (script de tema no `<head>`), `perfil-rosto.html`, `src/pages/perfil-rosto.js`
- Create: script descartável no scratchpad para gerar a paleta (não entra no repo)

**Interfaces:**
- Produces: tema salvo em `localStorage['selfiemovie:tema']` = `'escuro' | 'claro' | 'sistema'` (fora da conta, para valer também na landing e no login). Padrão `'escuro'`.

- [ ] **Step 1:** Cada cor de `tailwind.config.js` vira `rgb(var(--c-<token>) / <alpha-value>)`. `main.css` define os valores atuais em `:root` (escuro) e os claros em `html.light`.
- [ ] **Step 2:** Paleta clara: para cada token, manter matiz e croma do valor escuro (HCT, `@material/material-color-utilities` via `npx` no scratchpad, sem virar dependência) e trocar o tom pelo papel M3: primary/secondary/tertiary/error 40; on-* deles 100; *-container 90; on-*-container 10; *-fixed, *-fixed-dim, on-*-fixed, on-*-fixed-variant iguais ao escuro; surface/background 98; surface-dim 87; surface-bright 98; container-lowest 100; low 96; container 94; high 92; highest 90; on-surface/on-background 10; on-surface-variant 30; outline 50; outline-variant 80; inverse-surface 20; inverse-on-surface 95; inverse-primary 80; surface-variant 90.
- [ ] **Step 3:** Script inline no `<head>` de cada HTML aplica `class="light"` ou `"dark"` antes de pintar (lê `selfiemovie:tema` e `prefers-color-scheme` em `'sistema'`), com `try/catch`. `html { color-scheme }` acompanha. Perfil ganha "Aparência": Escuro / Claro / Sistema (radiogroup).
- [ ] **Step 4:** Texto sobre imagem (cards, banner, hero da landing, player) mantém o branco atual nos dois temas (usar classe fixa `text-white`/sombras onde hoje usa `on-surface` sobre foto).
- [ ] **Step 5:** Verificar todas as rotas nos dois temas em 390/1440; Lighthouse acessibilidade ≥ 90 em 4 rotas no tema claro.
- [ ] **Step 6:** Commit `feat: tema claro`.

### Task 9: Demo pública na Vercel

**Files:**
- Modify: `vercel.json` se o deploy pedir; nenhum código do app.

- [ ] **Step 1:** Rodar `npx vercel` (o usuário faz o login na conta dele). Projeto novo, framework Vite, output `dist`.
- [ ] **Step 2:** Deploy de preview. Conferir no link: as 14 rotas abrem sem `.html`, `/clipe?id=xyz` mostra "não encontrado", console limpo.
- [ ] **Step 3:** **Parar e pedir confirmação ao usuário** antes de `npx vercel --prod`: o link fica público, e quem abrir vê a demo (os dados de cada pessoa ficam só no navegador dela).
- [ ] **Step 4:** Commit só se `vercel.json` mudou (`.vercel/` vai para o `.gitignore`).

### Task 10: Revisão final

- [ ] Fluxos em 390 e 1440: todas as features novas + o fluxo completo da fase 1 (cadastro → foto → clipe → gerando → resultado → minhas criações).
- [ ] Lighthouse acessibilidade nas rotas principais, nos dois temas; corrigir o que ficar < 90.
- [ ] `grep` das palavras proibidas da seção 5 (fora de `telas/` e `src/store.js`) → vazio.
- [ ] `npm test` e `npm run build` passam. Revisão do branch inteiro por um revisor novo; Critical e Important corrigidos com teste.
- [ ] Commit; push só com o OK do usuário.
