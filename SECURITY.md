# Authentication and deployment

The former login accepted any nonempty password and trusted a browser profile. The former admin credentials and signing key were embedded in source. Neither mechanism is accepted anymore. All users, including administrators, now authenticate through the same server-side account and session checks.

## Required configuration

Use Node.js 24 or later. Copy `.env.example` into your deployment's private environment configuration and set:

- `APP_ORIGIN`: the exact browser origin, for example `https://market.example`, without a trailing slash. Production requires HTTPS. This value controls CSRF validation and email links; request Host headers never determine recovery links.
- `RESEND_API_KEY` and `AUTH_EMAIL_FROM`: a server-side Resend API key and an address on a verified sending domain, required only for password recovery. Sign-up and sign-in work without email delivery. Recovery fails closed if these settings are missing. Email delivery runs through Next.js `after()` after the generic response, so provider timing and errors do not disclose account existence. Delivery failures log only a generic operational message; monitor the provider and request recovery again to retry. No development endpoint returns or logs bearer tokens.
- `ADMIN_USER_ID` (optional): the stored user ID of the account granted administrator access. Register the intended account, then configure its ID from the database. There is no default administrator or separate admin password. An email address alone never grants administrator access. Changing this value immediately changes authorization on subsequent requests; `ADMIN_EMAIL` is no longer used.
- `MONGODB_URI` and `MONGODB_DB_NAME` for a shared database, or `SQLITE_PATH` for a persistent SQLite file on a single host. MongoDB connection failures never fall back to SQLite. MongoDB deployments need permission to create the `auth_state` collection and its TTL index. Do not expose either database to browsers or give clients direct write access.
- `AUTH_TRUSTED_IP_HEADER` (optional): configure this **only** if your trusted ingress overwrites that header and clients cannot reach the app directly. Leave it empty otherwise. Without a trusted header, the source limit is deliberately shared by all visitors. Use a shared MongoDB database across replicas; separate SQLite files cannot coordinate limits or revocation.

All configuration above is server-only. Do not prefix it with `NEXT_PUBLIC_`, add it to `next.config.js`'s `env`, or import server modules into client components. `server-only` guards enforce that boundary during compilation. Remove obsolete `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, and `NEXT_PUBLIC_ADMIN_EMAIL` settings. Treat the former source-embedded password and signing key as compromised, and rotate them wherever they were reused. Old admin cookies and local-storage profiles grant no access.

## Existing accounts and data

Accounts that already have a stored password can sign in immediately, including accounts that were awaiting email verification. Their profile is restored on successful password authentication if needed. Older profiles without password hashes must use **Password recovery** to prove mailbox ownership and choose a password. Recovery retains their stored user ID, preserving records owned by that ID. New registrations cannot replace existing profiles. Listing ownership is determined by the authenticated user ID; the former email/phone-based ownership inference was removed. Legacy records with mismatched or missing owner IDs require an operator to reconcile ownership using independently verified evidence.

Back up the database before deployment. Authentication adds an `auth_state` table/collection; it does not delete existing marketplace data. The old seed-version logic that deleted listings and requests has been removed. Previously client-supplied profile fields and verification badges are not reliable historical evidence; legacy password enrollment clears the profile's phone-verification claim. No phone-verification service is implemented by this change, and clients cannot grant that status.

## Controls

- Passwords: random 16-byte salts, asynchronous scrypt (`N=131072`, `r=8`, `p=1`, 64-byte output), constant-time comparisons, and a 15–128 character policy. Unknown-account checks perform the same password derivation. Allow memory for approximately 128 MiB per concurrent hash operation.
- Sessions: opaque random 256-bit tokens in `HttpOnly`, `SameSite=Lax`, production `Secure` cookies. Only token hashes are persisted. The server enforces a 12-hour absolute expiry and a 30-minute idle expiry. Login rotates the current session; logout revokes it in storage. Password reset changes the credential version, invalidating every prior session.
- Sign-up and sign-in: no email verification step. Registration persists the profile and starts a session immediately; login requires the stored password. Email addresses are not proof of mailbox ownership and do not confer administrator privileges.
- Recovery: hashed 256-bit tokens expire in 30 minutes. Issuing another invalidates the previous link. Atomic compare-and-swap consumes reset tokens, including concurrent requests. Email links carry tokens in URL fragments, which are removed after the page reads them; tokens are never sent in query strings or referrers. Opening a link alone does not change an account.
- Rate limits: persistent atomic counters allow 5 login attempts per normalized email per 15-minute window, shared by regular/admin login; 30 attempts per source and action per window; 3 signup/email-send attempts per address per window; and 5 reset submissions per address per window. Counters include successful attempts, and fixed windows may permit adjacent-window bursts. Rejected attempts receive HTTP 429 and `Retry-After`. Edge limits should additionally protect aggregate resource usage.
- Authorization: protected mutations validate sessions at the API, derive ownership from the account, and accept only editable fields. Profiles cannot change identity, email, credentials, or verification status. Admin data loaders and admin APIs independently check server-side admin status; middleware's cookie-presence redirect is only an optimization.
- Browser boundaries: state-changing APIs enforce the configured Origin; authentication responses use `Cache-Control: no-store`; redirects accept only local paths. Headers restrict framing, MIME sniffing, referrers, form targets, and base URLs. The frontend retrieves its user from `/api/auth/me` and only displays successful saved mutations.

## Verification

Run `npm run test:auth`, `npm run typecheck`, `npm run lint`, `npm run build`, and `npm audit`. The authentication suite uses a temporary SQLite database and a mocked email provider; it never reads `.env.local` or sends real emails. It covers immediate sign-up sessions, login without mail configuration, previously unverified accounts, password checks, reset token expiry/replay/races, session expiry/revocation, rate-limit races, CSRF, redirects, account enrollment, ownership and admin boundaries. Production recovery email delivery and a live MongoDB deployment still require an environment-specific smoke test with your own test mailbox.

Next.js was updated to the patched 15.5 release line. A PostCSS override selects the patched version for its transitive dependency. Keep dependency audits and security updates part of deployment maintenance.

References: [OWASP password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), [OWASP password recovery](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html), [Resend email API](https://resend.com/docs/api-reference/emails/send-email).
