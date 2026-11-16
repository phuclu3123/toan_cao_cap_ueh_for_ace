# Cloudflare Turnstile

CouponHub's widget credentials are reused by the local `backend/.env` and
`frontend/.env`. These files are ignored by Git. Only the public site key is
included in the frontend build; the secret key stays in the backend.

Protected POST routes:

| Route | Widget action |
| --- | --- |
| `/api/login` | `login` |
| `/api/signup` | `register` |
| `/api/auth/forgot-password` | `reset_request` |
| `/api/contact` | `contact` |
| `/api/subscribe` | `subscribe` |

The server checks Siteverify `success`, `action`, and an explicit hostname
allowlist before running the controller. Existing rate limits still apply.
The frontend resets widgets after submission, including failed requests and OTP
resends. Google/GitHub session exchange continues to verify provider identity.

## Production configuration

1. In Cloudflare Turnstile, open the existing CouponHub widget and add
   `toancaocapueh.id.vn` and `www.toancaocapueh.id.vn` to its allowed hostnames.
   For preview deployments, add each intended preview hostname explicitly.
2. Set `VITE_TURNSTILE_MODE=required` and `VITE_TURNSTILE_SITE_KEY` on the
   frontend hosting service, using the local frontend environment values.
3. Set `TURNSTILE_MODE=required`, `TURNSTILE_SITE_KEY`,
   `TURNSTILE_SECRET_KEY`, and `TURNSTILE_HOSTNAMES` on the backend hosting
   service, using the local backend environment values. Restrict the production
   allowlist to the intended frontend hosts.
4. Rebuild the frontend and restart/redeploy the backend together.

Local `.env` edits do not update Netlify or Render environment settings.
Use `auto` with empty keys for an unconfigured development checkout; a partial
configuration fails closed. Use `off` only when deliberately disabling the guard.

Reference: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
