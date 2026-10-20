# SelfieMovie: design e plano da fase visual

Data: 2026-10-20. Status: aprovado para a fase 1 (só front-end, sem API).

## 1. O produto

SelfieMovie é um app web pago, para desktop e celular. O usuário envia uma selfie (galeria ou câmera) e:

1. **Biblioteca:** escolhe um clipe pronto e recebe o clipe com ele como protagonista.
2. **Criar com texto:** descreve uma cena ("eu surfando no Havaí") e recebe um vídeo ou uma foto com o rosto dele.

Monetização por créditos: planos mensais e pacotes avulsos. Uma geração que falha devolve os créditos.

### Motor de IA (fase futura, não entra agora)

- API da Higgsfield (`https://api.higgsfield.ai`, docs em `https://docs.higgsfield.ai/docs`).
- Auth: header `Authorization: Key {id}:{secret}`. **A chave nunca vai para o navegador**: só um servidor pequeno (função serverless) chama a API.
- O fluxo é assíncrono: `POST` → recebe `request_id` → consulta `/requests/{id}/status` ou recebe webhook → baixa o resultado (guardado por 7 dias ou mais).
- Biblioteca: Genjutsu motion transfer (`/higgsfield/genjutsu/motion-transfer/v1.0`, recebe `video_url` com 4 s ou mais e `image_urls`).
- Texto para vídeo com rosto: Seedance 2.5 reference-to-video ou Kling O3 image reference. Texto para foto: SOUL (Soul ID é opcional e exige treino).
- A API **não** tem biblioteca de clipes prontos. Os clipes base serão gerados por IA uma vez e guardados. Não usar vídeo de banco de imagens com pessoas reais, cenas de filme, famosos ou marcas.
- Custo: pré-pago, cerca de US$ 0,05 a 0,46 por segundo de vídeo (fonte de terceiros, conferir no console). Uma falha não é cobrada.
- Antes de montar a biblioteca, fazer um teste de fidelidade: a mesma selfie no Genjutsu, no Seedance e no Kling, para ver qual mantém o rosto.

## 2. Objetivo da fase 1

Montar **todo o app navegável e responsivo** a partir das telas do Stitch, com dados simulados. Ao final da fase, trocar a simulação pela API real deve mexer em um arquivo só (`src/api.js`).

**Fora da fase 1:** servidor, Higgsfield, login real, pagamento real, banco de dados, biblioteca real de clipes.

**Falha da fase:** telas bonitas que quebram no celular; promessas técnicas falsas na interface; chave de API no front.

## 3. Fonte do design

Pasta `telas/` (gerada no Google Stitch):

| Pasta | Tela | Rota |
|---|---|---|
| `landing_page_seja_o_protagonista` | Landing | `/` |
| `login_e_cadastro` | Login / Cadastro (abas) | `/entrar` |
| `sua_foto_configura_o_facial` | Sua foto (câmera, galeria, consentimento) | `/perfil-rosto/foto` (ou o primeiro passo depois do cadastro) |
| `in_cio_biblioteca_de_clipes` | Início / Biblioteca | `/inicio` |
| `detalhe_do_clipe_agente_secreto` | Detalhe do clipe | `/clipe?id=` |
| `criar_com_texto_prompt_ia` | Criar com texto | `/criar-com-texto` |
| `gerando_progresso_da_ia` | Gerando | `/gerando?job=` |
| `resultado_seu_v_deo_est_pronto` | Resultado | `/resultado?job=` |
| `minhas_cria_es_galeria_status` | Minhas criações | `/minhas-criacoes` |
| `cinematic_ai_lumina/DESIGN.md` | Design system | — |

Cada pasta tem `code.html` (Tailwind por CDN + config inline) e `screen.png`. As rotas em `data-path` dos HTMLs são: `inicio`, `criar-com-texto`, `minhas-criacoes`, `creditos-planos`, `perfil-rosto` e `ajuda-faq`.

**Telas que faltam** (estão linkadas nos HTMLs, mas não existem): **Créditos & Planos**, **Perfil & Rosto**, **Ajuda/FAQ**, **Termos de Uso** e **Política de Privacidade**.

### Design system (resumo)

- Tema escuro "Cinematic Cyber-Glassmorphism": vidro fosco (`backdrop-blur`), gradiente roxo → rosa nos CTAs (`#7C3AED` → `#EC4899`), ciano para status e progresso.
- Fonte Plus Jakarta Sans; ícones Material Symbols Outlined.
- Os tokens de cor e tipografia valem como estão no `tailwind.config` inline dos HTMLs. O `DESIGN.md` descreve outra paleta (`#8B5CF6`, `#0B0A10`), mas **a fonte da verdade é o config dos HTMLs**, porque é o que as telas renderizam.
- Desktop: sidebar fixa de `w-72` mais header. Celular (`< md`): header compacto e **bottom nav fixa** (já existe no HTML de 7 telas).
- Os clipes são 9:16 nos cards, com opção 16:9 no detalhe e no resultado.

## 4. Decisões técnicas da fase 1 (escolhas do Claude, revisáveis)

