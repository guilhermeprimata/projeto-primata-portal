# Projeto Primata Games — portal para projetoprimata.com

Website estático e responsivo, pronto para hospedagem gratuita no **Cloudflare Pages**.

## Arquitetura

- **Domínio:** projetoprimata.com, registrado na GoDaddy. **O registro permanece na GoDaddy.**
- **DNS:** Cloudflare DNS no plano gratuito (após mudar nameservers na GoDaddy).
- **Hospedagem:** Cloudflare Pages Free, arquivos estáticos, deploy automático conectado ao GitHub.
- **Quickplay:** todos os 37 jogos apontam para `https://guilhermeprimata.github.io/Quickplay_Collection/<arquivo>.html` e são carregados **sob demanda**, em iframe somente ao abrir um jogo. Nenhum arquivo de jogo é duplicado no portal.
- **Capital Criminal:** informações e links da página principal Steam App 4080140 e da demo Steam App 5210610. Botões de wishlist e demo direcionam à Steam. Trailer é acessado na página oficial Steam (evita um embed de vídeo frágil ou não autorizado).
- **Marca:** assets criados **a partir do ZIP oficial fornecido**, H2 - O Curioso, versão aprovada 12/10/2026. Sem imagens geradas para o logo.

## Abrir e testar localmente

Como os módulos JS usam `type="module"`, **não** abra `index.html` diretamente pelo `file://`: inicie um servidor local:

```bash
cd projetoprimata-portal
python -m http.server 8000
```

Abra http://localhost:8000. O catálogo será renderizado mesmo sem internet; os jogos, o widget da Steam e as fontes remotas precisam de conexão ao jogar.

## Publicar no Cloudflare Pages (sem build, sem Node)

1. Crie um **repositório novo**, por exemplo `projetoprimata-portal`, no seu GitHub. Não apague nem substitua `Quickplay_Collection`.
2. Envie os conteúdos **desta pasta** para a raiz do novo repositório (`index.html`, `assets/`, `_headers`, etc.). A pasta que contém `index.html` deve ser a raiz publicada.
3. Entre em https://dash.cloudflare.com/ → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**. Autorize o GitHub e selecione o novo repositório.
4. Configure framework **None**, build command **em branco**, output directory **`/`** (se a interface exigir um valor, use `.` para raiz do repositório). Production branch `main`.
5. Publique. A Cloudflare atribuirá uma URL provisória como `projetoprimata-portal.pages.dev` (nome efetivo depende da disponibilidade).
6. Adicione `projetoprimata.com` em **Pages → seu projeto → Custom domains**, como domínio principal. Configure também `www.projetoprimata.com`, com redirecionamento para a raiz se desejar.
7. **Para o domínio raiz**, a Cloudflare exige que o domínio esteja como zona Cloudflare e os *nameservers* apontem para ela. No dashboard Cloudflare, adicione o site `projetoprimata.com` no **plano Free**, confira a importação dos registros DNS, e anote os **nameservers exclusivos mostrados na sua conta**.
8. Na GoDaddy → **My Products → Domains → projetoprimata.com → DNS / Nameservers → Change** → informe os nameservers fornecidos pela Cloudflare. Não invente nem use nameservers de terceiros. A validação e a propagação do DNS podem demorar.
9. Antes de mudar nameservers, confira os registros existentes da GoDaddy, especialmente **MX, SPF, DKIM e DMARC** se utiliza e-mails `@projetoprimata.com`. Eles precisam ser preservados no Cloudflare DNS. Também preserve quaisquer verificações TXT relevantes.
10. Após a ativação, confira `https://projetoprimata.com`, `https://www.projetoprimata.com`, o certificado TLS/HTTPS, um jogo Quickplay e o widget da Steam.

### Importante

- Ainda **não** foi alterado qualquer DNS nem publicado o novo portal em seu domínio. Este ZIP é a entrega pronta para deploy. GoDaddy/Cloudflare precisam de ações autenticadas em suas contas.
- O site usa apenas HTML/CSS/JavaScript, sem servidor de aplicação e sem banco de dados: custos de hospedagem estimados em **R$ 0** dentro dos limites do plano Free. **A renovação anual do domínio GoDaddy continua sendo cobrada.**
- O GitHub Pages original é o servidor dos jogos; atualizações nos mesmos arquivos `.html` aparecerão no portal sem novo deploy. Se um **nome de arquivo** mudar, atualize `assets/games.js` e publique novo commit.
- Jogar no iframe pode variar conforme restrições de navegador, políticas de terceiros, fullscreen, *pointer lock* e bloqueio de armazenamento entre sites. Há **Abrir em nova aba** em cada player para máxima compatibilidade.
- Nenhum analytics, cookie de rastreamento próprio ou anúncios foram instalados. O iframe da Steam e os jogos hospedados pelo GitHub podem operar sob suas próprias políticas.
- Para usar trailer **dentro da página**, inclua um MP4 do próprio estúdio que você tenha direito de hospedar ou um link de embed oficial verificado do YouTube, e substitua a seção `capital-trailer-link`.

## Personalização

- **Jogos, nomes, categorias e descrições:** `assets/games.js`.
- **Player, filtros, comportamento da navegação:** `assets/app.js`.
- **Cores, layout e responsividade:** `assets/styles.css`.
- **Arte original:** `assets/ppg-*.webp` e favicon.
- **Links Steam e copy do Capital Criminal:** seção `id="capital-criminal"` em `index.html`.
- **Cabeçalhos de segurança Cloudflare:** `_headers`. Revise `Content-Security-Policy` se adicionar novos provedores de vídeo ou analytics.

## Referências oficiais

- https://developers.cloudflare.com/pages/get-started/git-integration/
- https://developers.cloudflare.com/pages/configuration/custom-domains/
- https://developers.cloudflare.com/pages/platform/limits/
- https://github.com/guilhermeprimata/Quickplay_Collection
- https://store.steampowered.com/app/4080140/Capital_Criminal/
- https://store.steampowered.com/app/5210610/Capital_Criminal_Demo/
