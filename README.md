# BudgetSeal

Track spending habits, spot where money leaks, and get cheaper alternatives for past purchases.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

Data is stored in SQLite at `data/budget.db` (created on first request, gitignored).
Override the location with `DATABASE_PATH=/path/to/file.db`.

## Structure

```
app/                  Frontend pages (client components) + API routes
  page.tsx            Dashboard
  add/ history/ analytics/
  api/                HTTP layer — thin handlers: parse → call server → respond
server/               Backend only (guarded by `server-only`)
  db.ts               SQLite connection + versioned migrations
  repositories/       SQL data access (amounts stored as integer cents)
  services/           Business logic: analytics, money leaks, alternatives
  validation.ts       zod schemas for request bodies and query strings
  http.ts             Error handling → consistent JSON errors
lib/                  Shared by frontend and backend
  types.ts            Domain + API response types
  api.ts              Typed fetch client used by the pages
  format.ts           Currency/date formatting
components/           Shared UI
```

## API

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/purchases?category=&search=&from=&to=&limit=` | List purchases + `total`, `count` for the filter |
| POST | `/api/purchases` | Create `{ name, amount, category, date, note?, isImpulse? }` → 201 |
| GET | `/api/purchases/:id` | Fetch one |
| PATCH | `/api/purchases/:id` | Update any subset of fields |
| DELETE | `/api/purchases/:id` | Delete → 204 |
| GET | `/api/dashboard` | This month's totals, category breakdown, money leaks, recent purchases |
| GET | `/api/analytics` | 6-month trend, category totals, top expenses, impulse stats |
| GET | `/api/alternatives?category=&name=` | Cheaper alternatives for a purchase |

Errors return `{ "error": string, "issues"?: [{ path, message }] }` with 400 / 404 / 500.
