# 🪙 Bitcoin Learning Hub

A full-stack Single Page Application (SPA) built with **ReactJS + TypeScript** and **Node.js/Express**. Bitcoin Learning Hub is an educational platform where users can read and contribute articles about Bitcoin, follow structured learning paths and earn certifications, explore a community-driven glossary of cryptocurrency terms, use live on-chain and market tools, and engage in article discussions through a comments system.

---

## 📋 Project Description

Bitcoin Learning Hub provides a structured, dark-themed interface for learning about Bitcoin and cryptocurrency. The platform supports full user authentication, content ownership, live market data, on-chain tools, and community interaction features.

- **Guests** can browse articles, read article details, explore the glossary, use every tool, and view comments.
- **Logged-in users** can create articles, contribute glossary terms, post comments, save drafts, like and bookmark articles.
- **Authors** have full control (Edit/Delete) over their own articles, glossary terms, and comments.
- **Admins** moderate the platform from a dedicated dashboard — promote or demote users, delete any content, and feature standout articles on the home page.

---

## ✨ Features

### Public Area (Guest)
- **Home Page** — Hero section with platform tools panel, live Bitcoin market stats bar, halving countdown timer, Fear & Greed Index widget, an "On This Day in Bitcoin" historical events widget, latest articles feed, and a "Trending This Week" section.
- **Articles Catalog** — Browse all articles with server-side search, category filtering, difficulty tag filter, sort by latest or most viewed, and smart pagination.
- **Article Details** — Full article view with reading progress bar, drop-cap typography, reading time, view counter, like count, related articles sidebar, and a comments section.
- **Author Profiles** — Public profile pages showing an author's published articles and total likes received.
- **Glossary** — Searchable, alphabetically grouped A-Z list of Bitcoin terms with category filtering, letter rail scroll-spy, and dedicated term detail pages with prev/next navigation and related terms.
- **Learning Paths** — Curated multi-article learning tracks organized by skill level, with progress tracking and a certifying quiz at the end of each path.
- **Global Search** — `Ctrl+K` / `⌘ K` search overlay with arrow-key navigation, plus a dedicated search page covering articles and glossary terms with shareable URL filters by category, difficulty, and reading time.
- **Article Quizzes** — "Test Your Knowledge" quizzes at the end of articles, graded by the server with instant per-question feedback and a final score breakdown.
- **Authentication** — Login by email or username, and Register with full validation. Show/hide password toggles on every password field, a full `Forgot password?` email flow with single-use expiring reset links, and clear feedback when a session expires mid-request.

### Private Area (Logged-in User)
- **Create Article** — Submit new content with title, summary, content, category, and image URL. Choose to publish immediately or save as a draft.
- **Article Drafts** — Save works-in-progress as drafts. Drafts are private and never appear in the public catalog.
- **My Articles Page** — Dedicated page with a full grid view of all published articles and drafts, with edit and delete actions.
- **Create Learning Paths** — Build multi-article learning tracks with ordered lessons and a final quiz.
- **My Paths Page** — Manage your published paths and drafts with edit and delete actions.
- **Path Quiz Mode** — Take the end-of-path quiz to earn a certification, with scored feedback per question.
- **Certifications** — Personal dashboard of every path certification you have earned, viewable on a dedicated details page.
- **Like Articles** — Toggle a like on any article you did not author. One like per user per article.
- **Bookmark Articles** — Save articles to a personal bookmarks list for later reading.
- **Post Comments** — Join the discussion on any article with a 500-character limit and live character counter.
- **Contribute Glossary Terms** — Add new terms with a definition and category.
- **Route Guards** — Protected routes prevent unauthorized access to Create, Edit, Profile, Bookmarks, My Articles, My Paths, and Certifications pages.

### Bitcoin Tools
- **Sats / BTC / USD Converter** — Three linked inputs that convert between satoshis, BTC, and USD live against the current BTC spot price, with common preset amounts.
- **DCA Calculator** — Simulate dollar-cost-averaging strategies against historical BTC price data and visualize returns.
- **Mempool Visualizer** — Live view of the Bitcoin mempool powered by public explorers, with transaction activity, fee tiers, and block space stats.
- **Address Demystifier** — Paste any Bitcoin address to identify its format (Legacy, P2SH, SegWit, Taproot, Lightning, Testnet), read a plain-English explanation, and jump to the address on mempool.space.
- **Multisig Explainer** — Interactive walkthrough of multi-signature wallets with visual breakdowns of M-of-N thresholds and common real-world setups.

