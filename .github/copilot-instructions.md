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
- Do not leak bearer tokens to third-party origins.

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
