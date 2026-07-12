import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { LoginRequest, LoginResponse } from './auth.models';
import { getRuntimeConfig } from '../config/runtime-config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly config = getRuntimeConfig();

  private readonly token = signal<string | null>(null);
  private readonly expiresAt = signal<number | null>(null);

  readonly isAuthenticated = computed(() => {
    const token = this.token();
    const expiresAt = this.expiresAt();

    return token !== null && expiresAt !== null && Date.now() < expiresAt;
  });

  readonly apiBaseUrl = this.config.apiBaseUrl;
  readonly accessToken = this.token.asReadonly();

  getValidAccessToken(): string | null {
    if (!this.isAuthenticated()) {
      this.clearSession();
      return null;
    }

    return this.token();
  }

  login(payload: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.config.apiBaseUrl}/api/auth/login`, payload).pipe(
      map((response) => {
        if (!this.storeSession(response)) {
          throw new Error('Invalid login response');
        }

        return void 0;
      }),
    );
  }

  logout() {
    this.clearSession();
    void this.router.navigate(['/login']);
  }

  handleUnauthorized() {
    this.clearSession();
    void this.router.navigate(['/login']);
  }

  private storeSession(response: LoginResponse): boolean {
    if (!response.token) {
      this.clearSession();
      return false;
    }

    const expiresAt =
      typeof response.expiresAt === 'number'
        ? response.expiresAt
        : new Date(response.expiresAt).getTime();

    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      this.clearSession();
      return false;
    }

    this.token.set(response.token);
    this.expiresAt.set(expiresAt);

    return true;
  }

  private clearSession() {
    this.token.set(null);
    this.expiresAt.set(null);
  }
}
