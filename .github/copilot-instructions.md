# Copilot Instructions — itip-web-frontend

This is the **web frontend for ITIP** (IT Intelligence Platform), a domain application that translates the Generative System Model (GSM) for IT governance. UI mockups live in `def/mockups/`. No runnable code exists yet — Sprint 1 scaffolds the project.

---

## Team

| Agent | Name | Role | Key Skills |
|-------|------|------|------------|
| Producer | **Remy** | Sprint planning, backlog, GitHub Issues, UX coordination, PR merges | `product-manager`, `create-pr`, `update-pr`, `sync`, `commit`, `chronicle`, `breakdown-epic-pm`, `breakdown-feature-prd` |
| Dev | **Nova / Sage / Milo** | Frontend implementation, React/TypeScript, REST API integration, CSS/accessibility | `gsm-knowledge`, `drawio`, `md-to-docx`, `agent-customization`, `update-skills`, `commit`, `create-pr`, `context-map`, `refactor-plan` |
| QA | **Ivy** | UI testing, accessibility, mockup parity, visual regression | `code-review`, `commit` |

Remy **never writes application code**. Dev team **never merges to main directly** — always via PR.

---

## Frontend Rules (mandatory for all agents)

### Mockup-first workflow
- **Always check `def/mockups/`** before implementing any UI component or page.
- Mockup sections: `overview/`, `evaluation/`, `definition/`, `frameworks/`, `compliance/`, `review/`, `workflows/`, `deliverables/`, `lenses/`, `truth-sourcing/`, `admin/`.
- The design system CSS is `def/mockups/itip-design-system.css` — reference it for colors, typography, and component patterns.
- Design artifacts in `def/` are **read-only reference** — never delete or modify mockup files.

### GSM display fidelity
- **Definition/Ascription lifecycle states must be visually distinct** — states have specific semantics per GSM (use `gsm-knowledge` skill if needed for exact state names and transitions).
- The 8 GSM primitives (Structure, Mechanism, Effector, Receptor, Interaction, Archetype, Directive, Norm) each need distinct visual treatment.
- Directive/Norm relationship (DNA governance grammar) must be navigable from the UI.

### Appraisal indicators
- 29 indicators across **7 bilateral classes**: AA, AC, DD, DN, NA, NN, NX.
- Each indicator has a **measure type**: percent / count / days / ratio.
- Two zones: **meta-governance** (NA, NX) and **governance** (AA, AC, DD, DN, NN).
- Reference mockups in `def/mockups/evaluation/` for exact layout.
- Use `itip-appraisal-indicators` skill for precise measure/finding semantics before implementing indicator display.

### Accessibility
- **WCAG 2.1 AA minimum** — not optional. All interactive components, color contrast, keyboard navigation.
- Ivy audits every sprint for accessibility regressions.

### Repository discipline
- **Git history preservation**: use `git mv`, `git rm` for tracked file operations. Never plain `mv`/`rm`.
- **Archive folders are read-only**: `archives/` and `archive/` — never edit, update, or delete.
- **Commit trailer** (required on every commit):
  ```
  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```
- **No squash, no rebase** on feature branches — preserves commit history.
- **Secrets** go in `.env.local` (gitignored) — never in source code.

---

## Prompt Files

| Prompt | Path | Use |
|--------|------|-----|
| Remy sprint plan | `.github/prompts/remy-sprint-plan.prompt.md` | Start a new sprint with Remy |
| Dev feature impl | `.github/prompts/dev-feature-impl.prompt.md` | Implement a feature with Nova/Sage/Milo |
| Ivy test review | `.github/prompts/ivy-test-review.prompt.md` | QA sign-off with Ivy |

---

## Context Recovery

When a chat overflows, save state then start fresh:
```
Read PROJECT_BRIEF.md and docs/sprint-N/progress.md.
Continue from where it left off.
```

---

## SE Plugin Agents (global — invoke by name)

These agents are installed globally via the `software-engineering-team` plugin. Invoke them by name in any chat.

| When | Invoke |
|---|---|
| Security review before any merge | `SE: Security` |
| Architecture decision or structurant PR | `SE: Architect` |
| CI/CD pipeline, Helm, deployment debug | `SE: DevOps/CI` |
| Writing/updating API docs, ADRs, README | `SE: Technical Writer` |
| Authoring GitHub Issues or backlog items | `SE: Product Manager Advisor` |
| UX/UI design, Figma specs, user journeys | `SE: UX/UI Designer` |
| Accessibility and bias review | `SE: Responsible AI` |
