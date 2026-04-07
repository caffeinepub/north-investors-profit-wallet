# North Investors Profit Wallet

## Current State

- Full-stack ICP app: Motoko backend + React/TypeScript frontend
- Authentication is via Internet Identity (ICP's native auth system). Login/create account buttons on the landing page trigger the II popup flow.
- After II login, users fill in a name + email profile form. This is stored in the backend canister (stable storage).
- Crypto prices are fetched via WebSocket to Binance (`wss://stream.binance.com`). This WebSocket is frequently blocked on the Caffeine platform, showing `--` for all prices.
- Dashboard has full layout: balance card, withdrawal banner, activity feed, broker services, market watch, charts, etc.
- The `useLivePrices` hook handles all price fetching via WebSocket.

## Requested Changes (Diff)

### Add
- **Username/Password login form** on the landing page: a clean modal/inline form with fields for Username, Email Address, and Password. This replaces the II popup experience visually -- but the underlying ICP identity mechanism still authenticates. The form fields capture a username and email, which are then saved as the user profile after II auth completes.
- **Create Account form** with the same three fields (Username, Email, Password + Confirm Password). 
- **CoinGecko REST API price feed** as a replacement for the broken Binance WebSocket. Use `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin&vs_currencies=usd&include_24hr_change=true` with polling every 30 seconds.

### Modify
- **LandingPage login/create account buttons**: Instead of directly calling `login()` on click, clicking "Login" or "Create Account" opens a form-style modal/sheet where users enter Username, Email, and Password. After form submission, the app proceeds with Internet Identity auth (the fields are saved as the profile once II auth succeeds).
- **CreateAccountModal**: Add a Username field and a Password field (with confirm). Remove the "Secured with Internet Identity" note and replace with a standard security message.
- **`useLivePrices` hook**: Replace the Binance WebSocket implementation with a CoinGecko REST API polling approach. Poll every 30 seconds. Show loading state (`price: 0, live: false`) while first fetch is pending.
- **`CryptoTicker` / `LiveTicker` components**: Ensure they gracefully handle the loading state and show a spinner or "Loading..." instead of `--` while prices are being fetched.

### Remove
- The "Secured with Internet Identity" text from the create account modal.

## Implementation Plan

1. **Update `useLivePrices.ts`**: Replace the Binance WebSocket with a CoinGecko fetch + `setInterval(30s)`. Return `connected` as `true` after first successful fetch, `false` while loading.
2. **Update `LandingPage` component in `App.tsx`**: Add a "Login" modal with Username, Email, Password fields. On form submit, save the username/email to local state, then call `login()` to trigger II auth. After auth completes and profile is loaded/created, those form values are used as the profile.
3. **Update `CreateAccountModal` in `App.tsx`**: Add Username field and Password / Confirm Password fields. After form submit + II auth, save displayName=username, gmail=email to profile.
4. **Auth flow**: Keep Internet Identity as the actual authentication mechanism. The username/email/password fields are cosmetic (UX) -- they capture the user's desired display name and email, which are stored as the profile. Password is accepted by the form but is not transmitted to any server (II handles actual security).
5. **Fix `CryptoTicker`/`LiveTicker`**: Add loading state handling so prices show a spinner or skeleton rather than `--`.
