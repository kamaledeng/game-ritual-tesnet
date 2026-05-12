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
const STORAGE_KEY = "bonanza-fruit-ritual-state-v1";
const bets = [10, 20, 50, 100, 250, 500];
const chipPackages = [
  { ritual: "0.01", chips: 1000 },
  { ritual: "0.05", chips: 6000 },
  { ritual: "0.1", chips: 15000 },
];

const symbols = [
  { icon: "🍌", name: "banana", pay: 3 },
  { icon: "🍇", name: "grape", pay: 4 },
  { icon: "🍓", name: "strawberry", pay: 5 },
  { icon: "🍉", name: "melon", pay: 6 },
  { icon: "🍍", name: "pineapple", pay: 8 },
  { icon: "💎", name: "diamond", pay: 12 },
  { icon: "🍭", name: "scatter", pay: 0 },
];

const saved = readSavedState();
const state = {
  account: "",
  chainId: "",
  chips: saved.chips,
  bet: saved.bet,
  selectedPackage: chipPackages[0],
  spinCount: saved.spinCount,
  bestWin: saved.bestWin,
  spinning: false,
};

const el = {
  networkStatus: document.querySelector("#networkStatus"),
  connectWallet: document.querySelector("#connectWallet"),
  chips: document.querySelector("#chips"),
  reels: document.querySelector("#reels"),
  resultText: document.querySelector("#resultText"),
  lastWin: document.querySelector("#lastWin"),
  betLabel: document.querySelector("#betLabel"),
  decreaseBet: document.querySelector("#decreaseBet"),
  increaseBet: document.querySelector("#increaseBet"),
  quickBets: document.querySelector("#quickBets"),
  spinButton: document.querySelector("#spinButton"),
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

function log(message) {
  el.statusLog.textContent = message;
}

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function makeGrid() {
  return Array.from({ length: 6 }, () => Array.from({ length: 5 }, () => randomSymbol()));
}

function drawReels(grid = makeGrid(), winningNames = []) {
  el.reels.innerHTML = "";
  grid.forEach((column) => {
    const reel = document.createElement("div");
    reel.className = "reel";
    column.forEach((symbol) => {
      const cell = document.createElement("div");
      cell.className = `symbol ${winningNames.includes(symbol.name) ? "win" : ""}`;
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

  const scatters = grid.flat().filter((symbol) => symbol.name === "scatter").length;
  if (scatters >= 4) {
    payout += state.bet * scatters * 4;
    winningNames.push("scatter");
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
  el.betLabel.textContent = state.bet.toLocaleString();
  el.spinCount.textContent = state.spinCount.toLocaleString();
  el.bestWin.textContent = state.bestWin.toLocaleString();
  el.spinButton.disabled = state.spinning || state.chips < state.bet;

  if (!state.account) {
    el.networkStatus.textContent = "Not connected";
  } else {
    const chainLabel = state.chainId === RITUAL_CHAIN.chainId ? "Ritual" : `Chain ${state.chainId}`;
    el.networkStatus.textContent = `${chainLabel} · ${shortAddress(state.account)}`;
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

  const grid = makeGrid();
  const { payout, winningNames } = calculateWin(grid);
  state.chips += payout;
  state.bestWin = Math.max(state.bestWin, payout);
  state.spinning = false;

  drawReels(grid, winningNames);
  el.reels.classList.remove("spinning");
  el.lastWin.textContent = payout.toLocaleString();
  el.resultText.textContent =
    payout > 0 ? `Win ${payout.toLocaleString()} chips.` : "Belum menang, coba spin lagi.";

  saveState();
  render();
}

el.connectWallet.addEventListener("click", connectWallet);
el.buyChipsButton.addEventListener("click", buyChips);
el.spinButton.addEventListener("click", spin);
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
    render();
  });
  window.ethereum.on?.("chainChanged", (chainId) => {
    state.chainId = chainId;
    render();
  });
}

renderPackages();
drawReels();
render();
