# North Investors Profit Wallet — Invoice, Statement & Send/Receive Features

## Current State
The app is a fully authenticated Coinbase-style dark dashboard at `/home/ubuntu/workspace/src/frontend/src/App.tsx`. It contains:
- Landing page + login via Internet Identity
- Dashboard (gated behind auth) with: NavBar, CryptoTicker, HeroBanner, AccountOverviewCard, DepositCard, PortfolioPerformanceCard, RecentActivityCard, MarketWatchCard, WithdrawalPolicyCard, BrokerServicesSection, MarketInsightsCard, Footer
- PaymentModal for Fund Account (BTC, USDT, card)
- SupportChat floating bot
- No invoice/statement page
- No send/receive money feature
- No Gmail/phone number management for account

## Requested Changes (Diff)

### Add
1. **AccountStatementPage** — A dedicated full-page statement/invoice view accessible from the dashboard NavBar (a new nav item: "Statement" or "Account Summary"). Shows:
   - Company header: North Investors Profit Wallet (NIPW) with logo/crest
   - Statement date and statement number (auto-generated, e.g. NIPW-2024-XXXXX)
   - Account holder name (from displayName)
   - Account details: BTC balance ($600,000), BTC address, USDT address, available balance
   - Deposit instructions: required deposit amount ($120,000 = 20% of $600,000), BTC and USDT wallet addresses with copy buttons
   - Transaction history / recent activity table
   - Status badge: "PENDING ACTIVATION — Awaiting Final Deposit"
   - Print button and Download as PDF button (uses window.print() or html2canvas/jsPDF)
   - Professional invoice-style layout with NIPW gold/dark branding

2. **SendMoneyModal** — A modal accessible from the dashboard (new "Send" button in NavBar or dashboard) with:
   - Recipient field: Gmail address input (e.g. ccapribit@gmail.com) OR phone number
   - Amount field (USD)
   - Network selector (BTC / USDT TRC-20)
   - Confirmation step showing recipient details
   - Simulated "Send" action (shows success confirmation toast — no real transfer)
   - Clean form with validation

3. **ReceiveMoneyCard** — A section or modal for receiving funds:
   - Displays BTC address and USDT TRC-20 address as QR-code-style display (or formatted address boxes)
   - "Add Gmail" option: user can input their Gmail address to associate with account for receiving
   - "Add Phone Number" option: user can input phone number to receive verification codes
   - Copy-to-clipboard for all addresses
   - Share button for address sharing

4. **Account Settings Section** — Accessible from dashboard ("Settings" icon already in NavBar or new tab):
   - Add/update Gmail address
   - Add/update phone number for 2FA / code receiving
   - Display current account email and phone

### Modify
- **NavBar**: Add "Statement" link and "Send" button alongside existing "Fund Account" button
- **Dashboard**: Add "Send" and "Receive" quick action buttons to AccountOverviewCard or HeroBanner section

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/components/AccountStatement.tsx` — Full invoice/statement page component with print/download capability
2. Create `src/frontend/src/components/SendMoneyModal.tsx` — Send money modal with Gmail/phone recipient, amount, network selector
3. Create `src/frontend/src/components/ReceiveMoneyModal.tsx` — Receive money modal with address display, Gmail/phone linking
4. Update `App.tsx`:
   - Add state for current view: `'dashboard' | 'statement'`
   - Add state for showSendModal, showReceiveModal
   - Pass view switching to NavBar
   - Render AccountStatement page when view === 'statement'
   - Wire Send/Receive buttons in dashboard hero area or account card
5. Update `NavBar` to include Statement nav link and Send button
6. Add Gmail/phone number local state stored in component state (not backend)
