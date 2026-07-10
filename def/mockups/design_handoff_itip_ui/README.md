# ITIP UI — Design System & Screen Specification (v1, final)

Definitive design system and screen specs for the **IT Intelligence Platform (ITIP)** web frontend.
This is the single source of truth. Build to it exactly. There is no prior/legacy system to reconcile —
everything below is the decision.

**Stack:** framework-agnostic design; target repo is Vite + React + TypeScript, but the system maps
cleanly to Angular or Vue (see *Framework note*).

### Start here (agents)
1. Read **`AGENTS.md`** — build order + conformance checklist.
2. Load the tokens: **`tokens/itip-tokens.css`** (CSS custom properties + card classes) and
   **`tokens/itip-tokens.json`** (same values, machine-readable). **The token files are the source of
   truth for values;** this README is the human-readable spec.
3. Use **`ITIP Screens.dc.html`** as the visual reference — open in a browser, read exact values with
   devtools. It is a *reference prototype*, not production code to copy; re-implement in the repo stack.

**Fidelity: high.** Colors, typography, spacing, radii and copy are final and exact — recreate at the
pixel level. Interactions in the reference are static; implement the behavior in *Interactions* below.

---

## 1. Color

### Primary — Indigo
| Token | Value | Usage |
|---|---|---|
| `--itip-primary` | **`#4F46E5`** (Indigo 600) | primary buttons, active nav, links, focus ring, selected states |
| `--itip-primary-hover` | **`#4338CA`** (Indigo 700) | primary button/link hover |
| `--itip-primary-tint` | **`#EEF2FF`** (Indigo 50) | tinted chips, info banners, selected node fill, avatar-badge bg |
| `--itip-primary-tint-border` | **`#DFE3FF`** | border for tinted chips / banners |
| `--itip-primary-tint-text` | **`#4338CA`** | text on indigo tint |
| brand gradient | **`linear-gradient(135deg, #6366F1, #4F46E5)`** | logo mark, avatar |

### AI / Copilot — Violet (RESERVED)
`--itip-copilot: linear-gradient(135deg, #7C3AED, #6366F1)` — Copilot buttons and the AI assistant
affordance **only**. Never use violet as a primary/action color.

### Surfaces / text / border (light)
| Token | Value |
|---|---|
| `--itip-bg` | `#F5F6F8` |
| `--itip-surface` | `#FFFFFF` |
| `--itip-surface-muted` | `#FAFBFC` (table header, footer strips) |
| `--itip-surface-sunken` | `#F8F9FB` (nested property boxes) |
| `--itip-sidebar-bg` | `#0F1729` |
| `--itip-sidebar-text` | `#94A3B8` |
| `--itip-sidebar-section` | `#4B5A73` (uppercase group labels) |
| `--itip-text` | `#0F172A` |
| `--itip-text-muted` | `#64748B` |
| `--itip-text-light` | `#94A3B8` |
| `--itip-border` | `#E6E8EC` |
| `--itip-border-hairline` | `#EEF0F3` (in-card dividers, card border) |
| `--itip-border-strong` | `#D3D8E0` (inputs) |

### Lifecycle status
draft `#94A3B8` · proposed `#3B82F6` · active/approved `#16A34A` · deprecated `#D97706` (text `#A16207`) · retired `#9CA3AF`.

### Compliance
pass `#16A34A` · warn `#F59E0B` (text `#B45309`) · fail `#EF4444` (text `#DC2626`).

### Diagram node types (2px border)
structure `#4F46E5` · mechanism `#7C3AED` · interaction `#059669` · effector `#EA580C` · receptor `#0891B2`.

