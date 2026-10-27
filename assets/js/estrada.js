/* A estrada: carro e moto avançam pelas etapas conforme a rolagem */
(function () {
  "use strict";
  var estrada = document.querySelector("[data-estrada]");
  if (!estrada) return;
  var pista = estrada.querySelector(".estrada__pista");
  var carro = estrada.querySelector(".veiculo--carro");
  var moto = estrada.querySelector(".veiculo--moto");
  var etapas = Array.prototype.slice.call(estrada.querySelectorAll(".etapa"));
  var reduz = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduz) { etapas.forEach(function (e) { e.classList.add("ativa"); }); return; }

  var agendado = false;
  function atualizar() {
    agendado = false;
    var r = pista.getBoundingClientRect();
    var vh = window.innerHeight;
    var ref = vh * 0.55;                        /* linha de leitura: 55% da tela */
    var altura = r.height;
    var progresso = Math.min(1, Math.max(0, (ref - r.top) / altura));
    var hCarro = carro.offsetHeight || 80;
    var y = progresso * (altura - hCarro);
    carro.style.transform = "translateY(" + y.toFixed(1) + "px)";
    var yMoto = Math.min(altura - moto.offsetHeight, y + 46);   /* a moto vai um pouco à frente */
    moto.style.transform = "translateY(" + Math.max(0, yMoto).toFixed(1) + "px)";
    pista.style.setProperty("--faixa-y", (progresso * 600).toFixed(0) + "px");
    etapas.forEach(function (e) {
      var er = e.getBoundingClientRect();
      e.classList.toggle("ativa", er.top < ref + 40);
    });
  }
  function pedir() { if (!agendado) { agendado = true; requestAnimationFrame(atualizar); } }
  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  atualizar();
})();
