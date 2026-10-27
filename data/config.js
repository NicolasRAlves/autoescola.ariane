/* =====================================================================
   AUTO ESCOLA ARIANE — CONFIGURAÇÃO DO SITE
   ---------------------------------------------------------------------
   Tudo o que a escola pode mudar sem mexer no HTML fica aqui.
   Regras:
   - Texto sempre entre aspas.  Ex.: horas: "08h às 18h"
   - Valor que ainda não sabemos = null (o site mostra "sob consulta"
     ou esconde o item).
   - Depois de salvar, recarregue a página.
   ===================================================================== */

window.ARIANE = {

  /* Enquanto true, o site mostra as marcas amarelas [CLIENTE INFORMAR]
     e uma faixa de "prévia" no topo. Troque para false ANTES de publicar:
     tudo o que estiver pendente some do site. */
  modoRascunho: true,

  /* Domínio definitivo (sem barra no final). PROVISÓRIO até o cliente
     registrar o domínio. Lembre de trocar também no sitemap.xml,
     robots.txt e nas tags canonical/og das páginas (buscar e substituir). */
  siteUrl: "https://autoescolaariane.com.br",

  nome: "Auto Escola Ariane",
  tipo: "Centro de Formação de Condutores · Categorias A e B",

  /* ---------- CONTATO ---------- */
  telefones: [
    { rotulo: "(11) 5667-5745", numero: "+551156675745" },
    { rotulo: "(11) 5667-5691", numero: "+551156675691" }
  ],

  whatsapp: {
    numero: "551156675745",          // só números, com 55 + DDD
    rotulo: "(11) 5667-5745",
    mensagemPadrao: "Olá! Vim pelo site da Auto Escola Ariane e quero fazer um orçamento."
  },

  email: null,                        // ex.: "contato@autoescolaariane.com.br"

  endereco: {
    rua: "Av. Dona Belmira Marin, 5089",
    bairro: null,                     // [CLIENTE INFORMAR] ex.: "Grajaú"
    cidade: "São Paulo",
    uf: "SP",
    cep: null,                        // [CLIENTE INFORMAR] ex.: "04846-000"
    regiao: "Zona Sul",
    /* Texto usado para abrir Google Maps e Waze */
    busca: "Auto Escola Ariane, Av. Dona Belmira Marin, 5089, São Paulo - SP"
  },

  /* Horário de funcionamento. Vazio = o site mostra "consulte pelo WhatsApp".
     Exemplo: [{ dias: "Segunda a sexta", horas: "08h às 18h" },
               { dias: "Sábado", horas: "08h às 12h" }] */
  horarios: [],

  instagram: {
    usuario: "autoescolaariane",
    url: "https://www.instagram.com/autoescolaariane"
  },

  /* Frase do contador do mural. Só aparece com o site publicado depois
     que o cliente confirmar (fraseConfirmada: true). */
  frasePosts: "Mais de 2.000 publicações no nosso Instagram, a maioria de alunos aprovados.",
  fraseConfirmada: false,

  /* ---------- SERVIÇOS ----------
     true  = a escola oferece (aparece no site e no simulador)
     false = não oferece (some do site)
     null  = ainda não confirmado (aparece só no modo rascunho, marcado) */
  servicos: {
    categoriaAB: true,          // A e B juntas (Pacote Especial AB)
    adicaoCategoria: null,      // já tem A e quer B, ou o contrário
    aulaAvulsa: true,
    motoAutomatica: true,       // aula avulsa de moto automática
    aulaVespera: null,          // aula na véspera da prova
    veiculoProva: true,         // veículo da escola no exame (incluso no pacote)
    marcaProvas: true,          // a escola marca a prova teórica e a prática
    carroAutomatico: null,
    habilitadoComMedo: null,    // já tem CNH e quer perder o medo
    teoricoPresencial: false,   // o teórico é feito pelo app CNH do Brasil
    aulaSabado: null,
    aulaNoite: null
  },

  /* ---------- PLANOS E PREÇOS ----------
     Informados pela escola em 27/10/2026.
     Valores em número, sem R$, com ponto nos centavos: 52.83
     Para tirar um item do site, apague a linha dele. */
  planos: {
    atualizadoEm: "27/10/2026",

    /* precoAvista null = "sob consulta". destaque: true = card em vermelho */
    pacotes: [
      {
        id: "minimo",
        nome: "Pacote Mínimo",
        selo: "Já sei dirigir",
        descricao: "Para quem já sabe dirigir e só precisa cumprir as 2 aulas obrigatórias da lei antes da prova.",
        aPartirDe: true,
        precoAvista: 400,
        precoCartao: null,
        parcelasCartao: null,
        inclui: [
          "2 aulas práticas (o mínimo obrigatório)",
          "Preparo para a prova prática"
        ]
      },
      {
        id: "ab10",
        nome: "Pacote AB",
        selo: "A + B",
        descricao: "Moto e carro com 10 aulas no total, para quem já tem alguma prática.",
        precoAvista: 1100,
        precoCartao: 1200,
        parcelasCartao: 5,
        inclui: [
          "Matrícula",
          "5 aulas práticas de carro",
          "5 aulas práticas de moto",
          "Taxa da prova prática",
          "Uso do veículo no exame"
        ]
      },
      {
        id: "ab",
        nome: "Pacote Especial AB",
        selo: "Mais completo",
        destaque: true,
        descricao: "Moto e carro com 20 aulas, para quem está começando do zero.",
        precoAvista: 1600,
        precoCartao: 1700,
        parcelasCartao: 5,
        inclui: [
          "Matrícula",
          "10 aulas práticas de carro",
          "10 aulas práticas de moto",
          "Taxas das provas práticas",
          "Uso dos veículos nos exames práticos"
        ]
      }
    ],

    /* categorias: em quais páginas a aula aparece ("A" moto, "B" carro) */
    avulsas: [
      { id: "avulsa", nome: "Aula avulsa", detalhe: "carro ou moto", preco: 100, duracao: "50 min", categorias: ["A", "B"] },
      { id: "moto-automatica", nome: "Aula avulsa de moto automática", detalhe: "", preco: 120, duracao: "50 min", categorias: ["A"] }
    ],

    /* Pagos à parte, fora do pacote */
    taxasAParte: [
      { id: "exame-medico-psico", nome: "Exame médico e psicotécnico", valor: 180 },
      { id: "exame-toxico", nome: "Exame toxicológico", valor: 150 },
      { id: "taxa-teorico", nome: "Taxa do exame teórico", valor: 52.83 },
      { id: "taxa-emissao", nome: "Taxa de emissão da CNH", valor: 137.79 }
    ]
  },

  formasPagamento: "À vista ou em até 5x no cartão (Pacote AB: R$ 1.100 à vista ou R$ 1.200 em 5x; Especial AB: R$ 1.600 ou R$ 1.700 em 5x).",

  /* ---------- DADOS INSTITUCIONAIS ---------- */
  cnpj: null,
  credenciamentoDetran: null,

  /* Data em que as regras de trânsito do site foram conferidas */
  regrasAtualizadasEm: "27/10/2026",

  /* ---------- FOTOS AVULSAS ----------
     Depois de rodar scripts/otimizar-imagens.mjs, preencha com o nome
     gerado (sem extensão). Ex.: fachada: "fachada"
     -> o site usa assets/img/fotos/fachada-1600.webp etc. */
  fotos: {
    fachada: "fachada",
    frotaMoto: "fachada",
    frotaCarro: "fachada",
    aula: null,
    equipe: null
  },

  /* Vídeos (Reels). Ex.:
     { arquivo: "aprovacao-01.mp4", poster: "aprovacao-01.jpg",
       categoria: "B", titulo: "Aprovação na prova prática" }
     Os arquivos ficam em assets/video/ */
  videos: [],

  /* ---------- PERGUNTAS QUE DEPENDEM DA ESCOLA ----------
     Enquanto "resposta" estiver vazia, a pergunta só aparece no modo
     rascunho. Ao responder, ela entra no FAQ do site.
     categoria: "geral", "A" ou "B" */
  faqEscola: [
    { categoria: "geral", pergunta: "Quanto custa tirar a CNH na Ariane?", resposta: "Há três pacotes A + B. O Pacote AB (5 aulas de carro e 5 de moto) custa R$ 1.100 à vista ou R$ 1.200 em 5x. O Especial AB (10 + 10 aulas) custa R$ 1.600 à vista ou R$ 1.700 em 5x. Para quem já sabe dirigir existe o Pacote Mínimo, com as 2 aulas obrigatórias. Os pacotes incluem matrícula, taxa da prova prática e uso do veículo no exame. À parte: exame médico e psicotécnico (R$ 180), toxicológico (R$ 150), taxa do exame teórico (R$ 52,83) e emissão da CNH (R$ 137,79). Valores de 27/10/2026." },
    { categoria: "geral", pergunta: "Dá para parcelar?", resposta: "Sim, em até 5x no cartão: o Pacote AB sai R$ 1.200 em 5x (R$ 1.100 à vista) e o Especial AB, R$ 1.700 em 5x (R$ 1.600 à vista)." },
    { categoria: "geral", pergunta: "Vocês emprestam o veículo para a prova?", resposta: "Sim. Nos pacotes A + B, o uso do veículo da escola no exame prático e a taxa da prova prática já estão inclusos." },
    { categoria: "geral", pergunta: "Vocês marcam as provas?", resposta: "Sim. Quando você termina o curso teórico no app CNH do Brasil e sai o resultado dos exames, a escola marca a prova teórica. Depois que você passa, faz as aulas práticas e a escola marca a prova prática." },
    { categoria: "geral", pergunta: "E se eu precisar de mais aulas?", resposta: "Você pode contratar aulas avulsas de 50 minutos: R$ 100 cada, ou R$ 120 na moto automática." },
    { categoria: "geral", pergunta: "Posso tirar A e B juntas?", resposta: "Sim. Os pacotes A + B têm 5 + 5 aulas (Pacote AB) ou 10 + 10 aulas (Especial AB), com a prova prática e o veículo no exame inclusos." },
    { categoria: "geral", pergunta: "Qual o horário de atendimento?", resposta: "" },
    { categoria: "geral", pergunta: "Tem aula aos sábados?", resposta: "" },
    { categoria: "B", pergunta: "Vocês têm carro automático para aula e prova?", resposta: "" },
    { categoria: "B", pergunta: "Tem pacote só de carro?", resposta: "" },
    { categoria: "A", pergunta: "Tem aula em moto automática?", resposta: "Sim. A aula avulsa de moto automática custa R$ 120 e dura 50 minutos." },
    { categoria: "A", pergunta: "Tem pacote só de moto?", resposta: "" },
    { categoria: "A", pergunta: "Vocês emprestam capacete e equipamento?", resposta: "" }
  ]
};
