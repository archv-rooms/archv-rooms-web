import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private baseUrl = 'http://localhost:3000/api/games';

  constructor(private http: HttpClient) {}

  getGames() {
    return this.http.get<any>(this.baseUrl);
  }

  createGame(data: any) {
    return this.http.post<any>(this.baseUrl, data);
  }

  updateGame(id: string, data: any) {
    return this.http.put<any>(`${this.baseUrl}/${id}`, data);
  }

  deleteGame(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}