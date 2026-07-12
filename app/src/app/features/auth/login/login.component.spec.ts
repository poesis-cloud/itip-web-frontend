import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    window.__APP_CONFIG__ = { apiBaseUrl: '' };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('shows form validation errors when form is empty', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(fixture.componentInstance.form.invalid).toBe(true);
  });

  it('shows authentication error on 401 response', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    fixture.componentInstance.form.setValue({
      email: 'john.doe@itip.local',
      password: 'wrong',
    });

    fixture.componentInstance.submit();

    const loginReq = httpMock.expectOne('/api/auth/login');
    loginReq.flush({}, { status: 401, statusText: 'Unauthorized' });

    fixture.detectChanges();
    expect(fixture.componentInstance.errorMessage()).toContain('invalide');
  });
});
