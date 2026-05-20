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
  private apiUrl = 'http://archv-rooms.onrender.com/user';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('@ProjetoX:token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // =========================
  // PROFILE
  // =========================
  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(
      `${this.apiUrl}/profile`,
      { headers: this.getHeaders() }
    );
  }

  // =========================
  // AVATAR - URL EXTERNA
  // =========================
  updateAvatarUrl(avatarUrl: string): Observable<AvatarResponse> {
    return this.http.patch<AvatarResponse>(
      `${this.apiUrl}/avatar-url`,
      { avatarUrl },
      { headers: this.getHeaders() }
    );
  }

  // =========================
  // AVATAR - UPLOAD DE ARQUIVO
  // =========================
  updateAvatarFile(file: File): Observable<AvatarResponse> {
    const formData = new FormData();
    formData.append('avatar', file);
    const token = localStorage.getItem('@ProjetoX:token');
    return this.http.patch<AvatarResponse>(
      `${this.apiUrl}/avatar-file`,
      formData,
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      }
    );
  }

  // =========================
  // ADMIN - USERS
  // =========================
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/admin/users`,
      { headers: this.getHeaders() }
    );
  }

  // =========================
  // ADMIN - STATS
  // =========================
  getAdminStats(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/admin/stats`,
      { headers: this.getHeaders() }
    );
  }

  // =========================
  // BAN USER
  // =========================
  banUser(id: number, data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${id}/ban`,
      data,
      { headers: this.getHeaders() }
    );
  }

  // =========================
  // UNBAN USER
  // =========================
  unbanUser(id: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${id}/unban`,
      {},
      { headers: this.getHeaders() }
    );
  }
}