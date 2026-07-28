# LoanDesk — Loan Agreements & Trust Ledger

A two-sided loan agreement app: create agreements, auto-generate a PDF contract,
and track repayments on a shared ledger. Glassmorphism UI, works as a responsive
web app and installs like a native app on mobile (PWA).

```
loandesk/
├── frontend/     React + Vite + Tailwind — works immediately, no backend needed
└── backend/      Node + Express + MongoDB — scaffold for real persistence & auth
```

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
- Dashboard with per-relationship trust rings and totals
- Create agreement form with live EMI calculation
- Auto-generated PDF loan contract
- Shared repayment schedule + mark-as-paid + activity log
- Fully responsive, glassmorphism UI, installable PWA
- Backend scaffold ready for real auth + MongoDB

**Natural next steps:**
- Wire frontend to backend (see above) for multi-device sync
- Real two-sided accounts — send borrower a link to confirm/accept the agreement
- Email/SMS reminders before due dates (Nodemailer / Twilio)
- Payment proof upload (UPI/bank screenshot) for borrower-submitted confirmations
# loandesk
