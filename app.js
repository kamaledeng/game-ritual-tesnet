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
const bets = [100, 250, 500, 1000, 2500, 5000, 10000, 15000];
const autoSpinOptions = [10, 50, 100];
const BOARD_COLUMNS = 5;
const BOARD_ROWS = 4;
const baseCascadeMultipliers = [1, 2, 3, 5];
const freeSpinCascadeMultipliers = [2, 4, 6, 10];
const freeSpinAwards = {
  3: 12,
  4: 14,
  5: 16,
};
const chipPackages = [
  { ritual: "0.01", chips: 1000 },
  { ritual: "0.05", chips: 6000 },
  { ritual: "0.1", chips: 15000 },
];

const SPIN_SPEED_IDS = ["slow", "normal", "turbo"];
const DEFAULT_MATH_PROFILE = "high-domino";
const MATH_PROFILES = {
  balanced: {
    label: "Balanced",
    payoutDivisor: 25,
    bonusTriggerChance: 0.0045,
    symbolChances: {
      base: { scatter: 0.0074, wild: 0.0092 },
      bonus: { scatter: 0.0046, wild: 0.012 },
    },
    weights: {
      base: { dead: 0.35, near: 0.2, small: 0.3, medium: 0.13, big: 0.02 },
      bonus: { dead: 0.25, near: 0.2, small: 0.3, medium: 0.17, big: 0.08 },
    },
    deadStreakCap: 5,
    deadStreakShift: 0.02,
  },
  "royal-domino": {
    label: "Royal Domino",
    payoutDivisor: 28,
    bonusTriggerChance: 0.0032,
    symbolChances: {
      base: { scatter: 0.006, wild: 0.0085 },
      bonus: { scatter: 0.004, wild: 0.0105 },
    },
    weights: {
      base: { dead: 0.45, near: 0.22, small: 0.25, medium: 0.07, big: 0.01 },
      bonus: { dead: 0.3, near: 0.25, small: 0.28, medium: 0.14, big: 0.03 },
    },
    deadStreakCap: 6,
    deadStreakShift: 0.012,
  },
  "high-domino": {
    label: "High Domino",
    payoutDivisor: 25,
    bonusTriggerChance: 0.0038,
    symbolChances: {
      base: { scatter: 0.0065, wild: 0.0105 },
      bonus: { scatter: 0.0044, wild: 0.013 },
    },
    weights: {
      base: { dead: 0.5, near: 0.18, small: 0.22, medium: 0.08, big: 0.02 },
      bonus: { dead: 0.28, near: 0.22, small: 0.26, medium: 0.17, big: 0.07 },
    },
    deadStreakCap: 6,
    deadStreakShift: 0.016,
  },
};

const symbols = [
  { name: "char-1", suit: "character", rank: 1, pay: 5, tone: "red", mark: "\u4e00", suitMark: "\u842c" },
  { name: "char-5", suit: "character", rank: 5, pay: 8, tone: "red", mark: "\u4e94", suitMark: "\u842c" },
  { name: "char-8", suit: "character", rank: 8, pay: 12, tone: "red", mark: "\u516b", suitMark: "\u842c" },
  { name: "dot-2", suit: "dots", rank: 2, pay: 4, tone: "blue", mark: "2", suitMark: "\u7b52" },
  { name: "dot-5", suit: "dots", rank: 5, pay: 6, tone: "blue", mark: "5", suitMark: "\u7b52" },
  { name: "bamboo-3", suit: "bamboo", rank: 3, pay: 5, tone: "green", mark: "3", suitMark: "\u7d22" },
  { name: "bamboo-6", suit: "bamboo", rank: 6, pay: 8, tone: "green", mark: "6", suitMark: "\u7d22" },
  { name: "east", suit: "wind", rank: 0, pay: 10, tone: "blue", mark: "\u6771", suitMark: "\u98a8" },
  { name: "red-dragon", suit: "dragon", rank: 0, pay: 15, tone: "red", mark: "\u4e2d", suitMark: "\u9f8d" },
  { name: "green-dragon", suit: "dragon", rank: 0, pay: 20, tone: "green", mark: "\u767c", suitMark: "\u9f8d" },
  { name: "white-dragon", suit: "dragon", rank: 0, pay: 25, tone: "blue", mark: "\u767d", suitMark: "\u9f8d" },
  { name: "wild", suit: "wild", rank: 0, pay: 0, tone: "gold", mark: "\u767e\u642d", suitMark: "WILD" },
  {
    name: "gold-dragon-scatter",
    suit: "scatter",
    rank: 0,
    pay: 0,
    tone: "scatter",
    mark: "\u9f8d",
    suitMark: "\u91d1",
    scatter: true,
  },
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
  spinSpeed: saved.spinSpeed,
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
  machine: document.querySelector(".machine"),
  reelsFrame: document.querySelector(".reels-frame"),
  cinematicOverlay: document.querySelector("#cinematicOverlay"),
  winPopupLayer: document.querySelector("#winPopupLayer"),
  winLines: document.querySelector("#winLines"),
};

