/* Orçamento: monta a mensagem e abre o WhatsApp (nada é enviado a servidor).
   Os preços vêm de data/config.js > planos. */
(function () {
  "use strict";
  var C = window.ARIANE || {};
  var P = C.planos || {};
  var PL = window.ArianePlanos;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function whats(msg) { return window.ArianeWhats ? window.ArianeWhats(msg) : "https://wa.me/551156675745?text=" + encodeURIComponent(msg); }
  function rotulo(input) { return input ? (input.getAttribute("data-rotulo") || input.value) : ""; }
  function marcado(form, nome) { return $('input[name="' + nome + '"]:checked', form); }
  function marcados(form, nome) { return $$('input[name="' + nome + '"]:checked', form); }
  function brl(v) { return PL ? PL.brl(v) : "R$ " + v.toFixed(2).replace(".", ","); }

  function pacote(id) { return (P.pacotes || []).filter(function (p) { return p.id === id; })[0] || null; }
  var pacoteAB = pacote("ab");
  var avulsa = (P.avulsas || []).filter(function (a) { return a.id === "avulsa"; })[0] || null;
  var motoAut = (P.avulsas || []).filter(function (a) { return a.id === "moto-automatica"; })[0] || null;
  var taxas = (P.taxasAParte || []).reduce(function (s, t) { return s + (typeof t.valor === "number" ? t.valor : 0); }, 0);

  /* preço de uma aula avulsa pelo tipo: carro, moto ou moto-automatica */
  function precoAula(tipo) {
    if (tipo === "moto-automatica") return motoAut && typeof motoAut.preco === "number" ? motoAut.preco : null;
    return avulsa && typeof avulsa.preco === "number" ? avulsa.preco : null;
  }

  function planoDaUrl() {
    var m = /[?&](?:cat|plano)=(AB|avulsas|A|B)(?:&|$)/i.exec(location.search);
    if (!m) return null;
    var v = m[1].toUpperCase();
    return v === "AB" ? "ab" : v === "AVULSAS" ? "avulsas" : v;
  }

  /* ================= Versão curta (home) ================= */
  $$("[data-orc-rapido]").forEach(function (form) {
    var link = $("[data-orc-enviar]", form);
    var previa = $("[data-orc-previa]", form);
    var precoEl = $("[data-orc-rapido-preco]", form);
    function atualizar() {
      var plano = marcado(form, "r-plano"), etapa = marcado(form, "r-etapa");
      var linhas = ["Olá! Vim pelo site e quero um orçamento."];
      if (plano) linhas.push("Interesse: " + rotulo(plano));
      if (etapa) linhas.push("Etapa: " + rotulo(etapa));
      var m = linhas.join("\n");
      link.href = whats(m);
      if (previa) previa.textContent = m;
      if (precoEl) {
        var v = plano ? plano.value : "";
        var pk = pacote(v);
        if (pk && typeof pk.precoAvista === "number") {
          precoEl.innerHTML = "<span>" + pk.nome + "</span><strong>" + (pk.aPartirDe ? "a partir de " : "") + brl(pk.precoAvista) + "</strong>" +
            (pk.precoCartao ? "<small>ou " + brl(pk.precoCartao) + " em " + pk.parcelasCartao + "x no cartão. " : "<small>") + "Exames e taxas à parte: " + brl(taxas) + ".</small>";
        } else if (v === "avulsas" && avulsa) {
          precoEl.innerHTML = "<span>Aula avulsa de " + (avulsa.duracao || "50 min") + "</span><strong>" + brl(avulsa.preco) + " por aula</strong>" +
            (motoAut ? "<small>Moto automática: " + brl(motoAut.preco) + " por aula.</small>" : "");
        } else {
          precoEl.innerHTML = "<span>Valor</span><strong>Sob consulta</strong><small>A escola responde pelo WhatsApp com o valor do seu caso.</small>";
        }
      }
    }
    form.addEventListener("change", atualizar);
    form.addEventListener("submit", function (e) { e.preventDefault(); window.open(link.href, "_blank", "noopener"); });
    var p = planoDaUrl(); if (p) { var r = $('input[name="r-plano"][value="' + p + '"]', form); if (r) r.checked = true; }
    atualizar();
  });

  /* ================= Simulador completo ================= */
  var form = $("[data-orc-completo]");
  if (!form) return;

  var passos = $$(".passo", form);
  var barras = $$(".passos__item", form);
  var atual = 0;
  var erroEl = $("[data-orc-erro]", form);
  var linkFinal = $("[data-orc-enviar]", form);
  var previa = $("[data-orc-previa]", form);
  var estimEl = $("[data-orc-estimativa]", form);

  /* contadores (+/−) */
  $$("[data-contador]", form).forEach(function (box) {
    var input = $("input", box), out = $("output", box);
    var min = parseInt(input.min, 10) || 0, max = parseInt(input.max, 10) || 30;
    function set(v) { input.value = Math.max(min, Math.min(max, v)); out.textContent = input.value; form.dispatchEvent(new Event("change")); }
    $$("button", box).forEach(function (b) {
      b.addEventListener("click", function () { set((parseInt(input.value, 10) || 0) + parseInt(b.getAttribute("data-delta"), 10)); });
    });
  });
  function num(nome) { var i = $('input[name="' + nome + '"]', form); return i ? parseInt(i.value, 10) || 0 : 0; }

  function plano() { var p = marcado(form, "plano"); return p ? p.value : ""; }

  /* mostra só o bloco de aulas do plano escolhido */
  function blocos() {
    var p = plano();
    $$("[data-bloco]", form).forEach(function (b) {
      var lista = b.getAttribute("data-bloco").split(" ");
      b.hidden = lista.indexOf(p) === -1;
    });
    var extras = num("extras");
    var tipoExtra = $("[data-tipo-extra]", form);
    if (tipoExtra) tipoExtra.hidden = extras === 0;
  }

  function mostrarPasso(i) {
    atual = Math.max(0, Math.min(passos.length - 1, i));
    passos.forEach(function (p, k) { p.classList.toggle("ativo", k === atual); p.hidden = k !== atual; });
    barras.forEach(function (b, k) { b.classList.toggle("feito", k < atual); b.classList.toggle("atual", k === atual); });
    $$("[data-passo-num]", form).forEach(function (el) { el.textContent = (atual + 1) + " de " + passos.length; });
    $$("[data-voltar]", form).forEach(function (b) { b.hidden = atual === 0; });
    $$("[data-proximo]", form).forEach(function (b) { b.hidden = atual === passos.length - 1; });
    erroEl.textContent = "";
    blocos();
    var h = $("h2", passos[atual]);
    if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    var topo = form.getBoundingClientRect().top + window.scrollY - 90;
    if (window.scrollY > topo) window.scrollTo({ top: topo });
    atualizarResumo();
  }

  function validarPasso(i) {
    var p = passos[i];
    var req = p.getAttribute("data-obrigatorio");
    if (req === "nome") {
      var n = $("#nome", form).value.trim();
      if (n.length < 2) { erroEl.textContent = "Digite seu nome para a escola saber com quem está falando."; $("#nome", form).focus(); return false; }
      return true;
    }
    if (req && !marcado(form, req)) { erroEl.textContent = "Escolha uma opção para continuar."; var r = $('input[name="' + req + '"]', p); if (r) r.focus(); return false; }
    if (req === "aulas" || p.hasAttribute("data-passo-aulas")) {
      if (plano() === "avulsas" && !marcado(form, "tipo")) { erroEl.textContent = "Escolha o tipo de aula."; return false; }
      if (plano() === "ab" && num("extras") > 0 && !marcado(form, "tipo-extra")) { erroEl.textContent = "Escolha o tipo das aulas extras."; return false; }
    }
    return true;
  }

  function calcular() {
    var p = plano();
    var r = { linhas: [], total: null, cartao: null };
    var pk = pacote(p);
    if (pk && typeof pk.precoAvista === "number") {
      var cartao = (marcado(form, "pagamento") || {}).value === "cartao" && typeof pk.precoCartao === "number";
      var base = cartao ? pk.precoCartao : pk.precoAvista;
      r.linhas.push([pk.nome + (cartao ? " (" + pk.parcelasCartao + "x no cartão)" : " (à vista)"), base]);
      var extras = num("extras"), tipoE = marcado(form, "tipo-extra");
      if (extras > 0 && tipoE) {
        var pe = precoAula(tipoE.value);
        if (pe == null) return null;
        r.linhas.push([extras + " aula" + (extras > 1 ? "s" : "") + " extra" + (extras > 1 ? "s" : "") + " (" + rotulo(tipoE) + ")", extras * pe]);
      }
      r.total = r.linhas.reduce(function (s, l) { return s + l[1]; }, 0);
      if (cartao) { r.cartao = pk.parcelasCartao; r.parcela = pk.precoCartao / pk.parcelasCartao; }
      r.taxas = true;
      return r;
    }
    if (p === "avulsas") {
      var t = marcado(form, "tipo"), q = num("qtd");
      if (!t) return { pendente: true };
      var pa = precoAula(t.value);
      if (pa == null) return null;
      r.linhas.push([q + " aula" + (q > 1 ? "s" : "") + " avulsa" + (q > 1 ? "s" : "") + " (" + rotulo(t) + ")", q * pa]);
      r.total = q * pa;
      return r;
    }
    return null;
  }

  function dados() {
    var p = marcado(form, "plano"), sit = marcado(form, "situacao");
    return {
      nome: $("#nome", form).value.trim().replace(/\s+/g, " ").slice(0, 40),
      plano: p ? p.value : "",
      planoRotulo: rotulo(p),
      situacao: rotulo(sit),
      pagamento: rotulo(marcado(form, "pagamento")),
      extras: num("extras"),
      tipoExtra: rotulo(marcado(form, "tipo-extra")),
      qtd: num("qtd"),
      tipo: rotulo(marcado(form, "tipo")),
      qtdCat: num("qtd-cat"),
      periodos: marcados(form, "periodo").map(rotulo)
    };
  }

  function mensagem(d, est) {
    var l = ["Olá! Vim pelo site e quero um orçamento."];
    if (d.nome) l.push("Nome: " + d.nome);
    if (d.planoRotulo) l.push("Interesse: " + d.planoRotulo);
    if (d.situacao) l.push("Situação: " + d.situacao);
    if (pacote(d.plano)) {
      if (d.pagamento) l.push("Pagamento: " + d.pagamento);
      if (d.extras > 0) l.push("Aulas extras: " + d.extras + (d.tipoExtra ? " de " + d.tipoExtra : ""));
    } else if (d.plano === "avulsas") {
      l.push("Aulas avulsas: " + d.qtd + (d.tipo ? " de " + d.tipo : ""));
    } else if (d.plano) {
      l.push("Quantas aulas acho que preciso: cerca de " + d.qtdCat);
    }
    if (d.periodos.length) l.push("Melhor período: " + d.periodos.join(", "));
    if (est && est.total != null) l.push("Estimativa que vi no site: " + brl(est.total));
    return l.join("\n");
  }

  function atualizarResumo() {
    blocos();
    var d = dados();
    var est = calcular();
    if (estimEl) {
      if (est && est.total != null) {
        var html = "<span>Valor estimado</span>";
        if (est.linhas.length > 1) html += "<ul class=\"estimativa__linhas\">" + est.linhas.map(function (l) { return "<li><span>" + l[0] + "</span><span>" + brl(l[1]) + "</span></li>"; }).join("") + "</ul>";
        else html += "<small>" + est.linhas[0][0] + "</small>";
        html += "<strong>" + brl(est.total) + "</strong>";
        if (est.cartao) html += "<small>" + brl(est.parcela) + " por mês no pacote" + (est.linhas.length > 1 ? "; as aulas extras são combinadas à parte" : "") + ".</small>";
        if (est.taxas) html += "<small>Exames e taxas pagos à parte: " + brl(taxas) + " (médico, psicotécnico, toxicológico, exame teórico e emissão da CNH).</small>";
        html += "<small>Valor estimado, confirme no WhatsApp.</small>";
        estimEl.innerHTML = html;
      } else if (est && est.pendente) {
        estimEl.innerHTML = "<span>Valor</span><strong>Escolha o tipo de aula</strong>";
      } else {
        estimEl.innerHTML = "<span>Valor</span><strong>Sob consulta</strong><small>A escola responde pelo WhatsApp com o valor do seu caso.</small>";
      }
    }
    var m = mensagem(d, est);
    if (previa) previa.textContent = m;
    if (linkFinal) linkFinal.href = whats(m);
  }

  $$("[data-proximo]", form).forEach(function (b) { b.addEventListener("click", function () { if (validarPasso(atual)) mostrarPasso(atual + 1); }); });
  $$("[data-voltar]", form).forEach(function (b) { b.addEventListener("click", function () { mostrarPasso(atual - 1); }); });
  form.addEventListener("input", atualizarResumo);
  form.addEventListener("change", atualizarResumo);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (atual < passos.length - 1) { if (validarPasso(atual)) mostrarPasso(atual + 1); return; }
    window.open(linkFinal.href, "_blank", "noopener");
  });
  $("#nome", form).addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); if (validarPasso(atual)) mostrarPasso(atual + 1); } });

  var pu = planoDaUrl();
  if (pu) { var r = $('input[name="plano"][value="' + pu + '"]', form); if (r) r.checked = true; }

  /* estado inicial, sem roubar o foco */
  passos.forEach(function (p, k) { p.hidden = k !== 0; p.classList.toggle("ativo", k === 0); });
  barras.forEach(function (b, k) { b.classList.toggle("atual", k === 0); });
  $$("[data-voltar]", form).forEach(function (b) { b.hidden = true; });
  atualizarResumo();
})();
