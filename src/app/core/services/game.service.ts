import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('@archv:token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // GET /api/games — público
  getGames(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/games`);
  }

  // GET /api/games/:id — público
  getGameById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/games/${id}`);
  }

  // POST /admin/games — requer admin
  createGame(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/games`, data, {
      headers: this.getAuthHeaders()
    });
  }

  // PUT /admin/games/:id — requer admin
  updateGame(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/games/${id}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  // DELETE /admin/games/:id — requer admin
  deleteGame(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/games/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
