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
<<<<<<< HEAD
  private apiUrl = 'https://archv-rooms-web.vercel.app';
=======
  private apiUrl = 'archv-rooms.onrender.com';
>>>>>>> 057ffcff57a6a291664a3b2588af89448d29f066

  getGames(): Observable<LibraryResponse> {
    return this.http.get<LibraryResponse>(this.apiUrl);
  }
}
