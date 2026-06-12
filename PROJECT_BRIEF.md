# PROJECT_BRIEF.md — itip-web-frontend

> Last updated: 2025-07 | Sprint 0 | Status: Design Phase

## 1. Project Overview

`itip-web-frontend` is the web frontend for the **IT Intelligence Platform (ITIP)** — a domain application that translates the Generative System Model (GSM) for IT governance. It provides dashboards for appraisal indicators, governance framework compliance, GSM definition browsing, and Ascription lifecycle visualization. The UI is driven by mockups in `def/mockups/` and connects to the `itip-web-backend` REST API.

## 2. Concept / Product Description

ITIP surfaces GSM concepts for IT governance practitioners:

- **Appraisal Dashboard**: 29 appraisal indicators organized across 7 bilateral classes (AA, AC, DD, DN, NA, NN, NX). Each indicator has a measure type (percent / count / days / ratio) and produces findings. Two zones: meta-governance and governance.
- **Governance Frameworks**: Catalog and detail views for TOGAF, ISO 25010, ISO 25012, SAFe, ITIL, GDPR, NIS2, DORA. Framework stacking (composing multiple frameworks) and adherence matrix.
- **GSM Definition Browser**: Registry of GSM primitives — Structure, Mechanism, Effector, Receptor, Interaction, Archetype, Directive, Norm. Ascription lifecycle states must be visually distinct.
- **Review & Workflow**: Review board, review sessions, evaluation transitions, governance ceremony workflows.
- **Truth Sourcing**: Source management, sync jobs, blackboard contributions.
- **Deliverables**: Generated documents, template editor.
- **Lenses**: Diagram views, lens editing and browsing.
- **Admin**: User management, integrations.

UI mockups for all sections live in `def/mockups/`. The design system CSS is `def/mockups/itip-design-system.css`.

## 3. Tech Stack

- **Frontend:** Vite + React + TypeScript (TBD — confirm before Sprint 1)
- **Styling:** TBD (Tailwind CSS likely, referencing `def/mockups/itip-design-system.css`)
- **State Management:** TBD (Zustand or React Query)
- **Routing:** React Router v6
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Backend (external):** `itip-web-backend` REST API
- **CI/CD:** GitHub Actions

## 4. Architecture

```
+-------------------------------------------------------------+
|  Browser — itip-web-frontend (Vite + React + TypeScript)    |
|                                                             |
|  Pages/Routes                                               |
|  +-- /overview            — Activity dashboard              |
|  +-- /evaluation/*        — Appraisal indicators (7 classes)|
|  +-- /definition/*        — GSM definition browser          |
|  +-- /frameworks/*        — Governance framework catalog    |
|  +-- /compliance/*        — Adherence matrix                |
|  +-- /review/*            — Review board & sessions         |
|  +-- /workflows/*         — Governance workflows            |
|  +-- /deliverables/*      — Generated docs & templates      |
|  +-- /lenses/*            — Diagram lenses                  |
|  +-- /truth-sourcing/*    — Source & sync management        |
|  +-- /admin/*             — Users & integrations            |
+----------------------------+--------------------------------+
                             | REST / HTTPS
+----------------------------v--------------------------------+
|  itip-web-backend REST API                                  |
|  (separate repo: poesis/itip-web-backend)                   |
+----------------------------+--------------------------------+
                             |
+----------------------------v--------------------------------+
|  SIE — Definition Manager (GSM runtime, Ascription engine)  |
|  + Definition Blackboard Manager (sourcing)                 |
+-------------------------------------------------------------+
```

## 5. Key Files Map

| Area | Path | Contents |
|------|------|----------|
| Mockups | `def/mockups/` | HTML mockups by section (evaluation, definition, frameworks, ...) |
| Design system | `def/mockups/itip-design-system.css` | Reference CSS for colors, typography, components |
| Entry point | `src/main.tsx` | App bootstrap (to be created Sprint 1) |
| Components | `src/components/` | Shared UI components |
| Pages | `src/pages/` | Route-level page components |
| API client | `src/api/` | REST client, hooks, types |
| Sprint docs | `docs/sprint-N/` | Plans, progress trackers, done files |
| QA docs | `docs/qa/` | Sprint sign-off reports |

