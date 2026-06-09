import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/flight-search/flight-search.component').then(
        (m) => m.FlightSearchComponent
      )
  },
  {
    path: 'results',
    loadComponent: () =>
      import('./features/flight-results/flight-results.component').then(
        (m) => m.FlightResultsComponent
      )
  },
  {
    path: 'booking',
    loadComponent: () =>
      import('./features/flight-booking/flight-booking.component').then(
        (m) => m.FlightBookingComponent
      )
  }
];
