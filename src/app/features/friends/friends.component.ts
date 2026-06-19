import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FriendService } from '../../core/services/friend.service';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit {
  private friendService = inject(FriendService);
  private router = inject(Router);

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

  ngOnInit(): void {
    this.loadFriends();
    this.loadPending();
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
      error: () => {
        this.isLoadingPending.set(false);
      }
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
      error: () => {
        this.showFeedback('Erro ao responder convite.', 'error');
      }
    });
  }

  removeFriend(friendId: number): void {
    if (!confirm('Remover este amigo?')) return;
    this.friendService.removeFriend(friendId).subscribe({
      next: (res) => {
        if (res.success) {
          this.showFeedback('Amigo removido.', 'success');
          this.friends.update(list => list.filter(f => f.id !== friendId));
        }
      },
      error: () => {
        this.showFeedback('Erro ao remover amigo.', 'error');
      }
    });
  }

  showFeedback(message: string, type: 'success' | 'error'): void {
    this.feedbackMessage.set(message);
    this.feedbackType.set(type);
    setTimeout(() => this.feedbackMessage.set(''), 3000);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}