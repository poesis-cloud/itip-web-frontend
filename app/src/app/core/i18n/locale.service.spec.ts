import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { providePrimeNG } from 'primeng/config';
import { provideTransloco, translocoConfig, TranslocoService } from '@jsverse/transloco';
import { provideTranslocoLocale } from '@jsverse/transloco-locale';
import { vi } from 'vitest';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  getLocaleForLanguage,
} from './languages';
import { LocaleService } from './locale.service';
import { TranslocoHttpLoader } from './transloco-loader';

describe('LocaleService', () => {
  let httpMock: HttpTestingController;
  let languageGetterSpy: ReturnType<typeof vi.spyOn> | null = null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        providePrimeNG({}),
        provideTransloco({
          config: translocoConfig({
            availableLangs: SUPPORTED_LANGUAGES.map((language) => language.code),
            defaultLang: DEFAULT_LANGUAGE,
            fallbackLang: DEFAULT_LANGUAGE,
            reRenderOnLangChange: true,
            prodMode: true,
          }),
          loader: TranslocoHttpLoader,
        }),
        provideTranslocoLocale({
          langToLocaleMapping: {
            en: getLocaleForLanguage('en'),
            fr: getLocaleForLanguage('fr'),
            es: getLocaleForLanguage('es'),
          },
        }),
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    languageGetterSpy?.mockRestore();
    languageGetterSpy = null;
    localStorage.clear();
    document.documentElement.removeAttribute('lang');
    httpMock.verify();
  });

  it('prefers saved language over browser language on startup', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'fr');
    mockBrowserLanguage('es-MX');

    const service = TestBed.inject(LocaleService);
    const transloco = TestBed.inject(TranslocoService);

    const requests = flushAllRequests();
    expect(requests).toContain('/i18n/primeng/fr.json');
    expect(service.currentLanguage()).toBe('fr');
    expect(transloco.getActiveLang()).toBe('fr');
    expect(document.documentElement.getAttribute('lang')).toBe('fr');
  });

  it('falls back to default language when startup candidates are not supported', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'de');
    mockBrowserLanguage('pt-BR');

    const service = TestBed.inject(LocaleService);

    const requests = flushAllRequests();
    expect(requests).toContain('/i18n/primeng/en.json');
    expect(service.currentLanguage()).toBe('en');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });

  function mockBrowserLanguage(value: string): void {
    languageGetterSpy?.mockRestore();
    languageGetterSpy = vi.spyOn(window.navigator, 'language', 'get').mockReturnValue(value);
  }

  function flushAllRequests(): string[] {
    const urls: string[] = [];

    // Drain chained requests (/i18n/{lang}.json then /i18n/primeng/{lang}.json).
    while (true) {
      const requests = httpMock.match(() => true);
      if (requests.length === 0) {
        break;
      }

      for (const request of requests) {
        urls.push(request.request.url);
        request.flush({});
      }
    }

    return urls;
  }
});
