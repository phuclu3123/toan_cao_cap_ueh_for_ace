# Learning UI and discussion acceptance — 2026-11-25

## Changes

- Reused the existing paper palette, black actions and restrained lavender accents for authentication, post creation, the formula notebook, course details, player controls, member profiles and discussion areas.
- Used the user-provided AIM4A PNG as a circular site mark, including navigation, footer, loading, checkout and favicon.
- Aligned inline and display LaTeX answers to the same left edge. Scoped overrides also remove the global community math block's important padding.
- Added whole-page PDF fitting, manual zoom down to 10%, rotation-aware fitting and reader positioning below the sticky navigation. Multi-page width fitting remains available.
- Added keyboard focus containment, Escape handling and focus restoration for the composer, notebook and nested Greek-symbol dialog. Unsaved-post confirmation remains in place.
- Replaced notification `Model.init()` with retryable preparation after MongoDB connects. Collection and indexes are prepared before the heart/notification transaction; failed preparation can retry.
- Blog comments/reactions enter the public stream only after server confirmation. Failed comment text remains in the editor; browser storage failure does not turn a successful server write into an apparent failure. State is isolated by article.
- Added a service-origin GET route that also handles HEAD hosting probes. Dependency readiness remains at `/api/health`.

## Verified

- Backend: **166 tests passed**, TypeScript build passed, architecture check passed for 124 files.
- Frontend: **82 tests passed**, ESLint, strict math validation and production build passed.
- Browser acceptance: **41 tests passed** across community, checkout, player, authentication, PDF and blog discussions. Screenshots reviewed at 1440, 768 and 390 pixels.
- Final production-build browser check measured all four exam answer offsets as **0 px**. The complete PDF page stayed inside the 1000 px viewport at all three widths.
- Real MongoDB acceptance covered comments, nested replies, edits/deletes, heart idempotency, private inbox delivery, access isolation, transaction rollback, and blog comment/reaction persistence. Both browser accounts used the disposable QA database; it was removed afterward. The application database was not modified by this acceptance script.
- The blog browser test also verifies failure preserves text, no fake successful comment appears, reload retrieves the saved comment, and a simulated local-storage quota does not break a confirmed write.

## Local evidence

Reports and screenshots remain local under `artifacts/`: `ui-refresh-acceptance.log`, `ui-refresh-backend-tests.log`, `ui-refresh-release-check.log`, `ui-refresh-build/report.json`, and `community/comment-acceptance/report.json`.

Browser checkout/provider cases use controlled API fixtures; they do not transfer money or validate live Google, Turnstile or bank-provider behavior. Render dashboard/deployment verification remains with the user as requested. A Git push is not a deployment verification.
