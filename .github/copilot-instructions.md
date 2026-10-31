# Copilot Instructions - itip-web-frontend

These rules are mandatory for all future Copilot work in this repository.

## Project baseline

- Frontend stack is Angular 21 LTS.
- Runtime baseline is Node 22 or higher LTS.
- Always run npm commands with the Node 22 or higher LTS toolchain (npm bundled with Node 22). Do not run npm commands from older Node runtimes.
- UI stack is PrimeNG + Tailwind.
- Primary visual references are in `def/mockups/` and `def/mockups/*/itip-design-system.css`.
- Keep custom CSS to a minimum. Prefer PrimeNG components and Tailwind utilities.
- For responsive behavior across screen sizes, prefer Tailwind responsive utilities directly in templates (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`, and `max-[...]` when needed).
- Prefer Tailwind responsive utilities over component-level `@media` rules whenever the same result can be achieved cleanly.
- Keep component CSS media queries only for cases not reasonably expressible with Tailwind utilities.

## Architecture and signals policy

- Use Angular signals as the default local state mechanism.
- Use computed for derived state only.
- Use effects only for intentional side effects.
- For backend data retrieval (read-side resources), use Angular signal resources (`resource` or `rxResource`) by default.
- Keep command-style actions (login, submit, mutations) explicit; do not force them into resources.
- Never create subscriptions inside reactive contexts in ways Angular flags as unsafe.

## Authentication and security policy

- Authentication is email/password via `POST /api/auth/login`.
- Store JWT in memory only (no localStorage or sessionStorage for auth token).
- Attach Authorization header only to trusted API endpoints.
- On `401` from protected API, clear session and redirect to `/login`.
- On `403` from protected API, do NOT clear the session (the session is valid, the action is not permitted): redirect to `/forbidden`.
- Do not leak bearer tokens to third-party origins.
- Never decode the JWT for authorization. The JWT is a lean, opaque bearer credential (`sub/jti/iat/exp`); it carries no roles or privileges.

## Authorization (authz) and RBAC policy

Authorization is separate from authentication. It lives under `core/authz/` (do not mix it into `core/auth/`, which owns session/token lifecycle). See ADR-001 (`portfolio/itip/architecture/ADR-001-frontend-authorization-delivery-contract.md`) and ADR-002 (session rehydration).

### Backend RBAC model (source of truth)

The backend (`itip-web-backend`, Spring Boot) exposes a temporal RBAC model:

```
Account ──< AccountRoleAssignment >── Role ──< RolePrivilegeAssignment >── Privilege
 (email,      (expiresAt, revoked_at)  (name)   (revoked_at)              (code, unique)
  fullName)
```

- The **authority unit is the privilege `code`** (unique string), NOT the role name. Roles are display/grouping only. There is no `ROLE_` prefix.
- Assignments are **temporal**: an assignment counts only if `revoked_at == null` AND (`expires_at == null` OR `expires_at` is in the future). Authorities are re-resolved server-side on every request.
- Backend endpoints are enforced with `@PreAuthorize("hasAuthority('<PRIVILEGE_CODE>')")` (method security is enabled).

### The delivery contract — `GET /api/auth/me`

- Roles + privilege codes reach the frontend ONLY via the authenticated endpoint `GET /api/auth/me` → `{ id, email, fullName, roles: string[], privileges: string[] }`. Privileges are the codes to gate on; roles are display-only.
- `401` = authentication failure (no/invalid/expired token) → clear session + redirect `/login`. `403` = authenticated but lacking a privilege → `/forbidden`, session preserved.

### Frontend authz building blocks (use these; do not reinvent)

- **`AuthzService`** (`core/authz/authz.service.ts`, signals): holds `identity`, `roles`, `privileges` (as `Set<string>` for O(1) checks). Use `hasPrivilege(code)`, `hasAny(codes)`, `hasAll(codes)`, `hasRole(name)`. It hydrates from `/api/auth/me` via an `effect()` on `AuthService.isAuthenticated()` and clears on logout/401. **Fail-closed**: if `/me` fails, privileges stay empty (never assume all-access).
- **Route gating** — `privilegeGuard` (`core/authz/privilege.guard.ts`): declare required codes in `route.data` as `PrivilegeRouteData` (`{ privileges, mode?: 'any'|'all', redirectTo? }`). Chain it after `authGuard`.
- **UI gating** — the structural directive `*hasPrivilege="'CODE'"` (or an array with `mode:'all'`) for buttons/menus/sections.
- **Resource gating** — pre-check with `AuthzService` in the `rxResource` `params` (return `undefined` to skip firing a doomed request), but always treat the backend `403` as the real answer.
- **Privilege codes** — reference them through the typed catalog `core/authz/privilege.catalog.ts` (`Privilege.*` / `PrivilegeCode`), never as magic strings. This catalog is a small hand-authored typed reference of the codes this UI gates; the backend seed CSV (`structural-privileges.csv`) is the source of truth, and parity is enforced backend-side (a G3 test asserts every `@PreAuthorize` code exists in the seed). There is no cross-repo codegen (deferred/optional).

### Cardinal security principle (non-negotiable)

**Frontend authorization is UX/convenience only.** It hides what the user cannot do and avoids firing doomed requests — it never _prevents_ anything. The sole enforcement boundary is the backend `@PreAuthorize`. Parity rule: every privilege code gated in the frontend MUST correspond to a backend endpoint enforced with the same code. A hidden button in front of an unprotected endpoint is a vulnerability, not a feature.

### Rehydration (F5)

Token is in memory only, so a page refresh loses both token and privileges. Interim posture (ADR-002 Strategy A): refresh = re-login. The `AuthzService.hydrate()` + `bootstrapAuthz` initializer are staged so a future silent-refresh (HttpOnly refresh cookie) is a drop-in. Never persist privileges to storage.

## Routing policy

- Public route: `/login`.
- Protected route: `/dashboard`.
- Redirect authenticated users away from `/login` to `/dashboard`.
- Redirect unauthenticated users away from protected routes to `/login`.

## Environment policy

- Keep explicit frontend environments for dev, preprod, and prod.
- Dev backend base URL defaults to proxy usage (`/api` via Angular proxy to localhost:8080).
- Preprod/prod use explicit placeholder URLs until real values are available.
- Runtime deploy-time overrides must be supported via `public/runtime-config.js`.

## Docker and Helm policy

- Frontend must run through Docker/Kubernetes flows, not only host-native runtime.
- Keep Dockerfile and Helm chart operational and validated.
- Keep env values in `ops/helm/environments/{dev,preprod,prod}/values.yaml`.
- Use Makefile targets for dev/prod flows.

## Testing and quality gates

- Keep unit tests green on every change.
- Maintain high coverage and keep target at 90%+ when reporting coverage.
- Add/adjust tests when adding or changing signal logic, interceptors, guards, and resources.
- Maintain E2E authentication scenarios in Cypress.
- Cypress E2E tests must run in full mock mode for APIs by default.
- Never call the real backend from Cypress tests (no direct backend URL calls and no live API dependency in CI/local test runs).

## Formatting and code hygiene

- Keep formatting clean and consistent. Use Prettier for TS/HTML/CSS/JSON/YAML/MD files.
- Keep code ASCII unless a file already relies on non-ASCII content.
- Prefer small focused changes over broad refactors.
- Never commit secrets.

## Operational discipline

- Read `PROJECT_BRIEF.md` before non-trivial work and keep it updated when conventions evolve.
- If new recurring user instructions appear, add them to this file in the same change.