### Dark theme
Full first-class dark theme — activate with `data-theme="dark"` on the root; **Light is the default**,
dark is opt-in. Same elevation system (surfaces separated by hairline borders + deeper soft shadows).
Full palette in `tokens/itip-tokens.css` (`[data-theme="dark"]`) and `tokens/itip-tokens.json`
(`darkTheme`). Key values: bg `#0A0F1C`, surface `#141B2D`, text `#EAEEF6`, muted `#9AA5B8`,
border `#2A3450`, indigo tint `#1F2547`. Semantic text lightens on dark: pass `#22C55E`, warn `#FBBF24`,
fail `#F87171`, proposed `#60A5FA`. **Unchanged across themes:** the sidebar `#0F1729`, solid lifecycle
badge fills, and the brand + Copilot gradients. Every screen must render correctly in both themes.

---

## 2. Typography
- **UI + display:** `'Hanken Grotesk', system-ui, -apple-system, sans-serif` (Google Fonts; weights 400/500/600/700/800).
- **Mono (ids, emails, code, CEL):** `'JetBrains Mono', ui-monospace, monospace`.
- **Scale (px):** 10 (chip/label caps) · 11 (meta) · 12 (secondary) · 13 (body/table) · 14 (input/button/base) · 16 (card title) · 18 (modal title) · 22 (auth H1) · 25 (page title).
- **Weights:** body 400/500 · labels & table headers 600–700 · page/section titles 800.
- **Tracking:** headings `letter-spacing:-.02em`; uppercase caps labels `letter-spacing:.05em`.

## 3. Spacing, radius, shadow
- **Spacing:** 4px base scale. Card padding `16–24px`, main content padding `26px 28px`, grid gaps `14–16px`, field rhythm `15–18px`.
- **Radius:** inputs/buttons **9px** · cards **13px** (tweakable 8–22) · modals **16px** · chips/badges/pills **full (9999px)** · sidebar logo mark 8px.
- **Shadow:**
  - card resting: `0 1px 2px rgba(16,24,40,.04), 0 10px 26px -14px rgba(15,23,42,.16)`
  - card hover (stat cards only): `0 6px 12px rgba(16,24,40,.07), 0 22px 46px -18px rgba(15,23,42,.28)`
  - raised / dropdown: `0 6px 24px -8px rgba(15,23,42,.14)`
  - diagram node: `0 4px 10px -3px rgba(15,23,42,.15)`; selected: `0 6px 16px -4px rgba(79,70,229,.4)`
  - modal: `0 30px 60px -15px rgba(15,23,42,.4)`

## 4. Card system
Cards use **layered elevation**, not a hard border: surface `#FFFFFF`, hairline border `#EEF0F3`
(the shadow does the lifting), radius per `--itip-card-radius`.
- **`.itip-stat`** — number/KPI cards. **Lift on hover** (`translateY(-3px)` + deeper shadow, 180ms).
- **`.itip-panel`** — content panels. **Static — no hover animation** (dense, stable surfaces).
- **Treatments** (selectable, applies to stat cards): **Elevated** (default) · **Outline** (1.5px
  `#E3E7EE` border, no shadow, border→accent on hover) · **Accent** (elevated + 4px top gradient bar).
- **Tokens/tweaks:** `cardStyle` (Elevated/Outline/Accent, default Accent), `cardRadius` (8–22, default 13),
  `accentColor` (default `#0F766E`; swatches indigo/teal/amber/rose). Implement as CSS vars / theme
  service — never per-card overrides.

## 5. App shell (all authenticated screens)
CSS grid: `grid-template-columns: 236px 1fr; grid-template-rows: 60px 1fr;` — sidebar spans both rows;
header + main on the right.
- **Sidebar** `236px`, `#0F1729`, full height. 60px logo row (30px gradient mark + org name, 800/14).
  Nav grouped by uppercase labels (700/10, `#4B5A73`). Item: `9px 20px`, 13px, 17px icon + label,
  `border-left:3px solid transparent`. **Active:** color `#fff`, bg `rgba(79,70,229,.18)`,
  `border-left-color:#4F46E5`, weight 600, optional right-aligned count pill. Footer: “IT Intelligence
  Platform / by Poesis”, 10.5px, `#4B5A73`, top hairline.
