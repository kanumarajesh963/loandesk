# LoanDesk — Loan Agreements & Trust Ledger

A two-sided loan agreement app: create agreements, auto-generate a PDF contract,
and track repayments on a shared ledger. Glassmorphism UI, works as a responsive
web app and installs like a native app on mobile (PWA).

```
loandesk/
├── frontend/     React + Vite + Tailwind — works immediately, no backend needed
└── backend/      Node + Express + MongoDB — scaffold for real persistence & auth
```

## Multiple people / accounts

The app now has sign up / log in. Each account has its own private list of
agreements — so if two people use the app on the same device/browser, they
create separate accounts and never see each other's loans.

This auth is local-only (stored in the browser, lightly obscured — not
production-grade security). It's there so you can try multi-person use
immediately. For real security and syncing across devices, wire up the
`backend/` scaffold (JWT + bcrypt, already built) — see below.

## Quick start (frontend only — runs in 2 minutes)

The frontend works standalone using your browser's local storage as the data
layer, so you can try the whole app without setting up a database.

```bash
cd frontend
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`). A demo loan is
pre-loaded so you're not looking at an empty screen.

### Try it on your phone
1. Make sure your phone is on the same WiFi as your computer.
2. Run `npm run dev` (it binds to your network by default).
3. On your phone's browser, open `http://<your-computer-ip>:5173`.
4. Use "Add to Home Screen" — it installs like a real app (PWA), works full-screen, and remembers your data.

### Build for production / deploy
```bash
cd frontend
npm run build
```
This outputs a `dist/` folder you can host on Vercel, Netlify, GitHub Pages, or any static host.

## Backend (optional — for real accounts + syncing across devices)

The frontend currently stores data in the browser only (per-device). To make
data persist across devices and support real lender/borrower accounts, wire up
the backend:

```bash
cd backend
cp .env.example .env      # then fill in MONGO_URI, JWT_SECRET
npm install
npm run dev
```

This gives you:
- `POST /api/auth/signup`, `POST /api/auth/login` — JWT-based auth
- `POST /api/agreements`, `GET /api/agreements`, `GET /api/agreements/:id` — CRUD
- `PATCH /api/agreements/:id/installments/:installmentId/pay` — record a payment
- `DELETE /api/agreements/:id`

You'll need a MongoDB instance — either install locally, or use a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster and paste its connection
string into `MONGO_URI`.

**To connect the frontend to this backend:** replace the functions in
`frontend/src/lib/storage.js` with `fetch()` calls to these endpoints instead
of `localStorage`. The function signatures are already shaped to match
(`getAgreements`, `saveAgreement`, `markInstallmentPaid`, etc.), so it's a
drop-in swap.

## What's built vs. what's next

**Built now:**
- Multi-user accounts — sign up / log in, each with a private ledger
- Dashboard with per-relationship trust rings, totals, and an upcoming-reminders panel
- Create agreement form with live EMI calculation
- Auto-generated PDF loan contract
- **Partial payments** — record any amount against an installment, not just the full amount
- **Automatic late fees** — 2%/month accrues on overdue balances, shown live
- **Payment proof upload** — attach a screenshot to any recorded payment
- **Shareable borrower link** — "Share with borrower" copies a read-only link, no login needed on their end (it's a point-in-time snapshot — see note below)
- **CSV export** — export your full agreement list, or a single loan's schedule
- **WhatsApp reminders** — one tap on the Dashboard sends a pre-filled reminder message for anything due within 7 days
- Fully responsive, glassmorphism UI, installable PWA
- Backend scaffold (Express + MongoDB) with matching partial-payment support, ready for real auth + persistence

**Known limitation — read carefully before using this for real money:**
The shared borrower link and all data are currently **local to the browser you're using** (no live backend connected). This means:
- Data doesn't sync across your phone and laptop — same account "loans" won't show up on both.
- The borrower's shared link shows a **snapshot** frozen at the moment you clicked Share — if you record a new payment afterwards, the borrower needs a fresh link to see it.
- Anyone with physical/browser access to your device can see your data (there's no server-side security).

**To become truly production-ready** (real security, live sync, always-current borrower links), wire the frontend to the `backend/` API — see the "Backend" section above. That's the one remaining step between "solid demo" and "actually production."

**Natural next steps after that:**
- Real email/SMS reminders (Nodemailer / Twilio) — needs your own service credentials
- Two-way borrower accounts (confirm/dispute changes, not just view)
- Reputation/relationship insights across repeat borrowers