function spinSpeedFactor() {
  if (state.spinSpeed === "slow") return 1.55;
  if (state.spinSpeed === "turbo") return 0.34;
  return 1;
}

function spinDelay(ms) {
  return Math.max(12, Math.round(ms * spinSpeedFactor()));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, spinDelay(ms)));
}

function sleepAuto(ms) {
  if (state.autoSpinning) {
    return new Promise((resolve) => setTimeout(resolve, Math.max(80, Math.round(ms * spinSpeedFactor() * 1.25))));
  }
  return sleep(ms);
}

function applySpinSpeedTheme() {
  document.documentElement.dataset.spinSpeed = state.spinSpeed;
}

function setSpinSpeed(next) {
  if (!SPIN_SPEED_IDS.includes(next) || state.spinning) return;
  state.spinSpeed = next;
  saveState();
  applySpinSpeedTheme();
  render();
  if (next === "slow") log("Slow Speed — longer animation & sound.");
  else if (next === "turbo") log("Fast Speed — turbo spin, compact cascade.");
  else log("Normal Speed — standard casino rhythm.");
}

function activeMathProfile() {
  return MATH_PROFILES[DEFAULT_MATH_PROFILE] || MATH_PROFILES.balanced;
}

function normalizeWeights(weights) {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  if (total <= 0) return weights;
  return Object.fromEntries(entries.map(([k, v]) => [k, v / total]));
}

function applyDeadStreakShift(weights, profile) {
  const streak = Math.min(state.deadStreak, profile.deadStreakCap);
  const shift = Math.max(0, streak * profile.deadStreakShift);
  if (shift <= 0) return weights;

  const minDead = 0.12;
  const removable = Math.max(0, weights.dead - minDead);
  const removed = Math.min(removable, shift);
  if (removed <= 0) return weights;

  const next = { ...weights };
  next.dead -= removed;
  next.near += removed * 0.32;
  next.small += removed * 0.44;
  next.medium += removed * 0.18;
  next.big += removed * 0.06;
  return normalizeWeights(next);
}

function pickWeighted(weights) {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  let r = Math.random() * total;
  for (const [key, value] of entries) {
    r -= value;
    if (r <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

function readSavedSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    const spinSpeed = SPIN_SPEED_IDS.includes(parsed.spinSpeed) ? parsed.spinSpeed : "normal";
    return {
      bet: bets.includes(Number(parsed.bet)) ? Number(parsed.bet) : bets[2],
      spinSpeed,
    };
  } catch {
    return { bet: bets[2], spinSpeed: "normal" };
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
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ bet: state.bet, spinSpeed: state.spinSpeed }));

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

let audioCtx = null;

function getAudioContext() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  return audioCtx;
}

async function resumeAudio() {
  const ctx = getAudioContext();
  if (ctx?.state === "suspended") await ctx.resume().catch(() => {});
}

