import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import {
  AuthorizationCheck,
  AuthorizationCheckManyResponse,
  AuthorizationDecision,
  authorizationKey,
} from './authorization.models';

@Injectable({ providedIn: 'root' })
export class AuthorizationService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private readonly decisionsSignal = signal<ReadonlyMap<string, AuthorizationDecision>>(
    new Map(),
  );
  private readonly pendingSignal = signal<ReadonlySet<string>>(new Set());
  private readonly errorSignal = signal<unknown | null>(null);

  readonly decisions = this.decisionsSignal.asReadonly();
  readonly pending = this.pendingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly isLoading = computed(() => this.pendingSignal().size > 0);

  constructor() {
    effect(() => {
      if (!this.auth.isAuthenticated()) {
        this.clear();
      }
    });
  }

  canMany(checks: readonly AuthorizationCheck[]): Observable<AuthorizationDecision[]> {
    const uniqueChecks = [...new Map(checks.map((check) => [authorizationKey(check), check])).values()];
    const keys = new Set(uniqueChecks.map(authorizationKey));
    this.pendingSignal.update((pending) => new Set([...pending, ...keys]));
    this.errorSignal.set(null);

    return this.http
      .post<AuthorizationCheckManyResponse>(
        `${this.auth.apiBaseUrl}/api/authorization/check-many`,
        { checks: uniqueChecks },
      )
      .pipe(
        map((response) => response.decisions),
        tap((decisions) =>
          this.decisionsSignal.update((current) => {
            const next = new Map(current);
            decisions.forEach((decision) => next.set(authorizationKey(decision), decision));
            return next;
          }),
        ),
        catchError((error: unknown) => {
          this.errorSignal.set(error);
          this.decisionsSignal.update((current) => {
            const next = new Map(current);
            uniqueChecks.forEach((check) =>
              next.set(authorizationKey(check), { ...check, allowed: false }),
            );
            return next;
          });
          return of(
            uniqueChecks.map((check) => ({ ...check, allowed: false })),
          );
        }),
        finalize(() =>
          this.pendingSignal.update((pending) => {
            const next = new Set(pending);
            keys.forEach((key) => next.delete(key));
            return next;
          }),
        ),
      );
  }

  decisionFor(check: AuthorizationCheck): AuthorizationDecision | undefined {
    return this.decisionsSignal().get(authorizationKey(check));
  }

  clear(): void {
    this.decisionsSignal.set(new Map());
    this.pendingSignal.set(new Set());
    this.errorSignal.set(null);
  }
}