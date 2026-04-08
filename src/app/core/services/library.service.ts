import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Game {
  id: number;
  title: string;
  console: string;
  image: string;
  accessLevel: number;
}

interface LibraryResponse {
  success: boolean;
  data: { games: Game[] };
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/library';

  getGames(): Observable<LibraryResponse> {
    return this.http.get<LibraryResponse>(this.apiUrl);
  }
}
