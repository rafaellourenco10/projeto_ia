# SelfieMovie fase 2, lote 3: crescimento (retenção e conversão)

Itens 25 a 34 de `docs/superpowers/backlog-fase2.md` (pesquisa de crescimento de 2026-10-21). Tudo no front-end, com o estado no `localStorage` (`src/store.js`).

Fluxo: uma task por vez, teste em 390 e 1440, um commit por task, push só com OK. No fim, revisão do lote inteiro, `graphify update .` (commit separado `chore: update graphify graph`), backlog marcado e memória atualizada.

## Antes de começar

- Ler `src/store.js` (rostos, bônus diário, compras) e `src/api.js` (`criar`, `refazer`, `statusJob`).
- `npm test` deve passar (58 testes no fim do lote 2) e `npx vite --port 5173` rodando. Reiniciar o Vite ao criar arquivo novo.
- Teste no navegador: semear o estado pelo `localStorage` (`selfiemovie:v1`) com `evaluate_script`. Não usar `take_snapshot` com foto salva (despeja o base64).
- Compra só credita com `?debug` (sem pagamento real). O teste grátis da task 6 funciona sem `?debug`.

## Decisões

- Estado novo é opcional: estado salvo antes deste lote continua funcionando sem migração (mesmo padrão de `favoritos` e `rostos`).
- Datas: usar o dia local como no bônus diário (`toLocaleDateString('sv')`, AAAA-MM-DD). Funções do store recebem a data por parâmetro para os testes.
- Lógica nova que calcula algo (sequência, extrato, conquistas, desafio da semana, teste grátis) fica em função pura com teste.

## Tasks (nesta ordem)

### Task 1 (item 27): Sequência de dias
- `pegarBonusDiario(d)` passa a guardar `e.sequencia`: +1 se o último bônus foi ontem, senão volta a 1.
- `CUSTOS.bonusSemana = 5`: a cada 7 dias seguidos (7, 14, ...), o bônus do dia é 5 em vez de 2.
- Função pura `proximoBonus(estado, d)` → `{ creditos, sequencia }`, usada pela faixa do `/inicio`.
- Faixa do Início mostra "Dia N de 7" com 7 bolinhas e quanto o próximo vale.
- Testes: dia seguido, dia pulado, virada do mês, 7º dia vale 5, estado sem `sequencia`.

### Task 2 (item 32): Conquistas no Perfil
- Função pura `conquistas(estado)` em `src/conquistas.js` → lista `{ id, nome, icone, feita }`:
  primeiro clipe pronto, primeira criação com texto, primeira dupla, 5 criações prontas, 3 rostos salvos, 7 dias seguidos (usa `sequencia` da task 1), primeira legenda.
- Seção "Conquistas" no `/perfil-rosto`: grade de selos, os não feitos em cinza com o que falta.
- Teste da função com estados montados à mão.

### Task 3 (item 25): Retomar o pedido depois da compra
- `/clipe` e `/criar-com-texto`: sem saldo, o link vai para `/creditos-planos?voltar=<página atual>`. No `/clipe`, a proporção vai junto na URL (`&proporcao=16:9`) e a página lê `?proporcao`.
- `/creditos-planos`: com `voltar` válido (`destinoSeguro` de `src/foto-utils.js`), depois de comprar mostra o botão "Voltar e gerar" (não redireciona sozinho).
- O criar já guarda o rascunho em `sessionStorage`; conferir que volta igual.

### Task 4 (item 26): Tendências no criar
- Lista `TENDENCIAS` em `src/pages/criar.js`: rótulo, prompt, estilo, modo e proporção. Ex.: "Pôster de filme" (foto, cinemático), "Você daqui a 50 anos" (foto, realista), "Tempestade ao redor" (vídeo, cinemático), "Detetive noir" (vídeo, noir), "Herói de fantasia" (vídeo, fantasia).
- Fileira de cards com a imagem do estilo (`api.IMG_ESTILO`) acima do campo; clicar preenche prompt, estilo, modo e proporção e rola até o botão Gerar.

### Task 5 (item 28): Nota baixa vira refazer grátis
- `/resultado`: nota 1 ou 2 mostra "Não ficou bom? Refaça grátis" (uma vez por criação).
- `api.refazer(id, { gratis: true })`: cria com `custo: 0` e marca a original com `refazerGratisUsado: true`; recusa (`GRATIS_USADO`) se já usou. `criar()` aceita custo 0 (a reserva de saldo vira 0).
- Testes no `api.test.js`: custo zero, não debita, segunda vez recusa.

### Task 6 (item 29): Teste grátis do plano
- Store: `iniciarTeste(d)` dá `plano: 'Pro Creator'`, `teste: { fim }` (7 dias) e `testeUsado: true`; um por conta, sem créditos extras.
- `getPlano(d)` devolve `null` depois do `fim` (e grava a volta ao sem plano). Assinar um plano de verdade (`comprar` com plano) apaga `teste`.
- `/creditos-planos`: card "Teste 7 dias grátis" para quem nunca testou; com teste ativo, "Seu teste acaba em N dias". `/perfil-rosto` mostra o mesmo aviso.
- Testes: inicia, expira, não repete, compra apaga o teste.

### Task 7 (item 30): Créditos às claras e extrato (junta o item 7)
- Pacotes e planos mostram o rendimento: "≈ N clipes · N vídeos de 5 s · N fotos" (de `CUSTOS`).
- Bloco de regras: só debita quando fica pronto, falha devolve, créditos não expiram (fase 1).
- Extrato: função pura `extrato(estado)` junta `compras`, criações (`pronto` = débito; `falhou` = "devolvido", valor 0) e bônus. Para os bônus aparecerem, `cadastrar` e `pegarBonusDiario` passam a registrar em `e.bonus = [{ descricao, creditos, data }]` (estado antigo sem o campo: lista vazia).
- Lista no `/creditos-planos`, mais recente primeiro, com saldo atual no topo.
- Teste da função `extrato`.

### Task 8 (item 31): Desafio da semana
- `src/data/desafios.json`: tema, texto e `clipIds` (ou `estilo` para texto). Pelo menos 6, com clipes que já existem.
- Função pura `desafioDaSemana(d)`: índice pela semana do ano, gira na lista; devolve também início e fim da semana.
- `/inicio`: card do desafio com os clipes do tema. Criação feita na semana com clipe do tema ganha `desafio: <id>` (gravado em `api.criar`).
- `/minhas-criacoes`: selo "Desafio" nos cards com `desafio`.
- Teste: semana vira, mesma semana devolve o mesmo desafio.

### Task 9 (item 33): Espera que entretém
- `/gerando`: bloco "Enquanto isso" com uma dica que troca a cada fase (lista curta de dicas de foto e de prompt) e 3 `miniCard` de clipes (mesma categoria primeiro, sem o atual).
- Some quando o job termina ou falha.

### Task 10 (item 34): Exemplos na landing
- `index.html` seção `#exemplos`: faixa "Antes e depois" com `foto-retrato-exemplo.jpg` e duas ou três imagens de `/img/criacao-*.jpg`, legenda "Exemplo ilustrativo". Sem depoimentos nem números inventados.
- Mesmo visual da galeria que já existe; conferir 390 sem rolagem horizontal.

## Fora deste lote
- Coleções da época (Halloween, Natal): precisam de imagens novas.
- Itens antigos ainda abertos: 4, 8, 9, 10, 11, 12, 13.
