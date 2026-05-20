import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
<<<<<<< HEAD
  private apiUrl = 'https://archv-rooms-web.vercel.app';
=======
  private apiUrl = 'http://archv-rooms.onrender.com/auth';
>>>>>>> 057ffcff57a6a291664a3b2588af89448d29f066

  private tokenKey = '@ProjetoX:token';
  private userKey = '@ProjetoX:user';

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

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.success) {
          localStorage.setItem(this.tokenKey, response.data.token);
          localStorage.setItem(this.userKey, JSON.stringify(response.data.user));
          this.authState.next(true);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  getUserRole(): string {
  const userStr = localStorage.getItem(this.userKey);
  if (userStr) {
    const user = JSON.parse(userStr);
    return user.role;
  }
  return 'user';
}

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.authState.next(false);
    this.router.navigate(['/login']);
  }
}
