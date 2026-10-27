/* Planos e preços: monta os cards a partir de data/config.js > planos.
   O mesmo arquivo é usado pelo gerador das páginas, então o HTML já sai
   pronto e este script só atualiza se alguém mudar o config. */
(function (root) {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function brl(v) {
    if (typeof v !== "number") return "";
    var inteiro = Math.round(v * 100) % 100 === 0;
    return "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: inteiro ? 0 : 2, maximumFractionDigits: 2 });
  }

  function calc(C) {
    var P = (C && C.planos) || {};
    var taxas = (P.taxasAParte || []).reduce(function (s, t) { return s + (typeof t.valor === "number" ? t.valor : 0); }, 0);
    var ab = (P.pacotes || []).filter(function (p) { return p.id === "ab"; })[0] || null;
    return {
      taxas: taxas,
      ab: ab,
      totalAb: ab && typeof ab.precoAvista === "number" ? ab.precoAvista + taxas : null,
      parcela: ab && ab.precoCartao && ab.parcelasCartao ? ab.precoCartao / ab.parcelasCartao : null
    };
  }

  var WA = "https://wa.me/551156675745";
  function check(t) { return "<li>" + esc(t) + "</li>"; }

  function render(C, cat) {
    var P = (C && C.planos) || {};
    var k = calc(C);
    var html = "";

    (P.pacotes || []).forEach(function (p) {
      var parcela = p.precoCartao && p.parcelasCartao ? p.precoCartao / p.parcelasCartao : null;
      var temPreco = typeof p.precoAvista === "number";
      html += '<article class="plano' + (p.destaque ? " plano--destaque" : "") + '">' +
        (p.selo ? '<span class="selo selo--vermelho">' + esc(p.selo) + "</span>" : "") +
        "<h3>" + esc(p.nome) + "</h3>" +
        (p.descricao ? '<p class="plano__desc">' + esc(p.descricao) + "</p>" : "") +
        (temPreco ? '<p class="plano__preco">' + (p.aPartirDe ? '<span class="plano__apartir">a partir de</span> ' : "") + '<strong>' + brl(p.precoAvista) + "</strong> <span>à vista</span></p>"
          : '<p class="plano__preco"><strong class="plano__consulta">Sob consulta</strong></p><p class="plano__cartao"><span class="pendente" data-pendente>[CLIENTE INFORMAR preço]</span></p>') +
        (p.precoCartao ? '<p class="plano__cartao">ou ' + brl(p.precoCartao) + " em " + p.parcelasCartao + "x de " + brl(parcela) + " no cartão</p>" : "") +
        '<ul class="lista-check">' + (p.inclui || []).map(check).join("") + "</ul>" +
        '<a class="btn ' + (p.destaque ? "btn--vermelho" : "btn--azul") + ' btn--bloco" data-wa="Olá! Vim pelo site e quero saber do ' + esc(p.nome) + '." href="' + WA + '">Quero o ' + esc(p.nome) + "</a>" +
        "</article>";
    });

    var extras = "";
    var avulsas = (P.avulsas || []).filter(function (a) { return !cat || !a.categorias || a.categorias.indexOf(cat) > -1; });
    if (avulsas.length) {
      extras += '<article class="plano">' +
        '<span class="selo">Avulsas</span><h3>Aulas avulsas</h3>' +
        '<p class="plano__desc">Para treinar mais antes da prova, depois de uma reprovação ou para quem já está com o processo andando.</p>' +
        '<ul class="plano__tabela">' + avulsas.map(function (a) {
          return "<li><span>" + esc(a.nome) + (a.detalhe ? " <small>(" + esc(a.detalhe) + ")</small>" : "") + "<small>" + esc(a.duracao || "") + " por aula</small></span><strong>" + brl(a.preco) + "</strong></li>";
        }).join("") + "</ul>" +
        '<a class="btn btn--contorno btn--bloco" data-wa="Olá! Vim pelo site e quero contratar aulas avulsas." href="' + WA + '">Quero aulas avulsas</a>' +
        "</article>";
    }

    if ((P.taxasAParte || []).length) {
      extras += '<article class="plano plano--taxas">' +
        '<span class="selo">À parte</span><h3>Exames e taxas</h3>' +
        '<p class="plano__desc">Pagos à parte, fora do pacote.</p>' +
        '<ul class="plano__tabela">' + P.taxasAParte.map(function (t) {
          return "<li><span>" + esc(t.nome) + "</span><strong>" + brl(t.valor) + "</strong></li>";
        }).join("") + '<li class="plano__soma"><span>Total</span><strong>' + brl(k.taxas) + "</strong></li></ul>" +
        "</article>";
    }

    var rodape = "";
    if (false) {
      rodape = '<p class="planos__total">Primeira habilitação <strong>A + B completa</strong>: ' + brl(k.ab.precoAvista) + " do pacote + " + brl(k.taxas) +
        " de exames e taxas = <strong>" + brl(k.totalAb) + "</strong> à vista.</p>";
    }
    rodape += '<p class="fonte">Valores informados pela Auto Escola Ariane em ' + esc(P.atualizadoEm || "") + ". Taxas de exames e do Detran-SP podem mudar; confirme no WhatsApp.</p>";
    return '<div class="planos planos--pacotes">' + html + "</div>" + (extras ? '<div class="planos planos--extras">' + extras + "</div>" : "") + rodape;
  }

  /* textos soltos com preço: <span data-preco="ab-avista"> etc. */
  function valores(C) {
    var k = calc(C);
    var P = (C && C.planos) || {};
    var avulsa = (P.avulsas || []).filter(function (a) { return a.id === "avulsa"; })[0];
    var motoAut = (P.avulsas || []).filter(function (a) { return a.id === "moto-automatica"; })[0];
    var out = {};
    (P.taxasAParte || []).forEach(function (t) { if (t.id) out[t.id] = brl(t.valor); });
    var base = {
      "ab-avista": k.ab ? brl(k.ab.precoAvista) : "",
      "ab-cartao": k.ab ? brl(k.ab.precoCartao) : "",
      "ab-parcelas": k.ab ? String(k.ab.parcelasCartao || "") : "",
      "ab-parcela": k.parcela ? brl(k.parcela) : "",
      "taxas-total": brl(k.taxas),
      "total-ab": k.totalAb != null ? brl(k.totalAb) : "",
      "avulsa": avulsa ? brl(avulsa.preco) : "",
      "moto-automatica": motoAut ? brl(motoAut.preco) : ""
    };
    (P.pacotes || []).forEach(function (p) {
      if (typeof p.precoAvista === "number") out[p.id + "-avista"] = brl(p.precoAvista);
      if (typeof p.precoCartao === "number") out[p.id + "-cartao"] = brl(p.precoCartao);
    });
    Object.keys(base).forEach(function (key) { out[key] = base[key]; });
    return out;
  }

  var api = { brl: brl, calc: calc, render: render, valores: valores };
  root.ArianePlanos = api;
  if (typeof module === "object" && module.exports) module.exports = api;

  /* no navegador: atualiza o que estiver na página */
  if (typeof document !== "undefined" && root.ARIANE) {
    var C = root.ARIANE;
    Array.prototype.forEach.call(document.querySelectorAll("[data-planos]"), function (el) {
      var novo = render(C, el.getAttribute("data-planos") || "");
      if (el.innerHTML !== novo) el.innerHTML = novo;
    });
    var v = valores(C);
    Array.prototype.forEach.call(document.querySelectorAll("[data-preco]"), function (el) {
      var t = v[el.getAttribute("data-preco")];
      if (t && el.textContent !== t) el.textContent = t;
    });
  }
})(typeof window !== "undefined" ? window : globalThis);
