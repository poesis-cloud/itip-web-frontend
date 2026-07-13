/**
 * Client-side authorization (authz) contracts.
 *
 * Mirrors the backend `GET /api/auth/me` payload. Privilege CODES are the
 * authority unit; roles are display-only.
 */

export interface AuthzProfile {
  id: string;
  email: string;
  fullName: string | null;
  roles: string[];
  privileges: string[];
}

export interface AuthzIdentity {
  id: string;
  email: string;
  fullName: string | null;
}

/**
 * Route `data` contract read by `privilegeGuard`.
 *
 * - `privileges`: required privilege codes; empty/undefined means "no gate".
 * - `mode`: `'all'` requires every code, `'any'` (default) requires one.
 * - `redirectTo`: where to send a denied navigation (defaults to `/forbidden`).
 */
export interface PrivilegeRouteData {
  privileges?: string[];
  mode?: 'any' | 'all';
  redirectTo?: string;
}
