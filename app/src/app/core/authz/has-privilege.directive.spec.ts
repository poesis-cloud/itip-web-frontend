import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { vi } from 'vitest';
import { AuthService } from '../auth/auth.service';
import { AuthzProfile } from './authz.models';
import { AuthzService } from './authz.service';
import { HasPrivilegeDirective } from './has-privilege.directive';

@Component({
  standalone: true,
  imports: [HasPrivilegeDirective],
  template: `<span *hasPrivilege="required; mode: mode">GATED</span>`,
})
class HostComponent {
  required: string | string[] = 'dashboard:view';
  mode: 'any' | 'all' = 'any';
}

async function setup(required: string | string[], mode: 'any' | 'all') {
  window.__APP_CONFIG__ = { apiBaseUrl: '' };

  const result = await render(HostComponent, {
    componentProperties: { required, mode },
    providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
  });

  const httpMock = TestBed.inject(HttpTestingController);
  const auth = TestBed.inject(AuthService);
  const router = TestBed.inject(Router);
  vi.spyOn(router, 'navigate').mockResolvedValue(true);

  return { ...result, httpMock, auth };
}

function hydrateVia(
  auth: AuthService,
  httpMock: HttpTestingController,
  privileges: string[],
): void {
  auth.login({ email: 'john.doe@itip.local', password: 'secret' }).subscribe();
  httpMock
    .expectOne('/api/auth/login')
    .flush({ token: 'jwt-token', expiresAt: Date.now() + 60_000 });

  TestBed.flushEffects();

  const profile: AuthzProfile = {
    id: 'u',
    email: 'e',
    fullName: null,
    roles: [],
    privileges,
  };
  httpMock.expectOne('/api/auth/me').flush(profile);
  TestBed.flushEffects();
}

describe('HasPrivilegeDirective', () => {
  it('is absent when denied, appears after hydrate, disappears after clear', async () => {
    const { fixture, httpMock, auth } = await setup('dashboard:view', 'any');

    expect(screen.queryByText('GATED')).toBeNull();

    hydrateVia(auth, httpMock, ['dashboard:view']);
    fixture.detectChanges();
    expect(screen.queryByText('GATED')).not.toBeNull();

    auth.logout();
    TestBed.flushEffects();
    fixture.detectChanges();
    expect(screen.queryByText('GATED')).toBeNull();

    httpMock.verify();
  });

  it('mode all requires every code', async () => {
    const { fixture, httpMock, auth } = await setup(['dashboard:view', 'dashboard:manage'], 'all');

    hydrateVia(auth, httpMock, ['dashboard:view']);
    fixture.detectChanges();

    expect(screen.queryByText('GATED')).toBeNull();

    httpMock.verify();
  });

  it('mode any needs only one code', async () => {
    const { fixture, httpMock, auth } = await setup(['dashboard:view', 'dashboard:manage'], 'any');

    hydrateVia(auth, httpMock, ['dashboard:view']);
    fixture.detectChanges();

    expect(screen.queryByText('GATED')).not.toBeNull();

    httpMock.verify();
  });

  it('renders unconditionally when the required list is empty', async () => {
    const { httpMock } = await setup([], 'any');

    // No privileges required -> always granted, even unauthenticated.
    expect(screen.queryByText('GATED')).not.toBeNull();

    httpMock.verify();
  });
});
