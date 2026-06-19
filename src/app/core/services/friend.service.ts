import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class FriendService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/friends`;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('@archv:token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getFriends(): Observable<any> {
    return this.http.get(`${this.baseUrl}`, {
      headers: this.getHeaders()
    });
  }

  getPending(): Observable<any> {
    return this.http.get(`${this.baseUrl}/pending`, {
      headers: this.getHeaders()
    });
  }

  searchUsers(query: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`, {
      headers: this.getHeaders()
    });
  }

  sendRequest(receiverId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/request`, { receiverId }, {
      headers: this.getHeaders()
    });
  }

  respondRequest(friendshipId: number, status: 'accepted' | 'rejected'): Observable<any> {
    return this.http.patch(`${this.baseUrl}/respond/${friendshipId}`, { status }, {
      headers: this.getHeaders()
    });
  }

  removeFriend(friendId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${friendId}`, {
      headers: this.getHeaders()
    });
  }
}