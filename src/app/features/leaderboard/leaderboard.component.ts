import { Component, inject, OnInit, signal } from '@angular/core';
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
export class LeaderboardComponent implements OnInit {
  private leaderboardService = inject(LeaderboardService);
  private router = inject(Router);

  ranking = signal<any[]>([]);
  history = signal<any[]>([]);
  games = signal<any[]>([]);

  selectedGameId = signal<number | undefined>(undefined);

  isLoadingRanking = signal(false);
  isLoadingHistory = signal(false);
  isLoadingGames = signal(false);

  currentUser = JSON.parse(localStorage.getItem('@archv:user') || '{}');

  ngOnInit(): void {
    this.loadGames();
    this.loadRanking();
    this.loadHistory();
  }

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

  goBack(): void {
    this.router.navigate(['/']);
  }
}