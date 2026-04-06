# North Investors Profit Wallet (NIPW)

## Current State
- Coinbase-style dark theme investment dashboard, fully branded as North Investors Profit Wallet
- Internet Identity authentication gates all dashboard content
- Dashboard shows: $600,000 BTC balance, wallet addresses (BTC + USDT), investor/member counts, portfolio chart, activity feed, withdrawal policy banner
- Prominent gold withdrawal banner: $120,000 required deposit, BTC address, USDT address with copy buttons
- Brokerage Services section with full interactive modals for all 6 services
- Fund Account payment modal (BTC, USDT, card tabs)
- Account Statement page (printable/downloadable)
- Send Money modal (Gmail/phone recipient, BTC/USDT)
- Receive modal (wallet addresses + Link Account tab)
- Live crypto ticker across top
- Support chatbot (floating gold button)
- PWA manifest
- No SEO tags, no sitemap, no robots.txt, minimal index.html
- Backend: platform stats, user profiles, activities, market prices, authorization

## Requested Changes (Diff)

### Add
- **Full SEO**: index.html meta tags (title, description, keywords, author, robots), Open Graph tags (og:title, og:description, og:type, og:image, og:url), Twitter Card meta tags, canonical link
- **sitemap.xml**: static sitemap in /public listing main routes
- **robots.txt**: in /public, permitting all crawlers, pointing to sitemap
- **Receipt Upload + Deposit Confirmation Flow**: After a user indicates they have sent the 20% deposit, they can upload a receipt image and submit it. The system unlocks a "Deposit Received" confirmation screen showing their account is being activated, with a reference number. The backend stores receipt submissions per user.
- **Live Account Display**: When a user creates an account or logs in, their live account card (name, account ID, status, balance, deposit requirement) is prominently shown on the dashboard with a real-time "LIVE" indicator badge.
- **Account Generation**: New accounts get a unique NIPW account ID on registration, stored in the backend, displayed in dashboard and statement.
- **Deposit Agent Flow**: After 20% deposit is made, a confirmation modal walks the investor through: (1) Upload receipt, (2) Submit to NIPW, (3) Receive confirmation with account details. Backend records the deposit submission.
- **PWA manifest and service worker** (if not already present): ensure site is installable
- **Structured data (JSON-LD)**: Add Organization schema markup to index.html for Google rich results

### Modify
- **index.html**: Full SEO head section -- title, all meta tags, OG tags, Twitter Card, canonical, JSON-LD
- **Account Statement**: Display account as LIVE/ACTIVE once deposit is confirmed
- **Dashboard**: Show live account card with user name, account ID, status badge, real-time indicator
- **UI polish**: Tighten spacing, improve card hierarchy, ensure mobile responsiveness across all views

### Remove
- Nothing to remove

## Implementation Plan
1. Update `index.html` with comprehensive SEO: title, meta description/keywords/author/robots, Open Graph, Twitter Card, canonical, JSON-LD Organization schema
2. Add `public/sitemap.xml` and `public/robots.txt`
3. Update backend `main.mo` to add: deposit receipt submission (per user), account ID generation/storage, deposit status tracking per user
4. Frontend: add DepositConfirmationModal component -- upload receipt image (base64), submit to backend, show confirmation screen with reference number
5. Frontend: update Dashboard to show live account card with animated LIVE badge, user's account ID, deposit status
6. Frontend: update AccountStatement to reflect confirmed deposit status when applicable
7. PWA: ensure manifest.json and service worker are present in public/
8. Final polish pass: consistent spacing, card elevation, mobile responsiveness
