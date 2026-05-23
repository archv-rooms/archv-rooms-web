import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

export interface Plan {
  id: number;
  name: string;
  price: number;
  description: string;
  accessLevel: number;
}

interface PlansResponse {
  success: boolean;
  data: { plans: Plan[] };
  message: string;
}

@Injectable({ providedIn: 'root' })
export class PlanService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('@archv:token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // GET /plans — público
  getPlans(): Observable<PlansResponse> {
    return this.http.get<PlansResponse>(`${this.apiUrl}/plans`);
  }

  // POST /plans/subscribe — requer auth
  subscribe(planId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/plans/subscribe`, { planId }, {
      headers: this.getAuthHeaders()
    });
  }
}
