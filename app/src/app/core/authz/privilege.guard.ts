import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { AuthorizationService } from '../authorization/authorization.service';
import { PrivilegeRouteData } from './authz.models';
import { catchError, map } from 'rxjs';

/**
 * Route guard that enforces privilege requirements declared in `route.data`
 * (see `PrivilegeRouteData`).
 *
 * Decisions:
 * - No required checks -> allow (the route is not gated).
 * - Not authenticated -> redirect to `/login` (authz can never hydrate).
 * - The backend resolves all checks and the guard fails closed on transport or
 *   decision errors. `mode 'all'` requires every check, otherwise any one check.
 */
export const privilegeGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const authorization = inject(AuthorizationService);
  const router = inject(Router);

  const data = (route.data ?? {}) as PrivilegeRouteData;
  const required = data.checks ?? [];

  if (required.length === 0) {
    return true;
  }

  if (!auth.isAuthenticated()) {
    return router.parseUrl('/login');
  }

  return authorization.canMany(required).pipe(
    map((decisions) => {
      const granted =
        data.mode === 'all'
          ? decisions.every((decision) => decision.allowed)
          : decisions.some((decision) => decision.allowed);
      return granted ? true : router.parseUrl(data.redirectTo ?? '/forbidden');
    }),
    catchError(() => [router.parseUrl(data.redirectTo ?? '/forbidden')]),
  );
};
