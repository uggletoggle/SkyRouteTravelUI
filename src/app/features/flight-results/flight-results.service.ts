import { Injectable, inject } from '@angular/core';
import { FlightService } from '../../core/services/flight.service';

@Injectable({
  providedIn: 'root'
})
export class FlightResultsService {
  private readonly flightService = inject(FlightService);

  // Delegate search properties, resources, and mappings to FlightService
  readonly searchParams = this.flightService.searchParams;
  readonly flightsResource = this.flightService.flightsResource;
  readonly flights = this.flightService.flights;
}
