const RITUAL_CHAIN = {
  chainId: "0x7bb",
  chainName: "Ritual Testnet",
  nativeCurrency: {
    name: "RITUAL",
    symbol: "RITUAL",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.ritualfoundation.org"],
  blockExplorerUrls: ["https://explorer.ritualfoundation.org"],
};

const themes = [
  ["Olympus Gates", "myth reels", "⚡"],
  ["Candy Orbit", "cluster sweets", "🍬"],
  ["Star Princess", "royal cosmic", "✨"],
  ["Mahjong River", "tile match", "🀄"],
  ["Frontier Gold", "western rush", "🤠"],
  ["Sugar Sprint", "candy chain", "🍭"],
  ["Bonanza Vault", "gold cascade", "💰"],
  ["Sun Temple Gems", "ancient shine", "🔶"],
  ["Lucky Mooncat", "charm reels", "🐱"],
  ["Aztec Treasure Run", "temple hunt", "🗿"],
  ["Sky Kings Duel", "storm clash", "🌩️"],
  ["Dragon Hatchery", "egg bonus", "🐉"],
  ["Guard House", "kennel luck", "🏠"],
  ["Fruit Fiesta", "juicy party", "🍓"],
  ["Prairie Crown", "buffalo trail", "👑"],
  ["Serpent Queen", "stone gaze", "🐍"],
  ["Clover Riches", "green luck", "☘️"],
  ["Pirate Ledger", "sea gold", "🏴‍☠️"],
  ["Jester Jewels", "classic shine", "🃏"],
  ["Rhino Charge", "savanna reels", "🦏"],
];

const symbols = ["⚡", "🍬", "✨", "🀄", "💰", "🔶", "🐉", "🍓", "👑", "🃏"];

const state = {
  account: "",
  chainId: "",
  credits: 1000,
  bet: 20,
  selectedTheme: themes[0],
  spinCount: 0,
  bestWin: 0,
  lastSpin: null,
};

const el = {
  themeList: document.querySelector("#themeList"),
  themeCount: document.querySelector("#themeCount"),
  selectedTheme: document.querySelector("#selectedTheme"),
  selectedProvider: document.querySelector("#selectedProvider"),
  reels: document.querySelector("#reels"),
  resultText: document.querySelector("#resultText"),
  lastWin: document.querySelector("#lastWin"),
  credits: document.querySelector("#credits"),
  spinCount: document.querySelector("#spinCount"),
  bestWin: document.querySelector("#bestWin"),
  betAmount: document.querySelector("#betAmount"),
  betLabel: document.querySelector("#betLabel"),
  spinButton: document.querySelector("#spinButton"),
  recordButton: document.querySelector("#recordButton"),
  connectWallet: document.querySelector("#connectWallet"),
  networkStatus: document.querySelector("#networkStatus"),
  statusLog: document.querySelector("#statusLog"),
};

function shortAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function log(message) {
  el.statusLog.textContent = message;
}

function drawThemes() {
  el.themeCount.textContent = themes.length;
  el.themeList.innerHTML = "";

  themes.forEach((theme) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `theme-card ${theme[0] === state.selectedTheme[0] ? "active" : ""}`;
    button.innerHTML = `
      <span class="theme-icon">${theme[2]}</span>
      <span>
        <span class="theme-name">${theme[0]}</span>
        <span class="theme-note">${theme[1]}</span>
      </span>
    `;
    button.addEventListener("click", () => {
      state.selectedTheme = theme;
      el.selectedTheme.textContent = theme[0];
      el.selectedProvider.textContent = theme[1];
      drawThemes();
      log(`${theme[0]} selected.`);
    });
    el.themeList.appendChild(button);
  });
}

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function drawReels(grid = null, winningRows = []) {
  const nextGrid =
    grid ||
    Array.from({ length: 5 }, () => Array.from({ length: 3 }, () => randomSymbol()));

  el.reels.innerHTML = "";
  nextGrid.forEach((column) => {
    const reel = document.createElement("div");
    reel.className = "reel";
    column.forEach((symbol, rowIndex) => {
      const cell = document.createElement("div");
      cell.className = `symbol ${winningRows.includes(rowIndex) ? "win" : ""}`;
      cell.textContent = symbol;
      reel.appendChild(cell);
    });
    el.reels.appendChild(reel);
  });
}

