import { Component, inject, OnInit, OnDestroy, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LeaderboardService } from '../../core/services/leaderboard.service';
import { FriendService } from '../../core/services/friend.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit, OnDestroy {
  private leaderboardService = inject(LeaderboardService);
  private friendService = inject(FriendService);
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

  private animatedPositions = new Set<number>();

  currentUser: any = this.parseCurrentUser();

  // ── Player Profile Modal ──
  playerProfile = signal<any>(null);
  isLoadingProfile = signal(false);
  showProfileModal = signal(false);
  friendRequestStatus = signal<'idle' | 'loading' | 'sent' | 'error'>('idle');

  private parseCurrentUser(): any {
    try {
      return JSON.parse(localStorage.getItem('@archv:user') || '{}');
    } catch {
      return {};
    }
  }

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
    try {
      const token = localStorage.getItem('@archv:token');
      const user = JSON.parse(localStorage.getItem('@archv:user') || '{}');
      this.isLoggedIn = !!token;
      this.userName = user?.username || user?.name || '';
      this.isAdmin = user?.role === 'admin';
      this.currentUser = user;
    } catch {
      this.isLoggedIn = false;
    }
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
        this.games.set(res.success && res.data.length > 0 ? res.data : []);
        this.isLoadingGames.set(false);
      },
      error: () => { this.games.set([]); this.isLoadingGames.set(false); }
    });
  }

  loadRanking(): void {
    this.isLoadingRanking.set(true);
    this.ranking.set([]);
    this.animatedPositions.clear();
    this.leaderboardService.getRanking(this.selectedGameId()).subscribe({
      next: (res) => {
        this.ranking.set(res.success && res.data.length > 0 ? res.data : []);
        this.isLoadingRanking.set(false);
      },
      error: () => { this.ranking.set([]); this.isLoadingRanking.set(false); }
    });
  }

  loadHistory(): void {
    this.isLoadingHistory.set(true);
    this.history.set([]);
    this.leaderboardService.getHistory(this.selectedGameId()).subscribe({
      next: (res) => {
        this.history.set(res.success && res.data.length > 0 ? res.data : []);
        this.isLoadingHistory.set(false);
      },
      error: () => { this.history.set([]); this.isLoadingHistory.set(false); }
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

  getAnimatedTime(seconds: number, position: number): string {
    const formatted = this.formatTime(seconds);
    const alreadyAnimated = this.animatedPositions.has(position);
    if (!alreadyAnimated) {
      this.animatedPositions.add(position);
    }
    return formatted
      .split('')
      .map((char, i) => {
        if (char === ':') return `<span class="time-sep">:</span>`;
        const delay = alreadyAnimated ? 0 : (i * 60);
        return `<span class="time-digit" style="animation-delay:${delay}ms">${char}</span>`;
      })
      .join('');
  }

  getRankLabel(index: number): string {
    return `#${index + 1}`;
  }

  isCurrentUser(userId: number): boolean {
    return !!(this.currentUser?.id && this.currentUser.id === userId);
  }

  navigateToGame(gameId: number): void {
     console.log('gameId:', gameId); // adiciona isso
    if (gameId) this.router.navigate(['/rooms', gameId]);
  }

  // ── Player Profile Modal ──
  openPlayerProfile(username: string, event?: Event): void {
    if (event) event.stopPropagation();
    if (!username) return;
    this.showProfileModal.set(true);
    this.isLoadingProfile.set(true);
    this.playerProfile.set(null);
    this.friendRequestStatus.set('idle');
    this.leaderboardService.getPlayerProfile(username).subscribe({
      next: (res) => {
        this.playerProfile.set(res.success ? res.data : null);
        this.isLoadingProfile.set(false);
      },
      error: () => {
        this.isLoadingProfile.set(false);
      }
    });
  }

  closeProfileModal(): void {
    this.showProfileModal.set(false);
    this.playerProfile.set(null);
    this.friendRequestStatus.set('idle');
  }

  sendFriendRequest(): void {
    const profile = this.playerProfile();
    if (!profile?.userId || !this.isLoggedIn) return;

    this.friendRequestStatus.set('loading');
    this.friendService.sendRequest(profile.userId).subscribe({
      next: () => this.friendRequestStatus.set('sent'),
      error: () => this.friendRequestStatus.set('error')
    });
  }

  @HostListener('document:keydown.escape')
  onEscPress(): void {
    if (this.showProfileModal()) this.closeProfileModal();
  }
}