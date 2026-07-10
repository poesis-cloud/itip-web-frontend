import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ShellService {
  readonly isMobileSidebarOpen = signal(false);

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.update((isOpen) => !isOpen);
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
  }
}