const BIN_URL = "https://api.jsonbin.io/v3/b/69ba8242aa77b81da9f61d90/latest";
const MASTER_KEY = "$2a$10$4i14QEY44PwUIvj7C/oI6uAGx6IQpWoihAcpGKxP8IVWqgON0xVEy";

let templates = [];
let currentTemplate = null;
let currentResults = {};
let rerollCount = 0;
let history = JSON.parse(localStorage.getItem("rouletteHistory")) || [];

// Fallback en français (tu peux le supprimer une fois ton BIN rempli)
const fallbackTemplates = [
    {
        id: "demo1",
        name: "Jeu Sensuel Classique",
        image: "https://picsum.photos/id/1015/800/400",
        columns: {
            "A": { label: "Position", values: {"0":"Missionnaire lent et profond","1":"Cuillère sensuelle","2":"Chevaucheuse","3":"Debout contre le mur","4":"69 inversé","5":"Lotus face à face","6":"Chien classique","7":"Équerre","8":"Sur le côté","9":"Sur les genoux"} },
            "B": { label: "Durée", values: {"0":"30 secondes","1":"1 minute","2":"2 minutes","3":"3 minutes","4":"4 minutes","5":"5 minutes","6":"7 minutes","7":"10 minutes","8":"15 minutes","9":"Jusqu'à l'orgasme"} },
            "C": { label: "Action bonus", values: {"0":"Mains attachées","1":"Yeux bandés","2":"Avec glace","3":"Avec huile","4":"Baisers partout","5":"Lécher lentement","6":"Mordiller","7":"Fessées légères","8":"Parler sale","9":"Arrêt total au signal"} }
        }
    }
];

async function loadTemplates() {
    try {
        const res = await fetch(BIN_URL, {
            headers: { "X-Master-Key": MASTER_KEY }
        });
        const json = await res.json();
        const data = json.record || [];
        templates = Array.isArray(data) ? data : (data.templates || []);
    } catch (e) {
        console.warn("JSONBin inaccessible → fallback activé");
        templates = fallbackTemplates;
    }
    if (templates.length === 0) templates = fallbackTemplates;
    renderTemplates();
}

function renderTemplates() {
    const grid = document.getElementById("templates-grid");
    grid.innerHTML = "";
    templates.forEach(tpl => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${tpl.image}" alt="${tpl.name}">
            <h3>${tpl.name}</h3>
        `;
        card.onclick = () => startGame(tpl);
        grid.appendChild(card);
    });
}

function startGame(tpl) {
    currentTemplate = tpl;
    rerollCount = 0;
    currentResults = {};
    document.getElementById("template-image").src = tpl.image;
    document.getElementById("template-name").textContent = tpl.name;
    document.getElementById("roll-btn").classList.remove("hidden");
    document.getElementById("reroll-btn").classList.add("hidden");
    document.getElementById("results-body").innerHTML = "";
    showSection("game");
}

async function roll() {
    const tbody = document.getElementById("results-body");
    tbody.innerHTML = "";
    const letters = Object.keys(currentTemplate.columns).sort();

    const promises = letters.map(letter => {
        return new Promise(async resolve => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><strong>${letter}</strong></td>
                <td>${currentTemplate.columns[letter].label}</td>
                <td id="num-${letter}" class="number">0</td>
                <td id="inst-${letter}"></td>
            `;
            tbody.appendChild(row);

            // Animation roulette
            let spins = 25;
            const numCell = document.getElementById(`num-${letter}`);
            for (let i = 0; i < spins; i++) {
                numCell.textContent = Math.floor(Math.random() * 10);
                await new Promise(r => setTimeout(r, 40 + i * 3));
            }
            const finalNum = Math.floor(Math.random() * 10);
            numCell.textContent = finalNum;
            currentResults[letter] = finalNum;

            const instruction = currentTemplate.columns[letter].values[finalNum] || "—";
            document.getElementById(`inst-${letter}`).textContent = instruction;
            resolve();
        });
    });

    await Promise.all(promises);
    document.getElementById("roll-btn").classList.add("hidden");
    document.getElementById("reroll-btn").classList.remove("hidden");
    document.getElementById("reroll-count").textContent = "0";
    saveToHistory();
}

function reroll() {
    rerollCount++;
    document.getElementById("reroll-count").textContent = rerollCount;
    if (rerollCount >= 3) {
        showToast("⚠️ Relancer trop souvent enlève le côté jeu du hasard !");
    }
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
                ${Object.keys(entry.results).map(k => `${k}:${entry.results[k]}`).join(" • ")}
            </div>
        `;
        div.onclick = () => showHistoryDetail(entry);
        container.appendChild(div);
    });
}

function showHistoryDetail(entry) {
    document.getElementById("modal-template").textContent = entry.name;
    document.getElementById("modal-date").textContent = entry.date;
    const tbody = document.getElementById("modal-body");
    tbody.innerHTML = "";
    Object.keys(entry.results).forEach(letter => {
        const row = document.createElement("tr");
        row.innerHTML = `<td><strong>${letter}</strong></td><td>—</td><td>${entry.results[letter]}</td><td>Historique</td>`;
        tbody.appendChild(row);
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

// INIT
window.onload = () => {
    loadTemplates();
    renderHistory();
};
