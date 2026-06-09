import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FlightSearchComponent } from './flight-search.component';
import { FlightSearchService } from './flight-search.service';
import { Router } from '@angular/router';
import { signal } from '@angular/core';

describe('FlightSearchComponent', () => {
  let component: FlightSearchComponent;
  let fixture: ComponentFixture<FlightSearchComponent>;
  let mockFlightSearchService: any;
  let mockRouter: any;

  beforeEach(async () => {
    const airportList = [
      { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA' },
      { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA' }
    ];

    mockFlightSearchService = {
      airportsResource: {
        value: signal(airportList),
        isLoading: signal(false),
        error: signal(null)
      },
      // The component reads this directly as a signal: this.searchService.airports()
      airports: signal(airportList)
    };

    mockRouter = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [FlightSearchComponent],
      providers: [
        { provide: FlightSearchService, useValue: mockFlightSearchService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FlightSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default search values', () => {
    const query = component['searchQuery']();
    expect(query.from).toBe('');
    expect(query.to).toBe('');
    expect(query.passengers).toBe(1);
    expect(query.flightType).toBe('All');
  });

  it('should validate form fields', () => {
    const form = component['searchForm'];
    expect(form().invalid()).toBe(true); // Should be invalid since from/to/date are empty
  });

  it('should populate airports list reactively', () => {
    const list = component['airports']();
    expect(list.length).toBe(2);
    expect(list[0].code).toBe('LAX');
    expect(list[1].code).toBe('JFK');
  });
});
