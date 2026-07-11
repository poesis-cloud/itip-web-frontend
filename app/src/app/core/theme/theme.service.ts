import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

const THEME_STORAGE_KEY = 'itip-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly dark = signal(false);

  readonly isDark = this.dark.asReadonly();

  constructor() {
    const saved = this.readSavedTheme();
    const prefersDark =
      saved !== null
        ? saved === 'dark'
        : this.systemPrefersDark();

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

    this.writeSavedTheme(isDark ? 'dark' : 'light');
  }

  private systemPrefersDark(): boolean {
    try {
      return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    } catch {
      return false;
    }
  }

  private readSavedTheme(): string | null {
    try {
      return globalThis.localStorage?.getItem(THEME_STORAGE_KEY) ?? null;
    } catch {
      return null;
    }
  }

  private writeSavedTheme(theme: 'dark' | 'light'): void {
    try {
      globalThis.localStorage?.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage can be unavailable in privacy/sandboxed environments.
    }
  }
}