- **Vite** multi-page, com HTML e JS puros, sem framework. Uma página `.html` por rota: a rota `/clipe?id=` é o arquivo `clipe.html`, e `/perfil-rosto/foto` vira `foto.html`. Em produção, `cleanUrls` da Vercel tira o `.html` da URL.
- **Sem vídeos reais na fase 1:** os cards e os players usam imagem como poster. O preview em hover é só zoom e brilho. A estrutura `<video poster>` já fica pronta para receber o arquivo depois.
- **Tailwind v3 compilado** (PostCSS), reaproveitando o objeto `tailwind.config` dos HTMLs do Stitch. O CDN do Tailwind não serve para produção.
- **Shell compartilhado** (sidebar, header, bottom nav, badge de créditos) gerado por um módulo JS (`src/shell.js`), para não repetir o mesmo HTML em 7 arquivos. Ele marca a rota ativa.
- **Dados simulados:** `src/data/clips.json` com os clipes, título, categoria, duração, custo e imagem.
- **Estado no `localStorage`**, num módulo só (`src/store.js`): usuário fake, saldo, foto (dataURL já reduzido), consentimento e criações.
- **`src/api.js`** imita o fluxo real da Higgsfield: `gerarClipe()` / `gerarComTexto()` devolvem `jobId`, e `statusJob(jobId)` avança as fases com o tempo. A falha simulada só aparece com `?debug=falha`.
- **Imagens:** as dos HTMLs apontam para `lh3.googleusercontent.com` (hospedagem do Stitch) e podem expirar. Baixar para `public/img/` na tarefa 1.
- **Deploy de preview:** Vercel (skill `deploy-to-vercel`), só quando o usuário pedir.

### Tabela única de créditos (escolha do Claude; as telas usam valores diferentes)

| Ação | Créditos |
|---|---|
| Clipe da biblioteca | 5 |
| Texto para vídeo, 5 s | 5 |
| Texto para vídeo, 10 s | 8 |
| Texto para foto | 2 |
| Bônus de cadastro | 10 |

Planos, tirados da landing: Básico R$ 29, Pro Creator R$ 69 e Ultra Studio R$ 149 por mês. Conferir no HTML os créditos mensais de cada plano.

## 5. Correções de conteúdo obrigatórias

As telas do Stitch inventaram coisas que o app vai **vender**. Por causa do Código de Defesa do Consumidor e da LGPD, corrigir na hora de portar cada tela:

1. **Remover promessas técnicas falsas:** 4K/UHD, Dolby 5.1, "Fidelidade 99,4%", VRAM, ISO/f-stop, latência, "SelfieVision v4.2", "846 vetores", "Cluster neural", HEVC/ProRes, "5 GB". A API entrega até cerca de 1080p, dependendo do modelo. Usar textos neutros: "HD", "Pronto", "Processando".
2. **Privacidade coerente:** uma tela diz que a selfie é descartada, e outra mostra a selfie salva no Perfil. Regra adotada: **a foto fica salva até o usuário apagar** (botão "Apagar minha foto" no Perfil). Ajustar todos os textos.
3. **Consentimento:** o checkbox "Confirmo que esta foto é minha e autorizo o uso para gerar meus vídeos" é obrigatório. O botão "Usar esta foto" fica desabilitado até ele ser marcado.
4. **Botões de simulação** ("Simular Falha / Sucesso", "Simular Galeria Vazia") saem da interface. Só aparecem com `?debug`.
5. **Imagens de exemplo** parecidas com pessoas e marcas reais (estilo 007, F1 Petronas/Mercedes, Red Bull, Silverstone, Cannes) ficam só como placeholder. Na biblioteca real, nada de marca, famoso nem sósia.
6. **Créditos:** aplicar a tabela da seção 4 em todas as telas.
7. **Nomes fictícios:** "Camila Silva" e os 45 créditos vêm do `store.js`, nunca fixos no HTML.

## 6. Plano de tarefas

Cada tarefa termina com: a tela abre sem erro no console, foi conferida em **390 px e 1440 px** (agent-browser ou chrome-devtools) e tem um commit próprio.

### Tarefa 0: base do projeto
- `npm create vite` (vanilla), Tailwind v3 com PostCSS, fonte e ícones.
- `tailwind.config.js` com os tokens do Stitch.
- Estrutura: `src/`, `src/pages/`, `src/data/`, `public/img/`.
- Scripts `dev`, `build` e `preview`.
- **Pronto quando:** `npm run build` passa e uma página de teste mostra a fonte, as cores e um ícone.

### Tarefa 1: assets
- Baixar todas as imagens `lh3.googleusercontent.com` das 9 telas para `public/img/`, com nomes legíveis.
- Montar `src/data/clips.json` com os clipes da biblioteca e dos "semelhantes".
- **Pronto quando:** nenhuma página referencia mais `googleusercontent`.

