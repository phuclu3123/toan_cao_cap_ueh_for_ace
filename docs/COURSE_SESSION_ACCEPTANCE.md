# Course checkout and session acceptance — 2026-11-23

## Scope

This pass completes course checkout/session handling. Expanded website
notifications and transactional emails remain the next delivery. Existing
payment notifications were not expanded and no real email was sent by tests.

## Session behavior

- `AuthContext` owns the verified account for the header, course gates,
  Flashcard gate and checkout. Browser profile caches do not grant access.
- A feature API returning 401 requests a shared `/api/auth/me` check. It does
  not automatically replay a payment creation, key redemption or cancellation.
- A confirmed 401 clears the shared identity. A timeout/503 keeps the last
  verified account and presents a connection/retry state.
- Identical `/me` responses retain their object reference. Course checks depend
  on stable account IDs, avoiding a 401 → `/me` → render → access-check loop.
- Login/logout signals across tabs contain only an opaque change marker in
  localStorage. Other tabs read the HttpOnly session from the backend again;
  no ID token, key, entitlement or payment is trusted from storage.
- A forced check supersedes an older in-flight bootstrap on cross-tab changes.
  Responses also compare the shared session-change marker before committing.
  The Google OAuth transport tab does not bootstrap the storefront session or
  write the shared profile cache. Profile reads have their own request epochs
  and no longer independently rewrite the shared cache.
  Checkout responses are account scoped; a late response cannot replace the
  next account's checkout list. Account changes also clear session-bound player
  content and pending lesson requests.

### Firebase renewal

`POST /api/auth/session/refresh` requires an existing authenticated backend
session and a freshly verified Firebase ID token. The UID owner must resolve
to the same canonical account ID. This route does not create/link/merge users
or update profiles, emails, roles, enrollments or keys.

The existing opaque cookie token is renewed with a compare-and-update against
an unexpired session and its session version. This avoids competing token
rotations across browser tabs. A logout which removed that session cannot be
undone by this endpoint. Renewal remains bounded by the verified token expiry.

A matching cached Firebase identity does not shorten the remaining lifetime of
an already valid longer password/GitHub session. The database expiry only moves
forward, and renewal retains that pre-existing lifetime in the cookie.

Firebase token changes request this renewal when a backend session exists.
Focus and a five-minute visible-tab check ask Firebase for an expiring token
without showing another email prompt. A cached Firebase identity belonging to
another account cannot replace a password/GitHub login during background work.

## Checkout behavior

- Server prices and promotions determine quotes. Price/version/consent changes
  require confirmation again. Existing orders retain their original snapshot.
- One selected checkout per account/course is stored in MongoDB. A new
  transaction cannot create a different waiting order while the selected order
  is still pending, including concurrent requests from separate tabs.
- Repeating an uncertain request retains its exact body and Idempotency-Key.
- Modern pending orders resume at payment/QR, using their stored deadline.
  Legacy orders without deadlines offer an explicit resume/cancel choice.
- Replacing an order requires provider-confirmed cancellation. The persisted
  selection returns to details; it does not fall back to an older unpaid link.
- Restarting a terminal order persists dismissal before showing the form.
- The countdown uses `expiresAt` and server/client clock offset. Reopening a
  modal does not restart time. At zero, QR/payment links are hidden while the
  server reconciles; the browser does not invent payment success or failure.
- Only signed, matching payment confirmation grants course access. Duplicate
  webhook delivery is idempotent. Fulfillment uses a transaction and keeps
  explicit admin revocations intact.

## Verification boundaries

Final local results on 2026-11-23:

- Backend: **137/137 passed** (`npm.cmd test`).
- Frontend: **71/71 passed**, full lint, 8,815 math expressions validated and
  production build completed (`npm.cmd run check`).
- Browser: **23/23 passed** in one final run, including Google login/email
  repair, cross-tab logout, checkout recovery and simulated playback.
- Backend build and architecture checks passed (111 source/tooling files).
- `http://localhost:5173/api/health`: HTTP 200, MongoDB connected,
  course commerce ready. The live catalog reports course 1 at 10,000 VND and
  courses 2–4 closed at zero price. No price was changed during verification.

Browser report: `artifacts/course-checkout/report/index.html`.

Automated tests use isolated model/provider fixtures; no live bank transfer,
customer key redemption or customer-account mutation is part of the tests.
JWT signature tests use generated test signing keys. Browser tests simulate
API responses and do not authenticate to a real Google account.

Before production acceptance, use a controlled real purchase to confirm bank
receipt, production webhook delivery and the resulting enrollment, then check
playback using that purchaser. A real Google login and expiry/refresh cycle
also need browser acceptance with the deployed OAuth configuration.

Commands:

```powershell
cd backend
npm.cmd test
npm.cmd run build
npm.cmd run check:architecture
cd ../frontend
npm.cmd run check
npx.cmd playwright test --config playwright.course.config.js
```
