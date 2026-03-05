const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbxUlgMUwWkcw3nX-QQ3baNajnmU0Eq3hJekp_taYRQPYB6qPnxU6ILIq3-2lAZjOANM/exec";

document.getElementById("formGasto").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button");
  const status = document.getElementById("msgStatus");

  btn.disabled = true;
  status.innerText = "Enviando...";

  const corpo = {
    data: document.getElementById("inputData").value,
    descricao: document.getElementById("inputDesc").value,
    valor: parseFloat(document.getElementById("inputValor").value),
    responsavel: document.getElementById("inputResponsavel").value,
    fatura: document.getElementById("inputFatura").value,
  };

  try {
    await fetch(WEB_APP_URL, {
      method: "POST",
      mode: "no-cors", // Necessário para Google Apps Script
      body: JSON.stringify(corpo),
    });

    status.innerText = "✅ Gasto registrado!";
    e.target.reset();
  } catch (erro) {
    status.innerText = "❌ Erro ao salvar.";
  } finally {
    btn.disabled = false;
  }
});
