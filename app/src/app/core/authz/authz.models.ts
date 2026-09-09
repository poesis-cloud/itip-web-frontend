/**
 * Route authorization metadata. Decisions are resolved by the backend
 * `POST /api/authorization/check-many` endpoint.
 */

/**
 * Route `data` contract read by `authorizationGuard`.
 *
 * - `checks`: authorization decisions required by the route; empty/undefined means "no gate".
 * - `mode`: `'all'` requires every code, `'any'` (default) requires one.
 * - `redirectTo`: where to send a denied navigation (defaults to `/forbidden`).
 */
export interface AuthorizationRouteData {
  checks?: import('../authorization/authorization.models').AuthorizationCheck[];
  mode?: 'any' | 'all';
  redirectTo?: string;
}
