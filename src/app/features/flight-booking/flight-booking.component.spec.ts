import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FlightBookingComponent } from './flight-booking.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AirportService } from '../../core/services/airport.service';
import { FlightBookingService } from './flight-booking.service';
import { signal } from '@angular/core';

describe('FlightBookingComponent', () => {
  let component: FlightBookingComponent;
  let fixture: ComponentFixture<FlightBookingComponent>;
  let mockAirportService: any;
  let mockFlightBookingService: any;
  let queryParamsMock: any;

  beforeEach(() => {
    mockAirportService = {
      getAirportByCode: vi.fn((code: string) => {
        if (code === 'JFK') return { code: 'JFK', name: 'JFK', city: 'New York', country: 'United States' };
        if (code === 'LAX') return { code: 'LAX', name: 'LAX', city: 'Los Angeles', country: 'United States' };
        if (code === 'LHR') return { code: 'LHR', name: 'LHR', city: 'London', country: 'United Kingdom' };
        return undefined;
      }),
      getAirports: vi.fn().mockReturnValue(of([]))
    };

    mockFlightBookingService = {
      bookFlight: vi.fn().mockReturnValue(of({ bookingReference: 'SR-123456' })),
      bookingReference: signal<string | null>(null)
    };

    queryParamsMock = {
      from: 'JFK',
      to: 'LHR',
      departureDate: '2026-06-25',
      passengers: '2',
      flightType: 'Business',
      flightId: '64e4b9b7-b31a-4392-8611-29f1398fd001',
      provider: 'British Airways',
      price: '840',
      departureTime: '12:00',
      arrivalTime: '20:00',
      duration: '8h 00m',
      flightNumber: 'BA-204',
      class: 'Business'
    };
  });

  async function createComponent() {
    await TestBed.configureTestingModule({
      imports: [FlightBookingComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of(queryParamsMock)
          }
        },
        { provide: AirportService, useValue: mockAirportService },
        { provide: FlightBookingService, useValue: mockFlightBookingService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FlightBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create the component', async () => {
    await createComponent();
    expect(component).toBeTruthy();
  });

  it('should detect international flight and validate passport criteria', async () => {
    queryParamsMock.from = 'JFK';
    queryParamsMock.to = 'LHR'; // USA to UK = International
    await createComponent();

    expect(component['isInternational']()).toBe(true);
    expect(component['bookingModel']().passengers.length).toBe(2);

    // Set valid passport values via signal set (new array instance)
    component['bookingModel'].set({
      passengers: [
        { fullName: 'Alice', email: 'alice@example.com', documentNumber: 'A1234567' },
        { fullName: '', email: '', documentNumber: '' }
      ]
    });

    // Run form schema check
    const isInvalid = component['bookingForm']().invalid();
    // Initially touched/invalid because passenger 2 is still empty
    expect(component['bookingForm'].passengers[0].documentNumber().errors()).toEqual([]);
  });

  it('should detect domestic flight and validate national ID criteria', async () => {
    queryParamsMock.from = 'JFK';
    queryParamsMock.to = 'LAX'; // USA to USA = Domestic
    await createComponent();

    expect(component['isInternational']()).toBe(false);

    // Set national ID validation tests via signal set (new array instance)
    component['bookingModel'].set({
      passengers: [
        { fullName: 'Bob', email: 'bob@example.com', documentNumber: '12345678' },
        { fullName: '', email: '', documentNumber: '' }
      ]
    });

    expect(component['bookingForm'].passengers[0].documentNumber().errors()).toEqual([]);

    // Invalid passport format should trigger validation if domestic checks only numbers
    component['bookingModel'].set({
      passengers: [
        { fullName: 'Bob', email: 'bob@example.com', documentNumber: 'ABC12345' },
        { fullName: '', email: '', documentNumber: '' }
      ]
    });
    fixture.detectChanges();
    expect(component['bookingForm'].passengers[0].documentNumber().errors()?.length).toBeGreaterThan(0);
  });
});
