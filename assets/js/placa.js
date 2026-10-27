/* "Personalize sua placa": gera a imagem 1080×1350 em canvas puro */
(function () {
  "use strict";
  var form = document.querySelector("[data-gerador]");
  if (!form) return;

  var canvas = form.querySelector("canvas") || document.querySelector("[data-gerador-canvas]");
  var ctx = canvas.getContext("2d");
  var input = form.querySelector("#nome-placa");
  var erro = form.querySelector("[data-gerador-erro]");
  var btnBaixar = form.querySelector("[data-baixar]");
  var btnCompartilhar = form.querySelector("[data-compartilhar]");
  var btnWhats = form.querySelector("[data-gerador-whats]");
  var W = 1080, H = 1350;
  var MAX = 14;

  var COR = { azul: "#0A3C8C", vermelho: "#D7262E", amarelo: "#FFC300", asfalto: "#1C1F24", asfalto2: "#272B32", branco: "#FFFFFF" };
  var FONTE = '"Barlow Condensed", "Arial Narrow", Arial, sans-serif';

  /* ---------- filtro simples de palavrões ---------- */
  var PROIBIDAS_TRECHO = ["caralh", "porra", "merda", "buceta", "boceta", "foder", "fuder", "fodid", "arromb", "cacete", "piroca", "punhet", "xoxot", "xerec", "vagabund", "otari", "babaca", "bosta", "cuzao", "viado", "puta", "puto", "hitler", "nazis", "corno", "vadia"];
  var PROIBIDAS_EXATAS = ["cu", "foda", "pau", "pica", "fdp", "pqp", "vsf", "tnc", "krl", "prr", "vtnc", "bct", "rola", "kct", "bunda"];
  /* nomes reais que contêm trechos acima */
  var LIBERADOS = ["corneli"];
  function colapsar(p) { return p.replace(/(.)\1+/g, "$1"); }
  PROIBIDAS_TRECHO = PROIBIDAS_TRECHO.map(colapsar);
  PROIBIDAS_EXATAS = PROIBIDAS_EXATAS.map(colapsar);

  function normalizar(s) {
    return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[@4]/g, "a").replace(/3/g, "e").replace(/[1!]/g, "i").replace(/0/g, "o").replace(/\$|5/g, "s")
      .replace(/(.)\1+/g, "$1");
  }
  function proibido(nome) {
    var n = normalizar(nome);
    var junto = n.replace(/[^a-z]/g, "");
    var palavras = n.split(/[^a-z]+/).filter(Boolean);
    if (palavras.some(function (p) { return PROIBIDAS_EXATAS.indexOf(p) > -1; })) return true;
    if (LIBERADOS.some(function (l) { return junto.indexOf(l) > -1; })) return false;
    return PROIBIDAS_TRECHO.some(function (p) { return junto.indexOf(p) > -1; });
  }

  function limpar(v) {
    return (v || "").replace(/[^A-Za-zÀ-ÖØ-öø-ÿ' \-]/g, "").replace(/\s{2,}/g, " ").slice(0, MAX);
  }

  /* ---------- desenho ---------- */
  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function caber(texto, peso, tamMax, larguraMax, espac) {
    var t = tamMax;
    ctx.font = peso + " " + t + "px " + FONTE;
    while (larguraTexto(texto, espac * t) > larguraMax && t > 20) { t -= 4; ctx.font = peso + " " + t + "px " + FONTE; }
    return t;
  }
  function larguraTexto(txt, espaco) { return ctx.measureText(txt).width + espaco * Math.max(0, txt.length - 1); }
  function textoEspacado(txt, cx, y, espaco) {
    var total = larguraTexto(txt, espaco);
    var x = cx - total / 2;
    ctx.textAlign = "left";
    for (var i = 0; i < txt.length; i++) { ctx.fillText(txt[i], x, y); x += ctx.measureText(txt[i]).width + espaco; }
  }

  function bandeira(x, y, w, h) {
    ctx.fillStyle = "#1C9A4B"; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#FFD200";
    ctx.beginPath(); ctx.moveTo(x + w / 2, y + h * 0.1); ctx.lineTo(x + w * 0.92, y + h / 2); ctx.lineTo(x + w / 2, y + h * 0.9); ctx.lineTo(x + w * 0.08, y + h / 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#123E8C"; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, h * 0.24, 0, Math.PI * 2); ctx.fill();
  }

  function desenhar(semNome) {
    var nome = semNome ? "" : limpar(input.value).trim();
    var genero = (form.querySelector('input[name="genero"]:checked') || {}).value || "APROVADO";

    /* fundo asfalto */
    ctx.fillStyle = COR.asfalto; ctx.fillRect(0, 0, W, H);
    /* textura leve */
    ctx.globalAlpha = 0.05; ctx.fillStyle = "#fff";
    for (var i = 0; i < 420; i++) { var px = (i * 389) % W, py = (i * 571) % H; ctx.fillRect(px, py, 3, 3); }
    ctx.globalAlpha = 1;

    /* estrada no rodapé */
    var ey = 1000;
    ctx.fillStyle = "#2B3038"; ctx.fillRect(0, ey, W, 150);
    ctx.fillStyle = "#E9EAEC"; ctx.fillRect(0, ey, W, 8); ctx.fillRect(0, ey + 142, W, 8);
    ctx.fillStyle = COR.amarelo;
    for (var d = -20; d < W; d += 130) ctx.fillRect(d, ey + 69, 80, 12);

    /* topo: nome da escola */
    ctx.fillStyle = COR.amarelo; ctx.font = "700 40px " + FONTE; ctx.textBaseline = "alphabetic";
    textoEspacado("AUTO ESCOLA ARIANE", W / 2, 120, 9);
    ctx.fillStyle = "#C9CDD4"; ctx.font = "600 34px " + FONTE;
    textoEspacado("CATEGORIAS A E B · ZONA SUL DE SÃO PAULO", W / 2, 172, 3);

    /* placa */
    var pw = 940, ph = Math.round(pw * 130 / 400), pxp = (W - pw) / 2, pyp = 250;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20;
    ctx.fillStyle = COR.branco; rr(pxp - 12, pyp - 12, pw + 24, ph + 24, 46); ctx.fill();
    ctx.restore();
    ctx.fillStyle = COR.asfalto; rr(pxp, pyp, pw, ph, 36); ctx.fill();
    ctx.fillStyle = COR.branco; rr(pxp + 9, pyp + 9, pw - 18, ph - 18, 28); ctx.fill();
    /* faixa azul */
    ctx.save(); rr(pxp + 9, pyp + 9, pw - 18, ph - 18, 28); ctx.clip();
    var fh = Math.round(ph * 0.24);
    ctx.fillStyle = COR.azul; ctx.fillRect(pxp, pyp, pw, fh + 9);
    ctx.restore();
    ctx.fillStyle = COR.branco; ctx.font = "700 " + Math.round(fh * 0.72) + "px " + FONTE; ctx.textBaseline = "middle";
    textoEspacado("BRASIL", W / 2, pyp + 9 + fh / 2 + 2, 22);
    ctx.font = "700 " + Math.round(fh * 0.5) + "px " + FONTE; ctx.textAlign = "left";
    ctx.fillText("BR", pxp + 40, pyp + 9 + fh / 2 + 2);
    bandeira(pxp + pw - 40 - 64, pyp + 9 + fh * 0.2, 64, fh * 0.62);
    /* APROVADO */
    ctx.fillStyle = COR.vermelho; ctx.textBaseline = "middle";
    var corpoY = pyp + 9 + fh, corpoH = ph - 18 - fh;
    var tam = caber(genero, "800", Math.round(corpoH * 0.86), pw - 110, 0.04);
    textoEspacado(genero, W / 2, corpoY + corpoH / 2 + tam * 0.05, tam * 0.04);

    /* nome */
    ctx.textBaseline = "alphabetic";
    if (nome) {
      ctx.fillStyle = "#C9CDD4"; ctx.font = "600 44px " + FONTE;
      textoEspacado("ESSA PLACA TEM DONO:", W / 2, 720, 6);
      var nomeUp = nome.toLocaleUpperCase("pt-BR");
      var tn = caber(nomeUp, "800", 230, W - 140, 0.02);
      ctx.fillStyle = COR.branco;
      textoEspacado(nomeUp, W / 2, 720 + 30 + tn * 0.82, tn * 0.02);
    } else {
      ctx.fillStyle = "#8A909A"; ctx.font = "700 64px " + FONTE;
      textoEspacado("DIGITE SEU NOME", W / 2, 860, 6);
    }

    /* rodapé */
    ctx.fillStyle = COR.branco; ctx.font = "800 58px " + FONTE;
    textoEspacado("SUA PLACA DE APROVADO COMEÇA AQUI.", W / 2, 1238, 1);
    ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.font = "600 32px " + FONTE;
    textoEspacado("@AUTOESCOLAARIANE", W / 2, 1300, 4);
  }

  function nomeArquivo() {
    var n = limpar(input.value).trim().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z]+/g, "-").toLowerCase();
    return "placa-aprovado" + (n ? "-" + n : "") + ".png";
  }

  function validar() {
    var v = limpar(input.value);
    if (v !== input.value) input.value = v;
    if (v.trim() && proibido(v)) {
      erro.textContent = "Esse nome não pode ir na placa. Tente outro.";
      input.setAttribute("aria-invalid", "true");
      return false;
    }
    erro.textContent = "";
    input.removeAttribute("aria-invalid");
    return true;
  }

  function atualizar() {
    var ok = validar();
    desenhar(!ok);
    var nome = ok ? limpar(input.value).trim() : "";
    if (btnWhats && window.ArianeWhats) {
      btnWhats.href = window.ArianeWhats("Olá! Fiz minha placa de APROVADO no site" + (nome ? " (" + nome + ")" : "") + " e quero começar a minha CNH. Pode me passar um orçamento?");
    }
    btnBaixar.disabled = !ok || !nome;
    if (btnCompartilhar) btnCompartilhar.disabled = !ok || !nome;
  }

  function comBlob(fn) { canvas.toBlob(function (b) { if (b) fn(b); }, "image/png"); }

  btnBaixar.addEventListener("click", function () {
    if (!validar()) return;
    desenhar();
    comBlob(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = nomeArquivo();
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    });
  });

  if (btnCompartilhar) {
    var podeCompartilhar = false;
    try { podeCompartilhar = !!(navigator.canShare && navigator.canShare({ files: [new File([""], "t.png", { type: "image/png" })] })); } catch (e) { podeCompartilhar = false; }
    if (!podeCompartilhar) btnCompartilhar.hidden = true;
    btnCompartilhar.addEventListener("click", function () {
      if (!validar()) return;
      desenhar();
      comBlob(function (blob) {
        var file = new File([blob], nomeArquivo(), { type: "image/png" });
        navigator.share({ files: [file], title: "Minha placa de APROVADO", text: "Sua placa de APROVADO começa aqui. @autoescolaariane" }).catch(function () {});
      });
    });
  }

  form.addEventListener("submit", function (e) { e.preventDefault(); });
  input.addEventListener("input", atualizar);
  Array.prototype.forEach.call(form.querySelectorAll('input[name="genero"]'), function (r) { r.addEventListener("change", atualizar); });

  function iniciar() { atualizar(); }
  if (document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load('800 100px "Barlow Condensed"'), document.fonts.load('700 100px "Barlow Condensed"'), document.fonts.load('600 100px "Barlow Condensed"')])
      .then(iniciar, iniciar);
  } else iniciar();
  desenhar();
  document.addEventListener("ariane:pronto", atualizar);
})();