### Author Capabilities (Owner)
- **Edit Article** — Update any article you created. Choose to save as draft or publish directly from the edit page.
- **Delete Article** — Remove any article you created.
- **Delete Comments** — Remove your own comments.
- **Delete Glossary Terms** — Remove glossary terms you contributed.

### User Profile
- **Edit Profile** — Update username, email, and profile picture URL.
- **Username Change Lock** — Username changes are locked for 30 days after each change.
- **Change Password** — Dedicated dialog that confirms your current password, validates the new one, and signs out every other device on success.
- **Delete Account** — Password-confirmed "Danger Zone" dialog that permanently removes the account and all of its content.
- **Reset Reading History** — Clear every "marked as read" flag in one click, with a confirmation modal to prevent accidents.
- **Stats Overview** — At-a-glance count of published articles, saved drafts, and total likes received.

### Admin Area
- **Stats Dashboard** — Totals and last-7-days deltas for users, articles, comments, glossary terms, paths, bookmarks, and likes.
- **User Management** — Paginated, searchable list of users with role promotion/demotion and full account deletion (which cascades through articles, comments, bookmarks, likes, glossary terms, paths, reading history, and certifications).
- **Article Moderation** — Paginated list with search, hard-delete for any article, and a one-click toggle to feature an article on the home page.
- **Comment Moderation** — Paginated feed of every comment with article context and one-click removal.

### UI/UX
- **Reading Progress Bar** — Thin orange bar at the top of the viewport that fills as you scroll through an article.
- **Magazine-Style Article Layout** — Drop-cap first letter, tinted lead summary, and ornament-marked article end.
- **Smart Paginator** — Catalog pagination shows ellipsis for large page counts (e.g. `1 … 4 5 6 … 20`).
- **Trending This Week** — Home page section showing the most-liked articles from the past 7 days.
- **Custom Confirmation Modals** — All delete actions use a styled, context-aware modal.
- **Scroll to Top Button** — Accessible button that fades in after scrolling, respects `prefers-reduced-motion`.
- **Live Bitcoin Price** — Real-time BTC/USDT ticker in the top bar, updated every 5 seconds.
- **Bitcoin Stats Bar** — Live 24h price change, market cap, BTC dominance, and 24h volume.
- **Halving Countdown** — Live countdown timer to the next Bitcoin halving event.
- **Fear & Greed Index** — Live market sentiment widget powered by CoinStats.
- **Responsive Navbar** — Desktop, tablet, and mobile breakpoints with a portal-rendered full-screen mobile menu.
- **Tools Dropdown** — Consolidated hover/click dropdown in the navbar grouping every Bitcoin tool (Converter, DCA, Address, Mempool, Multisig) behind one entry point.
- **Loading Spinners** — Bitcoin-themed spinner shown during all async data fetches.
- **Toast Notifications** — Unified success/error/info notifications driven by a small singleton store, so mutations, background failures, and the session-expired flow all report through one consistent surface.
- **Form Loading States** — All submit buttons disable and show feedback text while requests are in flight.
- **Smooth Scroll Effects** — The article read-progress bar batches updates through `requestAnimationFrame` so it stays at one update per frame even on long scrolls.

---

## 🛠️ Technologies Used

| Layer | Technology |
| :--- | :--- |
| Frontend Library | ReactJS 19 + TypeScript |
| Routing | React Router v7 |
| Server State | TanStack Query (React Query) |
| Client State | React Context API |
| Forms & Validation | react-hook-form + Zod (shared schemas client and server) |
| Build Tool | Vite |
| Backend Runtime | Node.js |
| Backend Framework | Express.js v5 |
| Database | MongoDB via Mongoose |
| Authentication | JWT + bcrypt |
| Transactional Email | Resend |
| Testing | Vitest + Testing Library (client), Vitest + Supertest + mongodb-memory-server (API) |
| Styling | Pure CSS (no frameworks) |
| Icons | lucide-react |
| Live Market Data | Binance API, CoinGecko API, CoinStats API |
| On-Chain Data | mempool.space (explorer links and live mempool feeds) |

---

## 🔒 Security & Hardening

