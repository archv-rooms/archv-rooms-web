import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/leaderboard`;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('@archv:token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getRanking(gameId?: number): Observable<any> {
    const params = gameId ? `?gameId=${gameId}` : '';
    return this.http.get(`${this.baseUrl}/ranking${params}`, {
      headers: this.getHeaders()
    });
  }

  getHistory(gameId?: number): Observable<any> {
    const params = gameId ? `?gameId=${gameId}` : '';
    return this.http.get(`${this.baseUrl}/history${params}`, {
      headers: this.getHeaders()
    });
  }

  getGames(): Observable<any> {
    return this.http.get(`${this.baseUrl}/games`, {
      headers: this.getHeaders()
    });
  }
}