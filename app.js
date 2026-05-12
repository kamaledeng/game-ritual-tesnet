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
const SETTINGS_KEY = "ritual-mahjong-settings-v1";
const WALLET_STORAGE_PREFIX = "ritual-mahjong-wallet-v1";
const bets = [10, 20, 50, 100, 250, 500];
const autoSpinOptions = [10, 50, 100];
const BOARD_COLUMNS = 5;
const BOARD_ROWS = 4;
const baseCascadeMultipliers = [1, 2, 3, 5];
const freeSpinCascadeMultipliers = [2, 3, 5, 8];
const freeSpinAwards = {
  3: 8,
  4: 12,
  5: 15,
};
const chipPackages = [
  { ritual: "0.01", chips: 1000 },
  { ritual: "0.05", chips: 6000 },
  { ritual: "0.1", chips: 15000 },
];

const symbols = [
  { name: "char-1", suit: "character", rank: 1, pay: 3, tone: "red", mark: "\u4e00", suitMark: "\u842c" },
  { name: "char-5", suit: "character", rank: 5, pay: 5, tone: "red", mark: "\u4e94", suitMark: "\u842c" },
  { name: "char-8", suit: "character", rank: 8, pay: 7, tone: "red", mark: "\u516b", suitMark: "\u842c" },
  { name: "dot-2", suit: "dots", rank: 2, pay: 3, tone: "blue", mark: "2", suitMark: "\u7b52" },
  { name: "dot-5", suit: "dots", rank: 5, pay: 5, tone: "blue", mark: "5", suitMark: "\u7b52" },
  { name: "bamboo-3", suit: "bamboo", rank: 3, pay: 4, tone: "green", mark: "3", suitMark: "\u7d22" },
  { name: "bamboo-6", suit: "bamboo", rank: 6, pay: 6, tone: "green", mark: "6", suitMark: "\u7d22" },
  { name: "east", suit: "wind", rank: 0, pay: 8, tone: "blue", mark: "\u6771", suitMark: "\u98a8" },
  { name: "red-dragon", suit: "dragon", rank: 0, pay: 10, tone: "red", mark: "\u4e2d", suitMark: "\u9f8d" },
  { name: "green-dragon", suit: "dragon", rank: 0, pay: 12, tone: "green", mark: "\u767c", suitMark: "\u9f8d" },
  { name: "white-dragon", suit: "dragon", rank: 0, pay: 14, tone: "blue", mark: "\u767d", suitMark: "\u9f8d" },
  { name: "wild", suit: "wild", rank: 0, pay: 0, tone: "gold", mark: "\u767e\u642d", suitMark: "WILD" },
  { name: "gold-dragon-scatter", suit: "scatter", rank: 0, pay: 0, tone: "scatter", mark: "\u9f8d", suitMark: "BONUS", scatter: true },
];

const saved = readSavedSettings();
const state = {
  account: "",
  chainId: "",
  ritualBalance: "0",
  chips: 0,
  bet: saved.bet,
  selectedPackage: chipPackages[0],
  spinCount: 0,
  bestWin: 0,
  spinning: false,
  autoSpinning: false,
  selectedAutoSpins: 10,
  autoRemaining: 0,
  autoTimer: null,
  deadStreak: 0,
  freeSpinsRemaining: 0,
  freeSpinsTotal: 0,
  freeSpinWin: 0,
  bonusActive: false,
  lastFreeSpinBet: 0,
};

const el = {
  networkStatus: document.querySelector("#networkStatus"),
  ritualBalance: document.querySelector("#ritualBalance"),
  sideRitualBalance: document.querySelector("#sideRitualBalance"),
  connectWallet: document.querySelector("#connectWallet"),
  chips: document.querySelector("#chips"),
  remainingSpins: document.querySelector("#remainingSpins"),
  freeSpinCounter: document.querySelector("#freeSpinCounter"),
  bonusBanner: document.querySelector("#bonusBanner"),
  bonusText: document.querySelector("#bonusText"),
  reels: document.querySelector("#reels"),
  resultText: document.querySelector("#resultText"),
  lastWin: document.querySelector("#lastWin"),
  multiplierSteps: document.querySelectorAll(".multiplier-track strong"),
  betLabel: document.querySelector("#betLabel"),
  decreaseBet: document.querySelector("#decreaseBet"),
  increaseBet: document.querySelector("#increaseBet"),
  quickBets: document.querySelector("#quickBets"),
  autoOptions: document.querySelector("#autoOptions"),
  spinButton: document.querySelector("#spinButton"),
  autoSpinButton: document.querySelector("#autoSpinButton"),
  maxBetButton: document.querySelector("#maxBetButton"),
  packageList: document.querySelector("#packageList"),
  buyChipsButton: document.querySelector("#buyChipsButton"),
  spinCount: document.querySelector("#spinCount"),
  bestWin: document.querySelector("#bestWin"),
  statusLog: document.querySelector("#statusLog"),
};

function readSavedSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    return {
      bet: bets.includes(Number(parsed.bet)) ? Number(parsed.bet) : 20,
    };
  } catch {
    return { bet: 20 };
  }
}

function walletStorageKey(account) {
  return `${WALLET_STORAGE_PREFIX}-${account.toLowerCase()}`;
}

function loadWalletState(account) {
  try {
    const parsed = JSON.parse(localStorage.getItem(walletStorageKey(account)) || "{}");
    state.chips = Number(parsed.chips || 0);
    state.spinCount = Number(parsed.spinCount || 0);
    state.bestWin = Number(parsed.bestWin || 0);
  } catch {
    state.chips = 0;
    state.spinCount = 0;
    state.bestWin = 0;
  }
}

function resetWalletState() {
  state.chips = 0;
  state.spinCount = 0;
  state.bestWin = 0;
  state.ritualBalance = "0";
  resetBonusState();
}

function resetBonusState() {
  state.freeSpinsRemaining = 0;
  state.freeSpinsTotal = 0;
  state.freeSpinWin = 0;
  state.bonusActive = false;
  state.lastFreeSpinBet = 0;
}

function saveState() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ bet: state.bet }));

  if (!state.account) return;

  localStorage.setItem(
    walletStorageKey(state.account),
    JSON.stringify({
      chips: state.chips,
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

function cloneSymbol(symbol) {
  return { ...symbol };
}

function getSymbol(name) {
  return symbols.find((symbol) => symbol.name === name);
}

function payingSymbols() {
  return symbols.filter((symbol) => symbol.pay > 0);
}

function randomSymbol(options = {}) {
  const { bonus = false, allowScatter = true } = options;
  const roll = Math.random();
  const scatterChance = bonus ? 0.0035 : 0.006;
  const wildChance = bonus ? 0.014 : 0.0085;

  if (allowScatter && roll < scatterChance) return cloneSymbol(getSymbol("gold-dragon-scatter"));
  if (roll < scatterChance + wildChance) return cloneSymbol(getSymbol("wild"));

  const pool = payingSymbols();
  return cloneSymbol(pool[Math.floor(Math.random() * pool.length)]);
}

function makeGrid(options = {}) {
  return Array.from({ length: BOARD_COLUMNS }, () =>
    Array.from({ length: BOARD_ROWS }, () => randomSymbol(options)),
  );
}

function pickPayingSymbol() {
  const pool = payingSymbols();
  return pool[Math.floor(Math.random() * pool.length)];
}

function makeDeadGrid(options = {}) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const grid = makeGrid(options);
    if (calculateWin(grid, 1).payout === 0) return grid;
  }
  return makeGrid(options);
}

function makeNearMissGrid(options = {}) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const grid = makeGrid(options);
    const matchSymbol = pickPayingSymbol();

    for (let column = 0; column < 2; column += 1) {
      const rows = new Set();
      while (rows.size < 2) rows.add(Math.floor(Math.random() * BOARD_ROWS));
      rows.forEach((row) => {
        grid[column][row] = cloneSymbol(matchSymbol);
      });
    }

    grid[2] = grid[2].map((symbol) =>
      symbol.name === matchSymbol.name || symbol.name === "wild" ? randomNonMatchingSymbol(matchSymbol) : symbol,
    );

    if (calculateWin(grid, 1).payout === 0) return grid;
  }

  return makeDeadGrid(options);
}

function randomNonMatchingSymbol(matchSymbol) {
  const pool = symbols.filter(
    (symbol) => symbol.name !== matchSymbol.name && symbol.name !== "wild" && !symbol.scatter,
  );
  return cloneSymbol(pool[Math.floor(Math.random() * pool.length)]);
}

