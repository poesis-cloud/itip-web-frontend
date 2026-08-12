import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTransloco, translocoConfig, TranslocoLoader } from '@jsverse/transloco';
import { Observable, of } from 'rxjs';
import { providePrimeNG } from 'primeng/config';
import { App } from './app';
import { LocaleService } from './core/i18n/locale.service';

class TestTranslocoLoader implements TranslocoLoader {
  getTranslation(): Observable<Record<string, unknown>> {
    return of({});
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

describe('App', () => {
  beforeEach(async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: () => ({
        matches: false,
        media: '(max-width: 1200px)',
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
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
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