function calculateWin(grid) {
  const rows = [0, 1, 2];
  let payout = 0;
  const winningRows = [];

  rows.forEach((row) => {
    const rowSymbols = grid.map((column) => column[row]);
    const counts = rowSymbols.reduce((acc, symbol) => {
      acc[symbol] = (acc[symbol] || 0) + 1;
      return acc;
    }, {});
    const bestCount = Math.max(...Object.values(counts));

    if (bestCount >= 3) {
      winningRows.push(row);
      payout += state.bet * (bestCount - 2) * (row === 1 ? 3 : 2);
    }
  });

  if (grid.flat().filter((symbol) => symbol === state.selectedTheme[2]).length >= 4) {
    payout += state.bet * 5;
  }

  return { payout, winningRows };
}

async function spin() {
  if (state.credits < state.bet) {
    log("Demo credit tidak cukup. Turunkan bet atau refresh session.");
    return;
  }

  state.credits -= state.bet;
  state.spinCount += 1;
  state.lastSpin = null;
  el.recordButton.disabled = true;
  el.reels.classList.add("spinning");
  el.spinButton.disabled = true;
  el.resultText.textContent = "Spinning...";
  renderStats();

  await new Promise((resolve) => setTimeout(resolve, 650));

  const grid = Array.from({ length: 5 }, () => Array.from({ length: 3 }, () => randomSymbol()));
  const { payout, winningRows } = calculateWin(grid);
  state.credits += payout;
  state.bestWin = Math.max(state.bestWin, payout);
  state.lastSpin = {
    theme: state.selectedTheme[0],
    bet: state.bet,
    payout,
    at: new Date().toISOString(),
  };

  drawReels(grid, winningRows);
  el.reels.classList.remove("spinning");
  el.spinButton.disabled = false;
  el.recordButton.disabled = !state.account;
  el.resultText.textContent = payout > 0 ? "Win recorded in session." : "No win this spin.";
  el.lastWin.textContent = payout;
  renderStats();
}

function renderStats() {
  el.credits.textContent = state.credits;
  el.spinCount.textContent = state.spinCount;
  el.bestWin.textContent = state.bestWin;
  el.betLabel.textContent = state.bet;

  if (!state.account) {
    el.networkStatus.textContent = "Not connected";
    return;
  }

  const chainLabel = state.chainId === RITUAL_CHAIN.chainId ? "Ritual" : `Chain ${state.chainId}`;
  el.networkStatus.textContent = `${chainLabel} · ${shortAddress(state.account)}`;
}

async function ensureRitualChain() {
  if (!window.ethereum) {
    throw new Error("Wallet browser extension tidak ditemukan.");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: RITUAL_CHAIN.chainId }],
    });
  } catch (error) {
    if (error.code !== 4902) throw error;
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [RITUAL_CHAIN],
    });
  }
}

async function connectWallet() {
  try {
    await ensureRitualChain();
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    state.account = accounts[0] || "";
    state.chainId = await window.ethereum.request({ method: "eth_chainId" });
    el.recordButton.disabled = !state.lastSpin;
    renderStats();
    log("Wallet connected to Ritual testnet.");
  } catch (error) {
    log(error.message || "Wallet connection failed.");
  }
}

function encodeMemo(payload) {
  const json = JSON.stringify(payload);
  return `0x${Array.from(new TextEncoder().encode(json))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}

async function recordOnChain() {
  if (!state.lastSpin || !state.account) return;

  try {
    await ensureRitualChain();
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: state.account,
          to: state.account,
          value: "0x0",
          data: encodeMemo({
            app: "ritual-arcade-slots",
            ...state.lastSpin,
          }),
        },
      ],
    });
    log(`Spin memo sent: ${txHash}`);
  } catch (error) {
    log(error.message || "On-chain record failed.");
  }
}

el.betAmount.addEventListener("input", (event) => {
  state.bet = Number(event.target.value);
  renderStats();
});

el.spinButton.addEventListener("click", spin);
el.connectWallet.addEventListener("click", connectWallet);
el.recordButton.addEventListener("click", recordOnChain);

if (window.ethereum) {
  window.ethereum.on?.("accountsChanged", ([account]) => {
    state.account = account || "";
    renderStats();
  });
  window.ethereum.on?.("chainChanged", (chainId) => {
    state.chainId = chainId;
    renderStats();
  });
}

drawThemes();
drawReels();
renderStats();