function chooseSpinTarget(options = {}) {
  const { bonus = false } = options;
  const roll = Math.random();

  if (!bonus && roll < 0.0065) return "bonus";

  if (bonus) {
    if (roll < 0.58) return "dead";
    if (roll < 0.78) return "near";
    if (roll < 0.925) return "small";
    if (roll < 0.985) return "medium";
    return "big";
  }

  if (state.deadStreak >= 5) {
    if (roll < 0.42) return "dead";
    if (roll < 0.73) return "near";
    if (roll < 0.925) return "small";
    if (roll < 0.992) return "medium";
    return "big";
  }

  if (state.deadStreak >= 3) {
    if (roll < 0.54) return "dead";
    if (roll < 0.80) return "near";
    if (roll < 0.945) return "small";
    if (roll < 0.994) return "medium";
    return "big";
  }

  if (roll < 0.67) return "dead";
  if (roll < 0.90) return "near";
  if (roll < 0.982) return "small";
  if (roll < 0.998) return "medium";
  return "big";
}

function buildSpinGrid(options = {}) {
  const target = chooseSpinTarget(options);

  if (target === "dead") return makeDeadGrid(options);
  if (target === "near") return makeNearMissGrid(options);
  if (target === "bonus") return makeScatterTriggerGrid();

  const roll = Math.random();
  const grid = makeGrid(options);
  const matchSymbol = pickPayingSymbol();
  const matchReels =
    target === "small" ? 3 : target === "medium" ? (roll < 0.72 ? 3 : 4) : roll < 0.64 ? 4 : 5;
  const minPerReel = target === "big" ? 2 : 1;

  for (let column = 0; column < matchReels; column += 1) {
    const usedRows = new Set();
    const extraRowChance = target === "small" ? 0.18 : target === "medium" ? 0.34 : 0.52;
    const targetRows = Math.min(BOARD_ROWS, minPerReel + (Math.random() < extraRowChance ? 1 : 0));
    while (usedRows.size < targetRows) {
      const row = Math.floor(Math.random() * BOARD_ROWS);
      if (!usedRows.has(row)) {
        usedRows.add(row);
        grid[column][row] = cloneSymbol(matchSymbol);
      }
    }
  }

  if (target === "big") {
    const wild = getSymbol("wild");
    const wildCount = Math.random() < 0.74 ? 1 : 2;
    for (let count = 0; count < wildCount; count += 1) {
      grid[Math.floor(Math.random() * BOARD_COLUMNS)][Math.floor(Math.random() * BOARD_ROWS)] =
        cloneSymbol(wild);
    }
  }

  return grid;
}

function makeScatterTriggerGrid() {
  const grid = makeDeadGrid({ allowScatter: false });
  const scatter = getSymbol("gold-dragon-scatter");
  const positions = new Set();
  while (positions.size < 3) {
    positions.add(cellKey(Math.floor(Math.random() * BOARD_COLUMNS), Math.floor(Math.random() * BOARD_ROWS)));
  }
  positions.forEach((position) => {
    const [column, row] = position.split("-").map(Number);
    grid[column][row] = cloneSymbol(scatter);
  });
  return grid;
}

function cellKey(columnIndex, rowIndex) {
  return `${columnIndex}-${rowIndex}`;
}

function makePips(symbol) {
  return Array.from({ length: symbol.rank }, (_, index) => {
    if (symbol.suit === "dots") return `<i class="pip dot dot-${(index % 3) + 1}"></i>`;
    if (symbol.suit === "bamboo") return `<i class="pip bamboo"></i>`;
    return "";
  }).join("");
}

function tileFace(symbol) {
  if (symbol.suit === "scatter") {
    return `
      <span class="tile-corner">${symbol.suitMark}</span>
      <span class="tile-main">${symbol.mark}</span>
      <span class="tile-sub">FREE</span>
    `;
  }

  if (symbol.suit === "dots" || symbol.suit === "bamboo") {
    return `
      <span class="tile-corner">${symbol.rank}</span>
      <span class="tile-suit">${symbol.suitMark}</span>
      <span class="tile-pips tile-pips--${symbol.rank}">${makePips(symbol)}</span>
    `;
  }

  if (symbol.suit === "character") {
    return `
      <span class="tile-corner">${symbol.mark}</span>
      <span class="tile-main">${symbol.mark}</span>
      <span class="tile-sub">${symbol.suitMark}</span>
    `;
  }

  return `
    <span class="tile-corner">${symbol.suitMark}</span>
    <span class="tile-main">${symbol.mark}</span>
    <span class="tile-sub">${symbol.suitMark}</span>
  `;
}

