# Backend modular monolith and NestJS migration

## Current implementation

This is one backend process and one MongoDB database. NestJS 12.6.0 owns application bootstrap. The HTTP adapter is Express 5.3.0. The migration is incremental: resources has a native Nest controller, injected service and session guard; other endpoints retain their established Express handlers, now organized into business modules.

```text
backend/
  nest/                       TypeScript Nest composition and HTTP adapters
    app.module.ts
    bootstrap.ts
    identity/                 Adapter to the existing session verifier
    resources/                Native Nest controller and service
  src/
    app/                      HTTP perimeter, storage startup, error mapping
    platform/                 Database connection, shared HTTP middleware
    modules/
      identity/               Users, Google/Firebase identity, sessions, OTP
      access/                 Enrollments, course/flashcard grants and keys
      learning/               Course content, catalogs, flashcard content
      commerce/               Pricing, promotions, checkout, orders
        payments/             PayOS, webhook processing, reconciliation job
      resources/              Resource catalog and publishing use cases
      community/              Discussions, reporting, contributor profiles
      blog/                   Blog engagement
      contact/                Contacts and subscribers
  dist/                       Compiled Nest shell, ignored by Git
  data/                       Existing bundled/local data, same location
  server.js                   Stable entrypoint and runtime selection
```

The compiler emits only the TypeScript Nest shell. Both runtimes import the same `src` JavaScript implementations and therefore share the same Mongoose models. There is no compiled duplicate of the model files.

## Dependency rules

- A module calls another module through `src/modules/<name>/index.js`.
- A module owns its persistence models. Other modules use capability functions instead of importing those models.
- Identity owns account lookup, including the transaction-aware email lookup used during permission grants. The caller's MongoDB session is retained.
- Application code must not import HTTP controllers or middleware.
- Platform code must not depend on a business module.
- Application bootstrap may register module HTTP routes. The old global layer folders are removed; scripts and tooling use canonical module paths.
- Feature-specific admin operations stay with that feature; avoid building a second generic admin implementation of the same rules.

`npm run check:architecture` performs static source/dependency lint, including backend scripts and test-file imports. It does not execute handlers, tests, database operations or HTTP requests. It rejects missing relative imports, imports of deprecated layers, cross-module internal imports, platform-to-feature dependencies and application-to-HTTP dependencies. No cross-module persistence exceptions are allowed.

## What changed

- 65 implementation files moved from global layers into module ownership. The transition shims were subsequently removed after runtime/tooling imports were updated.
- Payment core and managed reconciliation/cancellation moved out of the HTTP controller into `commerce/payments/application/paymentService.js`.
- Payment maintenance now has its own job file and an explicit stop function. Startup remains conditional on commerce readiness; shutdown closes the interval.
- Community seed constants moved into its domain folder. Startup migration no longer imports a controller. Its existing opt-in environment flag remains unchanged.
- Resource operations accept plain inputs and return `{statusCode, body}`. Both native Nest and compatibility HTTP adapters use those operations, preserving existing response envelopes and owner checks.
- Native resource publishing uses the same established `requireAuth` session verifier through a Nest guard. Its existing 401/503 body and private cache headers are preserved.

## Compatibility and data

No account backfill, collection rename, reseed command, session rotation policy change or payment migration is part of this work. Existing Mongoose model declarations, database name selection, cookie name, identity verification, user IDs, enrollment policies and payment signatures are retained.

Existing startup initialization remains in `src/app/storage.js`, invoked before listening. Importing the application does not call database initialization. The existing community seed migration still requires `RUN_LEGACY_DATA_MIGRATION=true`. Normal module migration does not enable it.

Both legacy and native routes share the original CORS/origin checks, proxy configuration, security headers and 10 MB body parsers. Nest's automatic body parsing is disabled. Express's query parser is explicitly `extended` to retain Express 4 query parsing behavior. The native resource adapter uses explicit response objects to retain the status and JSON format.

## Local commands

```powershell
cd backend
npm.cmd ci --include=dev
npm.cmd run check:architecture
npm.cmd run build
npm.cmd run dev
```

Development starts the TypeScript watcher and the Node watcher. A TypeScript change rebuilds the Nest shell; a source JavaScript change restarts the server. Source maps are emitted for debugging. Production should compile once during its build stage.

### Render build settings when this branch is deployed

- Root directory: `backend`.
- Build command: `npm ci --include=dev && npm run build`.
- Start command: `node server.js`.
- Retain the existing environment variables, MongoDB database and session settings.
- No Firebase Console change or new secret is required.

The TypeScript compiler and types are development dependencies and must be present in the build stage. `npm start` also builds locally; the production start command above runs the already compiled result.

## Runtime rollback

`BACKEND_HTTP_RUNTIME=express` selects the modular Express composition, including the compatibility resource router, without loading the compiled Nest shell. The default is `nest`. This is an HTTP composition rollback, not an Express version downgrade. Both modes retain the same source services and model instances.

```powershell
$env:BACKEND_HTTP_RUNTIME = 'express'
node server.js
```

Remove the override or set it to `nest` to use the Nest composition again. Source snapshots for this working-copy migration are under `artifacts/architecture-migration/source-before`; they exclude `.env` and user data. Do not use a broad Git reset because this workspace contains earlier uncommitted feature work.

## Remaining migration

Resources is the first native Nest feature. Auth, commerce, access and other modules still use their existing Express HTTP adapters. Move one feature at a time, keep the same public API, and retain a rollback checkpoint. Converting all handlers to Nest decorators, converting all JavaScript to TypeScript, and reorganizing the React frontend are separate follow-up phases.

## Backend cleanup

The obsolete root folders `config`, `controllers`, `middleware`, `models`, `routes`, `services`, `utils` and the empty architecture-exception configuration have been removed. Their transition files are recoverable from `artifacts/backend-cleanup-2026-11-23/removed-files.zip` with a cleanup manifest alongside it. An empty `src/platform/mail` folder was also removed after OTP mail moved under Identity.

The useful manual Community seed script now lives at `backend/scripts/seed-community-db.js`, exposed as `npm run seed:community`. Cleanup did not execute it. Google E2E tooling follows canonical module imports.

`data`, `.env`, `nest`, `src`, `tests`, `node_modules` and the generated `dist` remain in use. In particular, the default Nest entrypoint requires the compiled `dist` output. Removing it would require a rebuild before starting.

Before production acceptance, exercise login/session renewal, old Google accounts, owner access, resource publishing, course/flashcard grants, coupon quotes and PayOS callbacks on the target environment. Real bank transactions and email delivery have not been certified by this structural migration.

Dependency installation also reported existing advisories for Mongoose, Nodemailer and ip-address. This migration does not automatically upgrade those unrelated libraries or change their data behavior.

References: [Nest Express migration](https://docs.nestjs.com/recipes/express-migration), [Nest modules](https://docs.nestjs.com/modules), [Express 5 migration](https://expressjs.com/en/guide/migrating-5/).
