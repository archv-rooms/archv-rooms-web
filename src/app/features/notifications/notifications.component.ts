import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  isLoggedIn = false;
  userName = '';
  isAdmin = false;

  notifications = signal<any[]>([]);
  isLoading = signal(false);
  feedbackMessage = signal('');
  feedbackType = signal<'success' | 'error'>('success');

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

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      friend_request: '👤',
      friend_accepted: '✓',
      challenge: '⚔',
      activity: '▶'
    };
    return icons[type] ?? '●';
  }

  showFeedback(message: string, type: 'success' | 'error'): void {
    this.feedbackMessage.set(message);
    this.feedbackType.set(type);
    setTimeout(() => this.feedbackMessage.set(''), 3000);
  }
}