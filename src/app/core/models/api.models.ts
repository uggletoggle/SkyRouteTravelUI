/**
 * Generic API envelope returned by every SkyRouteTravel API endpoint.
 * All responses follow: { data: T, message: string, errors: string[] | null }
 */
export interface ApiResponse<T> {
  data: T;
  message: string;
  errors: string[] | null;
}

// ─── Airport ──────────────────────────────────────────────────────────────────

export interface AirportDto {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface AirportsResponseData {
  airports: AirportDto[];
}

// ─── Providers ────────────────────────────────────────────────────────────────

export interface ProvidersResponseData {
  providers: string[];
}

// ─── Flights ──────────────────────────────────────────────────────────────────

export interface FlightDto {
  id: string;
  provider: string;
  flightNumber: string;
  originAirportId: string;
  originAirport: AirportDto;
  destinationAirportId: string;
  destinationAirport: AirportDto;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  cabinClass: string;
  baseFarePerPassenger: number;
  finalPrice: number;
}

export interface FlightsResponseData {
  flights: FlightDto[];
}

// ─── Booking ──────────────────────────────────────────────────────────────────

export interface PassengerRequestDto {
  fullName: string;
  email: string;
  /** 'Passport Number' | 'National ID' */
  documentType: string;
  documentNumber: string;
}

export interface BookFlightRequestDto {
  flightId: string;
  numberOfPassengers: number;
  passengers: PassengerRequestDto[];
}

export interface BookingResponseData {
  bookingReference: string;
  [key: string]: unknown;
}
