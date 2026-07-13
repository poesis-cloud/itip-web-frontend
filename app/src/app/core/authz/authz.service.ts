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
 * - `hydrationComplete` tracks whether the `/me` fetch has RESOLVED (success or
 *   error), distinct from `isHydrated` (which only reflects a populated
 *   identity). Guards fail-open while the fetch is in flight but fail-closed
 *   once it has completed, even on error.
 * - Fail-closed: any error fetching `/me` leaves privileges empty while still
 *   marking hydration complete.
 */
@Injectable({ providedIn: 'root' })
export class AuthzService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private readonly identitySignal = signal<AuthzIdentity | null>(null);
  private readonly rolesSignal = signal<ReadonlySet<string>>(new Set<string>());
  private readonly privilegesSignal = signal<ReadonlySet<string>>(new Set<string>());
  private readonly hydrationCompleteSignal = signal(false);
  private profileRequestVersion = 0;

  readonly identity = this.identitySignal.asReadonly();
  readonly roles = this.rolesSignal.asReadonly();
  readonly privileges = this.privilegesSignal.asReadonly();

  readonly isHydrated = computed(() => this.identitySignal() !== null);

  /**
   * `true` once the `/me` fetch has RESOLVED for the current session — on both
   * success and error. Guards must key their fail-open/fail-closed decision off
   * THIS signal (completion), not `isHydrated` (identity presence): an errored
   * fetch leaves the identity null yet hydration is complete, so gated routes
   * must deny rather than stay permanently fail-open.
   */
  readonly hydrationComplete = this.hydrationCompleteSignal.asReadonly();

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) {
        // Fetch the profile once per authenticated session, keyed off
        // completion so a failed fetch is not retried in a loop.
        if (!this.hydrationCompleteSignal()) {
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
    // A successfully loaded profile marks hydration as complete.
    this.hydrationCompleteSignal.set(true);
  }

  clear(): void {
    // Invalidate any in-flight /me response from the previous session.
    this.profileRequestVersion += 1;
    this.resetState();
    // A cleared session (logout/401) returns to the in-flight state so the next
    // authenticated session re-fetches and guards fail-open until it resolves.
    this.hydrationCompleteSignal.set(false);
  }

  private resetState(): void {
    this.identitySignal.set(null);
    this.rolesSignal.set(new Set<string>());
    this.privilegesSignal.set(new Set<string>());
  }

  /**
   * Fetch `GET {apiBaseUrl}/api/auth/me` and hydrate. Exposed for explicit or
   * bootstrap-time use. Fails closed: on any error privileges stay empty, but
   * hydration is still marked complete so guards flip from fail-open (in-flight)
   * to fail-closed (resolved).
   */
  loadProfile(): void {
    const requestVersion = ++this.profileRequestVersion;

    this.http.get<AuthzProfile>(`${this.auth.apiBaseUrl}/api/auth/me`).subscribe({
      next: (profile) => {
        if (requestVersion !== this.profileRequestVersion || !this.auth.isAuthenticated()) {
          return;
        }
        this.hydrate(profile);
      },
      error: () => {
        if (requestVersion !== this.profileRequestVersion || !this.auth.isAuthenticated()) {
          return;
        }
        // Fail-closed: leave privileges empty but record completion so the
        // guard stops failing open once the fetch has finished.
        this.resetState();
        this.hydrationCompleteSignal.set(true);
      },
    });
  }
}
