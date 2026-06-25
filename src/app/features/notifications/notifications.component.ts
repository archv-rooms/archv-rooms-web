import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { FriendService } from '../../core/services/friend.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private friendService = inject(FriendService);
  private router = inject(Router);

  isLoggedIn = false;
  userName = '';
  isAdmin = false;

  notifications = signal<any[]>([]);
  isLoading = signal(false);
  feedbackMessage = signal('');
  feedbackType = signal<'success' | 'error'>('success');
  activeFilter = signal<'all' | 'unread'>('all');

  ngOnInit(): void {
    this.checkAuth();
    this.loadNotifications();
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
    this.router.navigate(['/home']);
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  loadNotifications(): void {
    this.isLoading.set(true);
    this.notificationService.getNotifications().subscribe({
      next: (res) => {
        if (res.success) this.notifications.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.showFeedback('Erro ao carregar notificações.', 'error');
        this.isLoading.set(false);
      }
    });
  }

  setFilter(filter: 'all' | 'unread'): void {
    this.activeFilter.set(filter);
  }

  filteredNotifications(): any[] {
    const all = this.notifications();
    if (this.activeFilter() === 'unread') return all.filter(n => !n.read);
    return all;
  }

  groupedNotifications(): { label: string; items: any[] }[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: Record<string, any[]> = { hoje: [], ontem: [], antigas: [] };

    for (const n of this.filteredNotifications()) {
      const d = new Date(n.createdAt);
      d.setHours(0, 0, 0, 0);
      if (d.getTime() === today.getTime()) groups['hoje'].push(n);
      else if (d.getTime() === yesterday.getTime()) groups['ontem'].push(n);
      else groups['antigas'].push(n);
    }

    return [
      { label: 'hoje', items: groups['hoje'] },
      { label: 'ontem', items: groups['ontem'] },
      { label: 'anteriores', items: groups['antigas'] },
    ].filter(g => g.items.length > 0);
  }

  unreadCount(): number {
    return this.notifications().filter(n => !n.read).length;
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(n => n.id === id ? { ...n, read: true } : n)
        );
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update(list => list.map(n => ({ ...n, read: true })));
        this.showFeedback('Todas marcadas como lidas.', 'success');
      }
    });
  }

  deleteNotification(id: number): void {
    this.notificationService.deleteNotification(id).subscribe({
      next: () => {
        this.notifications.update(list => list.filter(n => n.id !== id));
      }
    });
  }

  respondFriendRequest(n: any, status: 'accepted' | 'rejected'): void {
    const friendshipId = n.data?.friendshipId;
    if (!friendshipId) return;

    this.friendService.respondRequest(friendshipId, status).subscribe({
      next: () => {
        const msg = status === 'accepted' ? 'Amizade aceita!' : 'Convite recusado.';
        this.showFeedback(msg, 'success');
        this.notifications.update(list =>
          list.map(item => item.id === n.id
            ? { ...item, read: true, _responded: true }
            : item
          )
        );
      },
      error: () => this.showFeedback('Erro ao responder convite.', 'error')
    });
  }

  showFeedback(message: string, type: 'success' | 'error'): void {
    this.feedbackMessage.set(message);
    this.feedbackType.set(type);
    setTimeout(() => this.feedbackMessage.set(''), 3000);
  }
}