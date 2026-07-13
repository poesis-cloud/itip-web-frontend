import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { TranslocoLocaleService } from '@jsverse/transloco-locale';
import { PrimeNG } from 'primeng/config';
import { Translation as PrimeNgTranslation } from 'primeng/api';
import { Observable, catchError, map, of } from 'rxjs';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  getLocaleForLanguage,
  normalizeLanguage,
} from './languages';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly document = inject(DOCUMENT);
  private readonly transloco = inject(TranslocoService);
  private readonly translocoLocale = inject(TranslocoLocaleService);
  private readonly primeNg = inject(PrimeNG);
  private readonly http = inject(HttpClient);

  private readonly lang = signal<SupportedLanguage>(DEFAULT_LANGUAGE);
  private readonly ready = signal(false);
  private loadSequence = 0;

  readonly currentLanguage = this.lang.asReadonly();
  readonly isReady = this.ready.asReadonly();
  readonly availableLanguages = signal([...SUPPORTED_LANGUAGES]);

  constructor() {
    this.applyLanguage(this.resolveStartupLanguage());
  }

  setLanguage(language: string): void {
    const normalized = normalizeLanguage(language) ?? DEFAULT_LANGUAGE;
    this.applyLanguage(normalized);
  }

  private applyLanguage(language: SupportedLanguage): void {
    const sequence = ++this.loadSequence;
    this.ready.set(false);

    this.loadLanguage(language).subscribe((resolvedLanguage) => {
      if (sequence !== this.loadSequence) {
        return;
      }

      this.lang.set(resolvedLanguage);
      this.translocoLocale.setLocale(getLocaleForLanguage(resolvedLanguage));
      this.document.documentElement.setAttribute('lang', resolvedLanguage);
      this.writeSavedLanguage(resolvedLanguage);
      this.transloco.setActiveLang(resolvedLanguage);
      this.applyPrimeNgTranslation(resolvedLanguage, sequence).subscribe(() => {
        if (sequence !== this.loadSequence) {
          return;
        }

        this.ready.set(true);
      });
    });
  }

  private loadLanguage(language: SupportedLanguage): Observable<SupportedLanguage> {
    return this.transloco.load(language).pipe(
      map(() => language),
      catchError(() => {
        if (language === DEFAULT_LANGUAGE) {
          return of(DEFAULT_LANGUAGE);
        }

        return this.transloco
          .load(DEFAULT_LANGUAGE)
          .pipe(
            map(() => DEFAULT_LANGUAGE),
            catchError(() => of(DEFAULT_LANGUAGE)),
          );
      }),
    );
  }

  private resolveStartupLanguage(): SupportedLanguage {
    const fromStorage = normalizeLanguage(this.readSavedLanguage());
    if (fromStorage) {
      return fromStorage;
    }

    const fromBrowser = normalizeLanguage(globalThis.navigator?.language);
    if (fromBrowser) {
      return fromBrowser;
    }

    return DEFAULT_LANGUAGE;
  }

  private applyPrimeNgTranslation(language: SupportedLanguage, sequence: number): Observable<void> {
    return this.http
      .get<PrimeNgTranslation>(`/i18n/primeng/${language}.json`)
      .pipe(
        catchError(() => {
          if (language === DEFAULT_LANGUAGE) {
            return of({} as PrimeNgTranslation);
          }

          return this.http
            .get<PrimeNgTranslation>(`/i18n/primeng/${DEFAULT_LANGUAGE}.json`)
            .pipe(catchError(() => of({} as PrimeNgTranslation)));
        }),
        map((translation) => {
          if (sequence !== this.loadSequence) {
            return void 0;
          }

          this.primeNg.setTranslation(translation);
          return void 0;
        }),
      );
  }

  private readSavedLanguage(): string | null {
    try {
      return globalThis.localStorage?.getItem(LANGUAGE_STORAGE_KEY) ?? null;
    } catch {
      return null;
    }
  }

  private writeSavedLanguage(language: SupportedLanguage): void {
    try {
      globalThis.localStorage?.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Storage can be unavailable in privacy/sandboxed environments.
    }
  }
}
