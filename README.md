# 🪙 Bitcoin Learning Hub

A full-stack Single Page Application (SPA) built with **ReactJS** and **Node.js/Express**, created as part of the **SoftUni React Course Exam**. Bitcoin Learning Hub is an educational platform where users can read and contribute articles about Bitcoin, explore a community-driven glossary of cryptocurrency terms, and engage in article discussions through a comments system.

---

## 📋 Project Description

Bitcoin Learning Hub provides a structured, dark-themed interface for learning about Bitcoin and cryptocurrency. The platform supports full user authentication, content ownership, live market data, and community interaction features.

- **Guests** can browse articles, read article details, explore the glossary, and view comments.
- **Logged-in users** can create articles, contribute glossary terms, post comments, and save drafts.
- **Authors** have full control (Edit/Delete) over their own articles, glossary terms, and comments.

---

## ✨ Features

### Public Area (Guest)
- **Home Page** — Hero section, live Bitcoin market stats bar, halving countdown timer, Fear & Greed Index widget, latest articles feed, and a "Trending This Week" section.
- **Articles Catalog** — Browse all articles with server-side search, category filtering, sort by latest or most viewed, and smart pagination.
- **Article Details** — Full article view with reading progress bar, like count, related articles sidebar, and a comments section.
- **Author Profiles** — Public profile pages showing an author's published articles and total likes received.
- **Glossary** — Searchable, alphabetically grouped A-Z list of Bitcoin terms with category filtering.
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
- **Smart Paginator** — Catalog pagination shows ellipsis for large page counts (e.g. `1 … 4 5 6 … 20`).
- **Trending This Week** — Home page section showing the 3 most-liked articles from the past 7 days.
- **Custom Confirmation Modals** — All delete actions use a styled, context-aware modal.
- **Scroll to Top Button** — Appears after scrolling 300px, smoothly returns to the top.
- **Live Bitcoin Price** — Real-time BTC/USDT ticker in the sidebar, updated every 5 seconds.
- **Bitcoin Stats Bar** — Live 24h price change, market cap, BTC dominance, and 24h volume.
- **Halving Countdown** — Live countdown timer to the next Bitcoin halving event.
- **Fear & Greed Index** — Live market sentiment widget powered by CoinStats.
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
| Live Market Data | Binance API, CoinGecko API, CoinStats API |

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