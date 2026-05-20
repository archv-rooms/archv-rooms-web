// plan.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Plan {
  id: number;
  name: string;
  price: number;
  description: string;
  accessLevel: number;
}

@Injectable({ providedIn: 'root' })
export class PlanService {
  private http = inject(HttpClient);
  private apiUrl = 'https://archv-rooms-web.vercel.app/pricing';
  // Planos são públicos — sem token
getPlans(): Observable<{ success: boolean; data: { plans: Plan[] }; message: string }> {
  return this.http.get<{ success: boolean; data: { plans: Plan[] }; message: string }>(`${this.apiUrl}?t=${Date.now()}`);
}

  // Subscribe requer auth
  subscribe(planId: number): Observable<any> {
    const token = localStorage.getItem('@ProjetoX:token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post(`${this.apiUrl}/subscribe`, { planId }, { headers });
  }
}