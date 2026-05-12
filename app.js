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

const OWNER_ADDRESS = "0xcf3da8d27bc354c8beb13a98205043e5c0967232";
const STORAGE_KEY = "mahjong-fortune-ritual-state-v1";
const bets = [10, 20, 50, 100, 250, 500];
const chipPackages = [
  { ritual: "0.01", chips: 1000 },
  { ritual: "0.05", chips: 6000 },
  { ritual: "0.1", chips: 15000 },
];

const symbols = [
  { icon: "萬", name: "wan", pay: 3, tone: "red" },
  { icon: "筒", name: "tong", pay: 4, tone: "blue" },
  { icon: "索", name: "suo", pay: 5, tone: "green" },
  { icon: "東", name: "east", pay: 6, tone: "purple" },
  { icon: "中", name: "red-dragon", pay: 8, tone: "red" },
  { icon: "發", name: "fortune", pay: 12, tone: "gold" },
  { icon: "🀄", name: "wild", pay: 0, tone: "gold" },
];

const saved = readSavedState();
const state = {
  account: "",
  chainId: "",
  ritualBalance: "0",
  chips: saved.chips,
  bet: saved.bet,
  selectedPackage: chipPackages[0],
  spinCount: saved.spinCount,
  bestWin: saved.bestWin,
  spinning: false,
  autoSpinning: false,
  autoTimer: null,
};

const el = {
  networkStatus: document.querySelector("#networkStatus"),
  ritualBalance: document.querySelector("#ritualBalance"),
  sideRitualBalance: document.querySelector("#sideRitualBalance"),
  connectWallet: document.querySelector("#connectWallet"),
  chips: document.querySelector("#chips"),
  remainingSpins: document.querySelector("#remainingSpins"),
  reels: document.querySelector("#reels"),
  resultText: document.querySelector("#resultText"),
  lastWin: document.querySelector("#lastWin"),
  betLabel: document.querySelector("#betLabel"),
  decreaseBet: document.querySelector("#decreaseBet"),
  increaseBet: document.querySelector("#increaseBet"),
  quickBets: document.querySelector("#quickBets"),
  spinButton: document.querySelector("#spinButton"),
  autoSpinButton: document.querySelector("#autoSpinButton"),
  maxBetButton: document.querySelector("#maxBetButton"),
  packageList: document.querySelector("#packageList"),
  buyChipsButton: document.querySelector("#buyChipsButton"),
  spinCount: document.querySelector("#spinCount"),
  bestWin: document.querySelector("#bestWin"),
  statusLog: document.querySelector("#statusLog"),
};

function readSavedState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      chips: Number(parsed.chips || 0),
      bet: bets.includes(Number(parsed.bet)) ? Number(parsed.bet) : 20,
      spinCount: Number(parsed.spinCount || 0),
      bestWin: Number(parsed.bestWin || 0),
    };
  } catch {
    return { chips: 0, bet: 20, spinCount: 0, bestWin: 0 };
  }
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      chips: state.chips,
      bet: state.bet,
      spinCount: state.spinCount,
      bestWin: state.bestWin,
    }),
  );
}

function shortAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatRitualBalance(hexBalance) {
  const wei = BigInt(hexBalance || "0x0");
  const whole = wei / 10n ** 18n;
  const fraction = ((wei % 10n ** 18n) / 10n ** 14n).toString().padStart(4, "0");
  const trimmed = fraction.replace(/0+$/, "");
  return `${whole}${trimmed ? `.${trimmed}` : ""}`;
}

async function refreshWalletBalance() {
  if (!window.ethereum || !state.account) {
    state.ritualBalance = "0";
    return;
  }

  try {
    const balance = await window.ethereum.request({
      method: "eth_getBalance",
      params: [state.account, "latest"],
    });
    state.ritualBalance = formatRitualBalance(balance);
  } catch {
    state.ritualBalance = "0";
  }
}

function log(message) {
  el.statusLog.textContent = message;
}

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function makeGrid() {
  return Array.from({ length: 6 }, () => Array.from({ length: 5 }, () => randomSymbol()));
}

function cloneSymbol(symbol) {
  return { ...symbol };
}

function pickPayingSymbol() {
  const payingSymbols = symbols.filter((symbol) => symbol.pay > 0);
  return payingSymbols[Math.floor(Math.random() * payingSymbols.length)];
}

