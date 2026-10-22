# SelfieMovie: candidatas da fase 2

Lista registrada em 2026-10-21. Ainda não é plano: o usuário escolhe os números, e então sai um plano em `docs/superpowers/plans/` (uma task por vez, teste em 390/1440, um commit por task, push só com OK).

Fora de escopo (cortado ou adiado pelo usuário): painel de subagentes, notificações do navegador, convite/indicação, API real, banco de dados, i18n, trocar imagens.

Esforço estimado sem abrir o código das pages.

## Consertos (pendências antigas)

- [x] **1. Conferir deploy da 1.6** — smoke test em https://projeto-ia-eta.vercel.app (commit 62d2876) em 390 e 1440. Valor alto, esforço baixo.
- [x] **2. Fechar job interrompido em qualquer página** — hoje débito/reembolso só acontece quando `/gerando` ou `/minhas-criacoes` consulta `statusJob`. Fechar no shell ao carregar qualquer página. Valor médio, esforço baixo.
- [x] **3. Página velha ao voltar depois do Gerar** — Voltar mostra página do bfcache. Recarregar no `pageshow` quando `event.persisted`. Valor médio, esforço baixo.
- [ ] **4. Minors da revisão da 1.6** — `updateCriacao` retorna `true` quando a criação não existe; spies dos testes restaurados só no caminho feliz; `transition-all` herdado do Stitch. Valor baixo, esforço baixo.

## Funcionalidades novas

- [x] **5. Compartilhar e baixar clipe** — em `/resultado` e `/clipe`: Web Share API, com copiar link como alternativa, e botão de download. Valor alto, esforço baixo.
- [x] **6. Página 404 própria** — rota errada hoje cai na página padrão da Vercel. Valor médio, esforço baixo.
- [ ] **7. Extrato de créditos** — compras, débitos e reembolsos em `/creditos-planos`. Valor médio, esforço médio.
- [ ] **8. Busca e ordenação em Minhas Criações** — filtrar por título e status, ordenar por data. Valor médio, esforço baixo.
- [ ] **9. Editar perfil** — trocar nome e e-mail no Perfil sem apagar a conta. Valor médio, esforço baixo.
- [ ] **10. Várias contas no mesmo navegador** — hoje uma conta por navegador. Mexe no `src/store.js` inteiro. Valor médio, esforço médio a alto.
- [ ] **11. PWA instalável** — manifest, ícone e service worker simples. Valor médio, esforço médio.
- [ ] **12. Onboarding na primeira visita** — três passos curtos no `/inicio`: foto, escolher clipe, gerar. Valor médio, esforço médio.

## Qualidade

- [ ] **13. Lighthouse na demo** — modo snapshot (navigation apaga o localStorage), corrigir notas baixas de desempenho e acessibilidade. Valor médio, esforço baixo a médio.

## Recomendação

Primeiro lote: 1, 2, 3, 5, 6.

## Feito em 2026-10-21

- 1: deploy da 1.6 conferido em 390 e 1440, sem erro no console.
- 2 e 3: já existiam desde a fase 1.5 (commit 8d308b5, `fecharVencidos` e `pageshow` no shell); conferidos no deploy.
- 5: `/resultado` já tinha baixar e compartilhar; `/clipe` ganhou compartilhar (b484100). Baixar em `/clipe` ficou de fora: o clipe ainda não é do usuário.
- 6: `404.html` na raiz, que a Vercel serve em rota inexistente.
