import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { TranslocoLoader, TranslocoLoaderData, Translation } from '@jsverse/transloco';
import { Observable } from 'rxjs';
import { DEFAULT_LANGUAGE, normalizeLanguage } from './languages';

const SCOPE_SEGMENT_PATTERN = /^[a-z0-9-]+$/i;

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);

  getTranslation(lang: string, data?: TranslocoLoaderData): Observable<Translation> {
    const safeLang = normalizeLanguage(lang) ?? DEFAULT_LANGUAGE;
    const safeScope = this.resolveScope(lang, data?.scope);

    const path = safeScope
      ? `/i18n/${safeScope}/${safeLang}.json`
      : `/i18n/${safeLang}.json`;

    return this.http.get<Translation>(path);
  }

  private resolveScope(lang: string, scope: string | undefined): string | null {
    const explicitScope = this.sanitizeScope(scope);
    if (explicitScope) {
      return explicitScope;
    }

    const langParts = lang.split('/');
    if (langParts.length > 1) {
      return this.sanitizeScope(langParts.slice(0, -1).join('/'));
    }

    return null;
  }

  private sanitizeScope(scope: string | undefined): string | null {
    if (!scope) {
      return null;
    }

    const normalized = scope.trim().replace(/^\/+|\/+$/g, '');
    if (!normalized) {
      return null;
    }

    const segments = normalized.split('/');
    const isSafe = segments.every((segment) => SCOPE_SEGMENT_PATTERN.test(segment));
    return isSafe ? segments.join('/') : null;
  }
}
