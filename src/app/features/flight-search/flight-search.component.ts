import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { form, FormField, required, min, max, validate, submit } from '@angular/forms/signals';
import { FlightSearchQuery } from '../../core/models/flight-search.model';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { Airport } from '../../core/services/airport.service';
import { FlightSearchService } from './flight-search.service';

@Component({
  selector: 'app-flight-search',
  standalone: true,
  imports: [CommonModule, FormField, HeaderComponent],
  templateUrl: './flight-search.component.html',
  styleUrl: './flight-search.component.css'
})
export class FlightSearchComponent {
  private readonly searchService = inject(FlightSearchService);
  private readonly router = inject(Router);

  // Computed list of airports from the reactive resource
  protected readonly airports = computed(() => this.searchService.airports());

  // 1. The source of truth model signal
  protected readonly searchQuery = signal<FlightSearchQuery>({
    from: '',
    to: '',
    departureDate: '',
    passengers: 1,
    flightType: 'All'
  });

  // 2. Initialize the Signal Form with validation rules
  protected readonly searchForm = form(this.searchQuery, (p) => {
    required(p.from, { message: 'Origin airport is required' });
    required(p.to, { message: 'Destination airport is required' });
    
    // Cross-field validation: Destination cannot be same as Origin
    validate(p.to, ({ value, valueOf }) => {
      const origin = valueOf(p.from);
      const dest = value();
      if (origin && dest && origin === dest) {
        return {
          kind: 'same-airport',
          message: 'Destination cannot be the same as origin'
        };
      }
      return null;
    });

    required(p.departureDate, { message: 'Departure date is required' });

    // Validation: Date must not be in the past
    validate(p.departureDate, ({ value }) => {
      const dateStr = value();
      if (!dateStr) return null;
      
      const selectedDate = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        return {
          kind: 'past-date',
          message: 'Departure date cannot be in the past'
        };
      }
      return null;
    });

    required(p.passengers, { message: 'Number of passengers is required' });
    min(p.passengers, 1, { message: 'Must have at least 1 passenger' });
    max(p.passengers, 9, { message: 'Maximum of 9 passengers' });
    
    required(p.flightType, { message: 'Flight class is required' });
  });

  // Keep track of search loading state
  protected readonly isSearching = signal(false);

  // Submit handler
  protected async onSearch(event: Event): Promise<void> {
    event.preventDefault();
    
    // Using submit helper from @angular/forms/signals
    // This will mark all fields as touched and run validation checks
    await submit(this.searchForm, async () => {
      this.isSearching.set(true);
      
      // Simulate 2 seconds flight search latency as requested
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      this.isSearching.set(false);

      // Redirect to the results page with search query params
      const query = this.searchQuery();
      this.router.navigate(['/results'], {
        queryParams: {
          from: query.from,
          to: query.to,
          departureDate: query.departureDate,
          passengers: query.passengers,
          flightType: query.flightType
        }
      });
    });
  }

  protected resetForm(): void {
    this.searchQuery.set({
      from: '',
      to: '',
      departureDate: '',
      passengers: 1,
      flightType: 'All'
    });
  }
}
