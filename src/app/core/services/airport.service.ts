import { Injectable, computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { API_BASE_URL } from '../tokens/api-url.token';
import { ApiResponse, AirportDto, AirportsResponseData } from '../models/api.models';

// Re-export so existing consumers keep working without import changes
export type Airport = AirportDto;

@Injectable({
  providedIn: 'root'
})
export class AirportService {
  private readonly apiBaseUrl = inject(API_BASE_URL);

  readonly airportsResource = httpResource<ApiResponse<AirportsResponseData>>(
    () => `${this.apiBaseUrl}/airports`
  );

  /** Unwrapped airport list, defaults to [] while loading */
  readonly airports = computed(() =>
    this.airportsResource.value()?.data.airports ?? []
  );

  getAirportByCode(code: string): Airport | undefined {
    return this.airports().find(a => a.code === code);
  }
}
