# React + Vite

## Production OAuth redirect (Netlify)

Google sign-in uses Firebase's full-page redirect flow. This project proxies
`/__/auth/*` and `/__/firebase/*` through Netlify so the Firebase helper runs
on the same site origin instead of inside a third-party iframe.

Before deploying the redirect flow to `toancaocapueh.id.vn`, configure the
following outside this repository:

1. The canonical site automatically uses `toancaocapueh.id.vn` as its Firebase
   `authDomain`. If Netlify defines `VITE_FIREBASE_AUTH_DOMAIN`, keep it set to
   the same value for configuration clarity, then rebuild.
2. In Firebase Authentication, authorize `toancaocapueh.id.vn`.
3. In the Google OAuth client used by Firebase, authorize
   `https://toancaocapueh.id.vn/__/auth/handler` as a redirect URI. Keep the
   existing Firebase-hosted URI too if other environments use it.
4. In Netlify, set `VITE_GOOGLE_CLIENT_ID` to that OAuth **Web** client ID and
   add `https://toancaocapueh.id.vn` to its authorized JavaScript origins.
   This variable enables One Tap; the normal Firebase redirect remains the
   fallback when One Tap is unavailable or suppressed by the browser.
5. The backend safely defaults to the public project ID
   `toancaocapueh-auth`; Render may still set `FIREBASE_PROJECT_ID` explicitly.
   Set `FIREBASE_AUTH_DISABLED=true` only when Google/Firebase sign-in must be
   intentionally disabled.

GitHub uses a server-side authorization-code exchange. Keep
`GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` on Render only; the frontend
requests the public client ID at runtime and never receives the secret.
Set the GitHub OAuth App callback URL to
`https://toancaocapueh.id.vn/` so the SPA can validate `state` and exchange
the returned authorization code.

The canonical production site also calls the backend through a domain-scoped
Netlify `/api` rewrite. Do not point its `VITE_API_URL` directly at Render:
same-origin API calls keep the HttpOnly session cookie first-party and reliable
in browsers that block third-party cookies. Preview and branch deploys do not
inherit this production proxy; give them an explicit `VITE_API_URL` and matching
Firebase `authDomain` only when they have their own backend environment.

Netlify evaluates `frontend/public/_redirects` before `netlify.toml`. Keep the
three `https://toancaocapueh.id.vn/...` proxy rules above the final
`/* /index.html 200` SPA fallback. The domain-qualified sources deliberately
prevent Netlify preview URLs from sending auth traffic to production.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