function drawReels(grid = makeGrid({ allowScatter: false }), winningCells = [], breaking = false) {
  const winningSet = new Set(winningCells);
  el.reels.innerHTML = "";
  grid.forEach((column, columnIndex) => {
    const reel = document.createElement("div");
    reel.className = "reel";
    column.forEach((symbol, rowIndex) => {
      const isWinning = winningSet.has(cellKey(columnIndex, rowIndex));
      const cell = document.createElement("div");
      cell.className = `symbol symbol--${symbol.tone} ${
        isWinning ? "win" : ""
      } ${breaking && isWinning ? "breaking" : ""}`;
      cell.innerHTML = tileFace(symbol);
      reel.appendChild(cell);
    });
    el.reels.appendChild(reel);
  });
}

function makeCascadeGrid(grid, winningCells, options = {}) {
  const winningSet = new Set(winningCells);
  return grid.map((column, columnIndex) => {
    const survivors = column.filter((_, rowIndex) => !winningSet.has(cellKey(columnIndex, rowIndex)));
    const refill = Array.from({ length: BOARD_ROWS - survivors.length }, () => randomSymbol(options));
    return [...refill, ...survivors];
  });
}

function makeControlledCascadeGrid(grid, winningCells, allowFollowUp, options = {}) {
  if (allowFollowUp) return makeCascadeGrid(grid, winningCells, options);

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const nextGrid = makeCascadeGrid(grid, winningCells, options);
    if (calculateWin(nextGrid, 1).payout === 0) return nextGrid;
  }

  return makeDeadGrid(options);
}

function calculateWin(grid, multiplier = 1, betAmount = state.bet) {
  let payout = 0;
  const winningCells = new Set();
  for (const symbol of symbols) {
    if (symbol.pay === 0) continue;

    let ways = 1;
    let streak = 0;
    const cellsForSymbol = [];

    for (let columnIndex = 0; columnIndex < grid.length; columnIndex += 1) {
      const matches = [];
      grid[columnIndex].forEach((cell, rowIndex) => {
        if (cell.name === symbol.name || cell.name === "wild") {
          matches.push(cellKey(columnIndex, rowIndex));
        }
      });

      if (matches.length === 0) break;
      streak += 1;
      ways *= matches.length;
      cellsForSymbol.push(...matches);
    }

    if (streak >= 3) {
      cellsForSymbol.forEach((key) => winningCells.add(key));
      payout += Math.max(1, Math.floor((betAmount * symbol.pay * ways * multiplier) / 8.8));
    }
  }

  return { payout, winningCells: Array.from(winningCells) };
}

function scatterCells(grid) {
  const cells = [];
  grid.forEach((column, columnIndex) => {
    column.forEach((symbol, rowIndex) => {
      if (symbol.scatter) cells.push(cellKey(columnIndex, rowIndex));
    });
  });
  return cells;
}

function scatterAward(scatterCount) {
  if (scatterCount >= 5) return freeSpinAwards[5];
  if (scatterCount >= 4) return freeSpinAwards[4];
  if (scatterCount >= 3) return freeSpinAwards[3];
  return 0;
}

function renderMultiplier(activeIndex = -1, bonus = state.bonusActive) {
  const multipliers = bonus ? freeSpinCascadeMultipliers : baseCascadeMultipliers;
  el.multiplierSteps.forEach((step, index) => {
    step.textContent = `x${multipliers[index]}`;
    step.classList.toggle("active", index === activeIndex);
    step.classList.toggle("bonus", bonus);
  });
}

function flashChipDeduction() {
  el.chips.classList.remove("deducting");
  window.requestAnimationFrame(() => {
    el.chips.classList.add("deducting");
  });
}

function showBonusBanner(message) {
  el.bonusText.textContent = message;
  el.bonusBanner.hidden = false;
  el.bonusBanner.classList.remove("show");
  window.requestAnimationFrame(() => {
    el.bonusBanner.classList.add("show");
  });
}

function hideBonusBanner() {
  el.bonusBanner.classList.remove("show");
  el.bonusBanner.hidden = true;
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

function renderAutoOptions() {
  el.autoOptions.innerHTML = "";
  autoSpinOptions.forEach((count) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `auto-option ${count === state.selectedAutoSpins ? "active" : ""}`;
    button.textContent = `Auto ${count}`;
    button.disabled = state.autoSpinning || state.bonusActive;
    button.addEventListener("click", () => {
      state.selectedAutoSpins = count;
      render();
    });
    el.autoOptions.appendChild(button);
  });
}

function setBet(nextBet) {
  state.bet = Math.max(bets[0], Math.min(bets[bets.length - 1], nextBet));
  saveState();
  render();
}

