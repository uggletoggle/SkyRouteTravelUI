import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FlightResult } from '../../core/services/flight.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FlightResultsService } from './flight-results.service';

@Component({
  selector: 'app-flight-results',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './flight-results.component.html',
  styleUrl: './flight-results.component.css'
})
export class FlightResultsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly flightResultsService = inject(FlightResultsService);

  // Search parameters from query parameters
  protected readonly from = signal('');
  protected readonly to = signal('');
  protected readonly departureDate = signal('');
  protected readonly passengers = signal(1);
  protected readonly flightType = signal('All');

  // Flight results list
  protected readonly flights = computed(() => this.flightResultsService.flights());
  protected readonly isLoading = computed(() => this.flightResultsService.flightsResource.isLoading());

  // Sorting signal (defaulting to price low-to-high)
  protected readonly sortBy = signal<string>('price-low-to-high');

  // Computed signal that automatically sorts flight results on the frontend
  protected readonly sortedFlights = computed(() => {
    const list = [...this.flights()];
    const criteria = this.sortBy();

    if (criteria === 'price-low-to-high') {
      return list.sort((a, b) => a.price - b.price);
    } else if (criteria === 'price-high-to-low') {
      return list.sort((a, b) => b.price - a.price);
    } else if (criteria === 'duration') {
      return list.sort((a, b) => {
        const durA = this.parseDurationToMinutes(a.duration);
        const durB = this.parseDurationToMinutes(b.duration);
        return durA - durB;
      });
    } else if (criteria === 'departure-time') {
      return list.sort((a, b) => {
        const timeA = this.parseTimeToMinutes(a.departureTime);
        const timeB = this.parseTimeToMinutes(b.departureTime);
        return timeA - timeB;
      });
    }

    return list;
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const origin = params['from'] || '';
      const dest = params['to'] || '';
      const date = params['departureDate'] || '';
      const pax = Number(params['passengers']) || 1;
      const fClass = params['flightType'] || 'All';

      this.from.set(origin);
      this.to.set(dest);
      this.departureDate.set(date);
      this.passengers.set(pax);
      this.flightType.set(fClass);

      // Perform flight search via service
      this.flightResultsService.searchParams.set({
        origin,
        destination: dest,
        cabinClass: fClass,
        passengers: pax
      });
    });
  }

  // Helper function to parse durations (e.g. "2h 15m") into total minutes
  private parseDurationToMinutes(durationStr: string): number {
    const regex = /(\d+)\s*h\s*(\d+)\s*m/;
    const match = durationStr.match(regex);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      return hours * 60 + minutes;
    }
    return 0;
  }

  // Helper function to parse departure time strings (e.g. "12:15") into total minutes
  private parseTimeToMinutes(timeStr: string): number {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      return hours * 60 + minutes;
    }
    return 0;
  }
}
