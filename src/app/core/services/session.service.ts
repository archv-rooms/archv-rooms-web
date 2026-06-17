import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from '../../../environments/environments'

@Injectable({ providedIn: 'root' })
export class SessionService {
  private api = environment.apiUrl

  constructor(private http: HttpClient) {}

  startSession(gameId: number) {
    return this.http.post(`${this.api}/sessions/start`, { gameId })
  }

  endSession(sessionId: number) {
    return this.http.patch(`${this.api}/sessions/${sessionId}/end`, {})
  }

  getHistory() {
    return this.http.get(`${this.api}/sessions/history`)
  }
}