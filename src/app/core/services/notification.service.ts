import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/notifications`;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('@archv:token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getNotifications(): Observable<any> {
    return this.http.get(this.baseUrl, { headers: this.getHeaders() });
  }

  getUnreadCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/unread`, { headers: this.getHeaders() });
  }

  markAsRead(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/read`, {}, { headers: this.getHeaders() });
  }

  markAllAsRead(): Observable<any> {
    return this.http.patch(`${this.baseUrl}/read-all`, {}, { headers: this.getHeaders() });
  }

  deleteNotification(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }
}