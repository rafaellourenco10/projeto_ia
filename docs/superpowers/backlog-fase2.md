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

## Pesquisa de mercado (2026-10-21)

Apps olhados: Higgsfield (face swap, presets de estilo, Soul ID), Reface (biblioteca de modelos, marca d'água no grátis), Viggle (Mix foto + vídeo, 8.000+ modelos, várias pessoas por vídeo, feed com remix, texto no vídeo), PixVerse (efeitos em alta, créditos diários grátis). Tudo abaixo é só front-end, sem API real.

- [x] **14. Em alta e Novidades no Início** — selos e fileira "Em alta" (Viggle, PixVerse). Valor alto, esforço baixo.
- [x] **15. Créditos diários grátis** — botão "Pegar créditos de hoje" uma vez por dia (PixVerse). Valor alto, esforço baixo.
- [x] **16. Marca d'água sem plano** — selo SelfieMovie na prévia e no download de quem não tem plano; plano tira (Reface, PixVerse). Valor médio, esforço baixo.
- [x] **17. Usar este prompt (remix)** — exemplos prontos em `/criar-com-texto` e botão que abre o criar já preenchido a partir de uma criação (Viggle). Valor médio, esforço baixo.
- [x] **18. Surpreenda-me e sugestões de prompt** — chips de ideias e prompt aleatório no criar. Valor médio, esforço baixo.
- [x] **19. Mais estilos com prévia** — galeria de presets visuais no criar, com imagens que já existem (Higgsfield). Valor médio, esforço baixo.
- [x] **20. Antes e depois** — sua selfie ao lado do resultado, para compartilhar. Valor médio, esforço baixo.
- [x] **21. Vários rostos salvos** — até 3 fotos com nome, escolher qual usar no clipe (Soul ID, Viggle). Valor alto, esforço médio.
- [x] **22. Clipes em dupla** — modelos com dois rostos (depende da 21) (Viggle). Valor médio, esforço médio a alto.
- [x] **23. Geração mais rápida no plano** — tempo de fila menor para quem tem plano, mostrado na página de planos (Higgsfield). Valor médio, esforço baixo.
- [x] **24. Legenda no vídeo** — texto opcional sobre a prévia do resultado (Viggle). Valor baixo, esforço médio.

Fora por exigir API real: enviar vídeo próprio, voz e lip-sync, câmera ao vivo.

## Lote 2 feito em 2026-10-21

Itens 14 a 24, plano em `docs/superpowers/plans/2026-10-21-selfiemovie-fase2-lote2.md`, commits até 8ea2a67 (um por task).

- 18: "Sugestão da IA" já existia; entrou só a fileira de chips.
- 20 e dupla: o antes e depois usa o rosto ativo, mesmo em clipe de dupla.
- Rosto extra pede consentimento da pessoa da foto. Renomear rosto ficou de fora (nome padrão "Rosto 2", "Rosto 3").
