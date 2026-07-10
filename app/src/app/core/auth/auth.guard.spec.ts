import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('auth guards', () => {
  beforeEach(() => {
    window.__APP_CONFIG__ = { apiBaseUrl: '' };

    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('authGuard redirects to /login when unauthenticated', () => {
    const router = TestBed.inject(Router);

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toEqual(router.parseUrl('/login'));
  });

  it('guestGuard redirects to /dashboard when authenticated', () => {
    const authService = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    const httpMock = TestBed.inject(HttpTestingController);

    authService.login({ email: 'john.doe@itip.local', password: 'secret' }).subscribe();
    httpMock
      .expectOne('/api/auth/login')
      .flush({ token: 'jwt-token', expiresAt: Date.now() + 60_000 });

    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));

    expect(result).toEqual(router.parseUrl('/dashboard'));
  });
});
