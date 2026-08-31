import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthorizationCheck } from './authorization.models';
import { AuthorizationService } from './authorization.service';
import { authInterceptor } from '../auth/auth.interceptor';
import { AuthService } from '../auth/auth.service';

const CHECK: AuthorizationCheck = {
  origin: 'ITIP',
  resource: 'PRIVILEGE',
  operation: 'CREATE',
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