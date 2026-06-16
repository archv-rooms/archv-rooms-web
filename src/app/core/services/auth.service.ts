import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  private tokenKey = '@archv:token';
  private userKey = '@archv:user';

  private authState = new BehaviorSubject<boolean>(this.hasToken());

  constructor() {}

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return this.authState.value;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserName(): string {
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.name;
    }
    return 'Player 1';
  }

  getUserRole(): string {
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.role;
    }
    return 'user';
  }

  // POST /auth/login
  login(credentials: { email: string; password: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/auth/login`, credentials, { headers }).pipe(
      tap((response: any) => {
        if (response.success) {
          localStorage.setItem(this.tokenKey, response.data.token);
          localStorage.setItem(this.userKey, JSON.stringify(response.data.user));
          this.authState.next(true);
        }
      })
    );
  }

  // POST /auth/register
  register(userData: { name: string; email: string; password: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/auth/register`, userData, { headers });
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.authState.next(false);
    this.router.navigate(['/login']);
  }

  loginWithGoogle(): void {
    window.location.href = `https://archv-rooms.onrender.com/auth/google`;
}
 
  handleGoogleCallback(token: string, name: string, role: string): void {
  localStorage.setItem(this.tokenKey, token);
  localStorage.setItem(this.userKey, JSON.stringify({ name, role }));
  this.authState.next(true);
}
}
