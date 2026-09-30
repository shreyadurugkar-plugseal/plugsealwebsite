# BudgetSeal

Track spending habits, spot where money leaks, and get cheaper alternatives for past purchases.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

Data is stored in SQLite at `data/budget.db` (created on first request, gitignored).
Override the location with `DATABASE_PATH=/path/to/file.db`.

## Using it on your phone

**Same Wi-Fi (quick test):** run `npm run dev -- -H 0.0.0.0`, find your computer's
local IP (e.g. `192.168.1.20`), and open `http://192.168.1.20:3000` on your phone.

**Anywhere:** deploy it to Railway (below). Any host with a **persistent disk** also
works (`npm run build && npm start`, with `DATABASE_PATH` on that disk). Serverless hosts
like Vercel or Netlify **won't** work as-is; their filesystem is wiped between requests.
Installing the app requires HTTPS (plain `http://localhost` also works for testing).

## Deploy on Railway

The repo is ready: `railway.json` sets the build/start commands, a health check
(`/api/health`), and restart-on-failure; `package.json` pins Node 22.

1. **Create the service.** In [railway.com](https://railway.com): **New Project →
   Deploy from GitHub repo →** pick this repo. In the service's **Settings → Source**,
   choose the branch to deploy.
2. **Attach a volume (required, or your data is wiped on every deploy).** Right-click the
   service (or ⌘K → "Volume") → **Add Volume**, mount path **`/data`**. The app finds it
   automatically via Railway's `RAILWAY_VOLUME_MOUNT_PATH` and stores `budget.db` there.
   If you forget, the deploy logs show a `[db] WARNING: no Railway volume attached`.
3. **Get a URL.** Service **Settings → Networking → Generate Domain**. Railway serves it
   over HTTPS, so login cookies are `Secure` and the app is installable.
4. **Open it on your phone**, create your account, and tap **Install app**.

No environment variables are needed. Every push to the chosen branch redeploys;
the volume (and your data) survives redeploys.

Notes:
- Keep the service at **1 replica**. SQLite on a volume and the in-memory login
  rate limit are single-instance.
- **Backups:** the whole database is one file at `/data/budget.db`. Railway volume
  backups can be enabled in the volume's settings.
- Optional: `DATABASE_PATH` overrides the database location entirely.

## Installable app (PWA)

BudgetSeal is a Progressive Web App: the same site works in any browser *and* installs
like a native app, with a home-screen icon, full-screen launch, and no browser bars.

- **Android / desktop Chrome & Edge:** tap **Install app** in the top bar (or the
  install icon in the address bar).
- **iPhone / iPad:** open in Safari, tap **Install app** for the steps, i.e.
  Share → **Add to Home Screen**.
- Long-press the installed icon for an **Add purchase** shortcut (Android).

How it's built:

| File | Purpose |
| --- | --- |
| `app/manifest.ts` | Name, colors, icons, standalone display, shortcuts |
| `public/icons/`, `app/icon.png`, `app/apple-icon.png` | App icons (source: `public/icons/icon.svg`) |
| `public/sw.js` | Service worker: caches static assets; shows `/offline` when there's no connection |
| `components/Pwa.tsx` | Registers the worker (production builds only) and the **Install app** button |

The service worker **never caches API responses or page HTML**, so one person's
spending is never shown to someone else on a shared device. Offline, the app shows
a "You're offline" screen instead of stale data. To ship a worker change, bump
`VERSION` in `public/sw.js`.

## Accounts

Email + password. Passwords are hashed with scrypt; sessions are random tokens stored
hashed in the database, sent as an `HttpOnly`, `SameSite=Lax` cookie, valid for 30 days.
Logins are limited to 10 failed attempts per email per 15 minutes.
Every purchase belongs to a user, and every query is scoped to the logged-in user.
The first account created takes ownership of any purchases recorded before accounts existed.

## Structure

```
app/                  Frontend pages (client components) + API routes
  page.tsx            Dashboard
  add/ history/ analytics/
  api/                HTTP layer — thin handlers: parse → call server → respond
proxy.ts              Redirects visitors without a session cookie to /login
server/               Backend only (guarded by `server-only`)
  auth/               Password hashing, sessions, login rate limiting
  db.ts               SQLite connection + versioned migrations
  repositories/       SQL data access (amounts stored as integer cents)
  services/           Business logic: analytics, money leaks, alternatives
  validation.ts       zod schemas for request bodies and query strings
  http.ts             Error handling → consistent JSON errors
lib/                  Shared by frontend and backend
  types.ts            Domain + API response types
  api.ts              Typed fetch client used by the pages
  format.ts           Currency/date formatting
components/           Shared UI (nav, PWA install/registration)
public/sw.js          Service worker
```

## API

All endpoints except signup/login return 401 without a valid session.

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/auth/signup` | `{ email, password }` → creates account, starts session (409 if taken) |
| POST | `/api/auth/login` | `{ email, password }` → starts session (401 wrong, 429 rate-limited) |
| POST | `/api/auth/logout` | Ends session → 204 |
| GET | `/api/auth/me` | Current user |
| GET | `/api/purchases?category=&search=&from=&to=&limit=` | List purchases + `total`, `count` for the filter |
| POST | `/api/purchases` | Create `{ name, amount, category, date, note?, isImpulse? }` → 201 |
| GET | `/api/purchases/:id` | Fetch one |
| PATCH | `/api/purchases/:id` | Update any subset of fields |
| DELETE | `/api/purchases/:id` | Delete → 204 |
| GET | `/api/dashboard` | This month's totals, category breakdown, money leaks, recent purchases |
| GET | `/api/analytics` | 6-month trend, category totals, top expenses, impulse stats |
| GET | `/api/alternatives?category=&name=` | Cheaper alternatives for a purchase |

Errors return `{ "error": string, "issues"?: [{ path, message }] }` with 400 / 404 / 500.
