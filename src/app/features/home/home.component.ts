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

  games: Game[] = [];
  loadingGames = false;
  gamesError = '';

  platforms = [
    { name: 'SNES',       count: '3.241', pct: 92 },
    { name: 'PS1',        count: '2.887', pct: 82 },
    { name: 'N64',        count: '1.654', pct: 47 },
    { name: 'MEGA DRIVE', count: '2.103', pct: 60 },
    { name: 'GAME BOY',   count: '1.820', pct: 52 },
    { name: 'GBA',        count: '1.440', pct: 41 },
    { name: 'NES',        count: '987',   pct: 28 },
    { name: 'SATURN',     count: '700',   pct: 20 },
  ];

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService   // ← injetado corretamente
  ) {}

  ngOnInit(): void {
    this.checkAuth();
  }

  // ── AUTH ─────────────────────────────────────────────

  private checkAuth(): void {
    // Usa o AuthService — chaves corretas: @archv:token / @archv:user
    this.isLoggedIn = this.authService.isAuthenticated();

    if (this.isLoggedIn) {
      this.userName = this.authService.getUserName();
      const token = this.authService.getToken();
      if (token) this.loadGames(token);
    }
  }

  logout(): void {
    this.authService.logout(); // já limpa o localStorage e redireciona para /login
    this.isLoggedIn = false;
    this.userName = '';
    this.games = [];
  }

  // ── GAMES ────────────────────────────────────────────

  private loadGames(token: string): void {
    this.loadingGames = true;
    this.gamesError = '';

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<{
      success: boolean;
      data: { games: Game[] };
      message: string;
    }>(
      `${environment.apiUrl}/library`,
      { headers }
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.games = res.data.games;
        } else {
          this.gamesError = res.message;
        }
        this.loadingGames = false;
      },
      error: (err) => {
        console.error(err);
        this.gamesError = 'FALHA AO CARREGAR ACERVO. VERIFIQUE O SINAL.';
        this.loadingGames = false;
      }
    });
  }

  // ── NAVIGATION ───────────────────────────────────────

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  onInitializeLink(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/library']);
    } else {
      this.router.navigate(['/register']);
    }
  }

  onGameClick(game: Game): void {
    this.router.navigate(['/library']);
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/placeholder-game.png';
  }
}
