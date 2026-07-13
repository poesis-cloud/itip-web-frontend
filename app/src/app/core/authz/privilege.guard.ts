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
 * - Authenticated but authz NOT yet hydrated -> ALLOW (fail-open on hydration).
 *   Rationale: `/me` hydration is asynchronous and driven by an effect. Blocking
 *   here would race the guard against the in-flight fetch and could bounce a
 *   legitimately-privileged user to `/forbidden`. Element-level `*hasPrivilege`
 *   still gates content, and a genuine backend denial is caught by the 403
 *   interceptor. So we fail-open on the "unknown" state and fail-closed once we
 *   actually have an answer.
 * - Hydrated -> `mode 'all'` requires every code, otherwise any one code.
 *   Denied navigations go to `redirectTo` (default `/forbidden`).
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

  if (!authz.isHydrated()) {
    return true;
  }

  const granted = data.mode === 'all' ? authz.hasAll(required) : authz.hasAny(required);

  return granted ? true : router.parseUrl(data.redirectTo ?? '/forbidden');
};