function playOscTone({ freq = 440, durationMs = 90, type = "sine", gain = 0.07, freqEnd }) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, ctx.currentTime);
  if (freqEnd != null) {
    o.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), ctx.currentTime + durationMs / 1000);
  }
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + durationMs / 1000 + 0.02);
}

function sfxBetTick() {
  playOscTone({ freq: 620, durationMs: 38, type: "square", gain: 0.032 });
}

function sfxReelWind() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "triangle";
  o.frequency.setValueAtTime(170, ctx.currentTime);
  o.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.32);
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.042, ctx.currentTime + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.36);
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.4);
}

function sfxNearMiss() {
  playOscTone({ freq: 185, durationMs: 200, type: "sawtooth", gain: 0.052, freqEnd: 95 });
  window.setTimeout(() => playOscTone({ freq: 205, durationMs: 150, type: "triangle", gain: 0.038, freqEnd: 105 }), 110);
}

function sfxSmallWin() {
  playOscTone({ freq: 650, durationMs: 52, type: "sine", gain: 0.058 });
  window.setTimeout(() => playOscTone({ freq: 870, durationMs: 75, type: "sine", gain: 0.052 }), 48);
}

function sfxCascade() {
  playOscTone({ freq: 510, durationMs: 68, type: "triangle", gain: 0.056 });
  window.setTimeout(() => playOscTone({ freq: 720, durationMs: 88, type: "sine", gain: 0.048 }), 55);
}

function sfxBigWin() {
  playOscTone({ freq: 328, durationMs: 115, type: "sine", gain: 0.075 });
  window.setTimeout(() => playOscTone({ freq: 436, durationMs: 130, type: "sine", gain: 0.07 }), 85);
  window.setTimeout(() => playOscTone({ freq: 554, durationMs: 200, type: "triangle", gain: 0.06 }), 160);
}

function sfxScatterFanfare() {
  [392, 494, 587, 784].forEach((f, i) => {
    window.setTimeout(() => playOscTone({ freq: f, durationMs: 150, type: "sine", gain: 0.065 }), i * 82);
  });
}

function sfxChipDrop() {
  playOscTone({ freq: 900, durationMs: 42, type: "square", gain: 0.038 });
  window.setTimeout(() => playOscTone({ freq: 1180, durationMs: 32, type: "sine", gain: 0.028 }), 36);
}

function sfxMultiplierPing(stepIndex) {
  const base = 430 + stepIndex * 105;
  playOscTone({ freq: base, durationMs: 110, type: "triangle", gain: 0.06, freqEnd: base * 1.06 });
}

function clearWinPopups() {
  if (el.winPopupLayer) el.winPopupLayer.innerHTML = "";
}

function showWinPopup(amount, variant = "default") {
  if (!el.winPopupLayer || amount <= 0) return;
  const pill = document.createElement("div");
  pill.className = `win-popup win-popup--${variant}`;
  pill.textContent = `+${amount.toLocaleString()}`;
  el.winPopupLayer.appendChild(pill);
  window.requestAnimationFrame(() => pill.classList.add("visible"));
  window.setTimeout(() => {
    pill.classList.remove("visible");
    window.setTimeout(() => pill.remove(), spinDelay(440));
  }, variant === "mega" ? spinDelay(1900) : spinDelay(1000));
}

function showScatterCinematic() {
  const ov = el.cinematicOverlay;
  if (!ov) return;
  ov.hidden = false;
  ov.classList.add("cinematic--scatter-active");
  window.setTimeout(() => {
    ov.classList.remove("cinematic--scatter-active");
    ov.hidden = true;
  }, spinDelay(2600));
}

function pulseReelStopPhase() {
  el.reelsFrame?.classList.add("reels-frame--stopping");
  window.setTimeout(() => el.reelsFrame?.classList.remove("reels-frame--stopping"), spinDelay(920));
}

function setNearMissSuspense(on) {
  el.reels?.classList.toggle("near-miss-suspense", on);
  el.reelsFrame?.classList.toggle("near-miss-frame", on);
}

