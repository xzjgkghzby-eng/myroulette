const BIN_URL = "https://api.jsonbin.io/v3/b/69ba93d4b7ec241ddc7c90ae/latest";
const MASTER_KEY = "$2a$10$4i14QEY44PwUIvj7C/oI6uAGx6IQpWoihAcpGKxP8IVWqgON0xVEy";

let templates = [];
let currentTemplate = null;
let currentResults = {};
let rerollCount = 0;
let history = JSON.parse(localStorage.getItem("rouletteHistory")) || [];

async function loadTemplates() {
    try {
        const res = await fetch(BIN_URL, { headers: { "X-Master-Key": MASTER_KEY } });
        const json = await res.json();
        templates = json.record || [];
    } catch(e) {
        console.warn("JSONBin inaccessible");
        templates = [];
    }
    renderTemplates();
}

function renderTemplates() {
    const grid = document.getElementById("templates-grid");
    grid.innerHTML = "";
    templates.forEach(tpl => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `<img src="${tpl.image}" alt="${tpl.name}"><h3>${tpl.name}</h3>`;
        card.onclick = () => startGame(tpl);
        grid.appendChild(card);
    });
}

function startGame(tpl) {
    currentTemplate = tpl;
    rerollCount = 0;
    currentResults = {};
    document.getElementById("template-image").src = tpl.image;
    document.getElementById("roll-btn").classList.remove("hidden");
    document.getElementById("reroll-btn").classList.add("hidden");
    document.getElementById("rolled-display").innerHTML = "";
    document.getElementById("instructions-list").innerHTML = "";
    showSection("game");
}

async function roll() {
    const letters = Object.keys(currentTemplate.columns).sort();
    const display = document.getElementById("rolled-display");
    const instrDiv = document.getElementById("instructions-list");
    
    display.innerHTML = "";
    instrDiv.innerHTML = "<h3>Tes instructions :</h3>";

    for (let letter of letters) {
        let numCell = document.createElement("span");
        numCell.className = "roll-letter";
        numCell.innerHTML = `${letter}<span class="roll-number">0</span>`;
        display.appendChild(numCell);

        let spins = 30;
        for (let i = 0; i < spins; i++) {
            numCell.querySelector(".roll-number").textContent = Math.floor(Math.random()*10);
            await new Promise(r => setTimeout(r, 50));
        }
        const finalNum = Math.floor(Math.random()*10);
        numCell.querySelector(".roll-number").textContent = finalNum;
        currentResults[letter] = finalNum;

        const instr = currentTemplate.columns[letter].values[finalNum] || "—";
        const item = document.createElement("div");
        item.className = "instruction-item";
        item.innerHTML = `<strong>${letter}${finalNum} :</strong> ${instr}`;
        instrDiv.appendChild(item);
    }

    document.getElementById("roll-btn").classList.add("hidden");
    document.getElementById("reroll-btn").classList.remove("hidden");
    document.getElementById("reroll-count").textContent = "0";
    saveToHistory();
}

function reroll() {
    rerollCount++;
    document.getElementById("reroll-count").textContent = rerollCount;
    if (rerollCount >= 3) showToast("⚠️ Relancer trop souvent enlève le côté jeu du hasard !");
    roll();
}

function saveToHistory() {
    const entry = {
        id: Date.now(),
        templateId: currentTemplate.id,
        name: currentTemplate.name,
        date: new Date().toLocaleString("fr-FR"),
        results: {...currentResults}
    };
    history.unshift(entry);
    if (history.length > 20) history.pop();
    localStorage.setItem("rouletteHistory", JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById("history-list");
    container.innerHTML = "";
    history.forEach(entry => {
        const div = document.createElement("div");
        div.className = "history-item";
        div.innerHTML = `
            <div>
                <strong>${entry.name}</strong><br>
                <small>${entry.date}</small>
            </div>
            <div style="font-size:0.9rem; color:#ff2d55;">
                ${Object.keys(entry.results).map(k => `${k}${entry.results[k]}`).join(" • ")}
            </div>
        `;
        div.onclick = () => showHistoryDetail(entry);
        container.appendChild(div);
    });
}

function showHistoryDetail(entry) {
    document.getElementById("modal-template").textContent = entry.name;
    document.getElementById("modal-date").textContent = entry.date;
    const display = document.getElementById("modal-results");
    display.innerHTML = "";
    const letters = Object.keys(entry.results).sort();
    letters.forEach(letter => {
        const num = entry.results[letter];
        const span = document.createElement("span");
        span.className = "roll-letter";
        span.innerHTML = `${letter}<span class="roll-number">${num}</span>`;
        display.appendChild(span);
    });
    document.getElementById("history-modal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("history-modal").classList.add("hidden");
}

function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 4000);
}

function showSection(section) {
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    document.getElementById(section).classList.add("active");
}

function backToHome() {
    showSection("home");
}

window.onload = () => {
    loadTemplates();
    renderHistory();
};
