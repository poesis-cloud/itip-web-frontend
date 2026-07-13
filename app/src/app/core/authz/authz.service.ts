import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { AuthzIdentity, AuthzProfile } from './authz.models';

/**
 * Holds the authenticated user's authorization state (identity + roles +
 * privilege codes) and answers privilege/role checks for guards, directives,
 * and templates.
 *
 * Design notes:
 * - Roles and privileges are stored as `ReadonlySet<string>` for O(1) checks.
 * - The check helpers are arrow fields that READ the underlying signals, so
 *   they stay reactive when used directly in templates or `effect()`s.
 * - Hydration is decoupled from `AuthService` via an `effect()` watching
 *   `isAuthenticated()`; this avoids a circular dependency and needs no edit to
 *   `AuthService`.
 * - Fail-closed: any error fetching `/me` leaves privileges empty.
 */
@Injectable({ providedIn: 'root' })
export class AuthzService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private readonly identitySignal = signal<AuthzIdentity | null>(null);
  private readonly rolesSignal = signal<ReadonlySet<string>>(new Set<string>());
  private readonly privilegesSignal = signal<ReadonlySet<string>>(new Set<string>());

  readonly identity = this.identitySignal.asReadonly();
  readonly roles = this.rolesSignal.asReadonly();
  readonly privileges = this.privilegesSignal.asReadonly();

  readonly isHydrated = computed(() => this.identitySignal() !== null);

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) {
        // Fetch the profile once per authenticated session.
        if (!this.isHydrated()) {
          this.loadProfile();
        }
      } else {
        this.clear();
      }
    });
  }

  readonly hasPrivilege = (code: string): boolean => this.privilegesSignal().has(code);

  readonly hasAny = (codes: string[]): boolean =>
    codes.some((code) => this.privilegesSignal().has(code));

  readonly hasAll = (codes: string[]): boolean =>
    codes.every((code) => this.privilegesSignal().has(code));

  readonly hasRole = (role: string): boolean => this.rolesSignal().has(role);

  hydrate(profile: AuthzProfile): void {
    this.identitySignal.set({
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
    });
    this.rolesSignal.set(new Set(profile.roles));
    this.privilegesSignal.set(new Set(profile.privileges));
  }

  clear(): void {
    this.identitySignal.set(null);
    this.rolesSignal.set(new Set<string>());
    this.privilegesSignal.set(new Set<string>());
  }

  /**
   * Fetch `GET {apiBaseUrl}/api/auth/me` and hydrate. Exposed for explicit or
   * bootstrap-time use. Fails closed: on any error the authz state is cleared.
   */
  loadProfile(): void {
    this.http.get<AuthzProfile>(`${this.auth.apiBaseUrl}/api/auth/me`).subscribe({
      next: (profile) => this.hydrate(profile),
      error: () => this.clear(),
    });
  }
}
