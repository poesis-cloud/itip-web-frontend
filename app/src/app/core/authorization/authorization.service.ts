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
  private authSessionGeneration = -1;
  private generation = 0;

  readonly decisions = this.decisionsSignal.asReadonly();
  readonly pending = this.pendingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly isLoading = computed(() => this.pendingSignal().size > 0);

  constructor() {
    effect(() => {
      this.synchronizeSession(this.auth.sessionGeneration());
    });
  }

  canMany(checks: readonly AuthorizationCheck[]): Observable<AuthorizationDecision[]> {
    this.synchronizeSession(this.auth.sessionGeneration());
    const uniqueChecks = [...new Map(checks.map((check) => [authorizationKey(check), check])).values()];
    const keys = new Set(uniqueChecks.map(authorizationKey));
    const requestGeneration = this.generation;
    this.pendingSignal.update((pending) => new Set([...pending, ...keys]));
    this.errorSignal.set(null);

    return this.http
      .post<AuthorizationCheckManyResponse>(
        `${this.auth.apiBaseUrl}/api/authorization/check-many`,
        { checks: uniqueChecks },
      )
      .pipe(
        map((response) => this.normalizeDecisions(uniqueChecks, response)),
        tap((decisions) => {
          if (this.isCurrentGeneration(requestGeneration)) {
            this.decisionsSignal.update((current) => {
              const next = new Map(current);
              decisions.forEach((decision) => next.set(authorizationKey(decision), decision));
              return next;
            });
          }
        }),
        catchError((error: unknown) => {
          const denied = this.deniedDecisions(uniqueChecks);
          if (this.isCurrentGeneration(requestGeneration)) {
            this.errorSignal.set(error);
            this.decisionsSignal.update((current) => {
              const next = new Map(current);
              denied.forEach((decision) => next.set(authorizationKey(decision), decision));
              return next;
            });
          }
          return of(denied);
        }),
        finalize(() => {
          if (this.isCurrentGeneration(requestGeneration)) {
            this.pendingSignal.update((pending) => {
              const next = new Set(pending);
              keys.forEach((key) => next.delete(key));
              return next;
            });
          }
        }),
      );
  }

  decisionFor(check: AuthorizationCheck): AuthorizationDecision | undefined {
    return this.decisionsSignal().get(authorizationKey(check));
  }

  clear(): void {
    this.generation += 1;
    this.resetState();
  }

  private synchronizeSession(sessionGeneration: number): void {
    if (sessionGeneration !== this.authSessionGeneration) {
      this.authSessionGeneration = sessionGeneration;
      this.clear();
    }
  }

  private isCurrentGeneration(requestGeneration: number): boolean {
    return requestGeneration === this.generation;
  }

  private normalizeDecisions(
    checks: readonly AuthorizationCheck[],
    response: AuthorizationCheckManyResponse,
  ): AuthorizationDecision[] {
    const requestedKeys = new Set(checks.map(authorizationKey));
    const byKey = new Map<string, AuthorizationDecision>();
    const decisions = Array.isArray(response?.decisions) ? response.decisions : [];

    decisions.forEach((decision) => {
      if (decision && requestedKeys.has(authorizationKey(decision))) {
        byKey.set(authorizationKey(decision), decision);
      }
    });

    return checks.map((check) => ({
      ...check,
      allowed: byKey.get(authorizationKey(check))?.allowed === true,
    }));
  }

  private deniedDecisions(checks: readonly AuthorizationCheck[]): AuthorizationDecision[] {
    return checks.map((check) => ({ ...check, allowed: false }));
  }

  private resetState(): void {
    this.decisionsSignal.set(new Map());
    this.pendingSignal.set(new Set());
    this.errorSignal.set(null);
  }
}