- **Header** 60px, surface, bottom border `#E6E8EC`, `0 24px`. Left: breadcrumb (muted segments + `/`
  + bold current). Right: search pill (⌘K hint), notification bell (red dot), optional Copilot button,
  34px round avatar (brand gradient + initials).
- **Main** scrollable, padding `26px 28px`: page title (800/25) + subtitle (400/13 muted), optional
  right-aligned actions, then content.

Icons: **Feather/Lucide** line set (`fill:none; stroke:currentColor; stroke-width:2; viewBox 0 0 24 24`)
via `lucide-react`/`lucide-angular` — do not hand-draw SVGs. The only bespoke mark is the ITIP logo
(3-node graph: 3 circles + connecting lines) on the indigo gradient.

---

## 6. Screens
IDs in parentheses match the reference file `ITIP Screens.dc.html`.

### Sign in — split-screen (`2a`)
- Username/password. **Enterprise SSO** button present but **disabled** with a “SOON” badge —
  reserved for a later **OIDC** phase; architect the auth layer so a provider drops in without a rewrite.
- Full viewport (`100vw`/`100vh`). Left **brand panel** `~400px`, dark gradient
  `linear-gradient(160deg,#0F1729,#182338 55%,#1E2C47)` + faint 22px dot pattern; logo, headline (800/27),
  sub-copy, 3 status bullets. Right **form panel** centered (cap content width ~420px): H1 “Welcome back”
  (800/22), sub “Sign in to the `acme-corp` workspace.”, Username + Password fields, “Keep me signed in”
  (accent `#4F46E5`), full-width primary **Sign in**, “OR” divider, disabled **Continue with Enterprise SSO**
  (lock icon + “SOON”).
- **Fields:** label 600/13 `#334155`; input full-width `11px 13px`, border `#D3D8E0`, radius 9px;
  focus border `#4F46E5` + `box-shadow:0 0 0 3px rgba(79,70,229,.12)`.

### Overview dashboard (`1d`)
- **KPI row:** 5 stat cards (`.itip-stat`): caps label (600/11 muted), value (800/27), detail (500/11).
  Compliance value green with “▲ 3%”; violations value red.
- **Compliance trend:** wide panel. Line+area chart, 12 monthly points, y ~70–95%. Line `#4F46E5` 2.5px,
  area gradient `#4F46E5` .20→0, gridlines `#EEF0F3`, dashed target line at 85% (`#CBD5E1`), end dots.
  Legend “Overall” (indigo) + “Target 85%” (grey). Implement with the chart lib (Recharts/visx or
  ngx-charts/D3), same styling.
- **Lifecycle donut:** Active 118 / Draft 12 / Deprecated 7 / Proposed 5 (total 142), centered total +
  legend rows. Segment colors = lifecycle tokens.
- **Findings by class:** horizontal progress bars per framework (label + count + track `#EEF0F3` + fill
  in compliance color).
- **Pending approvals:** list rows (subject + “author · time · framework”) with **Approve** (primary) /
  **Review** (secondary); header count pill.

### Users & privileges (`3a`)
- **Indicators:** 4 stat cards — Total users, Active (green), Invited (amber), Review-board members.
- **IAM banner:** indigo-tint info banner (`#EEF2FF` bg, `#DFE3FF` border, info icon `#4F46E5`, text
  `#3730A3`): privileges sync from the org IAM; direct editing is a fallback.
- **Toolbar:** search + “Sync from IAM” (secondary) + “+ Invite user” (primary).
- **Table:** User (name 700 + mono email), Role (solid/tinted badge), Ascription privileges (small pills:
  Draft, → ACTIVE green, → DEPRECATED amber, → RETIRED red, Review violet), Status (Active/Invited),
  Last active (mono/muted). Header bg `#FAFBFC`, uppercase 700/10.5 muted; row divider hairline; hover
  bg `#F5F6F8`.