### Tarefa 2: store e API simulada
- `src/store.js`: usuário, saldo, foto, consentimento e criações, com bônus de 10 créditos no cadastro.
- `src/api.js`: jobs simulados com 4 fases e cerca de 20 s no total. O débito de créditos só acontece no sucesso; a falha devolve os créditos.
- Um teste pequeno (Vitest) para o cálculo de saldo e para o reembolso.
- **Pronto quando:** os testes passam.

### Tarefa 3: shell compartilhado
- `src/shell.js`: sidebar desktop, header (busca, saldo, ajuda, "Novo Vídeo") e bottom nav no celular, com rota ativa e saldo vindos do store.
- **Pronto quando:** o shell aparece igual em todas as rotas internas, com a bottom nav só abaixo de `md`.

### Tarefa 4: Landing (`/`)
- Portar a tela, com o hero em vídeo/imagem, 3 passos, galeria com filtros, planos, FAQ (accordion) e CTA final.
- Aplicar as correções da seção 5.
- Os CTAs levam a `/entrar`.

### Tarefa 5: Login / Cadastro (`/entrar`)
- Abas Criar conta / Entrar, e-mail, senha com mostrar/ocultar e validação mínima de 8 caracteres.
- Google é só visual.
- Cadastro → `store` → `/perfil-rosto/foto`. Login → `/inicio`.

### Tarefa 6: Sua foto
- "Tirar foto": `getUserMedia` (câmera frontal) com guia oval, ou `<input type="file" accept="image/*" capture="user">` no celular.
- "Escolher da galeria": input file com arrastar e soltar no desktop.
- Reduzir a imagem para 1024 px ou menos antes de salvar.
- Mostrar o preview, com "Usar esta foto" (desabilitado até o consentimento) e "Trocar foto".
- Tratar câmera negada ou inexistente com uma mensagem e a galeria como saída.

### Tarefa 7: Início / Biblioteca (`/inicio`)
- Busca (atalho Ctrl+K), chips de categoria, ordenação (populares, recentes, custo), banner de destaque e grid de cards 9:16.
- Preview em hover no desktop; toque abre o detalhe.
- Estado vazio quando a busca não encontra nada.

### Tarefa 8: Detalhe do clipe (`/clipe?id=`)
- Player, alternância 16:9 / 9:16, informações, rosto do protagonista com link para trocar, custo, saldo e "restarão".
- "Gerar com meu rosto": sem foto, vai para Sua foto; sem saldo, vai para Créditos; com tudo certo, chama `api.gerarClipe` → `/gerando`.
- "Clipes semelhantes" da mesma categoria.

### Tarefa 9: Criar com texto (`/criar-com-texto`)
- Alternância Vídeo / Foto, textarea com contador de 500 caracteres, "Sugestão da IA" (sorteia exemplos), "Limpar", estilos, duração (5 s / 10 s) e proporção (9:16 / 16:9).
- O resumo do pedido mostra o custo calculado pela tabela.
- O botão gerar fica desabilitado se o texto estiver vazio, sem foto ou sem saldo.

### Tarefa 10: Gerando (`/gerando?job=`)
- Anel de progresso, fases (ver a legenda no `DESIGN.md`), tempo estimado e aviso de "pode sair desta tela".
- No sucesso vai para `/resultado`. Na falha, mostra o estado de erro com crédito devolvido e "Tentar de novo".

### Tarefa 11: Resultado (`/resultado?job=`)
- Player, download, compartilhar (Web Share API; sem suporte, copia o link), avaliação com estrelas, "Gerar variação", "Criar outro" e recomendados.

### Tarefa 12: Minhas criações (`/minhas-criacoes`)
- Abas Todos / Vídeos / Fotos, ordenação, cards com status (Pronto, Gerando com %, Falhou com crédito devolvido) e estado vazio.

### Tarefa 13: telas que faltam
- Primeiro, perguntar ao usuário se ele quer gerá-las no Stitch. Se não quiser, montar seguindo o design system:
  - **Créditos & Planos:** saldo, 3 planos (o Pro em destaque) e pacotes avulsos. O pagamento é só visual.
  - **Perfil & Rosto:** dados da conta, foto salva com "Trocar" e "Apagar minha foto" (com confirmação na própria página), histórico de compras, sair e excluir conta.
  - **Ajuda/FAQ**, **Termos de Uso** e **Política de Privacidade**: páginas simples. Os textos legais ficam marcados como rascunho, para revisão por um advogado.

### Tarefa 14: revisão final
- Navegar todos os fluxos em 390 px e 1440 px.
- Lighthouse (chrome-devtools) em acessibilidade e performance.
- Checar foco visível no teclado, `alt` nas imagens e contraste.
- Usar a skill `web-design-guidelines`.

## 7. Fase 2 (depois, cada item com seu próprio design)

1. Teste de fidelidade de rosto na Higgsfield (precisa da chave e de saldo).
2. Servidor serverless e troca de `src/api.js` pela API real, com webhook.
3. Login real e banco de dados (usuários, créditos, criações).
4. Pagamento (planos e créditos).
5. Geração e curadoria dos clipes base da biblioteca.
6. Revisão jurídica: termos, privacidade, LGPD e dado biométrico.
