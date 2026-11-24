# Payment reliability checks — 25 November 2026

## Fixes

- Course checkout callbacks no longer change with the dock's one-second countdown. Status requests keep their polling schedule and observe a minimum interval, including manual checks.
- PayOS calls from courses, donations and maintenance share one outbound queue and merchant cooldown per backend process. HTTP 429 honors `Retry-After`; a missing header defaults to 60 seconds. The client accepts both seconds and HTTP dates.
- Maintenance selects only due orders, persists exponential retry delays, prevents overlapping runs and stops its batch on merchant rate limiting. A failed reconciliation never proves cancellation or payment.
- An outbound create blocked locally by cooldown is distinguishable from an already sent request with an unknown result. Only a definitive rejection or a request never dispatched may mark that new reservation failed.
- Donation indexes initialize after MongoDB connects. Initialization retries safely after failure instead of reusing a rejected pre-connect `Model.init()` promise with buffering disabled.
- A donation form failure before an ambiguous provider operation releases the uncommitted browser receipt so its amount can be changed. Transport failures preserve the token for idempotent retry.
- Donation and course records, receipts, QR payloads and fulfillment remain separate. The signed donation webhook returns before course fulfillment; URL parameters never prove payment.
- Background reconciliation starts after the HTTP listener succeeds. A failed startup closes its application/database resources. The dev runner rejects an occupied port before launching watchers or touching storage.
- Deprecated Mongoose update options use `returnDocument: 'after'`.

## Verification boundaries

- Backend unit/integration fixtures cover retries, cooldown, signatures, ownership, entitlement grants and duplicate startup without contacting a bank.
- Browser fixtures exercise bounded checkout polling, course plus donation in the same browser, donation-store recovery, Google login and player progress.
- A real PayOS donation link for 50,000 VND was created and verified in a temporary QA database, then cancelled. No money was transferred. The QA database was removed; application payment records were not replaced.
- MongoDB community/comment acceptance used temporary QA databases and removed them after checks.
- A Git push is publication of source; it does not by itself confirm production deployment or an actual bank transfer.

## Local operation

Run one `npm.cmd run dev` in `backend`. If another process owns port 5000, use that backend or stop its terminal before restarting. Do not run a second server to work around an error in the first one.

Provider throttling can still occur outside this process (for example from another deployment sharing the merchant). QR remains valid until its original deadline; signed webhooks can settle payments immediately while outbound polling waits.
