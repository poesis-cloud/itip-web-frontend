/**
 * Structural privilege codes this UI gates (hand-authored typed reference).
 *
 * This is a small, HAND-AUTHORED, typed reference of the structural privilege
 * codes THIS UI gates — it is NOT a generated file and NOT a mirror of the full
 * backend catalog. The single source of truth is the backend seed resource
 * `structural-privileges.csv` (in `itip-web-backend`); the database is derived
 * from it.
 *
 * Anti-drift is enforced BACKEND-side: a G3 CI test asserts that every backend
 * `@PreAuthorize` code exists in the seed. There is deliberately NO cross-repo
 * sync here yet (deferred/optional).
 *
 * Rule: add a code here ONLY when a real UI gate needs it; keep it minimal; and
 * every code used here MUST exist in the backend seed. Dynamic/GSM-driven
 * privileges must never be hard-coded here — gate them generically from
 * `/api/auth/me`.
 *
 * The current entries are illustrative PLACEHOLDERS until the first real gated
 * feature.
 */
export const Privilege = {
  // Placeholder example codes — NOT enforced by any real feature yet.
  DashboardView: 'dashboard:view',
  DashboardManage: 'dashboard:manage',
} as const;

export type PrivilegeCode = (typeof Privilege)[keyof typeof Privilege];
