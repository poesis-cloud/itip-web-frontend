import { NgClass } from '@angular/common';
import { Component, HostListener, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import {
  LucideBell,
  LucideLayoutDashboard,
  LucideMenu,
  LucideMoon,
  LucideSun,
  LucideUsers,
  LucideX,
} from '@lucide/angular';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { filter, map, startWith } from 'rxjs';
import { LocaleService } from './core/i18n/locale.service';
import { LanguageSwitcherComponent } from './core/layout/language-switcher/language-switcher.component';
import { ShellService } from './core/layout/shell.service';
import { ThemeService } from './core/theme/theme.service';

const MOBILE_SHELL_MEDIA_QUERY = '(max-width: 1279px)';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NgClass,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideLayoutDashboard,
    LucideUsers,
    LucideMenu,
    LucideX,
    LucideBell,
    LucideSun,
    LucideMoon,
    InputTextModule,
    TranslocoPipe,
    LanguageSwitcherComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly routeSegmentTranslationKey: Record<string, string> = {
    dashboard: 'app.shell.dashboard',
    users: 'app.shell.users',
    admin: 'app.shell.admin',
    login: 'login.header.overline',
  };

  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);
  readonly shell = inject(ShellService);
  readonly locale = inject(LocaleService);
  readonly theme = inject(ThemeService);
  readonly isMobileViewport = signal(false);
  readonly themeToggleLabel = computed(() => {
    this.locale.currentLanguage();
    return this.theme.isDark()
      ? this.transloco.translate('theme.lightMode')
      : this.transloco.translate('theme.darkMode');
  });
  readonly breadcrumb = computed(() => this.buildBreadcrumb(this.currentUrl()));

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly isShellRoute = computed(() => !this.currentUrl().startsWith('/login'));

  constructor() {
    this.updateViewportFlags();

    effect(() => {
      const showShell = this.isShellRoute();
      const isMobileSidebarOpen = this.shell.isMobileSidebarOpen();

      if (!showShell && isMobileSidebarOpen) {
        this.shell.closeMobileSidebar();
      }

      this.setMobileScrollLock(showShell && isMobileSidebarOpen);
    });
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateViewportFlags();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.shell.isMobileSidebarOpen()) {
      this.shell.closeMobileSidebar();
    }
  }

  toggleMobileSidebar(): void {
    this.shell.toggleMobileSidebar();
  }

  closeMobileSidebar(): void {
    this.shell.closeMobileSidebar();
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  private setMobileScrollLock(isLocked: boolean): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (this.isMobileViewport()) {
      document.body.style.overflow = isLocked ? 'hidden' : '';
    } else {
      document.body.style.overflow = '';
    }
  }

  private updateViewportFlags(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.isMobileViewport.set(window.matchMedia(MOBILE_SHELL_MEDIA_QUERY).matches);
  }

  private buildBreadcrumb(url: string): { section: string; current: string } {
    this.locale.currentLanguage();

    const cleanUrl = url.split('?')[0]?.split('#')[0] ?? '';
    const segments = cleanUrl
      .split('/')
      .filter((segment) => segment.length > 0)
      .map((segment) => this.formatSegment(segment));

    if (segments.length === 0) {
      return {
        section: this.transloco.translate('app.shell.overview'),
        current: this.transloco.translate('app.shell.dashboard'),
      };
    }

    if (segments.length === 1) {
      return {
        section: this.transloco.translate('app.shell.overview'),
        current: segments[0],
      };
    }

    return {
      section: segments[segments.length - 2],
      current: segments[segments.length - 1],
    };
  }

  private formatSegment(segment: string): string {
    const translationKey = this.routeSegmentTranslationKey[segment.toLowerCase()];
    if (translationKey) {
      return this.transloco.translate(translationKey);
    }

    return segment
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (match) => match.toUpperCase());
  }
}
