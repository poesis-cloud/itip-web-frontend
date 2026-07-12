# AGENTS.md — ITIP UI build guide

You are implementing the **ITIP (IT Intelligence Platform)** web UI in the target repo
(`poesis-cloud/itip-web-frontend`). This folder is the design handoff. Build a system
**100% conformant** to it. Read this file first, then `README.md` for per-screen detail.

## Source of truth (in priority order)
1. **`tokens/itip-tokens.css`** + **`tokens/itip-tokens.json`** — every color, space, radius,
   shadow, font. **Never hard-code a value that exists as a token.** If a value you need is
   missing, add a token — do not inline a one-off hex.
2. **`README.md`** — component + screen specs, interactions, state, a11y.
3. **`ITIP Screens.dc.html`** — visual reference. Open in a browser; use devtools to read any
   exact computed value. It is a *reference*, not code to copy — re-implement in the repo stack.

## Golden rules
- **Indigo `#4F46E5` is the single primary.** Violet (`--itip-copilot-gradient`) is reserved for
  AI/Copilot affordances ONLY — never as a primary/action color.
- **Type:** Hanken Grotesk (UI) + JetBrains Mono (ids, emails, code, CEL). No other families.
- **Icons:** Feather/Lucide line set via the framework's icon package. The only bespoke mark is the
  ITIP logo (3-node graph on the brand gradient). Do not invent icons or draw ad-hoc SVG.
- **Lifecycle & compliance colors are semantic** — always pull from the lifecycle/compliance tokens
  (draft/proposed/active/deprecated/retired; pass/warn/fail). Never approximate.
- **Cards:** `.itip-stat` = number/KPI cards (lift on hover). `.itip-panel` = content panels
  (**static, no hover animation** — they are dense, stable surfaces). Respect this distinction.
- **App shell** (sidebar 236px dark + 60px header + scrollable main) is one layout component reused
  by every authenticated screen. Active nav item drives off the current route.
- **Auth:** username/password now; render the **Enterprise SSO** button disabled with a "SOON" badge.
  Architect the auth layer so an **OIDC** provider can be added later without a rewrite.

## Recommended build order
1. Install fonts + `tokens/itip-tokens.css` at the app root; wire the token set into your styling
   system (CSS vars / Tailwind theme / CSS modules). Add the `.itip-stat` / `.itip-panel` classes.
2. **App shell** — sidebar, header, breadcrumb, main. Router with the routes in PROJECT_BRIEF §4.
3. **Auth** (`1b` split-screen) — the one unauthenticated route.
4. **Dashboard** (`1d`) — KPI cards, compliance trend curve, lifecycle donut, findings, approvals.
   Charts via the project chart lib (Recharts/visx for React, ngx-charts/D3 for Angular), styled to
   the curve/donut spec in README.
5. **Registry / Structure detail** (`4c`), **Applications** (`3c`), **Users** (`3a`).
6. **Architecture diagram** (`3b`) — model `nodes{id,label,type,x,y,w,h,selected}` + `edges{from,to}`;
   edges and nodes MUST share ONE coordinate space (see README "Alignment technique").
7. **Framework Catalog** (`4b`), **Activity Log** (`4a`), **Create form + confirmation modal** (`3d`).

## Framework note
The design is framework-agnostic (semantic HTML + tokens + SVG). Confirmed app stack: **Angular +
PrimeNG + Tailwind** — see **`INTEGRATION-angular-primeng-tailwind.md`** for how to wire both to the
tokens (Tailwind config, a custom PrimeNG preset mapping primary→indigo, aligned dark selector, and a
component-by-component mapping). Angular mapping in brief: app shell → layout component with
`<router-outlet>`; sidebar → `routerLink` + `routerLinkActive`; tables/cards → `*ngFor` components;
modal → PrimeNG `p-dialog` (or CDK) with focus trap; charts → `ngx-charts`/D3; icons → `lucide-angular`.
Keep tokens in one global stylesheet; Tailwind and PrimeNG both consume the CSS variables.

## Conformance checklist (Definition of Done, per screen)
- [ ] Zero hard-coded colors/radii/shadows — all reference tokens.
- [ ] Hanken Grotesk + JetBrains Mono only; type scale + weights per tokens.
- [ ] Primary is indigo; violet used only for Copilot; lifecycle/compliance colors semantic.
- [ ] App shell reused (not re-built per screen); active nav + breadcrumb reflect the route.
- [ ] `.itip-stat` cards lift on hover; `.itip-panel` cards are static.
- [ ] Radii: inputs/buttons 9px, cards per `--itip-card-radius`, modal 16px, pills full.
- [ ] Interactions from README implemented (sorting, filtering, modal open/confirm, node select…).
- [ ] Enterprise SSO button disabled + "SOON"; auth layer OIDC-ready.
- [ ] WCAG 2.1 AA: visible focus ring, keyboard nav, `role="dialog"` + focus trap on modal,
      labelled inputs, contrast.
- [ ] Dark-theme override carried forward with the new tokens (full `[data-theme="dark"]` palette);
      every screen verified in BOTH light and dark.
- [ ] Matches `ITIP Screens.dc.html` at the pixel level (spacing, sizes, copy).

## Files
- `README.md` — full human-readable spec (tokens, screens, interactions, state, a11y).
- `tokens/itip-tokens.css` — CSS custom properties + card classes. Import at root.
- `tokens/itip-tokens.json` — same values, machine-readable.
- `ITIP Screens.dc.html` (+ `support.js`) — the visual reference. Open in a browser.
