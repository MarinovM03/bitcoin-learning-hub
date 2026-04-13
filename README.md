# 🪙 Bitcoin Learning Hub

A full-stack Single Page Application (SPA) built with **ReactJS** and **Node.js/Express**. Bitcoin Learning Hub is an educational platform where users can read and contribute articles about Bitcoin, explore a community-driven glossary of cryptocurrency terms, use live on-chain and market tools, and engage in article discussions through a comments system.

---

## 📋 Project Description

Bitcoin Learning Hub provides a structured, dark-themed interface for learning about Bitcoin and cryptocurrency. The platform supports full user authentication, content ownership, live market data, on-chain tools, and community interaction features.

- **Guests** can browse articles, read article details, explore the glossary, use every tool, and view comments.
- **Logged-in users** can create articles, contribute glossary terms, post comments, save drafts, like and bookmark articles.
- **Authors** have full control (Edit/Delete) over their own articles, glossary terms, and comments.

---

## ✨ Features

### Public Area (Guest)
- **Home Page** — Hero section with platform tools panel, live Bitcoin market stats bar, halving countdown timer, Fear & Greed Index widget, latest articles feed, and a "Trending This Week" section.
- **Articles Catalog** — Browse all articles with server-side search, category filtering, difficulty tag filter, sort by latest or most viewed, and smart pagination.
- **Article Details** — Full article view with reading progress bar, drop-cap typography, reading time, view counter, like count, related articles sidebar, and a comments section.
- **Author Profiles** — Public profile pages showing an author's published articles and total likes received.
- **Glossary** — Searchable, alphabetically grouped A-Z list of Bitcoin terms with category filtering, letter rail scroll-spy, and dedicated term detail pages with prev/next navigation and related terms.
- **Global Search** — `Ctrl+K` search overlay and a dedicated search page that covers articles and glossary terms.
- **Authentication** — Login by email or username, and Register with full validation.

### Private Area (Logged-in User)
- **Create Article** — Submit new content with title, summary, content, category, and image URL. Choose to publish immediately or save as a draft.
- **Article Drafts** — Save works-in-progress as drafts. Drafts are private and never appear in the public catalog.
- **My Articles Page** — Dedicated page with a full grid view of all published articles and drafts, with edit and delete actions.
- **Like Articles** — Like any article you did not author. One like per user per article.
- **Bookmark Articles** — Save articles to a personal bookmarks list for later reading.
- **Post Comments** — Join the discussion on any article with a 500-character limit and live character counter.
- **Contribute Glossary Terms** — Add new terms with a definition and category.
- **Route Guards** — Protected routes prevent unauthorized access to Create, Edit, Profile, Bookmarks, and My Articles pages.

### Bitcoin Tools
- **DCA Calculator** — Simulate dollar-cost-averaging strategies against historical BTC price data and visualize returns.
- **Mempool Visualizer** — Live view of the Bitcoin mempool powered by public explorers, with transaction activity, fee tiers, and block space stats.
- **Address Demystifier** — Paste any Bitcoin address to identify its format (Legacy, P2SH, SegWit, Taproot, Lightning, Testnet), read a plain-English explanation, and jump to the address on mempool.space.

### Author Capabilities (Owner)
- **Edit Article** — Update any article you created. Choose to save as draft or publish directly from the edit page.
- **Delete Article** — Remove any article you created.
- **Delete Comments** — Remove your own comments.
- **Delete Glossary Terms** — Remove glossary terms you contributed.

### User Profile
- **Edit Profile** — Update username, email, and profile picture URL.
- **Username Change Lock** — Username changes are locked for 30 days after each change.
- **Change Password** — Securely update your password with confirmation validation.
- **Stats Overview** — At-a-glance count of published articles, saved drafts, and total likes received.

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
- **Loading Spinners** — Bitcoin-themed spinner shown during all async data fetches.
- **Toast Notifications** — Fixed-position success notifications visible regardless of scroll position.
- **Form Loading States** — All submit buttons disable and show feedback text while requests are in flight.

---

## 🛠️ Technologies Used

| Layer | Technology |
| :--- | :--- |
| Frontend Library | ReactJS 19 |
| Routing | React Router v7 |
| State Management | React Context API |
| Build Tool | Vite |
| Backend Runtime | Node.js |
| Backend Framework | Express.js v5 |
| Database | MongoDB via Mongoose |
| Authentication | JWT + bcrypt |
| Styling | Pure CSS (no frameworks) |
| Icons | lucide-react |
| Live Market Data | Binance API, CoinGecko API, CoinStats API |
| On-Chain Data | mempool.space (explorer links and live mempool feeds) |

---

## 🛣️ Application Routes

| Path | Description | Access |
| :--- | :--- | :--- |
| `/` | Home Page | Public |
| `/login` | User Login | Guest only |
| `/register` | User Registration | Guest only |
| `/articles` | Articles Catalog | Public |
| `/articles/:id/details` | Article Details + Comments | Public |
| `/articles/create` | Create Article | Authenticated |
| `/articles/:id/edit` | Edit Article | Owner only |
| `/glossary` | Bitcoin Glossary | Public |
| `/glossary/:id` | Glossary Term Details | Public |
| `/search` | Global Search Results | Public |
| `/dca` | DCA Calculator | Public |
| `/mempool` | Mempool Visualizer | Public |
| `/address` | Address Demystifier | Public |
| `/users/:id` | Public Author Profile | Public |
| `/profile` | User Profile & Settings | Authenticated |
| `/my-articles` | My Articles Manager | Authenticated |
| `/bookmarks` | Saved Bookmarks | Authenticated |
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
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```
Install dependencies and start:
```bash
npm install
node index.js
```
The server will run on `http://localhost:5000`.

### 3. Set up the frontend
```bash
cd client
npm install
npm run dev
```
The app will run on `http://localhost:5173`.

---

## 👤 Author

**Martin Marinov**
GitHub: [@MarinovM03](https://github.com/MarinovM03)