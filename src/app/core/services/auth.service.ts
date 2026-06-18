import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;

  private tokenKey = '@archv:token';
  private userKey  = '@archv:user';

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private authState = new BehaviorSubject<boolean>(this.hasToken());

  constructor() {}

  private hasToken(): boolean {
    return this.isBrowser ? !!localStorage.getItem(this.tokenKey) : false;
  }

  isAuthenticated(): boolean {
    return this.authState.value;
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem(this.tokenKey) : null;
  }

  getUserName(): string {
    if (!this.isBrowser) return 'Player 1';
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.name;
    }
    return 'Player 1';
  }

  getUserRole(): string {
    if (!this.isBrowser) return 'user';
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.role;
    }
    return 'user';
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/auth/login`, credentials, { headers }).pipe(
      tap((response: any) => {
        if (response.success && this.isBrowser) {
          localStorage.setItem(this.tokenKey, response.data.token);
          localStorage.setItem(this.userKey, JSON.stringify(response.data.user));
          this.authState.next(true);
        }
      })
    );
  }

  register(userData: { name: string; email: string; password: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/auth/register`, userData, { headers });
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    this.authState.next(false);
    this.router.navigate(['/login']);
  }

  loginWithGoogle(): void {
    if (this.isBrowser) {
      window.location.href = `https://archv-rooms.onrender.com/auth/google`;
    }
  }

  handleGoogleCallback(token: string, name: string, role: string): void {
    if (this.isBrowser) {
      localStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.userKey, JSON.stringify({ name, role }));
      this.authState.next(true);
    }
  }
}