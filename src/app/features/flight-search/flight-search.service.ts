import { Injectable, inject } from '@angular/core';
import { AirportService } from '../../core/services/airport.service';

@Injectable({
  providedIn: 'root'
})
export class FlightSearchService {
  private readonly airportService = inject(AirportService);

  /** Raw resource — exposes isLoading(), error() etc. */
  readonly airportsResource = this.airportService.airportsResource;

  /** Unwrapped list of airports, ready to iterate */
  readonly airports = this.airportService.airports;
}
