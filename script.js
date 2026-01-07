let dadosPlanilha = [];
let filtroResponsavel = "Julinho";

const SHEET_ID = "1EtcHOcCxZljeDSnMjd79cxA9SqIM27nTutXqNQfesc8";
const API_KEY = "AIzaSyDbxjFXJowb1Hv6k3aTJzcBWJLS4kSyuYY";
const ABA = "Sheet1"; // nome da aba única

async function carregarDados() {
  document.getElementById("status").innerText = "Sincronizando...";

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${ABA}?key=${API_KEY}`;
    const response = await fetch(url);
    const json = await response.json();
    console.log("JSON bruto:", json);
    console.log("Valores:", json.values);

    if (!json.values) {
      throw new Error("Planilha vazia ou não encontrada");
    }

    // Remove cabeçalho
    dadosPlanilha = json.values.slice(1);

    popularMeses(); // 👈 ISSO FALTAVA
    renderizar();

    document.getElementById("status").innerText =
      "Dados sincronizados com sucesso ✅";
  } catch (e) {
    document.getElementById("status").innerText = "Erro ao sincronizar ❌";
    console.error(e);
  }
}

function renderizar() {
  const lista = document.getElementById("lista");
  const mesSelecionado = document.getElementById("Fatura").value;

  lista.innerHTML = "";

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

  let total = 0;

  filtrados.forEach((linha) => {
    const [, , valor] = linha;
    total += parseValor(valor);
  });

  document.getElementById(
    "totalFatura"
  ).innerText = `Total da fatura: ${formatarValor(total)}`;

  if (!filtrados.length) {
    lista.innerHTML = "<p>Nenhum gasto encontrado.</p>";
    return;
  }

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

function setResponsavel(nome) {
  filtroResponsavel = nome;
  renderizar();
}

carregarDados();
setInterval(carregarDados, 60000);

function popularMeses() {
  const select = document.getElementById("Fatura");

  // Remove todas as opções, exceto a primeira ("Selecione o mês")
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
