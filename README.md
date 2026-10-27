# Site — Auto Escola Ariane

Site estático (HTML, CSS e JS puros, sem framework e sem build) do CFC Auto Escola Ariane, categorias A e B, na Av. Dona Belmira Marin, Zona Sul de SP.

## Páginas

| Endereço | O que tem |
|---|---|
| `/` | Home: hero com a placa APROVADO, categorias, mural, Nova CNH, estrada do passo a passo, gerador de placa, orçamento rápido, FAQ e mapa |
| `/categoria-a/` | Moto (tema amarelo) |
| `/categoria-b/` | Carro (tema azul) |
| `/nova-cnh-2026/` | Guia das regras novas, tabela antes × agora, simulador de pontuação e fontes. É a página principal de SEO |
| `/aprovados/` | Mural completo com filtro Moto/Carro e lightbox |
| `/orcamento/` | Simulador em 5 etapas que abre o WhatsApp com a mensagem pronta |
| `/404.html` | Página de erro |

## Abrir no computador

As páginas usam endereços de pasta (`/categoria-a/`), então abra por um servidor local. Dar dois cliques no `index.html` não funciona direito.

```bash
cd site/scripts
npm install          # só na primeira vez
npm run servidor     # abre em http://localhost:8080
```

Sem Node, use o Python:

```bash
cd site
python -m http.server 8080
```

## Antes de publicar

1. Em `data/config.js`, troque `modoRascunho: true` para **`false`**. Isso esconde todas as marcas amarelas `[CLIENTE INFORMAR]` e a faixa de prévia.
2. Troque o domínio provisório `autoescolaariane.com.br` pelo definitivo: busque e substitua em todos os arquivos `.html`, no `sitemap.xml`, no `robots.txt` e no `config.js`.
3. Rode `npm run links` dentro de `site/scripts`. O resultado precisa ser "Nenhum arquivo local quebrado".

## Trazer as fotos do Instagram de uma vez

O Instagram não deixa baixar posts de forma automatizada, mas a dona da conta pode pedir uma **cópia oficial** de todas as publicações, com as legendas:

1. No app da escola: **Configurações › Central de Contas › Suas informações e permissões › Baixar suas informações**. Escolha "Algumas das suas informações" › **Publicações**, formato **JSON** e qualidade de mídia **Alta**.
2. O Instagram manda um link por e-mail (pode levar algumas horas). Baixe o `.zip` e extraia.
3. Rode:
   ```bash
   cd site/scripts
   node importar-instagram.mjs "C:\caminho\da\pasta\extraida" --max 40
   ```
   O script lê a legenda de cada post e **copia** a foto para `fotos-para-o-site/aprovados/moto`, `.../carro` ou `.../revisar`, quando a legenda não deixa claro se é moto ou carro. Posts sem a palavra "aprovado" (preços, avisos) também vão para `revisar`. Por padrão ele pega as 40 mais recentes de cada categoria.
4. Dê uma olhada nas pastas, tire quem não autorizou e rode `npm run imagens`.

## Como adicionar novos aprovados

1. Salve a foto em `fotos-para-o-site/aprovados/moto/` (categoria A) ou `fotos-para-o-site/aprovados/carro/` (categoria B). Essa pasta fica **fora** de `site`, para os originais pesados não irem para a hospedagem.
   - Dica: comece o nome com a data (`2026-11-03-aprovacao.jpg`). O mural mostra primeiro as mais recentes.
2. Rode:
   ```bash
   cd site/scripts
   npm run imagens
   ```
3. O script gera as versões WebP e JPG (600 px para o mural e 1080 px para o lightbox) em `assets/img/aprovados/` e reescreve `data/aprovados.js`, com uma linha por foto.

Para colocar uma descrição específica numa foto (para leitores de tela), edite a linha dela em `data/aprovados.js` e acrescente `"alt": "..."`. O script mantém essa descrição nas próximas execuções.

**Nunca publique nomes de alunos sem autorização.**

## Fotos da escola (fachada, frota, aulas, equipe)

1. Salve em `fotos-para-o-site/fotos/` com nomes simples: `fachada.jpg`, `moto.jpg`, `carro.jpg`, `aula.jpg`, `equipe.jpg`.
2. Rode `npm run imagens`.
3. Em `data/config.js`, preencha o bloco `fotos`:
   ```js
   fotos: { fachada: "fachada", frotaMoto: "moto", frotaCarro: "carro", aula: "aula", equipe: "equipe" }
   ```

