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

  private normalizeRanking(res: any): { success: boolean; data: any[] } {
    try {
      const raw = res?.data?.ranking ?? res?.data ?? res ?? [];
      const arr = Array.isArray(raw) ? raw : [];
      const data = arr.map((entry: any) => ({
        userId:       entry.user?.id       ?? entry.userId,
        username:     entry.user?.name     ?? entry.username ?? entry.user?.username ?? '—',
        avatar:       entry.user?.avatar   ?? entry.avatar,
        gameName:     entry.game?.title    ?? entry.gameName,
        totalSeconds: entry.totalDuration  ?? entry.totalSeconds ?? 0,
        position:     entry.position
      }));
      return { success: true, data };
    } catch {
      return { success: false, data: [] };
    }
  }

  private normalizeHistory(res: any): { success: boolean; data: any[] } {
    try {
      const raw = res?.data?.sessions ?? res?.data ?? res ?? [];
      const arr = Array.isArray(raw) ? raw : [];
      const data = arr.map((entry: any) => ({
        userId:          entry.user?.id       ?? entry.userId,
        username:        entry.user?.name     ?? entry.username ?? '—',
        avatar:          entry.user?.avatar   ?? entry.avatar,
        gameName:        entry.game?.title    ?? entry.gameName ?? 'jogo desconhecido',
        gameId:          entry.game?.id       ?? entry.gameId,
        durationSeconds: entry.duration       ?? entry.durationSeconds ?? 0,
        playedAt:        entry.startedAt      ?? entry.playedAt ?? entry.createdAt
      }));
      return { success: true, data };
    } catch {
      return { success: false, data: [] };
    }
  }

  private normalizeGames(res: any): { success: boolean; data: any[] } {
    try {
      const raw = res?.data?.games ?? res?.data ?? res ?? [];
      const arr = Array.isArray(raw) ? raw : [];
      return { success: true, data: arr };
    } catch {
      return { success: false, data: [] };
    }
  }

  private normalizeProfile(res: any): { success: boolean; data: any } {
    try {
      const d = res?.data ?? res;
      return { success: true, data: d };
    } catch {
      return { success: false, data: null };
    }
  }

  getRanking(gameId?: number): Observable<{ success: boolean; data: any[] }> {
    const params = gameId ? `?gameId=${gameId}` : '';
    return this.http
      .get(`${this.baseUrl}/ranking${params}`, { headers: this.getHeaders() })
      .pipe(
        map(res => this.normalizeRanking(res)),
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
        map(res => this.normalizeHistory(res)),
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
        map(res => this.normalizeGames(res)),
        catchError(err => {
          console.error('[LeaderboardService] getGames error:', err);
          return of({ success: false, data: [] });
        })
      );
  }

  getPlayerProfile(username: string): Observable<{ success: boolean; data: any }> {
    return this.http
      .get(`${this.baseUrl}/profile/${username}`, { headers: this.getHeaders() })
      .pipe(
        map(res => this.normalizeProfile(res)),
        catchError(err => {
          console.error('[LeaderboardService] getPlayerProfile error:', err);
          return of({ success: false, data: null });
        })
      );
  }
}