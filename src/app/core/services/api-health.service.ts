import { inject, Injectable, signal } from '@angular/core';
import { API_BASE_URL } from '../tokens/api-url.token';

export type ApiStatus = 'checking' | 'online' | 'offline';

@Injectable({ providedIn: 'root' })
export class ApiHealthService {
  private readonly baseUrl = inject(API_BASE_URL);

  readonly status = signal<ApiStatus>('checking');

  /** Call once at app startup to probe the API. */
  async checkHealth(): Promise<void> {
    this.status.set('checking');
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseUrl}/api/providers`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeout);
      this.status.set(response.ok ? 'online' : 'offline');
    } catch {
      this.status.set('offline');
    }
  }
}