function buildSpinGrid() {
  const roll = Math.random();
  const target =
    roll < 0.64 ? "loss" : roll < 0.88 ? "small" : roll < 0.97 ? "medium" : "big";

  if (target === "loss") {
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const grid = makeGrid();
      if (calculateWin(grid).payout === 0) return grid;
    }
    return makeGrid();
  }

  const grid = makeGrid();
  const matchSymbol = pickPayingSymbol();
  const matchCount = target === "small" ? 8 : target === "medium" ? 10 : 13;
  const used = new Set();

  while (used.size < matchCount) {
    const column = Math.floor(Math.random() * 6);
    const row = Math.floor(Math.random() * 5);
    const key = `${column}-${row}`;
    if (!used.has(key)) {
      used.add(key);
      grid[column][row] = cloneSymbol(matchSymbol);
    }
  }

  if (target === "big") {
    const wild = symbols.find((symbol) => symbol.name === "wild");
    for (let count = 0; count < 3; count += 1) {
      grid[Math.floor(Math.random() * 6)][Math.floor(Math.random() * 5)] = cloneSymbol(wild);
    }
  }

  return grid;
}

function drawReels(grid = makeGrid(), winningNames = []) {
  el.reels.innerHTML = "";
  grid.forEach((column) => {
    const reel = document.createElement("div");
    reel.className = "reel";
    column.forEach((symbol) => {
      const cell = document.createElement("div");
      cell.className = `symbol symbol--${symbol.tone} ${
        winningNames.includes(symbol.name) ? "win" : ""
      }`;
      cell.textContent = symbol.icon;
      reel.appendChild(cell);
    });
    el.reels.appendChild(reel);
  });
}

function calculateWin(grid) {
  const counts = {};
  for (const symbol of grid.flat()) {
    if (symbol.pay > 0) counts[symbol.name] = (counts[symbol.name] || 0) + 1;
  }

  let payout = 0;
  const winningNames = [];
  for (const symbol of symbols) {
    const count = counts[symbol.name] || 0;
    if (symbol.pay > 0 && count >= 8) {
      winningNames.push(symbol.name);
      payout += state.bet * symbol.pay * Math.floor(count / 3);
    }
  }

  const wilds = grid.flat().filter((symbol) => symbol.name === "wild").length;
  if (wilds >= 3) {
    payout += state.bet * wilds * 5;
    winningNames.push("wild");
  }

  return { payout, winningNames };
}

function renderPackages() {
  el.packageList.innerHTML = "";
  chipPackages.forEach((pack) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `package-card ${
      pack.ritual === state.selectedPackage.ritual ? "active" : ""
    }`;
    button.innerHTML = `
      <span>${pack.ritual} RITUAL</span>
      <strong>${pack.chips.toLocaleString()} chips</strong>
    `;
    button.addEventListener("click", () => {
      state.selectedPackage = pack;
      renderPackages();
    });
    el.packageList.appendChild(button);
  });
}

function renderBets() {
  el.quickBets.innerHTML = "";
  bets.forEach((bet) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `quick-bet ${bet === state.bet ? "active" : ""}`;
    button.textContent = bet;
    button.addEventListener("click", () => setBet(bet));
    el.quickBets.appendChild(button);
  });
}

function setBet(nextBet) {
  state.bet = Math.max(bets[0], Math.min(bets[bets.length - 1], nextBet));
  saveState();
  render();
}

function render() {
  el.chips.textContent = state.chips.toLocaleString();
  el.remainingSpins.textContent = Math.floor(state.chips / state.bet).toLocaleString();
  el.betLabel.textContent = state.bet.toLocaleString();
  el.spinCount.textContent = state.spinCount.toLocaleString();
  el.bestWin.textContent = state.bestWin.toLocaleString();
  el.ritualBalance.textContent = `${state.ritualBalance} RITUAL`;
  el.sideRitualBalance.textContent = `${state.ritualBalance} RITUAL`;
  el.spinButton.disabled = state.spinning || state.chips < state.bet;
  el.autoSpinButton.textContent = state.autoSpinning ? "Stop" : "Auto";
  el.autoSpinButton.classList.toggle("active", state.autoSpinning);
  el.autoSpinButton.disabled = !state.autoSpinning && state.chips < state.bet;

  if (!state.account) {
    el.networkStatus.textContent = "Not connected";
    el.connectWallet.hidden = false;
  } else {
    const chainLabel = state.chainId === RITUAL_CHAIN.chainId ? "Ritual" : `Chain ${state.chainId}`;
    el.networkStatus.textContent = `${chainLabel} · ${shortAddress(state.account)}`;
    el.connectWallet.hidden = true;
  }

  renderBets();
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
    await refreshWalletBalance();
    render();
    log("Wallet connected. Kamu bisa beli chip dengan RITUAL testnet.");
  } catch (error) {
    log(error.message || "Wallet connection failed.");
  }
}

