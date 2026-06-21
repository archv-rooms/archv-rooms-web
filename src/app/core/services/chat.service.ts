import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { AuthService } from './auth.service';

export interface ChatUser {
  id: number;
  name: string;
  username: string | null;
  avatar: string | null;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: string;
  sender: ChatUser;
}

export interface ChatConversation {
  id: number;
  type: string;
  name: string | null;
  createdAt: string;
  participants: { user: ChatUser }[];
  messages: ChatMessage[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;

  private socket: Socket | null = null;
  private newMessage$ = new BehaviorSubject<ChatMessage | null>(null);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private get authHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  connect(): void {
    if (!this.isBrowser || this.socket?.connected) return;

    this.socket = io(this.apiUrl.replace('/api', ''), {
      transports: ['websocket']
    });

    this.socket.on('new_message', (message: ChatMessage) => {
      this.newMessage$.next(message);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  joinConversation(conversationId: number): void {
    this.socket?.emit('join_conversation', conversationId);
  }

  leaveConversation(conversationId: number): void {
    this.socket?.emit('leave_conversation', conversationId);
  }

  onNewMessage(): Observable<ChatMessage | null> {
    return this.newMessage$.asObservable();
  }

  getConversations(): Observable<{ success: boolean; data: { conversations: ChatConversation[] } }> {
    return this.http.get<any>(`${this.apiUrl}/chat/conversations`, { headers: this.authHeaders });
  }

  getOrCreateDirectConversation(friendId: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/chat/conversations/direct`,
      { friendId },
      { headers: this.authHeaders }
    );
  }

  getMessages(conversationId: number): Observable<{ success: boolean; data: { messages: ChatMessage[] } }> {
    return this.http.get<any>(
      `${this.apiUrl}/chat/conversations/${conversationId}/messages`,
      { headers: this.authHeaders }
    );
  }

  sendMessage(conversationId: number, content: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/chat/conversations/${conversationId}/messages`,
      { content },
      { headers: this.authHeaders }
    );
  }
}