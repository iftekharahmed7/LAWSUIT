# LawSuite

LawSuite is an AI-powered legal help web app that makes legal information accessible to everyday people in Bangladesh. Ask questions in plain language (English or Bengali), summarise legal documents, download document templates, find and book lawyers, and learn your rights - without paying for an initial consultation.

> LawSuite provides general legal information, not legal advice. For your specific situation, consult a qualified lawyer.

## Features

- **Ask AI** - plain-language answers about Bangladeshi law, in English or Bengali
- **Summarise Document** - paste a contract or notice and get a plain-language summary
- **Document templates** - ready-to-use legal document templates
- **Lawyer directory and bookings** - search by specialization and location, book a consultation, cancel from "My bookings"
- **Glossary, legal news, Know Your Rights, helpline**
- **Accounts** - sign up, log in, password reset by email

## Tech stack

- **Backend:** Node.js, Express 5, MongoDB (Mongoose), JWT auth with bcrypt
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui (Radix)
- **AI:** Anthropic API (Claude Haiku by default)
- **Email:** Resend (password-reset emails)

In production the Express server also serves the built frontend, so the whole site runs from one URL with no CORS setup.

## Running locally

Requirements: Node.js 18+ (20 recommended) and a MongoDB database (local or Atlas).

```bash
git clone https://github.com/iftekharahmed7/LAWSUIT.git
cd LAWSUIT

npm install                      # backend dependencies
npm install --prefix FRONTEND    # frontend dependencies

cp .env.example .env             # then fill in the values (see below)
```

Run the backend (port 5000):

```bash
npm start
```

Run the frontend dev server in a second terminal (Vite prints the URL):

```bash
cd FRONTEND
npm run dev
```

In dev the frontend calls the API at `http://localhost:5000`. To test the production-style setup instead (one server, one URL):

```bash
npm run build --prefix FRONTEND
npm start                        # open http://localhost:5000
```

## Environment variables

Copy `.env.example` to `.env`. Never commit `.env`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGO_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Secret used to sign login tokens. Use a long random value, e.g. `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `PORT` | no | Server port (default 5000) |
| `ANTHROPIC_API_KEY` | for AI features | Without it, Ask AI and Summarise return a "not configured" message |
| `CHAT_MODEL` | no | Model for Ask AI (default `claude-haiku-4-5-20251001`) |
| `RESEND_API_KEY` | for emails | Password-reset emails are not sent without it |
| `APP_URL` | in production | Public site URL with no trailing slash, e.g. `https://your-app.onrender.com`. Used to build password-reset links. If unset, the server falls back to the request Host header, which is unsafe in production |

## Seed data and admin account

Run these once against a fresh database (read a script before re-running it on a database that already has data):

```bash
node scripts/seedLawyers.js
node scripts/seedDocuments.js
node scripts/seedGlossary.js
node scripts/seedLegalNews.js
```

Admins are created out-of-band, never through the public signup. Sign up normally, then promote the account:

```bash
node scripts/makeAdmin.js you@example.com
```

## API overview

| Path | What it does |
| --- | --- |
| `/api/auth` | `signup`, `login`, `forgot-password`, `reset-password` |
| `/api/lawyers` | list, `search`, get by id; adding a lawyer is admin-only |
| `/api/bookings` | create a booking, list `my` bookings, cancel via `PATCH /:id/status` (login required) |
| `/api/chat` | Ask AI |
| `/api/summarize` | Summarise a document |
| `/api/documents`, `/api/glossary`, `/api/legal-news` | templates, glossary, news |
| `/api/health` | status check |

### Limits and protections

- Ask AI and Summarise are open to visitors but rate limited per IP: 15 requests/hour anonymous, 60/hour when logged in. Chat questions are capped at 2,000 characters.
- Login (10 failed attempts / 15 min), signup, forgot-password and reset-password are rate limited per IP.
- Rate-limit counters live in server memory: they reset on restart and are not shared across multiple instances.
- Passwords are hashed with bcrypt, reset tokens are stored hashed and expire after 1 hour, and request bodies are type-checked before touching the database.

## Deploying (Render example)

Adjust to match your actual Render dashboard settings.

- **Build command:** `npm install && npm install --include=dev --prefix FRONTEND && npm run build --prefix FRONTEND`
- **Start command:** `npm start`
- **Environment variables:** `MONGO_URI`, `JWT_SECRET` (long random, different from local), `APP_URL`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`. Render sets `RENDER` automatically, which makes the server trust the proxy so rate limiting sees real visitor IPs.

If the build fails with `tsc` or `vite` not found, the frontend dev dependencies were skipped - keep `--include=dev` on the FRONTEND install.

## Project structure

```
server.js        Express app, route mounting, serves FRONTEND/dist
controllers/     request handlers
routes/          route definitions
models/          Mongoose schemas
middleware/      auth and rate limiting
utils/           email helper
scripts/         seed data and makeAdmin
FRONTEND/        React + Vite app
```