## 6. Team Roles

| Agent | Name | Role |
|-------|------|------|
| Producer | **Remy** | Sprint planning, mockup review, backlog, GitHub Issues, UX coordination |
| Frontend | **Nova** | UI components, state management, React/TypeScript |
| Backend/API | **Sage** | REST API integration, data contracts, type generation |
| Art/CSS | **Milo** | Design system implementation, accessibility, visual polish |
| QA | **Ivy** | E2E tests, accessibility audit, mockup parity, sign-off |

## 7. Sprint Status

| Sprint | Name | Status | Scope |
|--------|------|--------|-------|
| 0 | Bootstrap | Done | PROJECT_BRIEF, team setup, mockup inventory |
| 1 | Foundation | Planned | Vite+React scaffold, routing, design system tokens, overview dashboard |

## 8. Current State (rewrite every sprint)

**What works:**
- Mockups exist for all major UI sections (HTML + design system CSS)
- Team files bootstrapped (PROJECT_BRIEF, copilot-instructions, prompts)

**What does not work yet:**
- No runnable frontend code exists
- Tech stack not yet confirmed (Vite + React + TypeScript is the default candidate)

**What is next:**
- Sprint 1: confirm tech stack, scaffold project, implement overview dashboard from mockup

## 9. Security Rules

1. Secrets live in environment variables only — never in source code or git.
2. API keys / tokens for `itip-web-backend` go in `.env.local` (gitignored).
3. No PII in frontend logs or error messages.
4. WCAG 2.1 AA accessibility is a hard requirement — not optional polish.

## 10. How to Run Locally

```bash
# (Once scaffold exists — Sprint 1)
npm install
cp .env.example .env.local   # fill in VITE_API_BASE_URL
npm run dev
```

## 11. How to Deploy

TBD (Sprint 1+). Likely: GitHub Actions → build → deploy to static host or container.
Environment: `VITE_API_BASE_URL` pointing to `itip-web-backend`.

## 12. Cross-Chat Handoff Protocol

Every sprint chat must do these before finishing:

1. Write `docs/sprint-N/done.md` — what was built, what is not done, files changed
2. Update PROJECT_BRIEF.md: Section 7 (mark sprint done) + Section 8 (rewrite current state)
3. Commit all changes: `sprint-N: <summary>`

The repo is the shared memory. If skipped, the next chat starts blind.

**Context recovery prompt:**
```
Read PROJECT_BRIEF.md and docs/sprint-N/progress.md.
Continue from where it left off.
```

## 13. Bug & Fix Tracking

Bugs are tracked as GitHub Issues on `poesis-cloud/itip-web-frontend`.

- **QA (Ivy):** File bugs with labels `bug` + `severity:blocker|major|minor`. Include: component, steps to reproduce, expected vs actual. No-blocker sprints: write `docs/qa/sprint-N-signoff.md`.
- **Dev:** Check GitHub Issues before starting. Fix blockers + majors before polish. Use closing keywords: `fix: description (Fixes #NN)`.
- **Feature ideas:** add to `docs/ideas-backlog.md`.

## 14. Multi-Repo Setup

Each team works in their own separate clone. No worktrees.

```bash
git clone git@github.com:poesis-cloud/itip-web-frontend.git itip-web-frontend-dev
git clone git@github.com:poesis-cloud/itip-web-frontend.git itip-web-frontend-qa
```

**Branch strategy:**
- `main` — stable, coordination hub (Remy)
- `feature/sprint-N` — Dev team work
- `feature/qa-N` — QA work
- PRs to main via regular merge. **Never squash. Never rebase feature branches.**
