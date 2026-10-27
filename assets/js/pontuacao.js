/* Simulador de pontuação da prova prática
   Regra usada (confirmar no Detran-SP): leve 1, média 2, grave 4, gravíssima 6.
   Aprovado com até 10 pontos; reprovado acima de 10. */
(function () {
  "use strict";
  var box = document.querySelector("[data-pontuacao]");
  if (!box) return;
  var LIMITE = 10;
  var PESOS = { leve: 1, media: 2, grave: 4, gravissima: 6 };
  var cont = { leve: 0, media: 0, grave: 0, gravissima: 0 };
  var totalEl = box.querySelector("[data-total]");
  var fill = box.querySelector(".barra__fill");
  var veredito = box.querySelector("[data-veredito]");
  var barra = box.querySelector(".barra");

  function render() {
    var total = 0;
    Object.keys(cont).forEach(function (k) {
      total += cont[k] * PESOS[k];
      var out = box.querySelector('[data-cont="' + k + '"]');
      if (out) out.textContent = cont[k];
    });
    totalEl.textContent = total;
    var pct = Math.min(100, (total / 16) * 100);
    fill.style.width = pct + "%";
    fill.style.backgroundColor = total > LIMITE ? "#D7262E" : (total > 6 ? "#FFC300" : "#6BB36B");
    barra.setAttribute("aria-valuenow", String(total));
    var reprova = total > LIMITE;
    veredito.classList.toggle("reprova", reprova);
    if (reprova) {
      veredito.innerHTML = "Acima de 10 pontos: <strong>reprovaria</strong>. Passou do limite por " + (total - LIMITE) + " ponto" + (total - LIMITE > 1 ? "s" : "") + ". É exatamente isso que as aulas treinam.";
    } else if (total === 0) {
      veredito.innerHTML = 'Nenhuma falta: prova perfeita.<span class="placa" aria-hidden="true"><span class="placa__faixa">BRASIL</span><span class="placa__corpo"><span class="placa__texto">APROVADO</span></span></span>';
    } else {
      veredito.innerHTML = "Até 10 pontos: <strong>aprovaria</strong>. Ainda sobram " + (LIMITE - total) + " ponto" + (LIMITE - total > 1 ? "s" : "") + " de margem.";
    }
  }

  box.addEventListener("click", function (e) {
    var b = e.target.closest("[data-falta]");
    if (b) {
      var k = b.getAttribute("data-falta"), d = parseInt(b.getAttribute("data-delta"), 10);
      cont[k] = Math.max(0, Math.min(9, cont[k] + d));
      render();
    }
    if (e.target.closest("[data-zerar]")) {
      Object.keys(cont).forEach(function (k) { cont[k] = 0; });
      render();
    }
  });
  render();
})();
