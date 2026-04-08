import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Plan {
  id: number;
  name: string;
  price: number;
  description: string;
  accessLevel: number;
}

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/plans';

  getPlans(): Observable<{ success: boolean; data: { plans: Plan[] }; message: string }> {
    return this.http.get<{ success: boolean; data: { plans: Plan[] }; message: string }>(this.apiUrl);
  }

  subscribe(planId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/subscribe`, { planId });
  }
}
