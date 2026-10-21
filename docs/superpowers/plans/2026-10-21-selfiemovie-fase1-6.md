# SelfieMovie Fase 1.6: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fechar as pendências que sobraram da revisão final da fase 1.5.

**Architecture:** O app Vite multi-page de sempre: HTML e JS puros, estado no `localStorage` via `src/store.js`.

**Tech Stack:** Vite (vanilla), Tailwind CSS v3, Vitest + happy-dom.

**Spec:** `docs/superpowers/specs/2026-10-20-selfiemovie-design.md` (seções 4 e 5 valem para todas as tasks). As pendências vêm da memória da revisão final da fase 1.5. As decisões que o spec não cobre estão neste plano.

**Fora deste plano (já feito na fase 1.5):** job pela metade (Task 2), link da ajuda no rodapé, plano em `?debug`, captura cedo da câmera, erros do refazer (Task 3), `addCriacao`, `cadastrar` e `entrar` sem gravar (Task 1), Voltar com página velha (`pageshow` na Task 2). `transition-all` herdado do Stitch fica como está.

## Global Constraints

- Sem chave de API, servidor, login real ou pagamento real. Nada de `fetch` para serviços externos.
- Tudo da seção 5 do spec continua: nada de 4K/UHD/Dolby/"99,4%"/VRAM etc.; botões de simulação só com `?debug`; nome e saldo sempre do store.
- Uma conta por navegador: `cadastrar`/`entrar` recusam com `CONTA_EXISTENTE`.
- Toda task do app: `npm test` e `npm run build` passam; a página abre sem erro no console em 390 px (`emulate` "390x844x2,mobile,touch") e em 1440 px; um commit por task; depois `graphify update .`, com commit `chore` separado.
- Toda mensagem nova de erro diz o próximo passo, e não só o problema. Para falha de gravação, usar `MSG_SEM_ESPACO` de `src/util.js`.
- Ações destrutivas usam dois cliques (`dataset.confirmar`), nunca `confirm()`.
- Push para o GitHub só quando o usuário pedir: um push publica a demo em projeto-ia-eta.vercel.app.

## Review Focus

1. Compra em `?debug` com o navegador sem gravar: saldo, plano e histórico ficam como estavam, e aparece o aviso. Teste na Task 1.
2. Avaliação que não grava: as estrelas voltam para a nota salva e aparece o aviso. Checagem no navegador na Task 1.
3. `sessionStorage` bloqueado ou rascunho com valor que não existe mais (estilo removido): `/criar-com-texto` abre normal, sem erro, com os padrões. Checagem na Task 3.
4. Store muda enquanto o foco está num card do `/inicio` (job fecha, favorito em outra aba): o foco continua no mesmo card. Checagem na Task 2.

---

### Task 1: Gravações que falham sem aviso

**Files:**
- Modify: `src/store.js`, `src/pages/creditos-planos.js:84-94`, `src/pages/resultado.js:94-100`, `src/pages/gerando.js:92-96`
- Test: `src/store.test.js`

**Interfaces:**
- Produces: `comprar({ creditos, plano = null, descricao, preco }) -> boolean` em `src/store.js`. Faz numa única chamada `alterar`: soma os créditos, grava o plano (se vier) e põe a compra no início de `compras` com `data: Date.now()`. Devolve `false` sem mudar nada se o navegador não gravar. `adicionarCreditos`, `setPlano` e `registrarCompra` continuam existindo enquanto algum teste ou outra página usar.

- [x] **Step 1: Testes que falham** `store.test.js`:
  - `comprar grava créditos, plano e compra juntos`: cadastro (saldo inicial `S`) → `comprar({ creditos: 100, plano: 'Pro Creator', descricao: 'Plano Pro Creator', preco: 'R$ 49,90' }) === true`, `getSaldo() === S + 100`, `getPlano() === 'Pro Creator'`, `getCompras()[0].descricao === 'Plano Pro Creator'`.
  - `comprar não muda nada quando o navegador não grava`: cadastro, `vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('QuotaExceededError') })` → `false`; sem o mock, saldo `S`, plano `null` e `getCompras()` com tamanho 0.
- [x] **Step 2:** `npm test` → falha (`comprar` não existe).
- [x] **Step 3:** Mudanças:
  - `store.comprar`.
  - `creditos-planos.js` passa a chamar `store.comprar(...)` no lugar das três chamadas. Se devolver `false`, `avisar(MSG_SEM_ESPACO)` e não mostra o aviso de créditos. Atualiza `#plano-atual` como hoje.
  - `resultado.js`: se `updateCriacao` devolver `false`, chamar `avisar(MSG_SEM_ESPACO)`, `pintar(c.avaliacao ?? 0)` e desmarcar o radio escolhido. Só agradece no sucesso.
  - `gerando.js` (debug): se `updateCriacao` devolver `false`, `avisar(MSG_SEM_ESPACO)`.
- [x] **Step 4:** `npm test` passa. No navegador, com `localStorage.setItem = () => { throw 1 }` no console: comprar em `/creditos-planos?debug` mostra o aviso e o saldo do header não muda; avaliar em `/resultado` mostra o aviso e as estrelas voltam.
- [x] **Step 5:** Commit `fix: avisar quando compra e avaliação não gravam`.

### Task 2: Foco não se perde no `/inicio`

**Files:**
- Modify: `src/pages/inicio.js:88-94` (`render`)

