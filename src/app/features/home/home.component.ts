import { Component, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
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
export class HomeComponent implements OnInit, OnDestroy {

  isLoggedIn = false;
  userName = '';
  isAdmin = false;

  games: Game[] = [];
  loadingGames = false;
  gamesError = '';

  carouselIndex = 0;
  readonly carouselVisible = 4;

  platforms: Platform[] = [];
  totalGames = 0;

  carouselPaused = false;
  isDragging = false;

  private dragStartX = 0;
  private dragScrollLeft = 0;
  private touchStartX = 0;

  @ViewChild('carouselTrackRef') carouselTrackRef!: ElementRef<HTMLElement>;

  jumpscareActive = false;
  jumpscareVideoUrl = '/videos/hihi.mp4';
  private jumpscareTimer: any;
  private eggClickCount = 0;
  private eggClickTimer: any;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPlatforms();
    this.checkAuth();
  }

  ngOnDestroy(): void {
    clearTimeout(this.jumpscareTimer);
    clearTimeout(this.eggClickTimer);
  }

  private checkAuth(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.isAdmin = this.authService.getUserRole() === 'admin';

    if (this.isLoggedIn) {
      this.userName = this.authService.getUserName();
      const token = this.authService.getToken();
      if (token) {
        this.loadGames(token);
      }
    }
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.userName = '';
    this.games = [];
  }

  private loadPlatforms(): void {
    this.http.get<PlatformsResponse>(`${environment.apiUrl}/platforms`).subscribe({
      next: (res) => {
        if (res.success) {
          this.platforms = res.data.platforms;
          this.totalGames = res.data.totalGames;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[home] erro ao carregar plataformas:', err);
      }
    });
  }

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

  get carouselGames(): Game[] {
    return this.games.slice(this.carouselIndex, this.carouselIndex + this.carouselVisible);
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

  pauseCarousel(): void { this.carouselPaused = true; }

  resumeCarousel(): void {
    if (!this.isDragging) this.carouselPaused = false;
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

  navigate(path: string): void { this.router.navigate([path]); }

  onInitializeLink(): void {
    this.router.navigate([this.isLoggedIn ? '/library' : '/register']);
  }

  onGameClick(game: Game): void { this.router.navigate(['/rooms', game.id]); }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/placeholder-game.png';
  }

  isActive(path: string): boolean { return this.router.url === path; }

  onHomeIconClick(): void {
    this.navigate('/home');
    this.eggClickCount++;
    clearTimeout(this.eggClickTimer);
    if (this.eggClickCount >= 3) {
      this.eggClickCount = 0;
      this.triggerJumpscare();
      return;
    }
    this.eggClickTimer = setTimeout(() => { this.eggClickCount = 0; }, 800);
  }

  triggerJumpscare(): void {
    if (this.jumpscareActive) return;
    this.jumpscareActive = true;
    this.jumpscareTimer = setTimeout(() => { this.dismissJumpscare(); }, 24000);
  }

  dismissJumpscare(): void {
    this.jumpscareActive = false;
    clearTimeout(this.jumpscareTimer);
  }
}