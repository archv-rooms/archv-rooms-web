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
  avatar?: string;
  createdAt: string;
  subscriptions: Subscription[];
}

interface ProfileResponse {
  success: boolean;
  data: { user: UserProfile };
  message: string;
}

interface AvatarResponse {
  success: boolean;
  data: { avatar: string };
  message: string;
}

interface UpdateNameResponse {
  success: boolean;
  data: { name: string };
  message: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('@archv:token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  private getJsonHeaders(): HttpHeaders {
    const token = localStorage.getItem('@archv:token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // GET /user/profile
  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(
      `${this.apiUrl}/user/profile`,
      { headers: this.getAuthHeaders() }
    );
  }

  // PATCH /user/name
  updateName(name: string): Observable<UpdateNameResponse> {
    return this.http.patch<UpdateNameResponse>(
      `${this.apiUrl}/user/name`,
      { name },
      { headers: this.getJsonHeaders() }
    );
  }

  // PATCH /user/avatar-url
  updateAvatarUrl(avatarUrl: string): Observable<AvatarResponse> {
    return this.http.patch<AvatarResponse>(
      `${this.apiUrl}/user/avatar-url`,
      { avatarUrl },
      { headers: this.getJsonHeaders() }
    );
  }

  // PATCH /user/avatar-file
  updateAvatarFile(file: File): Observable<AvatarResponse> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.patch<AvatarResponse>(
      `${this.apiUrl}/user/avatar-file`,
      formData,
      { headers: this.getAuthHeaders() }
    );
  }

  // GET /admin/users
  getAllUsers(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/admin/users`,
      { headers: this.getAuthHeaders() }
    );
  }

  // PATCH /admin/users/:id/role
  setUserRole(id: number, role: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/admin/users/${id}/role`,
      { role },
      { headers: this.getJsonHeaders() }
    );
  }

  // PATCH /admin/users/:id/status
  setUserStatus(id: number, status: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/admin/users/${id}/status`,
      { status },
      { headers: this.getJsonHeaders() }
    );
  }

  // GET /user/payments
  getPaymentHistory(): Observable<any> {
    return this.http.get<any>(
     `${this.apiUrl}/user/payments`,
     { headers: this.getAuthHeaders() }
    );
  }
}