- [x] **Step 1:** Em `render`, montar o HTML da grade e só trocar `$('grade').innerHTML` quando o HTML mudar em relação ao último que foi aplicado (variável do módulo). Comentário de uma linha com o porquê: trocar o HTML tira o foco do card.
- [x] **Step 2:** No navegador em 1440 px: dar Tab até o 2º card e rodar `window.dispatchEvent(new StorageEvent('storage', { key: 'selfiemovie:v1' }))` → `document.activeElement` continua sendo o mesmo link (`href` igual). Busca, chips e ordenação continuam filtrando.
- [x] **Step 3:** `npm test` e `npm run build` passam. Commit `fix: manter o foco no card quando o início redesenha`.

### Task 3: Rascunho do `/criar-com-texto` sobrevive ao Voltar

**Files:**
- Modify: `src/pages/criar.js`

**Interfaces:**
- Produces: `sessionStorage['selfiemovie:rascunho-texto']` = JSON `{ prompt, modo, estilo, duracao, proporcao }`. Fica só na aba e não entra na conta.

- [x] **Step 1:** No fim de `render`, gravar o rascunho com `try/catch`, ignorando a falha. Antes do primeiro `render`, ler com `try/catch`: `prompt` volta para o textarea, e cada outro campo só é aplicado se existir o botão `[data-grupo="<campo>"][data-valor="<valor>"]`. O rascunho não é apagado depois de Gerar, porque é o Voltar do `/gerando` que precisa dele (o `pageshow` do shell recarrega a página).
- [x] **Step 2:** Navegador, conta com foto e `?debug`: escrever um prompt, escolher Foto e estilo Vintage, Gerar e depois Voltar → o prompt, Foto e Vintage voltam e o resumo e o custo batem.
- [x] **Step 3:** Rodar `sessionStorage.setItem('selfiemovie:rascunho-texto', '{"estilo":"xyz","modo":"foto"}')` e recarregar → abre sem erro no console, com estilo Cinematic e modo Foto. Com `sessionStorage.setItem = () => { throw 1 }` a página também funciona.
- [x] **Step 4:** `npm test` e `npm run build` passam. Commit `fix: guardar rascunho do criar com texto ao voltar`.

### Task 4: Estado vazio de Favoritos e meta description

**Files:**
- Modify: `inicio.html:66-72`, `src/pages/inicio.js` (`render`), e os 13 HTML sem `<meta name="description">`

- [x] **Step 1:** `inicio.html`: o ícone do vazio ganha `id="vazio-icone"` e o texto do botão `#limpar` fica num `<span id="limpar-texto">`. Em `render`, quando `semFavoritos`, o ícone vira `favorite` e o botão diz "Ver todos os clipes"; nos outros casos, `search_off` e "Limpar filtros". O clique continua o mesmo (`categoria = null`, que leva para Todos).
- [x] **Step 2:** Uma `<meta name="description">` logo depois do `<title>` em cada página, com este texto:
  - `ajuda-faq`: "Respostas sobre créditos, fotos, privacidade e como criar clipes no SelfieMovie."
  - `clipe`: "Veja o clipe, escolha a proporção e gere a sua versão com o seu rosto."
  - `creditos-planos`: "Veja seu saldo, compare planos e pacotes de créditos do SelfieMovie."
  - `criar-com-texto`: "Descreva uma cena em texto e gere uma foto ou um vídeo com o seu rosto."
  - `entrar`: "Entre ou crie sua conta no SelfieMovie e ganhe créditos de boas-vindas."
  - `gerando`: "Acompanhe a geração do seu clipe em tempo real."
  - `inicio`: "Escolha um clipe da biblioteca e seja o protagonista."
  - `minhas-criacoes`: "Todas as suas criações: prontas, gerando e com falha."
  - `perfil-rosto`: "Gerencie sua conta, sua foto e a aparência do SelfieMovie."
  - `perfil-rosto/foto`: "Envie ou tire a selfie usada nas suas criações."
  - `privacidade`: "Como o SelfieMovie trata sua foto e seus dados."
  - `resultado`: "Assista, baixe e avalie a sua criação."
  - `termos`: "Termos de uso do SelfieMovie."
- [x] **Step 3:** `grep -L 'name="description"' *.html perfil-rosto/*.html` → vazio. No navegador: Favoritos sem nenhum favorito mostra o coração e "Ver todos os clipes", e o clique volta para Todos; uma busca sem resultado mostra `search_off` e "Limpar filtros".
- [x] **Step 4:** `npm test` e `npm run build` passam. Commit `fix: estado vazio de favoritos e meta description nas páginas`.

### Task 5: Conferir o `/entrar`

**Files:**
- Modify: `entrar.html` ou `src/pages/entrar.js`, só se a checagem achar problema

- [ ] **Step 1:** Navegador em 390 e 1440 px: criar a conta A e sair; na aba Entrar, usar outro e-mail → aparecem o erro e o bloco "Conta salva" com o e-mail de A; trocar de aba esconde o bloco; o botão apagar pede dois cliques e depois deixa criar uma conta nova. Repetir na aba Criar conta.
- [ ] **Step 2:** Lighthouse em modo "snapshot" (o "navigation" apaga o `localStorage`) em `/entrar`: anotar cada auditoria que falhar, inclusive a "agentic" que a fase 1.5 apontou.
- [ ] **Step 3:** Corrigir o que for problema real e anotar no relatório o que não for, com o motivo. Commit `fix: ...` só se algo mudou.

### Task 6: Revisão final

- [ ] Fluxos em 390 e 1440 px: as mudanças das Tasks 1 a 5 e o fluxo completo (cadastro → foto → clipe → gerando → resultado → minhas criações).
- [ ] `grep` das palavras proibidas da seção 5 (fora de `telas/` e `src/store.js`) → vazio.
- [ ] `npm test` e `npm run build` passam. Um revisor novo revisa o branch inteiro; o que for Critical ou Important é corrigido, com teste.
- [ ] Atualizar a memória do projeto. Push só com o OK do usuário.