### Architecture diagram (`3b`)
- **Layout:** `1fr 280px` (canvas + inspector).
- **Canvas:** `#FBFCFD`, 24px dot grid, radius 12. **Nodes:** absolutely-positioned boxes, surface,
  2px border in type color, radius 9, name (700/12.5) + uppercase type caps (600/9 in type color).
  **Selected:** indigo-tint fill + stronger indigo shadow. Bottom-left zoom controls (`+ / − / Fit`).
- **Inspector:** type caps, name (800/17), mono id, status badge, divider, Properties (label/value rows),
  Compliance (bar + %), primary “Open structure” + secondary “View ascriptions”.
- **Alignment (critical):** edges and nodes MUST share ONE coordinate space or lines won’t meet boxes.
  The reference uses a fixed `700×300` layer: an SVG (`viewBox="0 0 700 300"`, `overflow:visible`) for
  edges and node `<div>`s at the SAME px `left/top`, each `width:150 height:46 box-sizing:border-box`.
  Edge endpoints are computed from box geometry — right-center `(left+w, top+h/2)`, left-center
  `(left, top+h/2)`, bottom-center `(left+w/2, top+h)`, top-center `(left+w/2, top)`. Model
  `nodes{id,label,type,x,y,w,h,selected}` + `edges{from,to}` and bind coordinates; or use a graph lib
  (React Flow / `@swimlane/ngx-graph` / D3+ELK) styled with these tokens.

### Applications inventory (`3c`)
- **Header:** title + “+ Register application” (primary).
- **Filters:** search + “Domain ▾” + “Framework ▾” + an active filter chip (“Status · Active ✕”) in
  indigo-tint (`#EEF2FF` bg, `#4F46E5` border, `#4338CA` text).
- **Table:** Application (32px rounded-square avatar `#EEF2FF`/`#4F46E5` initials + name + mono slug),
  Owner, Frameworks (grey pills), Compliance (mini bar + % in compliance color), Status (lifecycle
  badge). Deprecated row uses a grey avatar.

### Activity Log (`4a`)
- Header + filter bar (All Types ▾ / date range ▾ / All Users ▾ / search + range count).
- **Grouped timeline** (Today / Yesterday / 2 days ago…) inside one `.itip-panel`: a vertical rail with
  a status dot per event (color = event kind: approved green, proposed/created blue, violation/blocked
  red, warning amber). Each event: bold title + inline lifecycle badge where relevant, then meta
  (“time · actor (role) · framework ref”). Violations show a red remediation callout
  (`#FEF2F2` bg, `#FECACA` border). Footer: “Showing 1–N of M” + Previous.

### Framework Catalog (`4b`)
- KPI row (`.itip-stat`): Sourced frameworks, Total archetypes, Total directives, Total norms.
- **Framework cards** (`.itip-panel`, 3-col grid): icon tile + name + mono version/source; description;
  a 3-stat row (Archetypes / Directives / Norms, 800/18); footer tag pills (top hairline divider).

### Structure detail (`4c`)
- **Layout:** `1fr 336px` — tabbed content (Structure / Mechanisms / Governance / History; active tab
  underline `#4F46E5`) + a right **Structure Overview** rail.
- **Content panels:** Structure Definition (status badge; label/value rows; archetyping REF/ALLOF chips
  in indigo/amber tint; description); Statement Properties (sunken `#F8F9FB` boxes with a colored dot +
  mono facet header + mono key/value rows); Mechanisms (rows with an “M” tile + name + mono type +
  status badge).
- **Overview rail:** Status, Ownership, Active Facets (dark solid facet chips), Governance Coverage
  (indigo-tint summary + directive rows), Related Structures (rows + status badges).

### Create form + confirmation modal (`3d`)
- **Form (max-width 640):** title “New structure” + note it starts in DRAFT. Card: Name input,
  Type + Owner selects (2-col), Description textarea, “Governing frameworks” multi-select as removable
  indigo-tint chips + dashed “+ Add”. Footer right: **Cancel** (secondary) + **Create structure** (primary).
