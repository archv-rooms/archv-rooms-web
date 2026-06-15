import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

interface CheckoutResponse {
  success: boolean;
  data: {
    preferenceId: string;
    initPoint: string;
  };
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  createCheckout(planId: number): Observable<CheckoutResponse> {
    const token = localStorage.getItem('@archv:token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post<CheckoutResponse>(
      `${this.apiUrl}/checkout`,
      { planId },
      { headers }
    );
  }
}