function shakeMachine(intensity = "normal") {
  if (!el.machine) return;
  el.machine.classList.remove("shake-soft", "shake-hard");
  void el.machine.offsetWidth;
  el.machine.classList.add(intensity === "hard" ? "shake-hard" : "shake-soft");
  window.setTimeout(
    () => el.machine.classList.remove("shake-soft", "shake-hard"),
    spinDelay(intensity === "hard" ? 700 : 460),
  );
}

function renderWinLines(winningCells) {
  if (!el.winLines || !el.reelsFrame) return;
  el.winLines.innerHTML = "";
  if (!winningCells || winningCells.length === 0) return;
  const reelEls = el.reels.querySelectorAll(".reel");
  if (!reelEls.length) return;
  const frameRect = el.reelsFrame.getBoundingClientRect();
  el.winLines.setAttribute("viewBox", `0 0 ${frameRect.width} ${frameRect.height}`);
  const pointsByColumn = Array.from({ length: BOARD_COLUMNS }, () => []);
  winningCells.forEach((key) => {
    const [col, row] = key.split("-").map(Number);
    const reel = reelEls[col];
    const cell = reel?.children?.[row];
    if (!cell) return;
    const rect = cell.getBoundingClientRect();
    pointsByColumn[col].push({
      x: rect.left - frameRect.left + rect.width / 2,
      y: rect.top - frameRect.top + rect.height / 2,
    });
  });
  pointsByColumn.forEach((points) => points.sort((a, b) => a.y - b.y));
  const paths = [];
  for (let col = 0; col < BOARD_COLUMNS - 1; col += 1) {
    const left = pointsByColumn[col];
    const right = pointsByColumn[col + 1];
    if (!left.length || !right.length) continue;
    left.forEach((p) => {
      let best = right[0];
      let bestDist = Math.abs(best.y - p.y);
      for (let i = 1; i < right.length; i += 1) {
        const dist = Math.abs(right[i].y - p.y);
        if (dist < bestDist) {
          best = right[i];
          bestDist = dist;
        }
      }
      paths.push({ a: p, b: best });
    });
  }
  paths.slice(0, 10).forEach(({ a, b }) => {
    const midX = (a.x + b.x) / 2;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${a.x} ${a.y} Q ${midX} ${a.y} ${b.x} ${b.y}`);
    el.winLines.appendChild(path);
  });
  paths.slice(0, 10).forEach(({ a, b }) => {
    const c1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c1.setAttribute("cx", String(a.x));
    c1.setAttribute("cy", String(a.y));
    c1.setAttribute("r", "3.2");
    el.winLines.appendChild(c1);
    const c2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c2.setAttribute("cx", String(b.x));
    c2.setAttribute("cy", String(b.y));
    c2.setAttribute("r", "3.2");
    el.winLines.appendChild(c2);
  });
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

function pickPayingWeightedSymbol() {
  const pool = payingSymbols();
  const weights = pool.map((s) => {
    const p = s.pay;
    if (p <= 4) return 30;
    if (p <= 7) return 18;
    if (p <= 10) return 10;
    return 5;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i += 1) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

function randomSymbol(options = {}) {
  const { bonus = false, allowScatter = true } = options;
  const roll = Math.random();
  const profile = activeMathProfile();
  const symbolChances = bonus ? profile.symbolChances.bonus : profile.symbolChances.base;
  const scatterChance = symbolChances.scatter;
  const wildChance = symbolChances.wild;

  if (allowScatter && roll < scatterChance) return cloneSymbol(getSymbol("gold-dragon-scatter"));
  if (roll < scatterChance + wildChance) return cloneSymbol(getSymbol("wild"));

  return cloneSymbol(pickPayingWeightedSymbol());
}

function makeGrid(options = {}) {
  return Array.from({ length: BOARD_COLUMNS }, () =>
    Array.from({ length: BOARD_ROWS }, () => randomSymbol(options)),
  );
}

function applyGoldPlating(grid, options = {}) {
  const { bonus = false } = options;
  const chance = bonus ? 0.2 : 0.14;
  for (let columnIndex = 1; columnIndex <= 3; columnIndex += 1) {
    grid[columnIndex].forEach((symbol) => {
      if (symbol.plated !== undefined) return;
      if (symbol.scatter || symbol.name === "wild") {
        symbol.plated = false;
        return;
      }
      symbol.plated = Math.random() < chance;
    });
  }
}

function pickPayingSymbol() {
  return pickPayingWeightedSymbol();
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
  const profile = activeMathProfile();
  if (!bonus && Math.random() < profile.bonusTriggerChance) return "bonus";

  const baseWeights = bonus ? profile.weights.bonus : profile.weights.base;
  const shifted = bonus ? normalizeWeights({ ...baseWeights }) : applyDeadStreakShift(normalizeWeights({ ...baseWeights }), profile);
  return pickWeighted(shifted);
}

function buildSpinGrid(options = {}) {
  const target = chooseSpinTarget(options);

  if (target === "dead") {
    const grid = makeDeadGrid(options);
    applyGoldPlating(grid, options);
    return { grid, target };
  }
  if (target === "near") {
    const grid = makeNearMissGrid(options);
    applyGoldPlating(grid, options);
    return { grid, target };
  }
  if (target === "bonus") {
    const grid = makeScatterTriggerGrid();
    applyGoldPlating(grid, options);
    return { grid, target };
  }

  const roll = Math.random();
  const grid = makeGrid(options);
  const matchSymbol = pickPayingSymbol();
  const matchReels =
    target === "small" ? 3 : target === "medium" ? (roll < 0.68 ? 3 : 4) : roll < 0.62 ? 4 : 5;
  const minPerReel = target === "big" ? 2 : 1;

  for (let column = 0; column < matchReels; column += 1) {
    const usedRows = new Set();
    const extraRowChance = target === "small" ? 0.26 : target === "medium" ? 0.38 : 0.5;
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
    const wildCount = Math.random() < 0.72 ? 1 : 2;
    for (let count = 0; count < wildCount; count += 1) {
      grid[Math.floor(Math.random() * BOARD_COLUMNS)][Math.floor(Math.random() * BOARD_ROWS)] =
        cloneSymbol(wild);
    }
  }

  applyGoldPlating(grid, options);
  return { grid, target };
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
      <span class="tile-scatter-halo" aria-hidden="true"></span>
      <span class="tile-corner tile-corner--scatter">${symbol.suitMark}</span>
      <span class="tile-main tile-main--scatter">${symbol.mark}</span>
      <span class="tile-sub tile-sub--scatter">FREE SPIN</span>
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

function drawReels(grid = makeGrid({ allowScatter: false }), winningCells = [], breaking = false, landPop = false) {
  const winningSet = new Set(winningCells);
  el.reels.innerHTML = "";
  grid.forEach((column, columnIndex) => {
    const reel = document.createElement("div");
    reel.className = "reel";
    reel.style.setProperty("--reel-index", String(columnIndex));
    column.forEach((symbol, rowIndex) => {
      const isWinning = winningSet.has(cellKey(columnIndex, rowIndex));
      const cell = document.createElement("div");
      cell.className = `symbol symbol--${symbol.tone} ${symbol.plated ? "symbol--plated" : ""} ${
        isWinning ? "win" : ""
      } ${breaking && isWinning ? "breaking" : ""}`;
      if (landPop) {
        cell.classList.add("symbol--land-pop");
        cell.style.setProperty("--sym-delay", `${columnIndex * 140 + rowIndex * 18}ms`);
      }
      cell.innerHTML = tileFace(symbol);
      reel.appendChild(cell);
    });
    el.reels.appendChild(reel);
  });
}

function makeCascadeGrid(grid, winningCells, options = {}) {
  const winningSet = new Set(winningCells);
  const wild = getSymbol("wild");
  const nextGrid = grid.map((column, columnIndex) => {
    const survivors = [];
    column.forEach((symbol, rowIndex) => {
      const key = cellKey(columnIndex, rowIndex);
      if (winningSet.has(key)) {
        if (columnIndex >= 1 && columnIndex <= 3 && symbol.plated && !symbol.scatter && symbol.name !== "wild") {
          survivors.push(cloneSymbol(wild));
        }
        return;
      }
      survivors.push(symbol);
    });
    const refill = Array.from({ length: BOARD_ROWS - survivors.length }, () => randomSymbol(options));
    return [...refill, ...survivors];
  });
  applyGoldPlating(nextGrid, options);
  return nextGrid;
}

function makeForcedWinGrid(options = {}) {
  const grid = makeGrid(options);
  const symbol = pickPayingWeightedSymbol();
  
  // Create a guaranteed 3-symbol win on first 3 reels
  for (let col = 0; col < 3; col++) {
    const row = Math.floor(Math.random() * BOARD_ROWS);
    grid[col][row] = cloneSymbol(symbol);
  }
  
  return grid;
}

function makeControlledCascadeGrid(grid, winningCells, allowFollowUp, options = {}) {
  if (allowFollowUp) return makeCascadeGrid(grid, winningCells, options);

  // For cascade 1: 70% chance to allow follow-up
  // For cascade 2: 40% chance to allow follow-up  
  // For cascade 3: 15% chance to allow follow-up
  const followUpChance = options.cascadeIndex === 0 ? 0.7 : 
                        options.cascadeIndex === 1 ? 0.4 : 0.15;
  
  if (Math.random() < followUpChance) {
    return makeCascadeGrid(grid, winningCells, options);
  }

  // Try to create a cascade with smaller wins
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const nextGrid = makeCascadeGrid(grid, winningCells, options);
    const result = calculateWin(nextGrid, 1);
    // Allow small wins instead of zero
    if (result.payout <= options.betAmount * 0.3) return nextGrid;
  }

  return makeCascadeGrid(grid, winningCells, options);
}

function calculateWin(grid, multiplier = 1, betAmount = state.bet) {
  const divisor = activeMathProfile().payoutDivisor;
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
      payout += Math.max(1, Math.floor((betAmount * symbol.pay * ways * multiplier) / divisor));
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
  if (scatterCount < 3) return 0;
  return 12 + (scatterCount - 3) * 2;
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
  document.documentElement.dataset.connected = isConnectedToRitual() ? "true" : "false";
  el.chips.textContent = state.chips.toLocaleString();
  el.remainingSpins.textContent = Math.floor(state.chips / state.bet).toLocaleString();
  el.freeSpinCounter.textContent = state.freeSpinsRemaining.toLocaleString();
  el.betLabel.textContent = state.bet.toLocaleString();
  el.spinCount.textContent = state.spinCount.toLocaleString();
  el.bestWin.textContent = state.bestWin.toLocaleString();
  el.ritualBalance.textContent = `${state.ritualBalance} RITUAL`;
  el.sideRitualBalance.textContent = `${state.ritualBalance} RITUAL`;
  el.spinButton.disabled = state.spinning || !canPlay();
  el.autoSpinButton.textContent = state.autoSpinning ? "Stop" : "Auto";
  el.autoSpinButton.classList.toggle("active", state.autoSpinning);
  el.autoSpinButton.disabled = (!state.autoSpinning && !canPlay()) || state.bonusActive;
  if (state.autoSpinning) el.autoSpinButton.setAttribute("data-remaining", String(state.autoRemaining));
  else el.autoSpinButton.removeAttribute("data-remaining");

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
  el.machine?.classList.toggle("machine--free-spins", Boolean(state.bonusActive || hasActiveFreeSpin()));
  document.querySelectorAll(".speed-btn").forEach((btn) => {
    const on = btn.dataset.speed === state.spinSpeed;
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.disabled = state.spinning;
  });
  applySpinSpeedTheme();
}

async function ensureRitualChain() {
  if (!window.ethereum) {
    const fileUrlHint =
      window.location?.protocol === "file:"
        ? " Kalau kamu buka via file://, aktifkan izin extension untuk File URLs atau jalankan via local server (http://localhost)."
        : "";
    throw new Error(`Wallet browser extension not found.${fileUrlHint}`);
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
    log("Wallet connected. You can buy chips with RITUAL testnet.");
    resumeAudio();
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
    log("Connect wallet to Ritual testnet first before spinning.");
    return;
  }

  const isFreeSpin = hasActiveFreeSpin();
  const spinBet = isFreeSpin ? state.lastFreeSpinBet || state.bet : state.bet;

  if (!isFreeSpin && state.chips < state.bet) {
    stopAutoSpin();
    log("Insufficient chips. Buy chips first or lower bet.");
    return;
  }

  await resumeAudio();
  clearWinPopups();

  state.spinning = true;
  if (state.autoSpinning && !isFreeSpin) {
    state.autoRemaining = Math.max(0, state.autoRemaining - 1);
  }

  if (isFreeSpin) {
    state.freeSpinsRemaining -= 1;
    el.resultText.textContent = `Free Spin ${state.freeSpinsTotal - state.freeSpinsRemaining}/${state.freeSpinsTotal}.`;
    showBonusBanner(`${state.freeSpinsRemaining} free spin remaining. Bonus multiplier active.`);
  } else {
    state.chips -= state.bet;
    state.spinCount += 1;
    el.resultText.textContent = `Bet -${state.bet.toLocaleString()} chips. Reels spinning...`;
    flashChipDeduction();
    sfxChipDrop();
    for (let tick = 0; tick < 10; tick += 1) {
      window.setTimeout(() => sfxBetTick(), tick * spinDelay(52));
    }
  }

  el.lastWin.textContent = "0";
  el.reels.classList.add("spinning");
  el.reelsFrame?.classList.add("reels-frame--spin");
  sfxReelWind();
  saveState();
  render();

  const spinMs = isFreeSpin ? 1180 : 980;
  await sleep(spinMs * 0.42);
  pulseReelStopPhase();
  el.resultText.textContent = isFreeSpin ? "Golden Dragon reels..." : "Hampir berhenti...";
  await sleep(spinMs * 0.38);

  const { grid: builtGrid, target: spinTarget } = buildSpinGrid({ bonus: isFreeSpin, allowScatter: true });
  let grid = builtGrid;
  let totalPayout = 0;
  let cascadeIndex = 0;
  const multipliers = isFreeSpin ? freeSpinCascadeMultipliers : baseCascadeMultipliers;
  const scatterMatches = scatterCells(grid);
  const award = scatterAward(scatterMatches.length);

  el.reels.classList.remove("spinning");
  el.reelsFrame?.classList.remove("reels-frame--spin");
  renderWinLines([]);
  drawReels(grid, award > 0 ? scatterMatches : [], false, true);

  if (spinTarget === "near" && award === 0) {
    setNearMissSuspense(true);
    sfxNearMiss();
    await sleepAuto(680);
    setNearMissSuspense(false);
  }

  if (award > 0) {
    showScatterCinematic();
    sfxScatterFanfare();
    await sleepAuto(520);
    if (isFreeSpin) {
      state.freeSpinsRemaining += award;
      state.freeSpinsTotal += award;
      showBonusBanner(`Retrigger +${award} free spins dari Golden Dragon scatter.`);
      log(`Bonus retrigger +${award} free spins.`);
    } else {
      state.freeSpinsRemaining += award;
      state.freeSpinsTotal = award;
      state.freeSpinWin = 0;
      state.bonusActive = true;
      state.lastFreeSpinBet = spinBet;
      showBonusBanner(`${scatterMatches.length} scatter \u91d1\u9f8d: ${award} free spin terbuka.`);
      log(`${award} Free Spins aktif. Spin gratis memakai bet ${spinBet.toLocaleString()} chips.`);
    }
    render();
    await sleepAuto(820);
  }

  while (cascadeIndex < multipliers.length) {
    const multiplier = multipliers[cascadeIndex];
    const { payout, winningCells } = calculateWin(grid, multiplier, spinBet);

    if (payout <= 0 || winningCells.length === 0) {
      break;
    }

    sfxMultiplierPing(cascadeIndex);
    renderMultiplier(cascadeIndex, isFreeSpin);
    totalPayout += payout;
    if (isFreeSpin) state.freeSpinWin += payout;
    el.lastWin.textContent = totalPayout.toLocaleString();
    el.resultText.textContent = `${isFreeSpin ? "Bonus " : ""}Menang x${multiplier}: ${payout.toLocaleString()} chip.`;
    drawReels(grid, winningCells);
    renderWinLines(winningCells);
    const popVariant = payout >= spinBet * 18 || cascadeIndex >= 2 ? "burst" : "default";
    showWinPopup(payout, popVariant);
    if (cascadeIndex === 0) sfxSmallWin();
    else sfxCascade();
    await sleepAuto(isFreeSpin ? 420 : 340);

    el.reelsFrame?.classList.add("cascade-settling");
    drawReels(grid, winningCells, true);
    el.resultText.textContent = `Cascade x${multiplier}...`;
    await sleepAuto(isFreeSpin ? 480 : 400);
    el.reelsFrame?.classList.remove("cascade-settling");
    renderWinLines([]);
    grid = makeCascadeGrid(grid, winningCells, { bonus: isFreeSpin, allowScatter: isFreeSpin });
    drawReels(grid, [], false, true);
    await sleepAuto(isFreeSpin ? 360 : 280);
    cascadeIndex += 1;
  }

  state.chips += totalPayout;
  state.bestWin = Math.max(state.bestWin, totalPayout);
  state.deadStreak = totalPayout > 0 || award > 0 ? 0 : state.deadStreak + 1;
  state.spinning = false;

  const megaHit = totalPayout >= spinBet * 28;
  const bigHit = totalPayout >= spinBet * 12;
  if (megaHit) {
    sfxBigWin();
    shakeMachine("hard");
    showWinPopup(totalPayout, "mega");
  } else if (bigHit) {
    sfxBigWin();
    shakeMachine("soft");
    showWinPopup(totalPayout, "burst");
  } else if (totalPayout > 0 && award === 0) {
    sfxSmallWin();
  }

  el.lastWin.textContent = totalPayout.toLocaleString();
  el.resultText.textContent =
    totalPayout > 0
      ? `${isFreeSpin ? "Bonus total" : "Total menang"} ${totalPayout.toLocaleString()} chips.`
      : award > 0
        ? "Bonus siap. Free spins dimulai otomatis."
        : state.deadStreak >= 4
          ? "Dead spin. Polanya dingin sebentar."
          : spinTarget === "near"
            ? "Nyaris kena. Satu langkah lagi."
            : "Tanpa kemenangan kali ini.";
  renderMultiplier(-1, hasActiveFreeSpin());
  saveState();
  render();

  if (state.freeSpinsRemaining > 0) {
    state.autoTimer = window.setTimeout(spin, spinDelay(1400));
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
    }, spinDelay(1700));
  }

  // Auto spin logic - simplified
  if (state.autoSpinning && state.autoRemaining > 0) {
    state.autoTimer = window.setTimeout(() => {
      if (state.autoSpinning && state.autoRemaining > 0) {
        spin();
      }
    }, spinDelay(1350));
  } else if (state.autoSpinning && state.autoRemaining <= 0) {
    stopAutoSpin();
    log("Auto Spin selesai.");
  }
}

function stopAutoSpin() {
  if (state.autoTimer) {
    window.clearTimeout(state.autoTimer);
    state.autoTimer = null;
  }
  state.autoSpinning = false;
  state.autoRemaining = 0;
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

document.querySelectorAll(".speed-btn").forEach((btn) => {
  btn.addEventListener("click", () => setSpinSpeed(btn.dataset.speed));
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
applySpinSpeedTheme();
drawReels();
renderMultiplier(-1);
render();
