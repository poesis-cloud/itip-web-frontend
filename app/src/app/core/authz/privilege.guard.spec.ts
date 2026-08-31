import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../auth/auth.service';
import { AuthorizationCheck } from '../authorization/authorization.models';
import { privilegeGuard } from './privilege.guard';

const CHECK: AuthorizationCheck = { origin: 'ITIP', resource: 'PRIVILEGE', operation: 'READ' };
const SECOND_CHECK: AuthorizationCheck = { origin: 'ITIP', resource: 'PRIVILEGE', operation: 'UPDATE' };

function runGuard(checks: AuthorizationCheck[], mode?: 'any' | 'all') {
  return TestBed.runInInjectionContext(() =>
    privilegeGuard({ data: { checks, mode } } as never, {} as never),
  );
}

describe('privilegeGuard', () => {
  let auth: AuthService;
  let router: Router;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    window.__APP_CONFIG__ = { apiBaseUrl: '' };

    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });

    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function authenticate(): void {
    auth.login({ email: 'john.doe@itip.local', password: 'secret' }).subscribe();
    httpMock
      .expectOne('/api/auth/login')
      .flush({ token: 'jwt-token', expiresAt: Date.now() + 60_000 });
  }

  it('allows when no privileges are required', () => {
    expect(runGuard([])).toBe(true);
  });

  it('redirects to /login when not authenticated', () => {
    expect(runGuard([CHECK])).toEqual(router.parseUrl('/login'));
  });

  it('asks the backend for a batch and allows an allowed decision', () => {
    authenticate();
    const result = runGuard([CHECK]);
    let resolved: unknown;
    (result as never as { subscribe: (callback: (value: unknown) => void) => void }).subscribe(
      (value) => (resolved = value),
    );
    const request = httpMock.expectOne('/api/authorization/check-many');
    expect(request.request.body).toEqual({ checks: [CHECK] });
    request.flush({ decisions: [{ ...CHECK, allowed: true }] });
    expect(resolved).toBe(true);
  });

  it('redirects when the backend denies a decision', () => {
    authenticate();
    const result = runGuard([CHECK]);
    let resolved: unknown;
    (result as never as { subscribe: (callback: (value: unknown) => void) => void }).subscribe(
      (value) => (resolved = value),
    );
    httpMock.expectOne('/api/authorization/check-many').flush({ decisions: [{ ...CHECK, allowed: false }] });
    expect(resolved).toEqual(router.parseUrl('/forbidden'));
  });

  it('redirects in all mode when a successful response omits a required decision', () => {
    authenticate();
    const result = runGuard([CHECK, SECOND_CHECK], 'all');
    let resolved: unknown;
    (result as never as { subscribe: (callback: (value: unknown) => void) => void }).subscribe(
      (value) => (resolved = value),
    );

    httpMock.expectOne('/api/authorization/check-many').flush({ decisions: [{ ...CHECK, allowed: true }] });

    expect(resolved).toEqual(router.parseUrl('/forbidden'));
  });
});
