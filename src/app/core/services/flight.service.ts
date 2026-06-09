import { Injectable, signal, computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { API_BASE_URL } from '../tokens/api-url.token';
import { ApiResponse, FlightDto, FlightsResponseData } from '../models/api.models';

/** UI-friendly model used by components */
export interface FlightResult {
  id: string;
  provider: string;
  logoColor: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  class: string;
  type: string;
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  cabinClass: string;
  passengers: number;
}

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private readonly apiBaseUrl = inject(API_BASE_URL);

  readonly searchParams = signal<FlightSearchParams | null>(null);

  readonly flightsResource = httpResource<ApiResponse<FlightsResponseData>>(() => {
    const params = this.searchParams();
    if (!params || !params.origin || !params.destination) return undefined;

    const queryParams: Record<string, string> = {
      origin: params.origin,
      destination: params.destination,
    };

    if (params.cabinClass && params.cabinClass !== 'All') {
      queryParams['cabinClass'] = params.cabinClass;
    }

    return { url: `${this.apiBaseUrl}/flights`, params: queryParams };
  });

  /** Mapped to UI model; price = finalPrice × passenger count */
  readonly flights = computed<FlightResult[]>(() => {
    const raw = this.flightsResource.value()?.data.flights;
    if (!raw) return [];
    const passengers = this.searchParams()?.passengers ?? 1;

    return raw.map((f: FlightDto) => ({
      id: f.id,
      provider: f.provider,
      logoColor: this.providerColor(f.provider),
      flightNumber: f.flightNumber,
      departureTime: this.formatTime(f.departureTime),
      arrivalTime: this.formatTime(f.arrivalTime),
      duration: this.formatDuration(f.durationMinutes),
      price: f.finalPrice * passengers,
      class: f.cabinClass,
      type: 'Direct'
    }));
  });

  private formatTime(iso: string): string {
    const parts = iso.split('T');
    return parts.length === 2 ? parts[1].substring(0, 5) : '00:00';
  }

  private formatDuration(mins: number): string {
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  }

  private providerColor(provider: string): string {
    const colors: Record<string, string> = {
      'BudgetWings': 'bg-emerald-500',
      'GlobalAir':   'bg-indigo-600',
    };
    return colors[provider] ?? 'bg-slate-500';
  }
}
