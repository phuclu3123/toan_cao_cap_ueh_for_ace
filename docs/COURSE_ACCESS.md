# Course access

Course 1 uses the supplied 14-video playlist. Lessons 2 and 3 require access;
other lessons are public samples. The browser catalog has metadata only. Every
playback entry point requests `/api/courses/:courseId/lessons/:lessonId/content`.

## Authorization

- Owner access uses the existing verified session, `Admin` role, and configured
  `ADMIN_EMAIL`/`ADMIN_USERNAME` policy. It does not require purchase or a key.
- Learners use the existing unique Enrollment row for `(userId, courseId)`.
- Existing PayOS confirmation/status handling grants the paid enrollment.
  A frontend redirect or a success message cannot grant access by itself.
- A `TCCK-...` key grants the same enrollment with source `KEY`. Key claim,
  enrollment, and audit are committed in a MongoDB transaction.
- A key is course-specific, single-use, and stored as a SHA-256 hash. Full codes
  are returned only when issued. A retry by the successful claimant returns the
  previous result. An active member cannot accidentally consume another key.
- Revoked rights cannot be restored with a new key or by buying again. The
  owner must explicitly restore the enrollment.

## Admin

Use the account menu's course management link, or the course sidebar's management
link. The owner can issue/download keys, disable unused keys, grant registered
emails, list members and their sources, revoke/restore access, and read the audit.
Flashcard keys and Flashcard rights are separate and unchanged.

API routes under `/api/course-access` require a session; `/admin` additionally
requires the owner role. Lists are paginated. Redemption and admin calls have
rate limits. Course-key indexes are initialized additively at startup, with no
collection drops, account migration, or rewriting existing enrollments.

## Checkout and configuration

Course 1 uses its existing server price and PayOS flow. Courses 2–4 are closed
at zero price in the UI and backend; creating orders for them is rejected.
Existing payment rows and enrollment records are preserved.

Required existing backend settings: `ADMIN_EMAIL`, `PAYOS_CLIENT_ID`,
`PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`, plus the existing callback/origin settings.
No merchant secrets or full activation codes should be logged.

These sample sources are public YouTube videos. App authorization controls the
course API, not access to the underlying public YouTube URLs. Playback history
still lives in browser storage; cross-device progress sync is separate work.

## Local checkout verification

The course-access API, key redemption, order creation, and paid enrollment all
require MongoDB. An unavailable database returns 503; it does not mean the
student is unregistered or that PayOS has rejected a payment. The owner shortcut
does not prove the student enrollment store is reachable.

The unlock dialog checks access before showing checkout/key actions, bounds the
request to 12 seconds, and offers a retry when storage or networking is down.
Course detail also shows the unavailable state instead of silently treating it
as a confirmed lack of enrollment. Verified UI rights are cleared on identity
changes; every protected API request still checks the server.

If the backend starts while MongoDB is unreachable, development fallback is
selected for that process. After moving to an allowed network, restart the
backend and check `/api/health`: `database.status` must be `connected` before
testing actual checkout. Avoid adding a checkout fallback that grants access
without durable storage.

Focused checks:

- Backend: `node --test tests/course-checkout.test.js tests/course-content.test.js tests/paymentPolicy.test.js`
- Browser with simulated APIs: `npx playwright test --config playwright.course.config.js`
- Frontend contract checks: `node --test tests/entitlement-flow.test.js`

Browser tests cover student checkout, QR rendering, payment confirmation,
idempotent retries, outages/recovery, locked lessons, owner/student access,
revocation, sign-in requirements, closed courses, and identity changes. These
checks use isolated fixtures; they do not create live orders, keys, users, or
enrollments. Actual merchant credentials, bank transfers, and production
webhooks still require verification on a network that can reach MongoDB/PayOS.
