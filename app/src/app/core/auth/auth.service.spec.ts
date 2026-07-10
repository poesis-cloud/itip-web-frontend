import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    window.__APP_CONFIG__ = { apiBaseUrl: '' };

    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('stores JWT in memory on login success', () => {
    service.login({ email: 'john.doe@itip.local', password: 'secret' }).subscribe();

    const request = httpMock.expectOne('/api/auth/login');
    request.flush({ token: 'jwt-token', expiresAt: Date.now() + 60_000 });

    expect(service.isAuthenticated()).toBe(true);
    expect(service.accessToken()).toBe('jwt-token');
    expect(service.getValidAccessToken()).toBe('jwt-token');
  });

  it('clears session if login response expiresAt is invalid', () => {
    service.login({ email: 'john.doe@itip.local', password: 'secret' }).subscribe();

    const request = httpMock.expectOne('/api/auth/login');
    request.flush({ token: 'jwt-token', expiresAt: 'invalid-date' });

    expect(service.isAuthenticated()).toBe(false);
    expect(service.accessToken()).toBeNull();
  });

  it('clears session if login response token is empty', () => {
    service.login({ email: 'john.doe@itip.local', password: 'secret' }).subscribe();

    const request = httpMock.expectOne('/api/auth/login');
    request.flush({ token: '', expiresAt: Date.now() + 60_000 });

    expect(service.isAuthenticated()).toBe(false);
    expect(service.accessToken()).toBeNull();
  });

  it('returns null token when expired and clears session', () => {
    service.login({ email: 'john.doe@itip.local', password: 'secret' }).subscribe();

    const request = httpMock.expectOne('/api/auth/login');
    request.flush({ token: 'jwt-token', expiresAt: Date.now() - 1_000 });

    expect(service.getValidAccessToken()).toBeNull();
    expect(service.accessToken()).toBeNull();
  });

  it('navigates to login on logout and unauthorized handling', async () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    service.logout();
    service.handleUnauthorized();

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    expect(service.accessToken()).toBeNull();
  });
});
