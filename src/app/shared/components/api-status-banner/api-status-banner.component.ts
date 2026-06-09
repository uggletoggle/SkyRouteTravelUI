import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiHealthService, ApiStatus } from '../../../core/services/api-health.service';

@Component({
  selector: 'app-api-status-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './api-status-banner.component.html',
  styleUrl: './api-status-banner.component.css',
})
export class ApiStatusBannerComponent {
  private readonly healthService = inject(ApiHealthService);

  readonly status = this.healthService.status;

  readonly isVisible = computed(() => this.status() !== 'online');

  readonly config = computed<{ icon: string; message: string; detail: string; cls: string }>(() => {
    const s: ApiStatus = this.status();
    if (s === 'checking') {
      return {
        icon: '⏳',
        message: 'Connecting to API…',
        detail: 'Please wait while we establish a connection to the backend.',
        cls: 'banner--checking',
      };
    }
    return {
      icon: '🔌',
      message: 'API Unavailable',
      detail: 'The backend server is not reachable. Make sure it is running on http://localhost:5218.',
      cls: 'banner--offline',
    };
  });
}
