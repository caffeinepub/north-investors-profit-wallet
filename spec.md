# North Investors Profit Wallet

## Current State
Full-stack investment dashboard with Coinbase-style dark theme. Features: landing page, authenticated dashboard with BTC balance, portfolio chart, market watch, activity feed, broker services, deposit/withdrawal flow, statement page, send/receive money, deposit receipt flow, QR codes, and support chat. The navbar contains a non-functional 'Settings' link that just navigates to '/'.

## Requested Changes (Diff)

### Add
- **Settings Page/Modal** -- Clicking 'Settings' in the navbar opens a full Settings panel (either a dedicated page view or a large modal/drawer). The settings panel includes multiple sections:
  1. **Account Settings** -- Display name, Gmail address, account ID, verification status badge, account type (Investor/Premium)
  2. **Security Settings** -- Two-Factor Authentication toggle (simulated), session management (show active sessions, 'Sign out all devices' button), login history (last 3 logins with timestamps)
  3. **Notifications** -- Toggle notifications for: Deposits, Withdrawals, Price Alerts, Weekly Reports, Promotional updates
  4. **Privacy** -- Toggle: Hide balance from dashboard, Profile visibility (Public/Private)
  5. **Blockchain & Wallet** -- Show connected wallet addresses (BTC and USDT), blockchain network selector (Mainnet), transaction fee preference (Standard/Fast/Instant), gas fee estimator display, link/unlink wallet button, export private key (warning-gated UI)
  6. **Coinbase Integration** -- Section explaining Coinbase connectivity, 'Connect Coinbase Account' button (opens modal with API key + API secret fields), connected status display with last sync time, supported features list (auto-sync portfolio, price feeds, instant transfers), disconnect button when connected
  7. **Appearance** -- Theme selector (Dark/Light/Auto -- currently Dark is active and locked as default), currency display (USD/BTC/EUR)
  8. **About** -- App version, company info, legal links (Terms, Privacy Policy), support contact

### Modify
- Navbar 'Settings' link -- change from a dead `<a href="/">` to a button that triggers the settings panel to open
- Add a Settings icon button to the user pill area on mobile (since nav links are hidden on mobile)

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/components/SettingsPanel.tsx` -- a full-screen slide-in drawer or modal with tab/section navigation for all 8 settings sections listed above
2. Add state in `Dashboard` component: `const [showSettings, setShowSettings] = useState(false)`
3. Pass `onOpenSettings` prop to `NavBar` component
4. Update `NavBar` to call `onOpenSettings` when Settings link or icon is clicked
5. Render `<SettingsPanel>` inside `Dashboard` with `open/onOpenChange` props
6. SettingsPanel receives `displayName` and `btcAddress` props so it can pre-fill wallet/account info
7. All toggles are React state (simulated, no backend persistence needed)
8. Coinbase Connect modal is a nested dialog inside SettingsPanel
9. Blockchain section shows BTC address, USDT address, and a read-only network info section