function ritualToWeiHex(amount) {
  const [whole, fraction = ""] = amount.split(".");
  const wei = BigInt(whole || "0") * 10n ** 18n + BigInt((fraction + "0".repeat(18)).slice(0, 18));
  return `0x${wei.toString(16)}`;
}

async function buyChips() {
  try {
    if (!state.account) await connectWallet();
    if (!state.account) return;

    await ensureRitualChain();
    log(`Confirm payment ${state.selectedPackage.ritual} RITUAL testnet in wallet.`);

    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: state.account,
          to: OWNER_ADDRESS,
          value: ritualToWeiHex(state.selectedPackage.ritual),
        },
      ],
    });

    state.chips += state.selectedPackage.chips;
    await refreshWalletBalance();
    saveState();
    render();
    log(`Payment sent. Added ${state.selectedPackage.chips.toLocaleString()} chips. Tx: ${txHash}`);
  } catch (error) {
    log(error.message || "Payment failed.");
  }
}

async function spin() {
  if (state.spinning) return;
  if (state.chips < state.bet) {
    stopAutoSpin();
    log("Chip tidak cukup. Beli chip dulu atau turunkan bet.");
    return;
  }

  state.spinning = true;
  state.chips -= state.bet;
  state.spinCount += 1;
  el.lastWin.textContent = "0";
  el.resultText.textContent = "Spinning...";
  el.reels.classList.add("spinning");
  saveState();
  render();

  await new Promise((resolve) => setTimeout(resolve, 750));

  const grid = buildSpinGrid();
  const { payout, winningNames } = calculateWin(grid);
  state.chips += payout;
  state.bestWin = Math.max(state.bestWin, payout);
  state.spinning = false;

  drawReels(grid, winningNames);
  el.reels.classList.remove("spinning");
  el.lastWin.textContent = payout.toLocaleString();
  el.resultText.textContent =
    payout > 0 ? `Menang ${payout.toLocaleString()} chips.` : "Belum menang, coba spin lagi.";

  saveState();
  render();

  if (state.autoSpinning) {
    if (state.chips >= state.bet) {
      state.autoTimer = window.setTimeout(spin, 900);
    } else {
      stopAutoSpin();
      log("Auto Spin berhenti karena chip tidak cukup.");
    }
  }
}

function stopAutoSpin() {
  state.autoSpinning = false;
  if (state.autoTimer) {
    window.clearTimeout(state.autoTimer);
    state.autoTimer = null;
  }
  render();
}

function toggleAutoSpin() {
  if (state.autoSpinning) {
    stopAutoSpin();
    log("Auto Spin berhenti.");
    return;
  }

  if (state.chips < state.bet) {
    log("Chip tidak cukup untuk Auto Spin.");
    return;
  }

  state.autoSpinning = true;
  log("Auto Spin aktif.");
  render();
  spin();
}

el.connectWallet.addEventListener("click", connectWallet);
el.buyChipsButton.addEventListener("click", buyChips);
el.spinButton.addEventListener("click", spin);
el.autoSpinButton.addEventListener("click", toggleAutoSpin);
el.maxBetButton.addEventListener("click", () => setBet(bets[bets.length - 1]));
el.decreaseBet.addEventListener("click", () => {
  const index = Math.max(0, bets.indexOf(state.bet) - 1);
  setBet(bets[index]);
});
el.increaseBet.addEventListener("click", () => {
  const index = Math.min(bets.length - 1, bets.indexOf(state.bet) + 1);
  setBet(bets[index]);
});

if (window.ethereum) {
  window.ethereum.on?.("accountsChanged", ([account]) => {
    state.account = account || "";
    refreshWalletBalance().then(render);
    render();
  });
  window.ethereum.on?.("chainChanged", (chainId) => {
    state.chainId = chainId;
    refreshWalletBalance().then(render);
    render();
  });
}

renderPackages();
drawReels();
render();
