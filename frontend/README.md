# React + Vite

## Production OAuth redirect (Netlify)

Google sign-in uses Firebase's full-page redirect flow. This project proxies
`/__/auth/*` and `/__/firebase/*` through Netlify so the Firebase helper runs
on the same site origin instead of inside a third-party iframe.

Before deploying the redirect flow to `toancaocapueh.id.vn`, configure the
following outside this repository:

1. In Netlify, set `VITE_FIREBASE_AUTH_DOMAIN=toancaocapueh.id.vn` and rebuild.
2. In Firebase Authentication, authorize `toancaocapueh.id.vn`.
3. In the Google OAuth client used by Firebase, authorize
   `https://toancaocapueh.id.vn/__/auth/handler` as a redirect URI. Keep the
   existing Firebase-hosted URI too if other environments use it.
4. In Render, set `FIREBASE_PROJECT_ID=toancaocapueh-auth` and redeploy the
   backend. This value is required for server-side Firebase ID-token checks.

GitHub uses a server-side authorization-code exchange. Keep
`GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` on Render only; the frontend
requests the public client ID at runtime and never receives the secret.

The canonical production site also calls the backend through Netlify's `/api`
rewrite. Do not point its `VITE_API_URL` directly at Render: same-origin API
calls keep the HttpOnly session cookie first-party and reliable in browsers
that block third-party cookies.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
