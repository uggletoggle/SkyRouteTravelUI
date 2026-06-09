import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private readonly http = inject(HttpClient);

  post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(url, body);
  }
}
