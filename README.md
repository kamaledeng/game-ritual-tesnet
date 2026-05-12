# Ritual Mahjong Ways

Static mahjong slot-style game for Ritual testnet. Players buy demo chips by sending Ritual testnet tokens to the configured owner address, then use those chips to spin.

## Features

- One mahjong slot game: Ritual Mahjong Ways
- Chip balances are stored per connected wallet address
- Chip cashier using Ritual testnet wallet transactions
- Owner payment address: `0xcf3da8d27bc354c8beb13a98205043e5c0967232`
- Quick bet controls: `10`, `20`, `50`, `100`, `250`, `500`
- 5x4 mahjong tile reels with left-to-right ways-style payouts
- Traditional-looking tile faces with characters, dots, bamboo, winds, dragons, and ivory styling
- Premium casino UI skin with dark wood, gold, jade, ivory, lighting, and polished controls
- Cascading wins with multiplier steps `x1`, `x2`, `x3`, `x5`
- Balanced casino rhythm with dead spins, near misses, rarer wins, and less frequent multiplier cascades
- Slot-style outcome balance with losing spins, small wins, medium wins, and rare bigger wins
- Auto Spin presets: `10`, `50`, `100`
- Win tile break/cascade visual effect
- Wallet connect with Ritual testnet chain config
- Static deployment path for GitHub and Vercel

## Ritual Testnet

- Chain ID: `1979`
- Hex chain ID: `0x7bb`
- RPC: `https://rpc.ritualfoundation.org`
- Explorer: `https://explorer.ritualfoundation.org`
- Native symbol: `RITUAL`

## Run Locally

Open `index.html` directly in a browser, or serve the folder with any static server.

To test the Vercel build output locally:

```bash
npm run build
```

## Deploy to Vercel via GitHub

1. Push this folder to a GitHub repository.
2. In Vercel, import the repository.
3. Use framework preset `Other`.
4. Leave build command empty.
5. Leave output directory empty or use `./`.

## Notes

This is a Ritual testnet demo game. For production or any real-value game, add a smart contract, receipt verification, provable randomness, anti-abuse controls, legal review, and jurisdiction-specific compliance.
