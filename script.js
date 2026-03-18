const BIN_ID = "69ba8242aa77b81da9f61d90";
const API_KEY = "$2a$10$4i14QEY44PwUIvj7C/oI6uAGx6IQpWoihAcpGKxP8IVWqgON0xVEy";
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

let data = { decks: {} };
let history = JSON.parse(localStorage.getItem("rouletteHistory") || "[]");

// Charger les données depuis JSONBin
async function loadData() {
  const res = await fetch(BASE_URL + "/latest", {
    headers: { "X-Master-Key": API_KEY }
  });
  const json = await res.json();
  data = json.record;
  populateDecks();
}

// Remplir le sélecteur de decks
function populateDecks() {
  const sel = document.getElementById("deckSelect");
  sel.innerHTML = "";
  Object.keys(data.decks).forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    sel.appendChild(opt);
  });
}

// Lancer la roulette
document.getElementById("spinBtn").addEventListener("click", () => {
  const deckName = document.getElementById("deckSelect").value;
  const deck = data.decks[deckName];
  if (!deck || deck.length === 0) return;

  const item = deck[Math.floor(Math.random() * deck.length)];

  const resultDiv = document.getElementById("result");
  resultDiv.classList.add("hidden");

  setTimeout(() => {
    document.getElementById("resultCode").textContent = item.code;
    document.getElementById("resultText").textContent = item.text;
    resultDiv.classList.remove("hidden");

    history.unshift({ code: item.code, text: item.text });
    if (history.length > 20) history.pop();
    localStorage.setItem("rouletteHistory", JSON.stringify(history));
    renderHistory();
  }, 100);
});

// Historique
function renderHistory() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";
  history.forEach(e => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="tag">${e.code}</span><span>${e.text}</span>`;
    list.appendChild(li);
  });
}

function clearHistory() {
  history = [];
  localStorage.removeItem("rouletteHistory");
  renderHistory();
}

// Ajouter une règle
async function addRule() {
  const deck = document.getElementById("newDeck").value.trim();
  const code = document.getElementById("newCode").value.trim();
  const text = document.getElementById("newText").value.trim();
  const msg = document.getElementById("adminMsg");

  if (!deck || !code || !text) {
    msg.textContent = "⚠️ Remplis tous les champs !";
    msg.style.color = "#f87171";
    return;
  }

  if (!data.decks[deck]) data.decks[deck] = [];
  data.decks[deck].push({ code, text });

  await fetch(BASE_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY
    },
    body: JSON.stringify(data)
  });

  msg.textContent = `✅ Règle ${code} ajoutée dans "${deck}" !`;
  msg.style.color = "#34d399";
  populateDecks();

  document.getElementById("newDeck").value = "";
  document.getElementById("newCode").value = "";
  document.getElementById("newText").value = "";
}

// Init
loadData();
renderHistory();
renderHistory();

// =============================================
// LANCER LA ROULETTE
// =============================================
function spin() {
  const selectedDeck = decks[deckSelect.value];
  const item = selectedDeck[Math.floor(Math.random() * selectedDeck.length)];

  const resultDiv = document.getElementById('result');
  resultDiv.classList.add('hidden');

  setTimeout(() => {
    document.getElementById('resultCode').textContent = item.code;
    document.getElementById('resultDesc').textContent = item.desc;
    resultDiv.classList.remove('hidden');

    // Ajouter à l'historique
    history.unshift({ code: item.code, desc: item.desc, deck: deckSelect.value });
    if (history.length > 20) history.pop();
    localStorage.setItem('rouletteHistory', JSON.stringify(history));
    renderHistory();
  }, 100);
}

// =============================================
// HISTORIQUE
// =============================================
function renderHistory() {
  const list = document.getElementById('historyList');
  list.innerHTML = '';
  history.forEach(entry => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="code-tag">${entry.code}</span> <span>${entry.desc}</span>`;
    list.appendChild(li);
  });
}

function clearHistory() {
  history = [];
  localStorage.removeItem('rouletteHistory');
  renderHistory();
}
