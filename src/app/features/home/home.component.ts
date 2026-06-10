import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
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

interface PlatformsResponse {
  success: boolean;
  data: {
    platforms: Platform[];
    totalGames: number;
    totalPlatforms: number;
  };
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

  // ── CARROSSEL DE JOGOS ───────────────────────────────
  carouselIndex = 0;
  readonly carouselVisible = 4;

  // ── PLATAFORMAS ──────────────────────────────────────
  platforms: Platform[] = [];
  totalGames = 0;

  // ── CARROSSEL DE PLATAFORMAS — estado ────────────────
  carouselPaused = false;
  isDragging = false;

  private dragStartX = 0;
  private dragScrollLeft = 0;
  private touchStartX = 0;

  @ViewChild('carouselTrackRef') carouselTrackRef!: ElementRef<HTMLElement>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Plataformas são públicas — carrega sempre
    this.loadPlatforms();

    // Jogos só carregam se estiver logado
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
  }

  // ── PLATAFORMAS (público) ─────────────────────────────

  private loadPlatforms(): void {
    this.http.get<PlatformsResponse>(`${environment.apiUrl}/platforms`).subscribe({
      next: (res) => {
        if (res.success) {
          this.platforms = res.data.platforms;
          this.totalGames = res.data.totalGames;
        }
      },
      error: (err) => {
        console.error('[home] erro ao carregar plataformas:', err);
      }
    });
  }

  // ── GAMES (requer login) ──────────────────────────────

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

  // ── CARROSSEL DE JOGOS ───────────────────────────────

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

  // ── CARROSSEL DE PLATAFORMAS — controles ─────────────

  pauseCarousel(): void {
    this.carouselPaused = true;
  }

  resumeCarousel(): void {
    if (!this.isDragging) {
      this.carouselPaused = false;
    }
  }

  onDragStart(event: MouseEvent): void {
    const el = this.carouselTrackRef?.nativeElement;
    if (!el) return;

    this.isDragging = true;
    this.carouselPaused = true;
    this.dragStartX = event.pageX - el.offsetLeft;
    this.dragScrollLeft = el.scrollLeft;
  }

  onDragMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    event.preventDefault();

    const el = this.carouselTrackRef?.nativeElement;
    if (!el) return;

    const x = event.pageX - el.offsetLeft;
    const walk = (x - this.dragStartX) * 1.4;
    el.scrollLeft = this.dragScrollLeft - walk;
  }

  onDragEnd(): void {
    this.isDragging = false;
    this.carouselPaused = false;
  }

  onTouchStart(event: TouchEvent): void {
    const el = this.carouselTrackRef?.nativeElement;
    if (!el) return;

    this.isDragging = true;
    this.carouselPaused = true;
    this.touchStartX = event.touches[0].pageX;
    this.dragScrollLeft = el.scrollLeft;
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging) return;

    const el = this.carouselTrackRef?.nativeElement;
    if (!el) return;

    const walk = (this.touchStartX - event.touches[0].pageX) * 1.2;
    el.scrollLeft = this.dragScrollLeft + walk;
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
  isActive(path: string): boolean {
  return this.router.url === path;
}
}
