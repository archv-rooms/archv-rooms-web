import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LeaderboardService } from '../../core/services/leaderboard.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit, OnDestroy {
  private leaderboardService = inject(LeaderboardService);
  private router = inject(Router);

  // ── Sidebar / Topbar ──
  isLoggedIn = false;
  userName = '';
  isAdmin = false;

  jumpscareActive = false;
  jumpscareVideoUrl = '/videos/hihi.mp4';
  private jumpscareTimer: any;
  private eggClickCount = 0;
  private eggClickTimer: any;

  // ── Leaderboard ──
  ranking = signal<any[]>([]);
  history = signal<any[]>([]);
  games = signal<any[]>([]);

  selectedGameId = signal<number | undefined>(undefined);

  isLoadingRanking = signal(false);
  isLoadingHistory = signal(false);
  isLoadingGames = signal(false);

  currentUser = JSON.parse(localStorage.getItem('@archv:user') || '{}');

  ngOnInit(): void {
    this.checkAuth();
    this.loadGames();
    this.loadRanking();
    this.loadHistory();
  }

  ngOnDestroy(): void {
    clearTimeout(this.jumpscareTimer);
    clearTimeout(this.eggClickTimer);
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

  // ── Leaderboard ──
  loadGames(): void {
    this.isLoadingGames.set(true);
    this.leaderboardService.getGames().subscribe({
      next: (res) => {
        if (res.success) this.games.set(res.data);
        this.isLoadingGames.set(false);
      },
      error: () => this.isLoadingGames.set(false)
    });
  }

  loadRanking(): void {
    this.isLoadingRanking.set(true);
    this.leaderboardService.getRanking(this.selectedGameId()).subscribe({
      next: (res) => {
        if (res.success) this.ranking.set(res.data);
        this.isLoadingRanking.set(false);
      },
      error: () => this.isLoadingRanking.set(false)
    });
  }

  loadHistory(): void {
    this.isLoadingHistory.set(true);
    this.leaderboardService.getHistory(this.selectedGameId()).subscribe({
      next: (res) => {
        if (res.success) this.history.set(res.data);
        this.isLoadingHistory.set(false);
      },
      error: () => this.isLoadingHistory.set(false)
    });
  }

  onGameFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedGameId.set(value ? Number(value) : undefined);
    this.loadRanking();
    this.loadHistory();
  }

  formatTime(seconds: number): string {
    if (!seconds || seconds <= 0) return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
  }

  getMedalIcon(index: number): string {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  }

  isCurrentUser(userId: number): boolean {
    return this.currentUser?.id === userId;
  }
}