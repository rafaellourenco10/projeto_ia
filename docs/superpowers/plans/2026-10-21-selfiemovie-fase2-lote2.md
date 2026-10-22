# SelfieMovie fase 2, lote 2: melhorias da pesquisa de mercado

Itens 14 a 24 de `docs/superpowers/backlog-fase2.md`. Tudo no front-end, com o estado no `localStorage` (`src/store.js`).

Fluxo: uma task por vez, teste em 390 e 1440, um commit por task, push só com OK. No fim, uma revisão nova do lote inteiro.

## Decisões

- O estado novo é opcional. Estado salvo antes deste lote continua funcionando sem migração (mesmo padrão de `favoritos`).
- Imagem final (marca d'água, legenda, antes e depois) é montada num `<canvas>` no clique de baixar, com as imagens de `/img` (mesma origem, o canvas não fica bloqueado).
- Rostos: `getFoto()` continua sendo "a foto do rosto ativo", então as telas que já usam foto não mudam.

## Tasks

### Task 1 (item 14): Em alta e Novidades no Início
- `src/pages/inicio.js`: fileira "Em alta" (6 mais populares, `miniCard`, rolagem horizontal) acima da grade, só em "Todos" sem busca.
- Selo "Novo" nos 3 clipes com `criadoEm` mais recente (card da grade e `miniCard`).
- Teste em `biblioteca.test.js` para a função que escolhe os novos.

### Task 2 (item 15): Créditos diários grátis
- `CUSTOS.bonusDiario = 2`.
- `store.pegarBonusDiario(hoje)`: soma uma vez por dia (data local `AAAA-MM-DD` em `e.bonusDiario`); devolve `false` se já pegou ou se não gravou.
- Faixa no `/inicio` com o botão "Pegar 2 créditos"; some depois de pegar.
- Testes no `store.test.js`.

### Task 3 (item 23): Geração mais rápida no plano
- `api.criar` grava `duracaoMs` na criação: 10 s com plano, 20 s sem. `statusJob` usa `c.duracaoMs ?? DURACAO_MS`. Ajustar o `?debug` do `/gerando` que usa `DURACAO_MS`.
- Linha "Geração 2× mais rápida" nos planos em `/creditos-planos`; no `/gerando`, sem plano, aviso com link para os planos.
- Teste no `api.test.js`.

### Task 4 (item 18): Sugestões de prompt em chips
- `/criar-com-texto` já tem "Sugestão da IA" (aleatória). Falta mostrar as ideias: chips com rótulo curto embaixo do campo; clicar preenche o texto.

### Task 5 (item 19): Mais estilos com prévia
- Estilos ganham imagem de prévia (as mesmas de `IMG_ESTILO`) e dois novos: Noir (`clipe-detetive-noir.jpg`) e Fantasia (`clipe-guardiao-reino.jpg`).
- Grade 2 colunas no celular, 3 no desktop.

### Task 6 (item 17): Usar este prompt
- `/criar-com-texto` lê `?prompt=&modo=&estilo=&duracao=&proporcao=` (valem mais que o rascunho).
- `/resultado` de criação com texto: item "Editar e gerar de novo" nos próximos passos, abrindo o criar preenchido.

### Task 7 (item 16): Marca d'água sem plano
- Função de canvas em `src/foto-utils.js`: desenha a imagem e, se pedido, a marca "SelfieMovie" no canto.
- `/resultado`: sem plano, selo na prévia e download com marca; aviso "Assine um plano para baixar sem marca d'água".

### Task 8 (item 24): Legenda no vídeo
- `/resultado`: campo "Legenda" (até 60 caracteres), salvo em `criacao.legenda`, mostrado sobre a prévia e desenhado no download.

### Task 9 (item 20): Antes e depois
- `/resultado`: bloco com a selfie ao lado do resultado e o botão "Baixar antes e depois" (canvas lado a lado, com a mesma regra de marca d'água).

### Task 10 (item 21): Vários rostos salvos
- Store: `e.rostos = [{ id, nome, foto }]` (até 3) e `e.rostoAtivo`. Estado antigo com `e.foto` vira o primeiro rosto na leitura.
- `getFoto()` devolve a foto do rosto ativo. Funções novas: `getRostos`, `usarRosto(id)`, e `salvarFoto(dataUrl, { novo })`. `apagarFoto` apaga o rosto ativo.
- `/perfil-rosto/foto?rosto=novo` adiciona um rosto. `/perfil-rosto` mostra a fileira de rostos (usar e adicionar).
- `/clipe` e `/criar-com-texto` mostram os rostos para trocar o ativo quando há mais de um.
- Testes no `store.test.js`, incluindo o estado antigo.

### Task 11 (item 22): Clipes em dupla
- `clips.json`: `"pessoas": 2` em `noite-de-estreia` e `duelo-cerejeiras`. Selo "Dupla" nos cards.
- `/clipe` de dupla: rosto ativo e a escolha do segundo rosto; com um rosto só, botão para adicionar outro.
- `api.gerarClipe(clipId, { proporcao, rostos })` recusa dupla sem dois rostos (`SEM_SEGUNDO_ROSTO`); `refazer` repassa os rostos.
- Teste no `api.test.js`.

### Fim
- Revisão nova do lote, consertos, `graphify update .`, marcar o backlog, memória.