## Vídeos (Reels)

Salve os `.mp4` em `fotos-para-o-site/videos/` e rode `npm run imagens`. O script copia o vídeo para `assets/video/`, cria a capa `.jpg` com o ffmpeg e avisa se o arquivo passar de 8 MB. Depois acrescente o vídeo em `config.js > videos`. A seção "Em vídeo" do mural só aparece quando há algum vídeo cadastrado.

## Como mudar preços, horários e serviços

Tudo fica em `data/config.js`, comentado:

- **`horarios`**: vazio, o site mostra "Consulte pelo WhatsApp".
- **`planos`**: Pacote Especial AB, aulas avulsas e exames e taxas à parte. Ao mudar um valor aqui, mudam juntos os cards de planos (home e categorias), os valores citados no passo a passo, a página Nova CNH e as contas dos dois simuladores. O HTML já vem com os valores de 27/10/2026 escritos; o `planos.js` atualiza na hora se o config mudar.
- **`servicos`**: `true` aparece no site, `false` some e `null` aparece só na prévia, com a marca `[confirmar]`.
- **`faqEscola`**: preencha a `resposta` e a pergunta entra no FAQ do site.
- **`telefones`, `whatsapp`, `endereco`, `instagram`**: atualizam todos os botões e links.

## Publicar

Publique **o conteúdo da pasta `site`, menos a pasta `scripts`**. Ela é só para manutenção e tem o `node_modules`, que é pesado.

- **Hostinger:** no Gerenciador de Arquivos, envie o conteúdo para `public_html/`. A página `404.html` é usada automaticamente.
- **Netlify:** arraste a pasta para app.netlify.com/drop. Antes, copie a pasta `site` sem `scripts`.
- **GitHub Pages:** funciona, mas use um domínio próprio. A página 404 usa caminhos a partir da raiz (`/assets/...`).

## Depois de publicar

1. **Google Meu Negócio:** coloque o link do site no perfil da escola.
2. **Bio do Instagram:** troque o link da bio (hoje vai direto para o WhatsApp) por `https://[dominio]/`. O botão de WhatsApp continua a um clique, e a pessoa ainda vê o mural, a Nova CNH e o simulador.
3. **Google Search Console:** cadastre o domínio e envie o `sitemap.xml`.
4. **Regras de trânsito:** revise `/nova-cnh-2026/` a cada 3 meses. Ao revisar, atualize `regrasAtualizadasEm` no `config.js` e a data nos textos.

## Estrutura

```
site/
├── index.html, 404.html, sitemap.xml, robots.txt, favicon.*
├── categoria-a/  categoria-b/  nova-cnh-2026/  aprovados/  orcamento/
├── assets/
│   ├── css/style.css
│   ├── js/main.js        (contatos, menu, mural, lightbox, mapa, FAQ)
│   ├── js/placa.js       (gerador de placa em canvas)
│   ├── js/planos.js      (cards de planos e preços)
│   ├── js/orcamento.js   (orçamento rápido e simulador completo)
│   ├── js/pontuacao.js   (simulador de pontos da prova)
│   ├── js/estrada.js     (carro e moto andando na estrada)
│   ├── fonts/            (Barlow Condensed e Inter, licença OFL)
│   └── img/  video/
├── data/config.js        (tudo o que a escola pode mudar)
├── data/aprovados.js     (lista de fotos, gerada pelo script)
└── scripts/              (não publicar)
    ├── importar-instagram.mjs
    ├── otimizar-imagens.mjs
    └── checar-links.mjs
```

## Observações técnicas

- Nenhum dado de formulário vai para servidor: os orçamentos montam o texto e abrem o `wa.me` com `encodeURIComponent`.
- O mapa do Google só carrega depois do clique em "Ver no mapa".
- As animações respeitam `prefers-reduced-motion`.
- As fontes ficam no próprio site, sem chamada ao Google Fonts.
- Os testes da entrega (27/10/2026) passaram nas larguras 360, 390, 768, 1280 e 1440 px, sem rolagem horizontal. O axe-core não encontrou violações WCAG A/AA no modo publicado. O Lighthouse no celular (modo prévia) deu 89 a 97 em desempenho (a nota varia um pouco a cada rodada) e 100 em acessibilidade, boas práticas e SEO, com CLS 0 em todas as páginas.
