import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { vi } from 'vitest';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  afterEach(() => {
    delete window.__APP_CONFIG__;
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.body.removeAttribute('data-theme');
  });

  it('uses saved dark theme on initialization', () => {
    localStorage.setItem('itip-theme', 'dark');

    TestBed.configureTestingModule({});
    const service = TestBed.inject(ThemeService);

    expect(service.isDark()).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.body.getAttribute('data-theme')).toBe('dark');
  });

  it('falls back to system preference when no saved theme exists', () => {
    const originalMatchMedia = window.matchMedia;
    const matchMediaMock = vi
      .fn()
      .mockReturnValue({ matches: true } as MediaQueryList);
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: matchMediaMock,
    });

    TestBed.configureTestingModule({});
    const service = TestBed.inject(ThemeService);

    expect(service.isDark()).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)');

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: originalMatchMedia,
    });
  });

  it('toggles theme and persists selected value', () => {
    localStorage.setItem('itip-theme', 'light');

    TestBed.configureTestingModule({});
    const service = TestBed.inject(ThemeService);

    service.toggle();

    expect(service.isDark()).toBe(true);
    expect(localStorage.getItem('itip-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.body.getAttribute('data-theme')).toBe('dark');
  });

  it('writes and applies light mode when setDarkMode(false) is called', () => {
    localStorage.setItem('itip-theme', 'dark');

    TestBed.configureTestingModule({
      providers: [{ provide: DOCUMENT, useValue: document }],
    });
    const service = TestBed.inject(ThemeService);

    service.setDarkMode(false);

    expect(service.isDark()).toBe(false);
    expect(localStorage.getItem('itip-theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.body.getAttribute('data-theme')).toBe('light');
  });
});
