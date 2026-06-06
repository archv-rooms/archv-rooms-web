import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environments';
import { AuthService } from '../../core/services/auth.service';

interface Game {
  id: number;
  title: string;
  console: string;
  image: string;
}

interface Platform {
  name: string;
  count: number;
  pct: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  isLoggedIn = false;
  userName = '';

  // ── GAMES ────────────────────────────────────────────
  games: Game[] = [];
  loadingGames = false;
  gamesError = '';

  // ── CARROSSEL ────────────────────────────────────────
  carouselIndex = 0;
  readonly carouselVisible = 4; // quantos cards aparecem por vez

  // ── PLATAFORMAS — preenchido dinamicamente ────────────
  platforms: Platform[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkAuth();
  }

  // ── AUTH ─────────────────────────────────────────────

  private checkAuth(): void {
    this.isLoggedIn = this.authService.isAuthenticated();

    if (this.isLoggedIn) {
      this.userName = this.authService.getUserName();
      const token = this.authService.getToken();
      if (token) this.loadGames(token);
    }
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.userName = '';
    this.games = [];
    this.platforms = [];
  }

  // ── GAMES ────────────────────────────────────────────

  private loadGames(token: string): void {
    this.loadingGames = true;
    this.gamesError = '';

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<{
      success: boolean;
      data: { games: Game[] };
      message: string;
    }>(`${environment.apiUrl}/library`, { headers }).subscribe({
      next: (res) => {
        if (res.success) {
          this.games = res.data.games;
          this.buildPlatforms();
        } else {
          this.gamesError = res.message;
        }
        this.loadingGames = false;
      },
      error: (err) => {
        console.error(err);
        this.gamesError = 'Falha ao carregar acervo.';
        this.loadingGames = false;
      }
    });
  }

  // ── PLATAFORMAS — contagem real dos jogos ─────────────

  private buildPlatforms(): void {
    const counts: Record<string, number> = {};

    for (const game of this.games) {
      const key = game.console.toUpperCase();
      counts[key] = (counts[key] ?? 0) + 1;
    }

    const max = Math.max(...Object.values(counts), 1);

    this.platforms = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        pct: Math.round((count / max) * 100)
      }));
  }

  // ── CARROSSEL ────────────────────────────────────────

  get carouselGames(): Game[] {
    return this.games.slice(
      this.carouselIndex,
      this.carouselIndex + this.carouselVisible
    );
  }

  carouselPrev(): void {
    this.carouselIndex = Math.max(0, this.carouselIndex - this.carouselVisible);
  }

  carouselNext(): void {
    const max = this.games.length - this.carouselVisible;
    this.carouselIndex = Math.min(max, this.carouselIndex + this.carouselVisible);
  }

  get carouselHasPrev(): boolean {
    return this.carouselIndex > 0;
  }

  get carouselHasNext(): boolean {
    return this.carouselIndex + this.carouselVisible < this.games.length;
  }

  // ── NAVEGAÇÃO ────────────────────────────────────────

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  onInitializeLink(): void {
    this.router.navigate([this.isLoggedIn ? '/library' : '/register']);
  }

  onGameClick(game: Game): void {
    this.router.navigate(['/rooms', game.id]);
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/placeholder-game.png';
  }
}