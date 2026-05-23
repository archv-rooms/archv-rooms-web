import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private get headers() {
    const token = localStorage.getItem('@ProjetoX:token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getGames() {
    return this.http.get<any>(`${this.apiUrl}/api/games`, { headers: this.headers });
  }

  createGame(data: any) {
    return this.http.post<any>(`${this.apiUrl}/admin/games`, data, { headers: this.headers });
  }

  updateGame(id: string, data: any) {
    return this.http.put<any>(`${this.apiUrl}/admin/games/${id}`, data, { headers: this.headers });
  }

  deleteGame(id: string) {
    return this.http.delete(`${this.apiUrl}/admin/games/${id}`, { headers: this.headers });
  }
}