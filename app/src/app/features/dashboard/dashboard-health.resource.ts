import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/auth/auth.service';

interface HealthResponse {
  status: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardHealthResource {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly refreshTick = signal(0);

  private readonly healthUrl = computed(() => `${this.auth.apiBaseUrl}/actuator/health`);

  readonly health = rxResource<HealthResponse, { tick: number } | undefined>({
    defaultValue: { status: 'UNKNOWN' },
    params: () => (this.auth.isAuthenticated() ? { tick: this.refreshTick() } : undefined),
    stream: () => this.http.get<HealthResponse>(this.healthUrl()),
  });

  refresh() {
    this.refreshTick.update((value) => value + 1);
  }
}
