# UEH TCC backend

The backend is a modular monolith. NestJS owns bootstrap and the native resources HTTP adapter; established Express routes remain active during incremental migration.

```powershell
npm.cmd ci --include=dev
npm.cmd run check:architecture
npm.cmd run build
npm.cmd run dev
```

Use the existing backend environment configuration. No new authentication secret or Firebase setting is required.

For Render, installation runs `postinstall` to compile the Nest shell into `dist` before a direct `node server.js` start. The local `.npmrc` includes build dependencies even with `NODE_ENV=production`. Recommended build command: `npm ci`; start command: `node server.js` (or `npm start`). Do not use `--ignore-scripts` for the install step.

Run one backend dev process at a time. If port 5000 is already occupied, `dev` exits before initializing MongoDB or starting workers. Background reconciliation starts only after the HTTP listener succeeds, and stops when that listener closes. A failed startup disconnects its database connection.

Course and donation requests share a serialized PayOS client and honor merchant `Retry-After`. Maintenance backs off per order and stops a batch on HTTP 429. These failures do not prove that an already sent payment request failed; signed provider confirmation is still required to settle an order.

- Business implementations: `src/modules/<feature>`.
- Public capability APIs: `src/modules/<feature>/index.js`.
- Shared HTTP/database infrastructure: `src/platform` and `src/app`.
- Native Nest composition: `nest`; generated output: `dist`.
- The old global layer folders have been removed. Runtime and tooling import the canonical module paths.
- Manual Community seed: `npm.cmd run seed:community`. This operation writes to MongoDB and is never part of source cleanup.

See [architecture, deployment and rollback](../docs/BACKEND_ARCHITECTURE.md) for boundaries, preserved behavior and remaining migration phases.
