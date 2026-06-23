import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/leaderboard`;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('@archv:token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return new HttpHeaders(headers);
  }

  // Normaliza qualquer formato de resposta da API para sempre retornar { success, data }
  private normalize(res: any): { success: boolean; data: any[] } {
    // Array direto: [...]
    if (Array.isArray(res)) {
      return { success: true, data: res };
    }
    // { data: [...] }
    if (res && Array.isArray(res.data)) {
      return { success: true, data: res.data };
    }
    // { success: true, data: [...] }
    if (res && res.success !== undefined) {
      return { success: !!res.success, data: Array.isArray(res.data) ? res.data : [] };
    }
    // { items: [...] }
    if (res && Array.isArray(res.items)) {
      return { success: true, data: res.items };
    }
    // { results: [...] }
    if (res && Array.isArray(res.results)) {
      return { success: true, data: res.results };
    }
    // fallback
    return { success: false, data: [] };
  }

  getRanking(gameId?: number): Observable<{ success: boolean; data: any[] }> {
    const params = gameId ? `?gameId=${gameId}` : '';
    return this.http
      .get(`${this.baseUrl}/ranking${params}`, { headers: this.getHeaders() })
      .pipe(
        map(res => this.normalize(res)),
        catchError(err => {
          console.error('[LeaderboardService] getRanking error:', err);
          return of({ success: false, data: [] });
        })
      );
  }

  getHistory(gameId?: number): Observable<{ success: boolean; data: any[] }> {
    const params = gameId ? `?gameId=${gameId}` : '';
    return this.http
      .get(`${this.baseUrl}/history${params}`, { headers: this.getHeaders() })
      .pipe(
        map(res => this.normalize(res)),
        catchError(err => {
          console.error('[LeaderboardService] getHistory error:', err);
          return of({ success: false, data: [] });
        })
      );
  }

  getGames(): Observable<{ success: boolean; data: any[] }> {
    return this.http
      .get(`${this.baseUrl}/games`, { headers: this.getHeaders() })
      .pipe(
        map(res => this.normalize(res)),
        catchError(err => {
          console.error('[LeaderboardService] getGames error:', err);
          return of({ success: false, data: [] });
        })
      );
  }
}