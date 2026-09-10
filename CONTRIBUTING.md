# Contributing

Thanks for your interest in the project. Bug reports and small fixes are welcome.

## Local development

The project is split into a `client/` (React + Vite) and `server/` (Express + MongoDB).

```bash
# Server
cd server
npm install
npm run dev

# Client (in a second terminal)
cd client
npm install
npm run dev
```

You'll need a local `.env` in `server/` with `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL`. See the [README](README.md#environment-variables) for the full list.

## Code style

- Four-space indentation — match what's around you.
- No inline `style={{}}` in components. CSS lives in `client/src/styles/` and is imported through `site.css`. Passing a CSS custom property (`style={{ '--x': value }}`) is fine.
- Each React component lives in its own folder: `client/src/components/<name>/<Name>.tsx`.
- Reusable logic belongs in `client/src/utils/`, one concern per file.
- Server controllers wrap async handlers with `asyncHandler` and throw `AppError` for known error cases.
- Ownership checks belong in the query itself (`findOneAndUpdate({ _id, _ownerId })`), never as a separate read followed by a write.

## Before opening a PR

```bash
cd server && npm run lint && npm test
cd client && npm run lint && npm run typecheck && npm test && npm run build
```

All of these must pass. CI runs the same commands and will block the merge otherwise.

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

For anything security-related, please open a [security advisory](https://github.com/MarinovM03/bitcoin-learning-hub/security/advisories/new) instead of a public issue.
