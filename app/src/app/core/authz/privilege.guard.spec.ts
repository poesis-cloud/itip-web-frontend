import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../auth/auth.service';
import { PrivilegeRouteData } from './authz.models';
import { AuthzService } from './authz.service';
import { privilegeGuard } from './privilege.guard';

function runGuard(data: PrivilegeRouteData) {
  return TestBed.runInInjectionContext(() => privilegeGuard({ data } as never, {} as never));
}

describe('privilegeGuard', () => {
  let auth: AuthService;
  let authz: AuthzService;
  let router: Router;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    window.__APP_CONFIG__ = { apiBaseUrl: '' };

    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });

    auth = TestBed.inject(AuthService);
    authz = TestBed.inject(AuthzService);
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
    expect(runGuard({})).toBe(true);
    expect(runGuard({ privileges: [] })).toBe(true);
  });

  it('allows when the route carries no data at all', () => {
    const result = TestBed.runInInjectionContext(() => privilegeGuard({} as never, {} as never));
    expect(result).toBe(true);
  });

  it('redirects to /login when not authenticated', () => {
    expect(runGuard({ privileges: ['dashboard:view'] })).toEqual(router.parseUrl('/login'));
  });

  it('allows while the /me fetch is still in flight (fail-open on in-flight)', () => {
    authenticate();
    TestBed.flushEffects();

    const meRequest = httpMock.expectOne('/api/auth/me');

    // No profile flushed yet: hydration has not completed.
    expect(authz.hydrationComplete()).toBe(false);
    expect(runGuard({ privileges: ['dashboard:view'] })).toBe(true);

    // Complete the pending request to satisfy httpMock.verify() for this spec.
    meRequest.flush({
      id: 'u',
      email: 'e',
      fullName: null,
      roles: [],
      privileges: [],
    });
  });

  it('denies with /forbidden once hydration completes with no privilege (fail-closed)', () => {
    authenticate();

    // Simulate a failed /me: hydration completes but privileges stay empty.
    authz.loadProfile();
    httpMock.expectOne('/api/auth/me').flush({}, { status: 500, statusText: 'Server Error' });

    expect(authz.hydrationComplete()).toBe(true);
    expect(authz.privileges().size).toBe(0);
    expect(runGuard({ privileges: ['dashboard:view'] })).toEqual(router.parseUrl('/forbidden'));
  });

  it('mode any: allows when at least one privilege is held', () => {
    authenticate();
    authz.hydrate({
      id: 'u',
      email: 'e',
      fullName: null,
      roles: [],
      privileges: ['dashboard:view'],
    });

    expect(runGuard({ privileges: ['dashboard:view', 'other:code'] })).toBe(true);
  });

  it('mode any: denies with /forbidden when no privilege is held', () => {
    authenticate();
    authz.hydrate({ id: 'u', email: 'e', fullName: null, roles: [], privileges: ['a'] });

    expect(runGuard({ privileges: ['x', 'y'] })).toEqual(router.parseUrl('/forbidden'));
  });

  it('mode all: allows only when every privilege is held', () => {
    authenticate();
    authz.hydrate({ id: 'u', email: 'e', fullName: null, roles: [], privileges: ['a', 'b'] });

    expect(runGuard({ privileges: ['a', 'b'], mode: 'all' })).toBe(true);
    expect(runGuard({ privileges: ['a', 'c'], mode: 'all' })).toEqual(
      router.parseUrl('/forbidden'),
    );
  });

  it('denied navigation honours a custom redirectTo', () => {
    authenticate();
    authz.hydrate({ id: 'u', email: 'e', fullName: null, roles: [], privileges: ['a'] });

    expect(runGuard({ privileges: ['x'], redirectTo: '/nope' })).toEqual(router.parseUrl('/nope'));
  });
});
