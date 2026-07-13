import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { AuthService } from '../auth/auth.service';
import { AuthzProfile } from './authz.models';
import { AuthzService } from './authz.service';

const PROFILE: AuthzProfile = {
  id: 'user-1',
  email: 'john.doe@itip.local',
  fullName: 'John Doe',
  roles: ['ADMIN', 'AUDITOR'],
  privileges: ['dashboard:view', 'dashboard:manage'],
};

function authenticate(auth: AuthService, httpMock: HttpTestingController): void {
  auth.login({ email: 'john.doe@itip.local', password: 'secret' }).subscribe();
  httpMock
    .expectOne('/api/auth/login')
    .flush({ token: 'jwt-token', expiresAt: Date.now() + 60_000 });
}

describe('AuthzService', () => {
  let auth: AuthService;
  let authz: AuthzService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    window.__APP_CONFIG__ = { apiBaseUrl: '' };

    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });

    auth = TestBed.inject(AuthService);
    authz = TestBed.inject(AuthzService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('starts empty and not hydrated', () => {
    expect(authz.isHydrated()).toBe(false);
    expect(authz.identity()).toBeNull();
    expect(authz.roles().size).toBe(0);
    expect(authz.privileges().size).toBe(0);
  });

  it('hydrate populates identity, roles and privilege sets', () => {
    authz.hydrate(PROFILE);

    expect(authz.isHydrated()).toBe(true);
    expect(authz.identity()).toEqual({
      id: 'user-1',
      email: 'john.doe@itip.local',
      fullName: 'John Doe',
    });
    expect([...authz.roles()]).toEqual(['ADMIN', 'AUDITOR']);
    expect([...authz.privileges()]).toEqual(['dashboard:view', 'dashboard:manage']);
  });

  it('answers privilege and role checks against the hydrated sets', () => {
    authz.hydrate(PROFILE);

    // hasPrivilege
    expect(authz.hasPrivilege('dashboard:view')).toBe(true);
    expect(authz.hasPrivilege('unknown:code')).toBe(false);

    // hasAny
    expect(authz.hasAny(['unknown:code', 'dashboard:manage'])).toBe(true);
    expect(authz.hasAny(['unknown:code', 'other:code'])).toBe(false);
    expect(authz.hasAny([])).toBe(false);

    // hasAll
    expect(authz.hasAll(['dashboard:view', 'dashboard:manage'])).toBe(true);
    expect(authz.hasAll(['dashboard:view', 'unknown:code'])).toBe(false);
    expect(authz.hasAll([])).toBe(true);

    // hasRole
    expect(authz.hasRole('ADMIN')).toBe(true);
    expect(authz.hasRole('UNKNOWN')).toBe(false);
  });

  it('checks against an empty set fail closed', () => {
    expect(authz.hasPrivilege('dashboard:view')).toBe(false);
    expect(authz.hasAny(['dashboard:view'])).toBe(false);
    expect(authz.hasAll(['dashboard:view'])).toBe(false);
    expect(authz.hasRole('ADMIN')).toBe(false);
  });

  it('clear() empties identity, roles and privileges', () => {
    authz.hydrate(PROFILE);
    authz.clear();

    expect(authz.isHydrated()).toBe(false);
    expect(authz.identity()).toBeNull();
    expect(authz.roles().size).toBe(0);
    expect(authz.privileges().size).toBe(0);
  });

  it('effect fetches /me and hydrates when authentication flips true', () => {
    authenticate(auth, httpMock);

    TestBed.tick();
    httpMock.expectOne('/api/auth/me').flush(PROFILE);

    expect(authz.isHydrated()).toBe(true);
    expect(authz.hasPrivilege('dashboard:view')).toBe(true);
    expect(authz.hasRole('ADMIN')).toBe(true);
  });

  it('effect clears authz when authentication flips false', () => {
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    authenticate(auth, httpMock);
    TestBed.tick();
    httpMock.expectOne('/api/auth/me').flush(PROFILE);
    expect(authz.isHydrated()).toBe(true);

    auth.logout();
    TestBed.tick();

    expect(authz.isHydrated()).toBe(false);
    expect(authz.privileges().size).toBe(0);
  });

  it('fails closed when /me errors', () => {
    authenticate(auth, httpMock);

    TestBed.tick();
    httpMock.expectOne('/api/auth/me').flush({}, { status: 500, statusText: 'Server Error' });

    expect(authz.isHydrated()).toBe(false);
    expect(authz.privileges().size).toBe(0);
  });

  it('loadProfile() can be invoked explicitly', () => {
    authz.loadProfile();
    httpMock.expectOne('/api/auth/me').flush(PROFILE);

    expect(authz.isHydrated()).toBe(true);
    expect(authz.hasPrivilege('dashboard:manage')).toBe(true);
  });
});