- **Modal:** dim scrim `rgba(15,23,42,.45)` (optional 1.5px page blur). Dialog `440px`, surface,
  radius 16, modal shadow. 42px indigo-tint icon tile (check-circle) + title “Create this structure?”
  (800/18) + body summarizing name, DRAFT badge, frameworks. Grey summary box (`#F8F9FB`): “Reviewers
  notified · 4 members”, “Norms to evaluate · 7”. Footer: **Cancel** + **Confirm & submit** (primary).

---

## 7. Interactions & behavior (reference is static — implement these)
- **Auth:** validate required fields; disable Sign in while empty/submitting; inline error on failed
  login; Enterprise SSO stays `disabled` (tooltip “Coming soon”) until the OIDC phase; “Keep me signed
  in” → persistent session.
- **Navigation:** sidebar items route; active route drives the active nav style and the breadcrumb.
- **Tables:** row hover; row click → detail; header sort; search filter; removable/combinable filter
  chips; pagination for long lists.
- **Diagram:** node click → select (indigo-tint + populate inspector); drag to reposition; zoom
  `+/−/Fit`; “Add node” opens the create form/modal.
- **Form/modal:** framework chips add/remove; “Create structure” opens the modal; **Confirm & submit**
  creates the entity in DRAFT, notifies reviewers, routes to its detail/board; Cancel / scrim-click /
  Esc closes.
- **Motion:** modal ~150ms fade + subtle scale-in; hover states ~150–180ms; restrained (daily-use tool).
- **Accessibility (hard requirement, WCAG 2.1 AA):** visible 3px indigo focus ring; full keyboard nav;
  `role="dialog"` + focus trap on modals; labelled inputs; sufficient contrast in both themes.
- **Theming:** Light default, Dark opt-in via `theme`; persist the user’s choice.

## 8. State (per screen)
- Auth `{username, password, keepSignedIn, submitting, error}`
- Dashboard: KPIs, trend series, lifecycle distribution, findings, approvals; time-range selector
- Users: list, search, IAM sync status, invite-form state
- Diagram: nodes/edges, `selectedNodeId`, zoom/pan
- Applications: list, filters (`domain`, `framework`, `status`), search, pagination
- Structure detail: entity, active tab
- Form/modal: field values, selected frameworks, `modalOpen`, submit status

## 9. Framework note
Every screen is semantic HTML + tokens + SVG — no framework lock-in. Confirmed app stack:
**Angular + PrimeNG + Tailwind** — see **`INTEGRATION-angular-primeng-tailwind.md`** for the full wiring
(Tailwind config off the CSS vars, a custom PrimeNG preset mapping primary→indigo + surfaces + radius +
focus, an aligned `darkModeSelector`, `cssLayer` order, and a component-by-component mapping). Tokens
stay the single source of truth; **both Tailwind and PrimeNG consume the CSS variables** so one
`data-theme` flip re-themes everything. App-shell, sidebar, auth split-screen, cards and the diagram are
plain Angular components; use PrimeNG for the interactive widgets inside them; charts via `ngx-charts`/D3;
icons via `lucide-angular`.

## 10. Assets
- **Fonts:** Hanken Grotesk + JetBrains Mono (Google Fonts).
- **Icons:** Feather/Lucide line set. The only bespoke mark is the ITIP logo (3-node graph).
- **Charts:** the project chart library, styled per §6.
- No raster images or brand photography.

## Files in this package
- `AGENTS.md` — build order + conformance checklist (read first).
- `INTEGRATION-angular-primeng-tailwind.md` — how to wire Tailwind + PrimeNG to the tokens (preset, dark selector, component map).
- `tokens/itip-tokens.css` — CSS custom properties + `.itip-stat`/`.itip-panel` classes + dark theme. Import at root.
- `tokens/itip-tokens.json` — same values, machine-readable.
- `ITIP Screens.dc.html` — visual reference (open in a browser; Light default, `theme` tweak for Dark).
