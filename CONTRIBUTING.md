# Contributing

Thanks for your interest in the project. This is a personal portfolio piece, but bug reports and small fixes are welcome.

## Local development

The project is split into a `client/` (React + Vite) and `server/` (Express + MongoDB).

```bash
# Server
cd server
npm install
node index.js

# Client (in a second terminal)
cd client
npm install
npm run dev
```

You'll need a local `.env` in `server/` with `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL`. See the README for the full list.

## Code style

- Two-space indentation in JS/TS, four-space inside the existing codebase where already established — match what's around you.
- No inline `style={{}}` in components. CSS lives in `client/src/styles/` and is imported through `site.css`.
- Each React component lives in its own folder under `client/src/components/<name>/<Name>.jsx`.
- Server controllers wrap async handlers with `asyncHandler` and throw `AppError` for known error cases.

## Before opening a PR

```bash
# In client/
npm run lint
npm run build
```

Both must pass. CI will block the merge otherwise.

## Commit messages

Conventional Commits style:

- `feat(scope): short description`
- `fix(scope): short description`
- `refactor(scope): ...`
- `chore(scope): ...`
- `docs(scope): ...`

Keep messages outcome-focused. Avoid leaking implementation details that could aid an attacker (e.g. specific bypass techniques being patched).

## Reporting issues

For bugs, open a GitHub issue with:
- What you did
- What you expected
- What happened instead
- Browser / Node version if relevant
