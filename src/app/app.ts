import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiHealthService } from './core/services/api-health.service';
import { ApiStatusBannerComponent } from './shared/components/api-status-banner/api-status-banner.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ApiStatusBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly healthService = inject(ApiHealthService);

  ngOnInit(): void {
    this.healthService.checkHealth();
  }
}
