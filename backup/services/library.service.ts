import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

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
  private apiUrl = environment.apiUrl;

  getGames(): Observable<LibraryResponse> {
    return this.http.get<LibraryResponse>(this.apiUrl);
  }
}
