import { Injectable, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http.service';
import { API_BASE_URL } from '../../core/tokens/api-url.token';
import {
  ApiResponse,
  BookFlightRequestDto,
  BookingResponseData,
  PassengerRequestDto
} from '../../core/models/api.models';

// Re-export DTOs so existing component imports keep working
export type { PassengerRequestDto, BookFlightRequestDto };

@Injectable({
  providedIn: 'root'
})
export class FlightBookingService {
  private readonly httpService = inject(HttpService);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  /** Set after a successful booking to reactively load booking details */
  readonly bookingReference = signal<string | null>(null);

  /** GET /booking/{reference} — typed against the generic envelope */
  readonly bookingDetailsResource = httpResource<ApiResponse<BookingResponseData>>(() => {
    const ref = this.bookingReference();
    if (!ref) return undefined;
    return `${this.apiBaseUrl}/booking/${ref}`;
  });

  /** POST /booking */
  bookFlight(request: BookFlightRequestDto): Observable<ApiResponse<BookingResponseData>> {
    return this.httpService.post<ApiResponse<BookingResponseData>>(
      `${this.apiBaseUrl}/booking`,
      request
    );
  }
}
