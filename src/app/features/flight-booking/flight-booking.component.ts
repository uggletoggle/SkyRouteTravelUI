import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { form, FormField, required, validate, applyEach, submit } from '@angular/forms/signals';
import { AirportService } from '../../core/services/airport.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FlightBookingService } from './flight-booking.service';
import { firstValueFrom } from 'rxjs';

export interface PassengerDetails {
  fullName: string;
  email: string;
  documentNumber: string;
}

export interface BookingModel {
  passengers: PassengerDetails[];
}

@Component({
  selector: 'app-flight-booking',
  standalone: true,
  imports: [CommonModule, RouterModule, FormField, HeaderComponent],
  templateUrl: './flight-booking.component.html',
  styleUrl: './flight-booking.component.css'
})
export class FlightBookingComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly airportService = inject(AirportService);
  private readonly bookingService = inject(FlightBookingService);

  // Selected Flight Details
  protected readonly flightId = signal('');
  protected readonly from = signal('');
  protected readonly to = signal('');
  protected readonly departureDate = signal('');
  protected readonly passengerCount = signal(1);
  protected readonly flightType = signal('All');
  
  protected readonly provider = signal('');
  protected readonly pricePerPassenger = signal(0);
  protected readonly departureTime = signal('');
  protected readonly arrivalTime = signal('');
  protected readonly duration = signal('');
  protected readonly flightNumber = signal('');
  protected readonly cabinClass = signal('');

  // Derived properties: computed based on origin and destination airport country differences
  protected readonly isInternational = computed(() => {
    const origin = this.from();
    const dest = this.to();
    if (!origin || !dest) return true;
    const originAirport = this.airportService.getAirportByCode(origin);
    const destAirport = this.airportService.getAirportByCode(dest);
    if (originAirport && destAirport) {
      return originAirport.country !== destAirport.country;
    }
    return true; // Default to passport if unknown or still loading
  });
  protected readonly totalPrice = signal(0);
  protected readonly bookingReference = signal<string | null>(null);
  protected readonly bookingError = signal<{ message: string; errors: string[] } | null>(null);

  // Form State Writable Signal
  protected readonly bookingModel = signal<BookingModel>({
    passengers: []
  });

  // Signal Form definition
  protected readonly bookingForm = form(this.bookingModel, (schemaPath) => {
    applyEach(schemaPath.passengers, (itemPath) => {
      required(itemPath.fullName, { message: 'Full name is required' });
      
      required(itemPath.email, { message: 'Email address is required' });
      validate(itemPath.email, ({ value }) => {
        const val = value();
        if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          return { kind: 'invalid-email', message: 'Enter a valid email address' };
        }
        return null;
      });

      required(itemPath.documentNumber, {
        message: () => `${this.isInternational() ? 'Passport Number' : 'National ID'} is required`
      });
      
      validate(itemPath.documentNumber, ({ value }) => {
        const val = value();
        if (!val) return null;
        if (this.isInternational()) {
          // Passport Number: 6 to 12 alphanumeric characters
          if (!/^[a-zA-Z0-9]{6,12}$/.test(val)) {
            return {
              kind: 'invalid-passport',
              message: 'Passport Number must be 6 to 12 alphanumeric characters'
            };
          }
        } else {
          // National ID: 8 to 15 digits
          if (!/^\d{8,15}$/.test(val)) {
            return {
              kind: 'invalid-national-id',
              message: 'National ID must be 8 to 15 digits'
            };
          }
        }
        return null;
      });
    });
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const origin = params['from'] || '';
      const dest = params['to'] || '';
      const date = params['departureDate'] || '';
      const count = Number(params['passengers']) || 1;
      const type = params['flightType'] || 'All';
      
      const flId = params['flightId'] || '';
      const flProvider = params['provider'] || '';
      const flPrice = Number(params['price']) || 0;
      const flDepTime = params['departureTime'] || '';
      const flArrTime = params['arrivalTime'] || '';
      const flDuration = params['duration'] || '';
      const flNumber = params['flightNumber'] || '';
      const flClass = params['class'] || '';

      this.flightId.set(flId);
      this.from.set(origin);
      this.to.set(dest);
      this.departureDate.set(date);
      this.passengerCount.set(count);
      this.flightType.set(type);

      this.provider.set(flProvider);
      this.pricePerPassenger.set(flPrice / count); // Price from search was already multiplied, let's get base
      this.totalPrice.set(flPrice);

      this.departureTime.set(flDepTime);
      this.arrivalTime.set(flArrTime);
      this.duration.set(flDuration);
      this.flightNumber.set(flNumber);
      this.cabinClass.set(flClass);



      // Initialize forms dynamically for N passengers
      const passengerList: PassengerDetails[] = [];
      for (let i = 0; i < count; i++) {
        passengerList.push({ fullName: '', email: '', documentNumber: '' });
      }
      this.bookingModel.set({ passengers: passengerList });
    });
  }

  // Handle Confirm Booking
  protected async onConfirmBooking(event: Event): Promise<void> {
    event.preventDefault();

    await submit(this.bookingForm, async () => {
      const payload = {
        flightId: this.flightId(),
        numberOfPassengers: this.passengerCount(),
        passengers: this.bookingModel().passengers.map(p => ({
          fullName: p.fullName,
          email: p.email,
          documentType: this.isInternational() ? 'Passport Number' : 'National ID',
          documentNumber: p.documentNumber
        }))
      };

      this.bookingError.set(null);
      try {
        const response = await firstValueFrom(this.bookingService.bookFlight(payload));
        if (response?.data?.bookingReference) {
          this.bookingReference.set(response.data.bookingReference);
          this.bookingService.bookingReference.set(response.data.bookingReference);
        }
      } catch (err: any) {
        const body = err?.error;
        this.bookingError.set({
          message: body?.message ?? 'An unexpected error occurred. Please try again.',
          errors: Array.isArray(body?.errors) ? body.errors : []
        });
      }
    });
  }
}
