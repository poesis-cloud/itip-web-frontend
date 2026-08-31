import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthorizationCheck, AuthorizationDecision } from './authorization.models';
import { AuthorizationService } from './authorization.service';
import { authInterceptor } from '../auth/auth.interceptor';
import { AuthService } from '../auth/auth.service';

const CHECK: AuthorizationCheck = {
  origin: 'ITIP',
  resource: 'PRIVILEGE',
  operation: 'CREATE',
};

const SECOND_CHECK: AuthorizationCheck = {
  origin: 'ITIP',
  resource: 'PRIVILEGE',
  operation: 'READ',
};

describe('AuthorizationService', () => {
  let authorization: AuthorizationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    window.__APP_CONFIG__ = { apiBaseUrl: '' };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    authorization = TestBed.inject(AuthorizationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('stores a batch response in a signal-backed decision map', () => {
    let result: unknown;
    authorization.canMany([CHECK]).subscribe((decisions) => (result = decisions));

    const request = httpMock.expectOne('/api/authorization/check-many');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ checks: [CHECK] });
    request.flush({ decisions: [{ ...CHECK, allowed: true }] });

    expect(result).toEqual([{ ...CHECK, allowed: true }]);
    expect(authorization.decisionFor(CHECK)?.allowed).toBe(true);
    expect(authorization.isLoading()).toBe(false);
  });

  it('deduplicates identical checks in one request', () => {
    authorization.canMany([CHECK, CHECK]).subscribe();

    const request = httpMock.expectOne('/api/authorization/check-many');
    expect(request.request.body).toEqual({ checks: [CHECK] });
    request.flush({ decisions: [{ ...CHECK, allowed: false }] });
  });

  it('fails closed and caches denied decisions when a successful response omits a requested check', () => {
    let result: AuthorizationDecision[] | undefined;
    authorization.canMany([CHECK, SECOND_CHECK, CHECK]).subscribe((decisions) => (result = decisions));

    httpMock.expectOne('/api/authorization/check-many').flush({ decisions: [{ ...CHECK, allowed: true }] });

    expect(result).toEqual([
      { ...CHECK, allowed: true },
      { ...SECOND_CHECK, allowed: false },
    ]);
    expect(authorization.decisionFor(SECOND_CHECK)).toEqual({ ...SECOND_CHECK, allowed: false });
  });

  it('does not let an earlier session response update the current session cache', () => {
    const auth = TestBed.inject(AuthService);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    auth.login({ email: 'first@itip.local', password: 'secret' }).subscribe();
    httpMock.expectOne('/api/auth/login').flush({ token: 'first-token', expiresAt: Date.now() + 60_000 });

    authorization.canMany([CHECK]).subscribe();
    const firstRequest = httpMock.expectOne('/api/authorization/check-many');

    auth.logout();
    auth.login({ email: 'second@itip.local', password: 'secret' }).subscribe();
    httpMock.expectOne('/api/auth/login').flush({ token: 'second-token', expiresAt: Date.now() + 60_000 });
    authorization.canMany([CHECK]).subscribe();
    const secondRequest = httpMock.expectOne('/api/authorization/check-many');

    firstRequest.flush({ decisions: [{ ...CHECK, allowed: true }] });
    expect(authorization.decisionFor(CHECK)).toBeUndefined();

    secondRequest.flush({ decisions: [{ ...CHECK, allowed: false }] });
    expect(authorization.decisionFor(CHECK)).toEqual({ ...CHECK, allowed: false });
  });

  it('adds the current JWT to check-many requests', () => {
    const auth = TestBed.inject(AuthService);
    auth.login({ email: 'admin@itip.local', password: 'AdminPass123!' }).subscribe();
    httpMock.expectOne('/api/auth/login').flush({
      token: 'jwt-token',
      expiresAt: Date.now() + 60_000,
    });

    authorization.canMany([CHECK]).subscribe();

    const request = httpMock.expectOne('/api/authorization/check-many');
    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    request.flush({ decisions: [{ ...CHECK, allowed: true }] });
  });

  it('returns fail-closed decisions when the backend errors', () => {
    let result: unknown;
    authorization.canMany([CHECK]).subscribe((decisions) => (result = decisions));

    httpMock
      .expectOne('/api/authorization/check-many')
      .flush({}, { status: 503, statusText: 'Unavailable' });

    expect(result).toEqual([{ ...CHECK, allowed: false }]);
    expect(authorization.error()).not.toBeNull();
    expect(authorization.isLoading()).toBe(false);
  });

  it('clears decisions and errors', () => {
    authorization.canMany([CHECK]).subscribe();
    httpMock.expectOne('/api/authorization/check-many').flush({ decisions: [{ ...CHECK, allowed: true }] });

    authorization.clear();

    expect(authorization.decisionFor(CHECK)).toBeUndefined();
    expect(authorization.error()).toBeNull();
  });
});