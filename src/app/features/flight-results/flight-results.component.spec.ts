import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FlightResultsComponent } from './flight-results.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { FlightResultsService } from './flight-results.service';

describe('FlightResultsComponent', () => {
  let component: FlightResultsComponent;
  let fixture: ComponentFixture<FlightResultsComponent>;
  let mockFlightResultsService: any;

  beforeEach(async () => {
    mockFlightResultsService = {
      searchParams: signal<any>(null),
      flightsResource: {
        isLoading: signal(false),
        error: signal(null)
      },
      flights: signal([
        {
          id: 'FL-JFK-FRA-1',
          provider: 'Lufthansa',
          logoColor: 'bg-amber-500',
          flightNumber: 'JF-552',
          departureTime: '16:45',
          arrivalTime: '19:30',
          duration: '2h 45m',
          price: 500,
          class: 'Economy',
          type: 'Direct'
        },
        {
          id: 'FL-JFK-FRA-2',
          provider: 'XiamenAir',
          logoColor: 'bg-blue-500',
          flightNumber: 'JF-308',
          departureTime: '12:15',
          arrivalTime: '14:00',
          duration: '1h 45m',
          price: 150,
          class: 'Economy',
          type: 'Direct'
        },
        {
          id: 'FL-JFK-FRA-3',
          provider: 'United Airlines',
          logoColor: 'bg-sky-600',
          flightNumber: 'JF-901',
          departureTime: '07:30',
          arrivalTime: '09:45',
          duration: '2h 15m',
          price: 300,
          class: 'Economy',
          type: 'Direct'
        }
      ])
    };

    await TestBed.configureTestingModule({
      imports: [FlightResultsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({
              from: 'JFK',
              to: 'FRA',
              departureDate: '2026-06-25',
              passengers: '1',
              flightType: 'Economy'
            })
          }
        },
        { provide: FlightResultsService, useValue: mockFlightResultsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FlightResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load flight query parameters from route and execute search', () => {
    expect(component['from']()).toBe('JFK');
    expect(component['to']()).toBe('FRA');
    expect(component['departureDate']()).toBe('2026-06-25');
    expect(component['passengers']()).toBe(1);
    expect(component['flightType']()).toBe('Economy');

    expect(mockFlightResultsService.searchParams()).toEqual({
      origin: 'JFK',
      destination: 'FRA',
      cabinClass: 'Economy',
      passengers: 1
    });
    expect(component['flights']().length).toBe(3);
  });

  it('should sort flights reactively on the frontend', () => {
    // 1. Default sorting: price-low-to-high
    let sorted = component['sortedFlights']();
    expect(sorted[0].price).toBe(150); // XiamenAir
    expect(sorted[1].price).toBe(300); // United Airlines
    expect(sorted[2].price).toBe(500); // Lufthansa

    // 2. Sort by price-high-to-low
    component['sortBy'].set('price-high-to-low');
    sorted = component['sortedFlights']();
    expect(sorted[0].price).toBe(500);
    expect(sorted[1].price).toBe(300);
    expect(sorted[2].price).toBe(150);

    // 3. Sort by duration (shortest first)
    component['sortBy'].set('duration');
    sorted = component['sortedFlights']();
    expect(sorted[0].duration).toBe('1h 45m');
    expect(sorted[1].duration).toBe('2h 15m');
    expect(sorted[2].duration).toBe('2h 45m');

    // 4. Sort by departure time (earliest first)
    component['sortBy'].set('departure-time');
    sorted = component['sortedFlights']();
    expect(sorted[0].departureTime).toBe('07:30');
    expect(sorted[1].departureTime).toBe('12:15');
    expect(sorted[2].departureTime).toBe('16:45');
  });
});
