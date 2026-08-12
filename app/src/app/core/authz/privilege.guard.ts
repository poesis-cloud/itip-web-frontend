import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { PrivilegeRouteData } from './authz.models';
import { AuthzService } from './authz.service';

/**
 * Route guard that enforces privilege requirements declared in `route.data`
 * (see `PrivilegeRouteData`).
 *
 * Decisions:
 * - No required privileges -> allow (the route is not gated).
 * - Not authenticated -> redirect to `/login` (authz can never hydrate).
 * - Authenticated but the `/me` fetch still IN FLIGHT (hydration not complete)
 *   -> ALLOW (fail-open on the in-flight state only).
 *   Rationale: `/me` hydration is asynchronous and driven by an effect. Blocking
 *   here would race the guard against the in-flight fetch and could bounce a
 *   legitimately-privileged user to `/forbidden`. Element-level `*hasPrivilege`
 *   still gates content, and a genuine backend denial is caught by the 403
 *   interceptor. So we fail-open only on the "unknown" state.
 * - Hydration COMPLETE (success OR error) -> evaluate privileges and fail-CLOSED
 *   on the answer. `mode 'all'` requires every code, otherwise any one code.
 *   A missing privilege (including the empty-privilege set left by a failed
 *   `/me`) denies to `redirectTo` (default `/forbidden`).
 */
export const privilegeGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const authz = inject(AuthzService);
  const router = inject(Router);

  const data = (route.data ?? {}) as PrivilegeRouteData;
  const required = data.privileges ?? [];

  if (required.length === 0) {
    return true;
  }

  if (!auth.isAuthenticated()) {
    return router.parseUrl('/login');
  }

  // Fail-open only while the /me fetch is still in flight; once it has resolved
  // (success or error) we evaluate privileges and fail-closed on the answer.
  if (!authz.hydrationComplete()) {
    return true;
  }

  const granted = data.mode === 'all' ? authz.hasAll(required) : authz.hasAny(required);

  return granted ? true : router.parseUrl(data.redirectTo ?? '/forbidden');
};
