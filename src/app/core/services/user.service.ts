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

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('@archv:token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // ── PROFILE ──────────────────────────────────────────────
  // GET /user/profile
  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(
      `${this.apiUrl}/user/profile`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ── AVATAR (URL externa) ──────────────────────────────────
  // PATCH /user/avatar-url
  updateAvatarUrl(avatarUrl: string): Observable<AvatarResponse> {
    return this.http.patch<AvatarResponse>(
      `${this.apiUrl}/user/avatar-url`,
      { avatarUrl },
      {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${localStorage.getItem('@archv:token')}`,
          'Content-Type': 'application/json'
        })
      }
    );
  }

  // ── AVATAR (upload de arquivo) ────────────────────────────
  // PATCH /user/avatar-file
  // Nota: não enviar Content-Type manualmente — o browser define o boundary do multipart automaticamente
  updateAvatarFile(file: File): Observable<AvatarResponse> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.patch<AvatarResponse>(
      `${this.apiUrl}/user/avatar-file`,
      formData,
      { headers: this.getAuthHeaders() }
    );
  }

  // ── ADMIN — USERS ─────────────────────────────────────────
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
      {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${localStorage.getItem('@archv:token')}`,
          'Content-Type': 'application/json'
        })
      }
    );
  }

  // PATCH /admin/users/:id/status
  setUserStatus(id: number, status: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/admin/users/${id}/status`,
      { status },
      {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${localStorage.getItem('@archv:token')}`,
          'Content-Type': 'application/json'
        })
      }
    );
  }
}
