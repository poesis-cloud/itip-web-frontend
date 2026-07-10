import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../../core/auth/auth.service';
import { DashboardHealthResource } from './dashboard-health.resource';

describe('DashboardHealthResource', () => {
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let resource: DashboardHealthResource;

  beforeEach(() => {
    window.__APP_CONFIG__ = { apiBaseUrl: '' };

    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });

    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    resource = TestBed.inject(DashboardHealthResource);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('starts idle while user is not authenticated', () => {
    expect(resource.health.status()).toBe('idle');
    expect(resource.health.hasValue()).toBe(true);
    expect(resource.health.value().status).toBe('UNKNOWN');
  });

  it('loads backend health after authentication', () => {
    authService.login({ email: 'john.doe@itip.local', password: 'secret' }).subscribe();
    httpMock
      .expectOne('/api/auth/login')
      .flush({ token: 'jwt-token', expiresAt: Date.now() + 60_000 });

    expect(resource.health.status()).toBe('loading');
    TestBed.flushEffects();

    const request = httpMock.expectOne('/actuator/health');
    expect(request.request.method).toBe('GET');
    request.flush({ status: 'UP' });
  });

  it('reloads health resource when refresh is called', () => {
    authService.login({ email: 'john.doe@itip.local', password: 'secret' }).subscribe();
    httpMock
      .expectOne('/api/auth/login')
      .flush({ token: 'jwt-token', expiresAt: Date.now() + 60_000 });

    expect(resource.health.status()).toBe('loading');
    TestBed.flushEffects();

    const firstRequest = httpMock.expectOne('/actuator/health');
    expect(firstRequest.request.method).toBe('GET');
    firstRequest.flush({ status: 'UP' });

    resource.refresh();

    expect(resource.health.status()).toBe('loading');
    TestBed.flushEffects();

    const secondRequest = httpMock.expectOne('/actuator/health');
    expect(secondRequest.request.method).toBe('GET');
    secondRequest.flush({ status: 'UP' });
  });
});
