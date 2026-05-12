# Ritual Arcade Slots

Static slot-style demo game for Ritual testnet. The game uses original themes inspired by popular slot categories and does not include third-party game assets.

## Features

- 20 original slot-style themes
- Demo credit and bet controls
- Wallet connect with Ritual testnet chain config
- Optional on-chain spin memo using a zero-value self transaction
- Static deployment path for GitHub and Vercel

## Ritual Testnet

- Chain ID: `1979`
- Hex chain ID: `0x7bb`
- RPC: `https://rpc.ritualfoundation.org`
- Explorer: `https://explorer.ritualfoundation.org`
- Native symbol: `RITUAL`

## Run Locally

Open `index.html` directly in a browser, or serve the folder with any static server.

If you have Node tooling available:

```bash
node server.js
```

## Deploy to Vercel via GitHub

1. Push this folder to a GitHub repository.
2. In Vercel, import the repository.
3. Use the default static project settings.
4. Leave build command empty.
5. Leave output directory as project root.

## Notes

This is a demo game using session credits only. For a production game, add a smart contract, provable randomness, anti-abuse controls, legal review, and jurisdiction-specific compliance before using any real value.
