import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { environment } from '../../../environments/environments'

@Injectable({ providedIn: 'root' })
export class SessionService {
  private api = environment.apiUrl

  constructor(private http: HttpClient) {}

  private get headers(): HttpHeaders {
    const token = localStorage.getItem('@archv:token')
    return new HttpHeaders({ Authorization: `Bearer ${token}` })
  }

  startSession(gameId: number) {
    return this.http.post(`${this.api}/sessions/start`, { gameId }, { headers: this.headers })
  }

  endSession(sessionId: number) {
    return this.http.patch(`${this.api}/sessions/${sessionId}/end`, {}, { headers: this.headers })
  }

  getHistory() {
    return this.http.get(`${this.api}/sessions/history`, { headers: this.headers })
  }
}