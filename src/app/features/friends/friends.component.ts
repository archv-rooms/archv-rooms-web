import { Component, inject, OnInit, OnDestroy, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FriendService } from '../../core/services/friend.service';
import { ChatService, ChatMessage } from '../../core/services/chat.service';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit, OnDestroy {
  private friendService = inject(FriendService);
  private chatService = inject(ChatService);
  private router = inject(Router);

  @ViewChild('chatMessages') chatMessagesEl!: ElementRef;

  isLoggedIn = false;
  userName = '';
  isAdmin = false;

  jumpscareActive = false;
  jumpscareVideoUrl = '/videos/hihi.mp4';
  private jumpscareTimer: any;
  private eggClickCount = 0;
  private eggClickTimer: any;

  friends = signal<any[]>([]);
  pendingRequests = signal<any[]>([]);
  searchResults = signal<any[]>([]);

  searchQuery = '';
  isLoadingFriends = signal(false);
  isLoadingPending = signal(false);
  isSearching = signal(false);
  feedbackMessage = signal('');
  feedbackType = signal<'success' | 'error'>('success');

  currentUser = JSON.parse(localStorage.getItem('@archv:user') || '{}');

  // ── CHAT ──
  chatOpen = false;
  activeFriend: any = null;
  messages: ChatMessage[] = [];
  newMessage = '';
  isLoadingMessages = false;
  private activeConversationId: number | null = null;
  private msgSubscription?: Subscription;

  ngOnInit(): void {
    this.checkAuth();
    this.loadFriends();
    this.loadPending();
    this.chatService.connect();
  }

  ngOnDestroy(): void {
    clearTimeout(this.jumpscareTimer);
    clearTimeout(this.eggClickTimer);
    this.msgSubscription?.unsubscribe();
    this.chatService.disconnect();
  }

  private checkAuth(): void {
    const token = localStorage.getItem('@archv:token');
    const user = JSON.parse(localStorage.getItem('@archv:user') || '{}');
    this.isLoggedIn = !!token;
    this.userName = user?.username || user?.name || '';
    this.isAdmin = user?.role === 'admin';
  }

  logout(): void {
    localStorage.removeItem('@archv:token');
    localStorage.removeItem('@archv:user');
    this.isLoggedIn = false;
    this.userName = '';
    this.router.navigate(['/home']);
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  onHomeIconClick(): void {
    this.eggClickCount++;
    clearTimeout(this.eggClickTimer);
    if (this.eggClickCount >= 3) {
      this.eggClickCount = 0;
      this.triggerJumpscare();
      return;
    }
    this.eggClickTimer = setTimeout(() => {
      this.eggClickCount = 0;
      this.navigate('/home');
    }, 300);
  }

  triggerJumpscare(): void {
    if (this.jumpscareActive) return;
    this.jumpscareActive = true;
    this.jumpscareTimer = setTimeout(() => this.dismissJumpscare(), 24000);
  }

  dismissJumpscare(): void {
    this.jumpscareActive = false;
    clearTimeout(this.jumpscareTimer);
  }

  loadFriends(): void {
    this.isLoadingFriends.set(true);
    this.friendService.getFriends().subscribe({
      next: (res) => {
        if (res.success) this.friends.set(res.data);
        this.isLoadingFriends.set(false);
      },
      error: () => {
        this.showFeedback('Erro ao carregar amigos.', 'error');
        this.isLoadingFriends.set(false);
      }
    });
  }

  loadPending(): void {
    this.isLoadingPending.set(true);
    this.friendService.getPending().subscribe({
      next: (res) => {
        if (res.success) this.pendingRequests.set(res.data);
        this.isLoadingPending.set(false);
      },
      error: () => this.isLoadingPending.set(false)
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults.set([]);
      return;
    }
    this.isSearching.set(true);
    this.friendService.searchUsers(this.searchQuery).subscribe({
      next: (res) => {
        if (res.success) this.searchResults.set(res.data);
        this.isSearching.set(false);
      },
      error: () => {
        this.showFeedback('Erro ao buscar usuários.', 'error');
        this.isSearching.set(false);
      }
    });
  }

  sendRequest(receiverId: number): void {
    this.friendService.sendRequest(receiverId).subscribe({
      next: (res) => {
        if (res.success) {
          this.showFeedback('Convite enviado!', 'success');
          this.searchResults.update(list =>
            list.map(u => u.id === receiverId ? { ...u, requestSent: true } : u)
          );
        }
      },
      error: (err) => {
        this.showFeedback(err?.error?.message || 'Erro ao enviar convite.', 'error');
      }
    });
  }

  respondRequest(friendshipId: number, status: 'accepted' | 'rejected'): void {
    this.friendService.respondRequest(friendshipId, status).subscribe({
      next: (res) => {
        if (res.success) {
          const msg = status === 'accepted' ? 'Amizade aceita!' : 'Convite recusado.';
          this.showFeedback(msg, 'success');
          this.pendingRequests.update(list => list.filter(r => r.id !== friendshipId));
          if (status === 'accepted') this.loadFriends();
        }
      },
      error: () => this.showFeedback('Erro ao responder convite.', 'error')
    });
  }

  removeFriend(friendshipId: number): void {
    if (!confirm('Remover este amigo?')) return;
    this.friendService.removeFriend(friendshipId).subscribe({
      next: (res) => {
        if (res.success) {
          this.showFeedback('Amigo removido.', 'success');
          this.friends.update(list => list.filter(f => f.friendshipId !== friendshipId));
        }
      },
      error: () => this.showFeedback('Erro ao remover amigo.', 'error')
    });
  }

  showFeedback(message: string, type: 'success' | 'error'): void {
    this.feedbackMessage.set(message);
    this.feedbackType.set(type);
    setTimeout(() => this.feedbackMessage.set(''), 3000);
  }

  // ── CHAT ──────────────────────────────────────────
  openChat(friend: any): void {
    this.activeFriend = friend;
    this.chatOpen = true;
    this.messages = [];
    this.isLoadingMessages = true;

    this.chatService.getOrCreateDirectConversation(friend.id).subscribe({
      next: (res) => {
        if (!res.success) return;
        const convId = res.data.conversation.id;
        this.activeConversationId = convId;
        this.chatService.joinConversation(convId);

        this.msgSubscription?.unsubscribe();
        this.msgSubscription = this.chatService.onNewMessage().subscribe(msg => {
          if (msg && msg.conversationId === this.activeConversationId) {
            this.messages.push(msg);
            this.scrollToBottom();
          }
        });

        this.chatService.getMessages(convId).subscribe({
          next: (r) => {
            if (r.success) {
              this.messages = r.data.messages;
              this.isLoadingMessages = false;
              this.scrollToBottom();
            }
          },
          error: () => { this.isLoadingMessages = false; }
        });
      },
      error: () => { this.isLoadingMessages = false; }
    });
  }

  closeChat(): void {
    if (this.activeConversationId !== null) {
      this.chatService.leaveConversation(this.activeConversationId);
    }
    this.msgSubscription?.unsubscribe();
    this.chatOpen = false;
    this.activeFriend = null;
    this.messages = [];
    this.activeConversationId = null;
  }

  sendMessage(): void {
    const content = this.newMessage.trim();
    if (!content || !this.activeConversationId) return;

    this.newMessage = '';

    this.chatService.sendMessage(this.activeConversationId, content).subscribe({
      error: () => this.showFeedback('Erro ao enviar mensagem.', 'error')
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.chatMessagesEl?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }
}