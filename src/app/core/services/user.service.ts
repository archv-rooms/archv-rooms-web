// user.service.ts
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

export interface Subscription {
  id: number;
  userId: number;
  planId: number;
  status: string;
  createdAt: string;
  plan: Plan;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  subscriptions: Subscription[];
}

interface ProfileResponse {
  success: boolean;
  data: { user: UserProfile };
  message: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'https://archv-rooms.onrender.com/user';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('@ProjetoX:token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(
      `${this.apiUrl}/profile`,
      { headers: this.getHeaders() }
    );
  }
}