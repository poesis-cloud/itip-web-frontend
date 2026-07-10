import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

const THEME_STORAGE_KEY = 'itip-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly dark = signal(false);

  readonly isDark = this.dark.asReadonly();

  constructor() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark =
      saved !== null
        ? saved === 'dark'
        : (window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);

    this.setDarkMode(prefersDark);
  }

  toggle(): void {
    this.setDarkMode(!this.dark());
  }

  setDarkMode(isDark: boolean): void {
    this.dark.set(isDark);

    const themeValue = isDark ? 'dark' : 'light';
    this.document.documentElement.setAttribute('data-theme', themeValue);
    this.document.body.setAttribute('data-theme', themeValue);

    localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
  }
}
