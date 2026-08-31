import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from '../auth/auth.service';
import { AuthorizationCheck } from './authorization.models';
import { HasAuthorizationDirective } from './has-authorization.directive';

const CHECK: AuthorizationCheck = { origin: 'ITIP', resource: 'PRIVILEGE', operation: 'READ' };

@Component({
  standalone: true,
  imports: [HasAuthorizationDirective],
  template: '<span *hasAuthorization="checks">Authorized content</span>',
})
class HostComponent {
  checks: AuthorizationCheck | AuthorizationCheck[] = CHECK;
}

describe('HasAuthorizationDirective', () => {
  let auth: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    window.__APP_CONFIG__ = { apiBaseUrl: '' };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });

    auth = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  afterEach(() => httpMock.verify());

  function authenticate(token = 'jwt-token'): void {
    auth.login({ email: 'john.doe@itip.local', password: 'secret' }).subscribe();
    httpMock.expectOne('/api/auth/login').flush({ token, expiresAt: Date.now() + 60_000 });
  }

  function createHost(): ReturnType<typeof TestBed.createComponent<HostComponent>> {
    return TestBed.createComponent(HostComponent);
  }

  it('hides content and makes no authorization request when unauthenticated', () => {
    const fixture = createHost();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Authorized content');
    httpMock.expectNone('/api/authorization/check-many');
  });

  it('shows content when the requested decision is allowed', () => {
    authenticate();
    const fixture = createHost();
    fixture.detectChanges();

    httpMock.expectOne('/api/authorization/check-many').flush({ decisions: [{ ...CHECK, allowed: true }] });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Authorized content');
  });

  it('keeps content hidden when the requested decision is denied', () => {
    authenticate();
    const fixture = createHost();
    fixture.detectChanges();

    httpMock.expectOne('/api/authorization/check-many').flush({ decisions: [{ ...CHECK, allowed: false }] });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Authorized content');
  });

  it('does not issue duplicate requests for pending checks', () => {
    authenticate();
    const fixture = createHost();
    fixture.componentInstance.checks = [CHECK, CHECK];
    fixture.detectChanges();
    fixture.detectChanges();

    const request = httpMock.expectOne('/api/authorization/check-many');
    expect(request.request.body).toEqual({ checks: [CHECK] });
    request.flush({ decisions: [{ ...CHECK, allowed: false }] });
  });

  it('hides previously allowed content after logout', () => {
    authenticate();
    const fixture = createHost();
    fixture.detectChanges();
    httpMock.expectOne('/api/authorization/check-many').flush({ decisions: [{ ...CHECK, allowed: true }] });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Authorized content');

    auth.logout();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Authorized content');
  });

  it('does not reveal content from a prior session response', () => {
    authenticate('first-token');
    const fixture = createHost();
    fixture.detectChanges();
    const firstRequest = httpMock.expectOne('/api/authorization/check-many');

    auth.logout();
    authenticate('second-token');
    fixture.detectChanges();
    const secondRequest = httpMock.expectOne('/api/authorization/check-many');

    firstRequest.flush({ decisions: [{ ...CHECK, allowed: true }] });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Authorized content');

    secondRequest.flush({ decisions: [{ ...CHECK, allowed: false }] });
  });
});