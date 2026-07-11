import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  function setup(apiBaseUrl = '') {
    TestBed.resetTestingModule();
    window.__APP_CONFIG__ = { apiBaseUrl };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  }

  beforeEach(() => {
    setup('');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('adds Authorization header to protected API calls', () => {
    authService.login({ email: 'john.doe@itip.local', password: 'secret' }).subscribe();
    httpMock
      .expectOne('/api/auth/login')
      .flush({ token: 'jwt-token', expiresAt: Date.now() + 60_000 });

    http.get('/api/protected').subscribe();

    const request = httpMock.expectOne('/api/protected');
    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    request.flush({});
  });

  it('does not add Authorization header to non-API requests', () => {
    authService.login({ email: 'john.doe@itip.local', password: 'secret' }).subscribe();
    httpMock
      .expectOne('/api/auth/login')
      .flush({ token: 'jwt-token', expiresAt: Date.now() + 60_000 });

    http.get('/assets/logo.svg').subscribe();

    const request = httpMock.expectOne('/assets/logo.svg');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });

  it('triggers unauthorized handler on 401 from protected API', () => {
    authService.login({ email: 'john.doe@itip.local', password: 'secret' }).subscribe();
    httpMock
      .expectOne('/api/auth/login')
      .flush({ token: 'jwt-token', expiresAt: Date.now() + 60_000 });

    const unauthorizedSpy = vi.spyOn(authService, 'handleUnauthorized').mockImplementation(() => {
      // Prevent router side effects in isolated interceptor test.
    });

    http.get('/api/protected').subscribe({
      error: () => {
        // expected
      },
    });

    const request = httpMock.expectOne('/api/protected');
    request.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(unauthorizedSpy).toHaveBeenCalled();
  });

  it('adds Authorization header to protected actuator calls', () => {
    authService.login({ email: 'john.doe@itip.local', password: 'secret' }).subscribe();
    httpMock
      .expectOne('/api/auth/login')
      .flush({ token: 'jwt-token', expiresAt: Date.now() + 60_000 });

    http.get('/actuator/health').subscribe();

    const request = httpMock.expectOne('/actuator/health');
    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    request.flush({ status: 'UP' });
  });

  it('triggers unauthorized handler on 401 from protected actuator endpoint', () => {
    authService.login({ email: 'john.doe@itip.local', password: 'secret' }).subscribe();
    httpMock
      .expectOne('/api/auth/login')
      .flush({ token: 'jwt-token', expiresAt: Date.now() + 60_000 });

    const unauthorizedSpy = vi.spyOn(authService, 'handleUnauthorized').mockImplementation(() => {
      // Prevent router side effects in isolated interceptor test.
    });

    http.get('/actuator/health').subscribe({
      error: () => {
        // expected
      },
    });

    const request = httpMock.expectOne('/actuator/health');
    request.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(unauthorizedSpy).toHaveBeenCalled();
  });

  it('does not attach token when request origin differs from configured api base url', () => {
    setup('https://api.example.com');

    authService.login({ email: 'john.doe@itip.local', password: 'secret' }).subscribe();
    httpMock
      .expectOne('https://api.example.com/api/auth/login')
      .flush({ token: 'jwt-token', expiresAt: Date.now() + 60_000 });

    http.get('https://third-party.example.com/api/protected').subscribe();

    const request = httpMock.expectOne('https://third-party.example.com/api/protected');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });

  it('attaches token when request matches configured api base url and api path', () => {
    setup('https://api.example.com/base');

    authService.login({ email: 'john.doe@itip.local', password: 'secret' }).subscribe();
    httpMock
      .expectOne('https://api.example.com/base/api/auth/login')
      .flush({ token: 'jwt-token', expiresAt: Date.now() + 60_000 });

    http.get('https://api.example.com/base/api/protected').subscribe();

    const request = httpMock.expectOne('https://api.example.com/base/api/protected');
    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    request.flush({});
  });

  it('does not trigger unauthorized handler for 401 on unprotected endpoint', () => {
    const unauthorizedSpy = vi.spyOn(authService, 'handleUnauthorized').mockImplementation(() => {
      // No-op for test assertions.
    });

    http.get('/assets/logo.svg').subscribe({
      error: () => {
        // expected
      },
    });

    const request = httpMock.expectOne('/assets/logo.svg');
    request.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(unauthorizedSpy).not.toHaveBeenCalled();
  });
});
