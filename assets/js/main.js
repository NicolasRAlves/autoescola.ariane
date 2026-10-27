/* Auto Escola Ariane — script comum a todas as páginas */
(function () {
  "use strict";

  var C = window.ARIANE || {};
  var APROVADOS = window.ARIANE_APROVADOS || [];
  var doc = document;
  var root = doc.documentElement;
  var base = (doc.body && doc.body.getAttribute("data-base")) || "./";
  var reduzMovimento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  root.classList.add("js");

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- WhatsApp ---------- */
  function linkWhats(msg) {
    var num = (C.whatsapp && C.whatsapp.numero) || "551156675745";
    var texto = msg || (C.whatsapp && C.whatsapp.mensagemPadrao) || "Olá! Vim pelo site e quero um orçamento.";
    return "https://wa.me/" + num + "?text=" + encodeURIComponent(texto);
  }
  window.ArianeWhats = linkWhats;

  function prepararWhats() {
    $$("[data-wa]").forEach(function (a) {
      var msg = a.getAttribute("data-wa") || "";
      a.href = linkWhats(msg || null);
      a.target = "_blank";
      a.rel = "noopener";
    });
  }

  /* ---------- Dados de contato vindos do config ---------- */
  function preencherContatos() {
    var tels = C.telefones || [];
    $$("[data-tel]").forEach(function (a) {
      var t = tels[parseInt(a.getAttribute("data-tel"), 10) || 0];
      if (!t) { a.remove(); return; }
      a.href = "tel:" + t.numero;
      if (a.hasAttribute("data-tel-fixo")) return;
      var alvo = $("[data-tel-texto]", a) || a;
      alvo.textContent = t.rotulo;
    });
    $$("[data-whats-rotulo]").forEach(function (el) { if (C.whatsapp) el.textContent = C.whatsapp.rotulo; });

    var e = C.endereco || {};
    var linha2 = [e.bairro, e.cidade + " - " + e.uf].filter(Boolean).join(", ");
    $$("[data-endereco]").forEach(function (el) {
      el.innerHTML = esc(e.rua) + "<br>" + esc(linha2) + (e.cep ? " · CEP " + esc(e.cep) : "") +
        ((!e.bairro || !e.cep) ? ' <span class="pendente" data-pendente>[CLIENTE INFORMAR bairro e CEP]</span>' : "");
    });
    var busca = encodeURIComponent(e.busca || (e.rua + ", " + e.cidade));
    $$("[data-maps]").forEach(function (a) { a.href = "https://www.google.com/maps/search/?api=1&query=" + busca; a.target = "_blank"; a.rel = "noopener"; });
    $$("[data-waze]").forEach(function (a) { a.href = "https://waze.com/ul?q=" + busca + "&navigate=yes"; a.target = "_blank"; a.rel = "noopener"; });

    $$("[data-instagram]").forEach(function (a) {
      if (!C.instagram) return;
      a.href = C.instagram.url; a.target = "_blank"; a.rel = "noopener";
      var t = $("[data-instagram-texto]", a); if (t) t.textContent = "@" + C.instagram.usuario;
    });

    $$("[data-horarios]").forEach(function (el) {
      var h = C.horarios || [];
      if (h.length) {
        el.innerHTML = h.map(function (x) { return esc(x.dias) + ": " + esc(x.horas); }).join("<br>");
      } else {
        el.innerHTML = 'Consulte pelo WhatsApp. <span class="pendente" data-pendente>[CLIENTE INFORMAR horário]</span>';
      }
    });

    $$("[data-email]").forEach(function (el) {
      if (C.email) { el.innerHTML = '<a href="mailto:' + esc(C.email) + '">' + esc(C.email) + "</a>"; }
      else { var li = el.closest("[data-email-bloco]"); if (li) li.setAttribute("data-pendente", ""); el.innerHTML = '<span class="pendente">[CLIENTE INFORMAR e-mail]</span>'; }
    });
    $$("[data-pagamento]").forEach(function (el) {
      if (C.formasPagamento) el.textContent = C.formasPagamento;
      else { el.innerHTML = '<span class="pendente">[CLIENTE INFORMAR formas de pagamento]</span>'; var b = el.closest("[data-pagamento-bloco]"); if (b) b.setAttribute("data-pendente", ""); }
    });
    $$("[data-cnpj]").forEach(function (el) {
      var partes = [];
      if (C.cnpj) partes.push("CNPJ " + esc(C.cnpj));
      if (C.credenciamentoDetran) partes.push("Credenciamento Detran-SP nº " + esc(C.credenciamentoDetran));
      el.innerHTML = partes.length ? partes.join(" · ") : '<span class="pendente" data-pendente>[CLIENTE INFORMAR CNPJ e nº de credenciamento Detran-SP]</span>';
    });
    $$("[data-ano]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
    $$("[data-regras-data]").forEach(function (el) { el.textContent = C.regrasAtualizadasEm || ""; });

    $$("[data-frase-posts]").forEach(function (el) {
      el.textContent = C.frasePosts || "";
      if (!C.fraseConfirmada) {
        el.setAttribute("data-pendente", "");
        el.insertAdjacentHTML("beforeend", ' <span class="pendente">[CONFIRMAR frase com o cliente]</span>');
      }
    });
  }

  /* ---------- Serviços opcionais (true / false / null) ---------- */
  function aplicarServicos() {
    var s = C.servicos || {};
    $$("[data-servico]").forEach(function (el) {
      var v = s[el.getAttribute("data-servico")];
      if (v === true) return;
      if (v === false) { el.remove(); return; }
      el.setAttribute("data-pendente", "");
      var alvo = el.matches(".opcao") ? (el.querySelector("input + span") || el) : el;
      if (!el.hasAttribute("data-sem-marca")) alvo.insertAdjacentHTML("beforeend", ' <span class="pendente">[confirmar]</span>');
    });
  }

  /* ---------- Modo rascunho ---------- */
  function modoRascunho() {
    if (C.modoRascunho) doc.body.classList.add("rascunho");
  }

  /* ---------- Topo, menu ---------- */
  function topo() {
    var t = $(".topo");
    if (t) {
      var onScroll = function () { t.classList.toggle("rolou", window.scrollY > 8); };
      onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    }
    var btn = $(".menu-btn"), menu = $("#menu-mobile");
    if (!btn || !menu) return;
    function fechar(foco) {
      btn.setAttribute("aria-expanded", "false"); btn.querySelector(".menu-btn__rotulo").textContent = "Menu";
      menu.classList.remove("aberto"); menu.hidden = true; doc.body.classList.remove("menu-aberto");
      if (foco) btn.focus();
    }
    function abrir() {
      btn.setAttribute("aria-expanded", "true"); btn.querySelector(".menu-btn__rotulo").textContent = "Fechar";
      menu.hidden = false; menu.classList.add("aberto"); doc.body.classList.add("menu-aberto");
      var primeiro = $("a", menu); if (primeiro) primeiro.focus();
    }
    btn.addEventListener("click", function () { btn.getAttribute("aria-expanded") === "true" ? fechar(false) : abrir(); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.classList.contains("aberto")) fechar(true); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { fechar(false); }); });
    window.addEventListener("resize", function () { if (window.innerWidth >= 980 && menu.classList.contains("aberto")) fechar(false); });
  }

  /* ---------- Revelar no scroll ---------- */
  function revelar() {
    var els = $$(".revelar");
    if (!("IntersectionObserver" in window) || reduzMovimento) { els.forEach(function (el) { el.classList.add("visivel"); }); return; }
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("visivel"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Placa do hero: letras estampadas ---------- */
  function estampar() {
    $$("[data-estampa]").forEach(function (placa) {
      var alvo = $(".placa__texto", placa);
      var palavra = placa.getAttribute("data-estampa");
      if (!alvo || !palavra) return;
      alvo.setAttribute("aria-hidden", "true");
      alvo.innerHTML = palavra.split("").map(function (l, i) {
        return '<span class="letra" style="animation-delay:' + (0.35 + i * 0.09).toFixed(2) + 's">' + esc(l) + "</span>";
      }).join("");
      placa.classList.add("placa--estampa");
      if (!reduzMovimento) {
        setTimeout(function () { placa.classList.add("batida"); }, 350 + palavra.length * 90 + 380);
      }
    });
  }

  /* ---------- Fotos ---------- */
  var ICONE_FOTO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-8 8"/></svg>';
  function placeholder(texto, claro) {
    return '<div class="ph' + (claro ? " ph--claro" : "") + '" role="img" aria-label="Espaço reservado: ' + esc(texto) + '"><div>' + ICONE_FOTO + "<span>[FOTO: " + esc(texto) + "]</span></div></div>";
  }
  window.ArianePlaceholder = placeholder;

  function pictureAprovado(f, tamanho, eager) {
    var dir = base + "assets/img/aprovados/";
    var w = 600, h = Math.round(600 * (f.h / f.w)) || 750;
    var src = tamanho === "g" ? f.id + "-1080" : f.id + "-600";
    if (tamanho === "g") { w = f.w; h = f.h; }
    return '<picture><source srcset="' + dir + src + '.webp" type="image/webp">' +
      '<img src="' + dir + src + '.jpg" width="' + w + '" height="' + h + '" alt="' + esc(f.alt || altPadrao(f)) + '"' +
      (eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async"></picture>';
  }
  function altPadrao(f) {
    return f.categoria === "A"
      ? "Aluno aprovado na categoria A (moto) segurando a placa APROVADO em frente ao local de exame"
      : "Aluno aprovado na categoria B (carro) segurando a placa APROVADO em frente ao local de exame";
  }

  function fotoPlaca(f, i, tag) {
    var cat = f ? f.categoria : "";
    var inner = '<span class="foto-placa__faixa" aria-hidden="true">BRASIL</span>' +
      '<span class="foto-placa__img">' + (f ? pictureAprovado(f, "p") : placeholder("aluno aprovado com a placa")) + "</span>" +
      '<span class="foto-placa__rotulo">' + (f && f.texto ? esc(f.texto) : "APROVADO") +
      (cat ? ' <span class="foto-placa__cat">CAT ' + cat + "</span>" : "") + "</span>";
    if (tag === "button") {
      return '<button type="button" class="foto-placa" data-idx="' + i + '">' + inner + '<span class="sr-only"> (ampliar foto ' + (i + 1) + ")</span></button>";
    }
    return '<figure class="foto-placa">' + inner + "</figure>";
  }

  /* lista de fotos (ou placeholders) com filtro de categoria */
  function listaFotos(cat, limite) {
    var lista = APROVADOS.filter(function (f) { return !cat || cat === "todos" || f.categoria === cat; });
    if (!APROVADOS.length) {
      var n = limite || 12;
      lista = [];
      for (var i = 0; i < n; i++) lista.push(null);
      return lista;
    }
    return limite ? lista.slice(0, limite) : lista;
  }

  /* Mosaico do hero */
  function mosaico() {
    $$("[data-mosaico]").forEach(function (el) {
      var cols = window.innerWidth >= 760 ? 5 : 3;
      var fotos = APROVADOS.slice(0, 15);
      var html = "";
      for (var c = 0; c < cols; c++) {
        var itens = "";
        for (var k = 0; k < 4; k++) {
          var f = fotos.length ? fotos[(c * 4 + k) % fotos.length] : null;
          itens += '<div class="mosaico__item">' + (f ? pictureAprovado(f, "p") : placeholder("aprovado")) + "</div>";
        }
        html += '<div class="mosaico__coluna">' + itens + itens + "</div>"; /* duplicado para loop contínuo */
      }
      el.innerHTML = html;
      $$("img", el).forEach(function (img) { img.alt = ""; });
      $$(".ph", el).forEach(function (ph) { ph.removeAttribute("role"); ph.removeAttribute("aria-label"); });
    });
  }

  /* Pilha de fotos no hero */
  function pilha() {
    $$("[data-pilha]").forEach(function (el) {
      var fotos = listaFotos(null, 3);
      el.innerHTML = fotos.map(function (f, i) { return fotoPlaca(f, i); }).join("");
    });
  }

  /* Mural: trilho (carrossel) ou grade com lightbox */
  var muralAtual = [];
  function mural() {
    $$("[data-mural]").forEach(function (el) {
      var tipo = el.getAttribute("data-mural");
      var cat = el.getAttribute("data-cat") || "todos";
      var limite = parseInt(el.getAttribute("data-limite"), 10) || 0;
      var fotos = listaFotos(cat, limite);
      if (tipo === "grade") {
        muralAtual = fotos;
        el.innerHTML = fotos.map(function (f, i) { return fotoPlaca(f, i, "button"); }).join("");
        if (APROVADOS.length && !fotos.length) el.innerHTML = '<p class="nota">Ainda não há fotos desta categoria.</p>';
      } else {
        el.innerHTML = fotos.map(function (f, i) { return fotoPlaca(f, i); }).join("");
      }
    });
    $$("[data-mural-vazio]").forEach(function (el) { if (APROVADOS.length) el.remove(); });
  }

  function filtros() {
    var grupo = $("[data-filtros]");
    if (!grupo) return;
    var alvo = $('[data-mural="grade"]');
    $$(".filtro", grupo).forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".filtro", grupo).forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        alvo.setAttribute("data-cat", b.getAttribute("data-filtro"));
        mural();
        var info = $("[data-filtro-info]");
        if (info) info.textContent = muralAtual.length + (muralAtual.length === 1 ? " foto" : " fotos");
      });
    });
  }

  function trilhos() {
    $$("[data-trilho-ctrl]").forEach(function (ctrl) {
      var trilho = doc.getElementById(ctrl.getAttribute("data-trilho-ctrl"));
      if (!trilho) return;
      $$("button", ctrl).forEach(function (b) {
        b.addEventListener("click", function () {
          var dir = b.getAttribute("data-dir") === "prev" ? -1 : 1;
          var item = trilho.firstElementChild;
          var passo = item ? item.getBoundingClientRect().width + 18 : 260;
          trilho.scrollBy({ left: dir * passo * (window.innerWidth > 760 ? 2 : 1), behavior: reduzMovimento ? "auto" : "smooth" });
        });
      });
    });
  }

  /* ---------- Lightbox ---------- */
  function lightbox() {
    var grade = $('[data-mural="grade"]');
    var dlg = $("#lightbox");
    if (!grade || !dlg || typeof dlg.showModal !== "function") return;
    var palco = $(".lightbox__palco", dlg), cont = $(".lightbox__contagem", dlg);
    var idx = 0, ultimoFoco = null;

    function mostrar(i) {
      var n = muralAtual.length; if (!n) return;
      idx = (i + n) % n;
      var f = muralAtual[idx];
      palco.innerHTML = f
        ? '<figure class="foto-placa"><span class="foto-placa__faixa" aria-hidden="true">BRASIL</span><span class="foto-placa__img">' + pictureAprovado(f, "g", true) + '</span><figcaption class="foto-placa__rotulo">APROVADO <span class="foto-placa__cat">CAT ' + f.categoria + "</span></figcaption></figure>"
        : placeholder("aluno aprovado com a placa");
      cont.textContent = (idx + 1) + " / " + n;
    }
    grade.addEventListener("click", function (e) {
      var b = e.target.closest("[data-idx]"); if (!b) return;
      ultimoFoco = b; mostrar(parseInt(b.getAttribute("data-idx"), 10)); dlg.showModal();
      $(".lightbox__fechar", dlg).focus();
    });
    $("[data-lb='prev']", dlg).addEventListener("click", function () { mostrar(idx - 1); });
    $("[data-lb='next']", dlg).addEventListener("click", function () { mostrar(idx + 1); });
    $(".lightbox__fechar", dlg).addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("close", function () { if (ultimoFoco) ultimoFoco.focus(); });
    dlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); mostrar(idx - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); mostrar(idx + 1); }
    });
    dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target === palco) dlg.close(); });
    var x0 = null;
    palco.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
    palco.addEventListener("pointerup", function (e) {
      if (x0 === null) return; var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) mostrar(idx + (dx < 0 ? 1 : -1));
    });
  }

  /* ---------- Fotos avulsas (fachada, frota...) ---------- */
  function fotosAvulsas() {
    var fotos = C.fotos || {};
    $$("[data-foto]").forEach(function (el) {
      var chave = el.getAttribute("data-foto");
      var nome = fotos[chave];
      var desc = el.getAttribute("data-foto-desc") || chave;
      if (!nome) { el.innerHTML = placeholder(desc, el.hasAttribute("data-claro")); return; }
      var dir = base + "assets/img/fotos/";
      el.innerHTML = '<picture><source type="image/webp" srcset="' + dir + nome + '-800.webp 800w, ' + dir + nome + '-1600.webp 1600w" sizes="(min-width: 900px) 50vw, 100vw">' +
        '<img src="' + dir + nome + '-1600.jpg" width="1600" height="1200" loading="lazy" decoding="async" alt="' + esc(el.getAttribute("data-foto-alt") || desc) + '"></picture>';
    });
  }

  /* ---------- Vídeos ---------- */
  function videos() {
    $$("[data-videos]").forEach(function (el) {
      var cat = el.getAttribute("data-videos");
      var lista = (C.videos || []).filter(function (v) { return !cat || cat === "todos" || v.categoria === cat; });
      var bloco = el.closest("[data-videos-bloco]");
      if (!lista.length) { if (bloco) bloco.remove(); return; }
      if (bloco) bloco.hidden = false;
      el.innerHTML = lista.map(function (v) {
        return '<figure style="margin:0"><video controls muted playsinline preload="metadata" poster="' + base + "assets/video/" + esc(v.poster) + '" src="' + base + "assets/video/" + esc(v.arquivo) + '"></video>' +
          (v.titulo ? '<figcaption class="nota">' + esc(v.titulo) + "</figcaption>" : "") + "</figure>";
      }).join("");
    });
  }

  /* ---------- Mapa sob clique ---------- */
  function mapa() {
    $$("[data-mapa]").forEach(function (el) {
      var btn = $("button", el); if (!btn) return;
      btn.addEventListener("click", function () {
        var q = encodeURIComponent((C.endereco && C.endereco.busca) || "Av. Dona Belmira Marin, 5089, São Paulo");
        el.innerHTML = '<iframe title="Mapa: Auto Escola Ariane" src="https://www.google.com/maps?q=' + q + '&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>';
      });
    });
  }

  /* ---------- FAQ dependente da escola ---------- */
  function faqEscola() {
    $$("[data-faq-escola]").forEach(function (el) {
      var cat = el.getAttribute("data-faq-escola");
      var existentes = $$("summary", el).map(function (s) { return s.textContent.trim(); });
      var itens = (C.faqEscola || []).filter(function (q) {
        return (q.categoria === cat || cat === "todas") && existentes.indexOf(q.pergunta) === -1;
      });
      var html = itens.map(function (q) {
        var resp = (q.resposta || "").trim();
        return "<details" + (resp ? "" : " data-pendente") + "><summary>" + esc(q.pergunta) + "</summary>" +
          '<div class="faq__resp"><p>' + (resp ? esc(resp) : '<span class="pendente">[CLIENTE INFORMAR] Resposta não publicada até a escola responder.</span>') + "</p></div></details>";
      }).join("");
      el.insertAdjacentHTML("beforeend", html);
    });
  }

  /* ---------- Fluxo da estrada (ver estrada.js) ---------- */

  function iniciar() {
    modoRascunho();
    preencherContatos();
    aplicarServicos();
    prepararWhats();
    topo();
    estampar();
    mosaico();
    pilha();
    mural();
    filtros();
    trilhos();
    lightbox();
    fotosAvulsas();
    videos();
    mapa();
    faqEscola();
    revelar();
    doc.dispatchEvent(new CustomEvent("ariane:pronto"));
  }

  /* espera os outros scripts (planos.js, orcamento.js...) montarem a página */
  if (doc.readyState === "complete") iniciar();
  else doc.addEventListener("DOMContentLoaded", iniciar);
})();
