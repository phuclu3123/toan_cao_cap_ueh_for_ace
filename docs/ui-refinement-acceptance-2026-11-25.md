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

## Follow-up: bright learning studio

- Rebuilt the course introduction as peach and sky paper fields, using four original full portrait handwritten pages (Input–Output, elasticity, stationary points and Lagrange). Moved course facts to a separate strip and replaced the repeated cover in the enrollment sidebar with a dedicated starting/learning panel. Activated accounts see their access state rather than another price offer.
- Rebuilt post creation again after user feedback: one writing sheet, title and subject/difficulty at the top, on-demand formula tools, a dedicated notebook action, and collapsible image/tag details below the editor. Drafts, preview, formula notebook, upload and submission handlers remain connected.
- Constrained the playlist to the video and controls' height on desktop; it becomes a bounded list below the video on tablet/mobile. The desktop dialog is now up to 1360 px wide, with video height capped at 52dvh; the syllabus opens by default on wide screens. Added a minimum-width reset to keep dialog actions inside the phone viewport.
- Brightened discussion cards with sky/mint surfaces and stronger text. Filled and autofilled auth inputs use dark ink on a white surface, with no intermediate shadow transition. Turnstile receives the application's theme, including when the OS theme differs.
- Changed the title to `α∫M4A - Math for all • Aim for A`, including social metadata and the blog title suffix. The actual browser favicon now embeds the original image inside a circular SVG clip, rather than relying on the navbar's CSS crop. Browser canvas checks measured alpha 0 at the corner and 255 at the center.

### Follow-up evidence

- Frontend checks: ESLint, 82 unit tests, 8,815 strict KaTeX expressions and production build.
- Initial expanded browser run: 39 of 41 cases passed. The two failures identified an outdated composer dialog name in the test and an animated autofill paint; both were corrected. The four affected UI/create/comment cases then passed against the production build at 1440, 768 and 390 pixels.
- Browser checks cover actual modal bounds, the single writing sheet, on-demand math controls, optional attachment details, light autofill under a dark OS, app-selected Turnstile theme, hidden price for activated access, and playlist placement without the previous blank band. Provider responses in these UI checks are controlled fixtures.
- Local screenshots and traces: `artifacts/learning-studio-acceptance/`, `artifacts/learning-studio-final/` and `artifacts/learning-studio-revision/`. Production layout measurements: `artifacts/learning-studio-production/report.json`.
- The design inspector measured no horizontal overflow or broken images at the three widths. It also flagged the established floating capsule navigation/shadows, paper blends, pastel icon fields, marketing headline size and existing small footer labels. These style findings are not a clean accessibility certification; the homepage's paper palette and capsule navigation were retained according to the user's direction. The enrollment-note contrast and new course caption size were improved during this pass.

## Hand-drawn editorial sections and notebook

- Added an unboxed portfolio note below the homepage mementos, linking to the owner's supplied `https://phuclu3123.github.io/portfolio/`.
- The five public sections now have different copy, composition and original SVG scenes: a reader's learning journey (courses), a bookshelf (resources), a conversation (community), a practice worksheet and stopwatch (exams), and a letter with a paper plane (blog). These illustrations contain no navigation links. Flashcards are unchanged.
- Increased course-section breathing room at the user's correction: 170 px above / 185 px below the editorial section on desktop, 130 / 145 px on mobile. The exam illustration sits between online practice and midterm materials.
- Replaced the formula notebook's nested cards with a category index and flat formula/name/action rows. On phones the index becomes a horizontal strip. Clipboard feedback is confirmed only after `writeText` resolves, and failure feedback remains available on phones.
- The homepage journey heading uses the locally hosted **Oooh Baby** handwriting family, including Vietnamese, Latin and extended Latin subsets. The OFL license is included. Font source: https://github.com/google/fonts/tree/main/ofl/ooohbaby.
- Fixed fullscreen layout independently from the short modal layout: the player fills the screen, the stage flexes into available height, controls retain readable dark surfaces, and the playlist remains bounded. Browser acceptance enters and exits the real Fullscreen API on desktop and phone-sized viewports.
- Replaced the old `fvc.jpg` social metadata with an original 1200 × 630 PNG under a new URL, plus width/height/type/alt metadata. A read of the public homepage still returned the previous title and old image before this release; local changes are not evidence of production rollout or social-cache refresh.
- YouTube uses the site's external controls (`controls=0`), annotations off and related results limited by the supported embed options. No cropping, iframe extraction or fake `modestbranding` / `showinfo` removal is used. The official documentation says those branding/info parameters are deprecated: https://developers.google.com/youtube/player_parameters. Complete removal of provider overlays requires a separately hosted video source rather than a YouTube iframe.

### Current verification

- First distinct-layout review: **4 browser cases passed** at 1440, 768 and 390 px, including real API-fixture post create/edit/delete, notebook copying/search, responsive player/auth, all five scenes and portfolio link.
- Final frontend check passed: ESLint, **82 unit tests**, **8,815 strict KaTeX expressions**, and production build. A final build after the fullscreen duration-text contrast adjustment also passed.
- Final production browser run: **5 cases passed**. Covered post create/edit/delete, answers and comments, notebook search/copy, mobile composer, all five editorial scenes, exact social metadata, locally loaded handwriting, and real fullscreen entry/exit at desktop and phone widths. Evidence: `artifacts/study-editorial-production/results/`; check logs: `artifacts/study-editorial-complete-check.log` and `artifacts/study-editorial-ship-build.log`.
- Production design inspection measured **0 px horizontal overflow and no broken images** at 1440, 768 and 390 px. It is not a clean style audit: it flags existing tiny labels, pastel icon fields, paper blends, shadows, the floating navbar covering text at intermediate scroll positions, and marketing-title scale. The user specifically requested the paper/pastel direction and more breathing room. The automated app-screen score does not establish accessibility compliance. Report: `artifacts/study-editorial-inspector/report.json`.
- Controlled YouTube/payment responses remain fixtures, not verification of a real bank transfer or every live YouTube overlay. The fullscreen screenshots intentionally show the fixture's embedding-error state while measuring the actual layout; they are not evidence that the production lesson is blocked.
