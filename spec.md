# North Investors Profit Wallet

## Current State
Fully deployed dashboard with Coinbase-style dark theme, BTC/ETH market watch using static fallback prices, portfolio chart with mock data, and all broker features live. React 19 + TypeScript + Tailwind stack. No real-time price feeds.

## Requested Changes (Diff)

### Add
- `web3` npm package for Ethereum wallet interaction utilities in the browser
- `useLivePrices` custom hook that connects to Binance WebSocket stream (`wss://stream.binance.com:9443/stream`) for real-time BTC, ETH, and SOL prices
- Live price ticker bar at the top of the dashboard showing BTC, ETH, SOL, BNB prices with real-time updates and a pulsing green dot
- Wire MarketWatchCard to use live prices from the hook instead of static fallback values
- Web3 utility display in the Settings > Blockchain & Wallet section (ETH address generation demo using web3)

### Modify
- `MarketWatchCard` component: replace static price props with live WebSocket prices, show real-time % change calculated from price movement
- Dashboard: add live ticker bar above the hero section showing streaming prices
- Settings Blockchain section: add Web3.js wallet utilities (generate ETH address button)

### Remove
- Nothing removed

## Implementation Plan
1. Install `web3` package via package.json
2. Create `src/hooks/useLivePrices.ts` — WebSocket hook connecting to Binance public stream for BTC/ETH/SOL/BNB, reconnects on disconnect, exposes price + 24h change
3. Create `src/components/LiveTicker.tsx` — horizontal scrolling ticker bar with live coin prices
4. Update `App.tsx` — import and wire useLivePrices hook, pass live prices to MarketWatchCard, add LiveTicker component above HeroBanner
5. Add Web3 ETH address generator button in Settings Blockchain & Wallet section
6. Validate and deploy
