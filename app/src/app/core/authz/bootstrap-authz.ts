import { provideAppInitializer } from '@angular/core';

/**
 * Interim application-bootstrap authz hook (ADR-002 Strategy A).
 *
 * Strategy A performs no silent token refresh at bootstrap, so there is no
 * persisted session to rehydrate and this initializer is intentionally a no-op.
 *
 * Future seam: once silent-refresh is introduced, this hook should, after the
 * refreshed token is established, call `AuthzService.loadProfile()` (e.g.
 * `inject(AuthzService).loadProfile()`) so privileges are hydrated before the
 * first guarded navigation resolves.
 */
export function bootstrapAuthz(): void {
  // No-op for Strategy A. See the doc comment for the future silent-refresh seam.
}

/** Provider wiring the `bootstrapAuthz` hook as an app initializer. */
export function provideAuthzBootstrap() {
  return provideAppInitializer(bootstrapAuthz);
}