function isConnectedToRitual() {
  return Boolean(state.account) && state.chainId === RITUAL_CHAIN.chainId;
}

function hasActiveFreeSpin() {
  return state.freeSpinsRemaining > 0;
}

function canPlay() {
  return isConnectedToRitual() && (state.chips >= state.bet || hasActiveFreeSpin());
}

function render() {
  el.chips.textContent = state.chips.toLocaleString();
  el.remainingSpins.textContent = Math.floor(state.chips / state.bet).toLocaleString();
  el.freeSpinCounter.textContent = state.freeSpinsRemaining.toLocaleString();
  el.betLabel.textContent = state.bet.toLocaleString();
  el.spinCount.textContent = state.spinCount.toLocaleString();
  el.bestWin.textContent = state.bestWin.toLocaleString();
  el.ritualBalance.textContent = `${state.ritualBalance} RITUAL`;
  el.sideRitualBalance.textContent = `${state.ritualBalance} RITUAL`;
  el.spinButton.disabled = state.spinning || !canPlay();
  el.autoSpinButton.textContent = state.autoSpinning ? `Stop ${state.autoRemaining}` : "Auto";
  el.autoSpinButton.classList.toggle("active", state.autoSpinning);
  el.autoSpinButton.disabled = (!state.autoSpinning && !canPlay()) || state.bonusActive;

  if (!state.account) {
    el.networkStatus.textContent = "Not connected";
    el.connectWallet.hidden = false;
  } else {
    const chainLabel = state.chainId === RITUAL_CHAIN.chainId ? "Ritual" : `Chain ${state.chainId}`;
    el.networkStatus.textContent = `${chainLabel} · ${shortAddress(state.account)}`;
    el.connectWallet.hidden = true;
  }

  renderBets();
  renderAutoOptions();
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
    if (state.account) loadWalletState(state.account);
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
  if (!isConnectedToRitual()) {
    stopAutoSpin();
    log("Connect wallet ke Ritual testnet dulu sebelum spin.");
    return;
  }

  const isFreeSpin = hasActiveFreeSpin();
  const spinBet = isFreeSpin ? state.lastFreeSpinBet || state.bet : state.bet;

  if (!isFreeSpin && state.chips < state.bet) {
    stopAutoSpin();
    log("Chip tidak cukup. Beli chip dulu atau turunkan bet.");
    return;
  }

  state.spinning = true;
  if (state.autoSpinning && !isFreeSpin) state.autoRemaining = Math.max(0, state.autoRemaining - 1);

  if (isFreeSpin) {
    state.freeSpinsRemaining -= 1;
    el.resultText.textContent = `Free Spin ${state.freeSpinsTotal - state.freeSpinsRemaining}/${state.freeSpinsTotal}.`;
    showBonusBanner(`${state.freeSpinsRemaining} free spin tersisa. Multiplier bonus aktif.`);
  } else {
    state.chips -= state.bet;
    state.spinCount += 1;
    el.resultText.textContent = `Bet -${state.bet.toLocaleString()} chips. Reels spinning...`;
    flashChipDeduction();
  }

  el.lastWin.textContent = "0";
  el.reels.classList.add("spinning");
  saveState();
  render();

  await new Promise((resolve) => setTimeout(resolve, isFreeSpin ? 640 : 520));
  el.resultText.textContent = isFreeSpin ? "Golden reels charging..." : "Almost there...";
  await new Promise((resolve) => setTimeout(resolve, isFreeSpin ? 560 : 460));

  let grid = buildSpinGrid({ bonus: isFreeSpin, allowScatter: true });
  let totalPayout = 0;
  let cascadeIndex = 0;
  const multipliers = isFreeSpin ? freeSpinCascadeMultipliers : baseCascadeMultipliers;
  const scatterMatches = scatterCells(grid);
  const award = scatterAward(scatterMatches.length);

  drawReels(grid, award > 0 ? scatterMatches : []);
  el.reels.classList.remove("spinning");

  if (award > 0) {
    await new Promise((resolve) => setTimeout(resolve, 420));
    if (isFreeSpin) {
      const retrigger = Math.min(5, Math.ceil(award / 3));
      state.freeSpinsRemaining += retrigger;
      state.freeSpinsTotal += retrigger;
      showBonusBanner(`Retrigger +${retrigger} free spins dari Golden Dragon scatter.`);
      log(`Bonus retrigger +${retrigger} free spins.`);
    } else {
      state.freeSpinsRemaining += award;
      state.freeSpinsTotal = award;
      state.freeSpinWin = 0;
      state.bonusActive = true;
      state.lastFreeSpinBet = spinBet;
      showBonusBanner(`${scatterMatches.length} Golden Dragon scatter: ${award} free spins unlocked.`);
      log(`${award} Free Spins aktif. Spin gratis memakai bet ${spinBet.toLocaleString()} chips.`);
    }
    render();
    await new Promise((resolve) => setTimeout(resolve, 760));
  }

  while (cascadeIndex < multipliers.length) {
    const multiplier = multipliers[cascadeIndex];
    const { payout, winningCells } = calculateWin(grid, multiplier, spinBet);
    if (payout <= 0 || winningCells.length === 0) break;

    renderMultiplier(cascadeIndex, isFreeSpin);
    totalPayout += payout;
    if (isFreeSpin) state.freeSpinWin += payout;
    el.lastWin.textContent = totalPayout.toLocaleString();
    el.resultText.textContent = `${isFreeSpin ? "Bonus " : ""}Win x${multiplier}: ${payout.toLocaleString()} chips.`;
    drawReels(grid, winningCells);
    await new Promise((resolve) => setTimeout(resolve, isFreeSpin ? 440 : 360));
    drawReels(grid, winningCells, true);
    el.resultText.textContent = `Pecah x${multiplier}, cascade lanjut...`;
    await new Promise((resolve) => setTimeout(resolve, isFreeSpin ? 520 : 430));
    const followUpChance = isFreeSpin
      ? cascadeIndex === 0
        ? 0.075
        : cascadeIndex === 1
          ? 0.032
          : 0.012
      : cascadeIndex === 0
        ? 0.055
        : cascadeIndex === 1
          ? 0.022
          : 0.008;
    grid = makeControlledCascadeGrid(grid, winningCells, Math.random() < followUpChance, {
      bonus: isFreeSpin,
      allowScatter: isFreeSpin,
    });
    drawReels(grid);
    await new Promise((resolve) => setTimeout(resolve, isFreeSpin ? 340 : 260));
    cascadeIndex += 1;
  }

  state.chips += totalPayout;
  state.bestWin = Math.max(state.bestWin, totalPayout);
  state.deadStreak = totalPayout > 0 || award > 0 ? 0 : state.deadStreak + 1;
  state.spinning = false;
  el.lastWin.textContent = totalPayout.toLocaleString();
  el.resultText.textContent =
    totalPayout > 0
      ? `${isFreeSpin ? "Bonus total" : "Total menang"} ${totalPayout.toLocaleString()} chips.`
      : award > 0
        ? "Bonus siap. Free spins dimulai otomatis."
        : state.deadStreak >= 3
          ? "Dead spin. Momentum sedang dingin."
          : "Near miss. Coba spin lagi.";
  renderMultiplier(-1, hasActiveFreeSpin());
  saveState();
  render();

  if (state.freeSpinsRemaining > 0) {
    state.autoTimer = window.setTimeout(spin, 1050);
    return;
  }

  if (state.bonusActive) {
    const bonusWin = state.freeSpinWin;
    showBonusBanner(`Bonus selesai. Total bonus win ${bonusWin.toLocaleString()} chips.`);
    log(`Free Spins selesai. Total bonus win ${bonusWin.toLocaleString()} chips.`);
    resetBonusState();
    window.setTimeout(() => {
      hideBonusBanner();
      renderMultiplier(-1, false);
      render();
    }, 1600);
  }

  if (state.autoSpinning) {
    if (state.autoRemaining <= 0) {
      stopAutoSpin();
      log("Auto Spin selesai.");
    } else if (state.chips >= state.bet) {
      state.autoTimer = window.setTimeout(spin, 900);
    } else {
      stopAutoSpin();
      log("Auto Spin berhenti karena chip tidak cukup.");
    }
  }
}

function stopAutoSpin() {
  state.autoSpinning = false;
  state.autoRemaining = 0;
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

  if (!isConnectedToRitual()) {
    log("Connect wallet ke Ritual testnet dulu sebelum Auto Spin.");
    return;
  }

  if (state.bonusActive) {
    log("Auto Spin menunggu bonus round selesai.");
    return;
  }

  state.autoSpinning = true;
  state.autoRemaining = state.selectedAutoSpins;
  log(`Auto Spin ${state.selectedAutoSpins} aktif.`);
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
    if (state.account) {
      loadWalletState(state.account);
    } else {
      resetWalletState();
      stopAutoSpin();
    }
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
renderMultiplier(-1);
render();
