import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { providePrimeNG } from 'primeng/config';
import { provideTransloco, translocoConfig, TranslocoLoader } from '@jsverse/transloco';
import { Observable, of } from 'rxjs';
import { LocaleService } from '../../../core/i18n/locale.service';
import { LoginComponent } from './login.component';

class TestTranslocoLoader implements TranslocoLoader {
  getTranslation(): Observable<Record<string, unknown>> {
    return of({
      login: {
        errors: {
          invalidCredentials: 'Invalid email or password.',
          generic: 'Sign in failed. Please try again later.',
        },
      },
    });
  }
}

const localeServiceStub = {
  availableLanguages: signal([
    { code: 'en', endonym: 'English', locale: 'en-US' },
    { code: 'fr', endonym: 'Français', locale: 'fr-FR' },
    { code: 'es', endonym: 'Español', locale: 'es-ES' },
  ]),
  currentLanguage: signal<'en' | 'fr' | 'es'>('en').asReadonly(),
  setLanguage: () => {},
};

describe('LoginComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    window.__APP_CONFIG__ = { apiBaseUrl: '' };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        providePrimeNG({}),
        provideTransloco({
          config: translocoConfig({
            availableLangs: ['en', 'fr', 'es'],
            defaultLang: 'en',
            fallbackLang: 'en',
            reRenderOnLangChange: true,
            prodMode: true,
          }),
          loader: TestTranslocoLoader,
        }),
        { provide: LocaleService, useValue: localeServiceStub },
      ],
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
    expect(fixture.componentInstance.errorMessage()).not.toBeNull();
  });
});
