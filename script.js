// =============================================
// BASE DE DONNÉES DES DECKS
// Ajoute autant de decks et d'entrées que tu veux !
// Chaque entrée : { code: "A1", desc: "Description de l'action" }
// =============================================
const decks = {
  "Deck 1 — Exemple": [
    { code: "A1", desc: "Action A1 — à personnaliser" },
    { code: "A2", desc: "Action A2 — à personnaliser" },
    { code: "A3", desc: "Action A3 — à personnaliser" },
    { code: "B1", desc: "Action B1 — à personnaliser" },
    { code: "B2", desc: "Action B2 — à personnaliser" },
    { code: "C1", desc: "Action C1 — à personnaliser" },
  ],
  "Deck 2 — Exemple": [
    { code: "X1", desc: "Règle X1 — à personnaliser" },
    { code: "X2", desc: "Règle X2 — à personnaliser" },
    { code: "Y1", desc: "Règle Y1 — à personnaliser" },
  ]
  // Ajoute d'autres decks ici...
};

// =============================================
// INITIALISATION
// =============================================
const deckSelect = document.getElementById('deckSelect');
let history = JSON.parse(localStorage.getItem('rouletteHistory') || '[]');

// Remplir le sélecteur de deck
Object.keys(decks).forEach(name => {
  const opt = document.createElement('option');
  opt.value = name;
  opt.textContent = name;
  deckSelect.appendChild(opt);
});

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