- **Helmet** baseline headers and a strict CORS allow-list driven by `CLIENT_URL`.
- **Required-env startup check** — the server refuses to boot when critical config is missing or weak, so a degraded process can never silently ship.
- **Reverse-proxy aware** — configured to resolve real client addresses behind Render/Heroku/Fly/nginx so rate limiting and view de-duplication operate on the right key.
- **Tiered rate limiting** — separate per-client limiters for authentication endpoints and for state-changing requests.
- **Per-account login lockout** — repeated failed sign-in attempts temporarily lock the account regardless of source IP. The counter resets on the next successful sign-in.
- **Password reset by email** — single-use reset links that expire after 30 minutes; a successful reset signs out every existing session.
- **Re-authentication for sensitive changes** — changing the account email or password, or deleting the account, always requires the current password.
- **Defensive input handling** — request payloads, URL parameters, and query strings are sanitized and type-coerced before they reach the database layer.
- **Indexed text search** — article search runs against a weighted text index instead of scanning the collection.
- **Sanitized markdown rendering** — every article body and glossary definition passes through `rehype-sanitize` before reaching the DOM.
- **bcrypt password hashing** with a tuned work factor.
- **JWT auth** — signed tokens with an enforced expiry, validated on every request and revalidated client-side before each call.
- **Tight ownership checks** — every edit/delete handler scopes the query by owner so users can only touch their own content.
- **Health probe** — `GET /health` reports DB connectivity and process uptime for hosting platforms and uptime monitors.

---

## 🛣️ Application Routes

| Path | Description | Access |
| :--- | :--- | :--- |
| `/` | Home Page | Public |
| `/login` | User Login | Guest only |
| `/register` | User Registration | Guest only |
| `/forgot-password` | Password Reset Request | Guest only |
| `/reset-password` | Set a New Password (from email link) | Guest only |
| `/articles` | Articles Catalog | Public |
| `/articles/:id/details` | Article Details + Comments | Public |
| `/articles/create` | Create Article | Authenticated |
| `/articles/:id/edit` | Edit Article | Owner only |
| `/glossary` | Bitcoin Glossary | Public |
| `/glossary/:id` | Glossary Term Details | Public |
| `/paths` | Learning Paths Catalog | Public |
| `/paths/:id` | Learning Path Details | Public |
| `/paths/create` | Create Learning Path | Authenticated |
| `/paths/:id/edit` | Edit Learning Path | Owner only |
| `/paths/:id/quiz` | Take Path Quiz | Authenticated |
| `/search` | Global Search Results | Public |
| `/converter` | Sats / BTC / USD Converter | Public |
| `/dca` | DCA Calculator | Public |
| `/mempool` | Mempool Visualizer | Public |
| `/address` | Address Demystifier | Public |
| `/multisig` | Multisig Explainer | Public |
| `/users/:id` | Public Author Profile | Public |
| `/profile` | User Profile & Settings | Authenticated |
| `/my-articles` | My Articles Manager | Authenticated |
| `/my-paths` | My Paths Manager | Authenticated |
| `/certifications` | Earned Certifications | Authenticated |
| `/certifications/:id` | Certification Details | Authenticated |
| `/bookmarks` | Saved Bookmarks | Authenticated |
| `/admin` | Admin Dashboard (Stats, Users, Articles, Comments) | Admin only |
| `/health` | Health Probe (server only) | Public |
| `*` | 404 Not Found | Public |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/MarinovM03/bitcoin-learning-hub.git
cd bitcoin-learning-hub
```

### 2. Set up the backend
```bash
cd server
```
Create a `.env` file in the `server/` directory:
```
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<generate_with_openssl_rand_base64_48>
CLIENT_URL=http://localhost:5173
PORT=5000

# Optional: comma-separated list of emails auto-promoted to admin on register
ADMIN_EMAILS=

# Optional: Resend API key for password reset emails.
# Without it, reset links are printed to the server console instead.
RESEND_API_KEY=
# Optional: verified sender, e.g. "Bitcoin Learning Hub <noreply@yourdomain.com>"
EMAIL_FROM=
```
> The server fails fast at startup if `MONGO_URI`, `CLIENT_URL`, or `JWT_SECRET` are missing. `JWT_SECRET` has a minimum length requirement — generate one with `openssl rand -base64 48`.
Install dependencies and start:
```bash
npm install
npm run dev
```
The server will run on `http://localhost:5000`.

### 3. Set up the frontend
```bash
cd client
npm install
npm run dev
```
The app will run on `http://localhost:5173`.

### 4. Run the test suites
```bash
cd server && npm test   # API integration tests (in-memory MongoDB)
cd client && npm test   # component and unit tests
```

---

## 👤 Author

**Martin Marinov**
GitHub: [@MarinovM03](https://github.com/MarinovM03)