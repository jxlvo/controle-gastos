let dadosPlanilha = [];
let filtroResponsavel = "Julinho";

const SHEET_ID = "1EtcHOcCxZljeDSnMjd79cxA9SqIM27nTutXqNQfesc8";
const API_KEY = "AIzaSyDbxjFXJowb1Hv6k3aTJzcBWJLS4kSyuYY";
const ABA = "Sheet1";

// =====================
// CARREGAR DADOS
// =====================
async function carregarDados() {
  document.getElementById("status").innerText = "Sincronizando...";

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${ABA}?key=${API_KEY}`;
    const response = await fetch(url);
    const json = await response.json();

    if (!json.values) {
      throw new Error("Planilha vazia ou não encontrada");
    }

    // Remove cabeçalho
    dadosPlanilha = json.values.slice(1);

    popularMeses();
    renderizar();

    document.getElementById("status").innerText =
      "Dados sincronizados com sucesso ✅";
  } catch (e) {
    document.getElementById("status").innerText = "Erro ao sincronizar ❌";
    console.error(e);
  }
}

// =====================
// RENDERIZAR
// =====================
function renderizar() {
  const lista = document.getElementById("lista");
  const mesSelecionado = document.getElementById("Fatura").value;
  const totalEl = document.getElementById("totalFatura");

  lista.innerHTML = "";
  totalEl.style.display = "none"; // 👈 escondido por padrão

  if (!mesSelecionado) {
    lista.innerHTML = "<p>Selecione um mês para visualizar os gastos.</p>";
    return;
  }

  const filtrados = dadosPlanilha.filter((linha) => {
    const [, , , responsavel, fatura] = linha;

    return (
      responsavel?.toLowerCase() === filtroResponsavel.toLowerCase() &&
      fatura?.toLowerCase() === mesSelecionado.toLowerCase()
    );
  });

  if (!filtrados.length) {
    lista.innerHTML = "<p>Nenhum gasto encontrado.</p>";
    return;
  }

  let total = 0;

  filtrados.forEach((linha) => {
    const [, , valor] = linha;
    total += parseValor(valor);
  });

  totalEl.innerText = `Total da fatura: ${formatarValor(total)}`;
  totalEl.style.display = "block"; // 👈 mostra apenas agora

  filtrados.forEach((linha) => {
    const [data, desc, valor] = linha;

    lista.innerHTML += `
      <div class="card">
        <small>${data || ""}</small><br>
        <strong>${desc || "Compra"}</strong>
        <span class="valor">${formatarValor(valor)}</span>
      </div>
    `;
  });
}

// =====================
// RESPONSÁVEL
// =====================
function setResponsavel(nome) {
  filtroResponsavel = nome;
  renderizar();
}

// =====================
// MESES
// =====================
function popularMeses() {
  const select = document.getElementById("Fatura");
  select.innerHTML = `<option value="">Selecione o mês</option>`;

  const meses = dadosPlanilha
    .map((linha) => linha[4]) // coluna Fatura
    .filter(Boolean);

  const ordemMeses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const mesesUnicos = [...new Set(meses)].sort(
    (a, b) => ordemMeses.indexOf(a) - ordemMeses.indexOf(b)
  );

  mesesUnicos.forEach((mes) => {
    const option = document.createElement("option");
    option.value = mes;
    option.textContent = mes;
    select.appendChild(option);
  });
}

// =====================
// VALOR
// =====================
function parseValor(valor) {
  if (!valor) return 0;

  if (typeof valor === "number") return valor;

  return (
    Number(
      valor
        .toString()
        .replace("R$", "")
        .replace(/\s/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
    ) || 0
  );
}

function formatarValor(valor) {
  return parseValor(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// =====================
// INICIALIZAÇÃO
// =====================
carregarDados();
setInterval(carregarDados, 60000);
