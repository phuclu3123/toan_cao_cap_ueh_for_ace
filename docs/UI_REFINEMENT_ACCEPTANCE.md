# UI refinement — local acceptance

## Scope and order

Finish composition and interaction before the requested page-by-page palette review. Current colors are transitional, not approved. The design rationale, original-site comparison and exceptions are in `.taste-skill/site-refinement/review.md`.

## Implemented

- **Library:** removed the old proportional-padding placeholder that doubled artwork height; metadata and concise labels no longer overlap the image. The two original book covers remain on home and their publication cards. Long original titles remain available in title attributes and full content.
- **PDF:** replaced the narrow embedded viewer with a fluid reading desk. Auto layout shows up to five pages according to available width; explicit 1–5 page selection, page/group navigation, numeric jump, zoom/reset, rotation, per-page reading, text selection, original PDF links, original download and fullscreen. Phone layout uses one page. Only the current group is rendered; each bitmap is capped at five million pixels. Resize is debounced. Actual original PDFs remain untouched.
- **Publication metadata:** display persisted view counts only; unknown counts stay absent. Engagement writes no longer modify publication updatedAt. Prefer editorial publication/date fields over engagement-related timestamps.
- **Home:** retain the two original book covers, compact introductory copy, real catalog totals, and the automatically animated educational strip.
- **Courses:** original SVG covers and a four-course, two-column catalog. Lesson counts come from published content; student counts are distinct active course entitlements, not payment totals or active-learning sessions. Unknown published lesson counts are not invented zeros. Closed courses say registration is unavailable instead of implying a free price.
- **Exams:** use generated metadata from the actual practice-exam content (question counts and duration), with cohort/search filters and honest empty states.
- **Blog:** full featured artwork, aligned text column, short preview titles for long specialist articles, category/search controls and responsive article grid. Full article content remains unchanged.
- **Motion:** one-time viewport reveals, no per-scroll JS listener; diagrams use a shared animation loop and pause off-screen/when the tab is hidden. Reduced-motion immediately exposes content and stops ambient animation.
- **Footer:** official Facebook, YouTube and existing Zalo links. TikTok is an icon without a fabricated link.

Community comments, notifications and full-height interactive margin objects are documented separately in `COMMUNITY_ACCEPTANCE.md`.

## Repeatable checks

```text
frontend: npm.cmd run lint
frontend: npm.cmd run build
frontend: node scripts/review-site-refinement.mjs
frontend: node scripts/community-universe-review.mjs
backend:  npm.cmd run build
backend:  npm.cmd run check:architecture
```

Browser checks use the real local catalog and PDFs, and inspect 1440/768/390px layouts plus a 2560px PDF desk. Focused QA blocks third-party auth/captcha scripts in its own browser context only. Browser visits can record ordinary public document views; no account or content deletion is part of this review.

## Evidence

- `artifacts/ui-refinement/report.json` and corresponding screenshots: latest focused browser result.
- `artifacts/ui-refinement/production/report.json`: the same checks against the production build served locally, separate from dev results.
- `artifacts/ui-refinement/pdf-inspector/`: additional design inspector, with findings and timing limitations; not a clean pass.
- `artifacts/course-catalog-stats/report.json`: database comparison for actual course figures.
- `artifacts/community/comment-acceptance/report.json`: isolated two-account comment/notification checks.
- `artifacts/community/universe/report.json`: pointer, collision, trails, full-height and reduced-motion checks.

Latest run, 24 November 2026: frontend lint/build passed; backend build/architecture passed (116 source/tooling files). Both dev and production-local browser runs passed 11 check groups, with 15 route/viewport measurements at zero horizontal overflow and no page errors. The universe run passed five check groups with no page errors. Production-local means a built bundle on this computer, not a deployed release.

## Remaining review boundaries

- Palette harmony is deliberately deferred per the user's instruction; do not describe the current colors as final or approved.
- This is local UI/functional acceptance, not production deployment verification.
- PDF annotation editing, persistent PDF notes and arbitrary embedded scripts are not implemented; safe original hyperlinks and internal destinations are preserved.
- The short browser long-task sample is not a guarantee on every device.
- Existing unpublished sample course curriculum is separate from the now factual public course figures.
- Notification delivery is visible-tab polling/focus refresh, not push/email/WebSocket delivery.

Local addresses: frontend `http://localhost:5174`, backend `http://localhost:5000`.
