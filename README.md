# 🪙 Bitcoin Learning Hub

**Community-written Bitcoin education — in-depth articles, an A–Z glossary, and live market and on-chain tools, in one place.**

[![CI](https://github.com/MarinovM03/bitcoin-learning-hub/actions/workflows/ci.yml/badge.svg)](https://github.com/MarinovM03/bitcoin-learning-hub/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-F7931A.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-339933.svg)](.node-version)

---

## Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Testing](#testing)
- [Security](#security)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Bitcoin is badly served by the material written about it: exchange blogs selling something, forum threads assuming you already know, and documentation written for engineers. Bitcoin Learning Hub is a place to publish and read the explanation you wish you had found first.

Anyone can read. Signed-in readers can like, bookmark, comment, take quizzes and follow the authors they trust. Authors write articles and gather them into ordered reading paths. Admins review what new authors submit before it goes public.

**Roles at a glance**

| | Read & browse | Comment, like, follow | Publish | Moderate |
| :--- | :---: | :---: | :---: | :---: |
| Guest | ✅ | — | — | — |
| Reader *(confirmed email)* | ✅ | ✅ | — | — |
| Author | ✅ | ✅ | ✅ | — |
| Admin | ✅ | ✅ | ✅ | ✅ |

Publishing, commenting, liking and glossary contributions all require a confirmed email address. Submissions from authors who have not yet earned publishing trust go to a moderation queue rather than straight to the site.

---

## Features

### Reading
- **Articles** — full-text search, category and difficulty filters, sort by newest or most read, paginated.
- **Article pages** — readable web addresses, a reading progress bar, table of contents, reading time, view and like counts, related articles and threaded discussion.
- **Collections** — multi-part guides in a deliberate order, with part navigation built into each article.
- **Glossary** — A–Z terms with search, category filter, a letter rail that tracks your scroll position, and prev/next navigation between terms.
- **Global search** — `Ctrl+K` / `⌘K` overlay with keyboard navigation, plus a results page with shareable filters.
- **Quizzes** — end-of-article questions graded server-side, with per-question feedback and a final score.
- **Author profiles** — published work, collections, likes received and follower count.

### Accounts
- **Your Feed** — everything published by the accounts and collections you follow, filterable to a single author.
- **Following** — follow and unfollow authors and collections, managed from your profile.
- **Reading history** — mark articles as read and watch the list build up.
- **Bookmarks** — a private saved-for-later list.
- **Profile** — avatar, username (locked for 30 days after a change), email, password and account deletion.

### Writing
- **Markdown editor** with live preview, draft support and an optional quiz builder.
- **My Articles** — everything you have written, with review status, edit and delete.
- **My Collections** — create collections, reorder their parts and set a cover image.
- **Glossary contributions** — add terms with a definition and category.

### Bitcoin tools
- **Sats / BTC / USD converter** — three linked inputs against the live spot price.
- **DCA calculator** — backtest dollar-cost averaging against historical price data.
- **Address lookup** — identify any address format (Legacy, P2SH, SegWit, Taproot, Lightning, Testnet) with a plain-English explanation.
- **Multisig explainer** — an interactive walkthrough of M-of-N thresholds and common setups.

### Live data
Real-time BTC price, 24-hour change, market cap, dominance and volume; a countdown to the next halving; a Fear & Greed sentiment gauge; and an "On This Day in Bitcoin" panel.

### Administration
- **Dashboard** — platform totals with seven-day deltas.
- **Moderation queue** — approve or reject submissions with a note back to the author.
- **Reports** — triage what readers flag on articles, comments and glossary terms.
- **Users** — search, promote, grant publishing trust, or delete an account and everything it created.
- **Content** — remove any article, comment, collection or term, and feature an article on the home page.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| UI | React 19 + TypeScript |
| Routing | React Router v7 |
| Server state | TanStack Query |
| Client state | React Context |
| Forms & validation | react-hook-form + Zod *(schemas shared with the API)* |
| Build | Vite |
| Runtime | Node.js 22 |
| API | Express 5 |
| Database | MongoDB via Mongoose |
| Auth | JWT in an httpOnly cookie + bcrypt |
| Email | Resend |
| Testing | Vitest + Testing Library (UI) · Vitest + Supertest + mongodb-memory-server (API) |
| Styling | Plain CSS, no framework |
| Icons | lucide-react |
| Market data | Binance, CoinGecko, CoinStats |
| On-chain | mempool.space |

---

## Architecture

Two independently deployable applications in one repository.

```
bitcoin-learning-hub/
├── client/     React SPA — static build, deployed to a CDN
├── server/     Express REST API — deployed as a long-running Node process
└── .github/    CI — lint, test and build on every push and pull request
```

The client is a static bundle that talks to the API over CORS with credentials. The API owns all authorisation; the client never decides what a user may do, only what to show them.

A few decisions worth knowing about:

- **Validation schemas are written once in Zod** and used by both the form layer and the API, so the browser and the server agree on what a valid article is.
- **Server state lives in TanStack Query**, not in context. Mutations invalidate the specific keys they affect rather than clearing the cache.
- **Content is addressed by readable slugs** (`/articles/what-is-bitcoin`). Renaming keeps the old address working, so published links never rot.
- **Sitemap and RSS are generated by the API** from live data rather than built into the bundle.
- **Sessions are httpOnly cookies**, so the token is never reachable from JavaScript.

---

## Getting Started

### Prerequisites

- **Node.js 22+** (see [`.node-version`](.node-version))
- **MongoDB** — a local instance or a free MongoDB Atlas cluster

### 1. Clone

```bash
git clone https://github.com/MarinovM03/bitcoin-learning-hub.git
cd bitcoin-learning-hub
```

### 2. Start the API

```bash
cd server
npm install
```

Create `server/.env`:

```ini
MONGO_URI=mongodb://127.0.0.1:27017/bitcoin-hub
JWT_SECRET=<generate with: openssl rand -base64 48>
CLIENT_URL=http://localhost:5173
PORT=5000
```

```bash
npm run dev
```

The API runs on `http://localhost:5000`. It refuses to start if `MONGO_URI`, `CLIENT_URL` or `JWT_SECRET` are missing, so a half-configured process can never quietly serve traffic.

### 3. Start the client

```bash
cd client
npm install
npm run dev
```

The app runs on `http://localhost:5173` and expects the API on port 5000 by default.

### 4. Create an account

Register through the UI. Publishing and commenting need a confirmed email address — without `RESEND_API_KEY` set, and in any non-production run, the confirmation email is printed to the API console. Copy the link from your terminal into the browser.

To give your first account admin rights, add its email to `ADMIN_EMAILS` in `server/.env` before registering.

### Upgrading an existing database

Articles are addressed by slug. Give articles created before that one, with the server stopped:

```bash
cd server && npm run backfill:slugs
```

---

## Environment Variables

### `server/.env`

| Variable | Required | Description |
| :--- | :---: | :--- |
| `MONGO_URI` | ✅ | MongoDB connection string. |
| `JWT_SECRET` | ✅ | Session signing secret. Minimum length enforced at startup — generate with `openssl rand -base64 48`. |
| `CLIENT_URL` | ✅ | Origin allowed by CORS and used to build links in outgoing email. |
| `PORT` | | API port. Defaults to `5000`. |
| `ADMIN_EMAILS` | | Comma-separated emails promoted to admin on registration. |
| `RESEND_API_KEY` | | Enables real email delivery. Without it, messages are printed to the console. |
| `EMAIL_FROM` | | Verified sender, e.g. `Bitcoin Learning Hub <noreply@yourdomain.com>`. Required for delivery to addresses other than your own. |
| `COOKIE_SAMESITE` | | Session cookie `SameSite` policy. Defaults to `lax`; set to `none` when the site and API sit on different domains. |
| `COOKIE_SECURE` | | Force the `Secure` flag. Defaults to on in production, and whenever `SameSite=None`. |

### `client/.env`

| Variable | Required | Description |
| :--- | :---: | :--- |
| `VITE_API_URL` | for builds | API origin. Also fixes the CSP `connect-src` and the sitemap URL in `robots.txt`. |
| `VITE_SITE_URL` | recommended | Public site origin, used to make social preview image URLs absolute. |

Both are validated at build time — a malformed value fails the build rather than shipping.

---

## Scripts

### Server

| Command | What it does |
| :--- | :--- |
| `npm run dev` | Start with file watching. |
| `npm start` | Start once. |
| `npm run lint` | ESLint. |
| `npm test` | API tests against an in-memory MongoDB. |
| `npm run test:watch` | Same, in watch mode. |
| `npm run backfill:slugs` | Give existing articles a readable address. |
| `npm run backfill:verified` | Mark pre-existing accounts as confirmed. |
| `npm run backfill:moderation` | Populate moderation fields on older content. |
| `npm run migrate:collections` | Convert legacy article series into collections. |

### Client

| Command | What it does |
| :--- | :--- |
| `npm run dev` | Vite dev server with HMR. |
| `npm run build` | Type-check and build to `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | TypeScript, no emit. |
| `npm test` | Component and unit tests. |

---

## Testing

```bash
cd server && npm test    # API integration tests, real routes against in-memory MongoDB
cd client && npm test    # component and unit tests in jsdom
```

The API suite exercises the actual Express app through Supertest against a real MongoDB instance started in-process, so routing, validation, authorisation and database behaviour are all covered rather than mocked.

CI runs on every push and pull request to `main`: lint and tests for the API, and lint, type-check, tests and a production build for the client.

---

## Security

The platform holds accounts and user-written content, so the API is written on the assumption that any request may be hostile.

- **Sessions** are signed JWTs in httpOnly, same-site cookies, revocable per session and across all devices.
- **Passwords** are bcrypt-hashed. Changing your email or password, or deleting your account, requires the current password.
- **Sign-in throttling** locks an account after repeated failures regardless of where they come from, and rate limits apply separately to authentication, writes and reads.
- **Every input is validated** against a schema before it reaches the database, and unknown keys are stripped rather than trusted.
- **Ownership is enforced in the query**, so an edit or delete can only ever match content the requester owns.
- **User-written markdown is sanitised** before rendering; no raw HTML from users reaches the DOM.
- **Response headers** set a strict Content-Security-Policy, deny framing, and enable HSTS.
- **Email confirmation** gates publishing, commenting, liking and glossary contributions.

Found something? Please report it privately by opening a [security advisory](https://github.com/MarinovM03/bitcoin-learning-hub/security/advisories/new) rather than a public issue.

---

## Deployment

The two applications deploy separately.

**Client** — any static host. The repository ships Netlify configuration in `client/public/`: `_redirects` for SPA routing and `_headers` for security and cache headers. Build with `npm run build` and publish `client/dist/`, with `VITE_API_URL` and `VITE_SITE_URL` set in the host's build environment.

**API** — any platform that runs a Node process (Render, Railway, Fly). Set the environment variables above, point `CLIENT_URL` at the deployed site, and use `GET /health` as the health check — it reports database connectivity, not just process liveness. The API is proxy-aware, so rate limiting and view counting use the real client address behind a load balancer.

---

## Roadmap

- **Lightning value flows** — tip an author for an article, and sats prizes on quizzes. Non-custodial: the platform never holds anyone's funds.
- **Image uploads** — for avatars, article covers and collection covers, alongside the existing URL field.
- **Transaction Explainer** — paste a transaction ID and read what it actually did, in plain English.
- **Live block feed** — new blocks as they are found, with fees and space used.
- **Scam sandbox** — safe, annotated walkthroughs of real scam patterns.
- **Learning résumé** — a shareable record of what you have read and the quizzes you have passed.

---

## Contributing

Bug reports and small fixes are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, code style and commit conventions.

---

## License

[MIT](LICENSE) © Martin Marinov

**GitHub:** [@MarinovM03](https://github.com/MarinovM03)
