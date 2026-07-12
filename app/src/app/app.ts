import { NgClass } from '@angular/common';
import { Component, HostListener, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
import { filter, map, startWith } from 'rxjs';
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
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);
  readonly shell = inject(ShellService);
  readonly theme = inject(ThemeService);
  readonly isMobileViewport = signal(false);
  readonly themeToggleLabel = computed(() => (this.theme.isDark() ? 'Light mode' : 'Dark mode'));
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
    const cleanUrl = url.split('?')[0]?.split('#')[0] ?? '';
    const segments = cleanUrl
      .split('/')
      .filter((segment) => segment.length > 0)
      .map((segment) => this.formatSegment(segment));

    if (segments.length === 0) {
      return { section: 'Overview', current: 'Dashboard' };
    }

    if (segments.length === 1) {
      return { section: 'Overview', current: segments[0] };
    }

    return {
      section: segments[segments.length - 2],
      current: segments[segments.length - 1],
    };
  }

  private formatSegment(segment: string): string {
    return segment
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (match) => match.toUpperCase());
  }
}
