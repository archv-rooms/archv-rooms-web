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
    this.showWelcomeBack();
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

  // ── WELCOME BACK ─────────────────────────────────────

  private showWelcomeBack(): void {
    const shouldShow = sessionStorage.getItem('show-welcome');
    if (!shouldShow) return;
    sessionStorage.removeItem('show-welcome');

    const name = this.authService.getUserName();
    if (!name || name === 'Player 1') return;

    const screen = document.createElement('div');
    screen.id = 'welcome-back-screen';
    screen.style.cssText = `
      position: fixed; inset: 0;
      background: #0a0b10;
      z-index: 99998;
      display: flex; align-items: center; justify-content: center;
      font-family: 'VT323', monospace;
      transition: opacity 0.8s ease;
    `;

    screen.innerHTML = `
      <div style="
        position: relative; width: 520px;
        background: #0d0e16; border: 1px solid #2a1f4e;
        border-radius: 4px; padding: 40px;
        box-shadow: 0 0 40px rgba(124,58,237,0.2), inset 0 0 60px rgba(124,58,237,0.03);
        overflow: hidden;
      ">
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(to bottom,transparent 0px,transparent 3px,rgba(0,0,0,0.18) 3px,rgba(0,0,0,0.18) 4px);pointer-events:none;z-index:10;"></div>
        <div style="position:absolute;top:10px;left:10px;width:14px;height:14px;border:2px solid #6d28d9;border-right:none;border-bottom:none;opacity:0.7"></div>
        <div style="position:absolute;top:10px;right:10px;width:14px;height:14px;border:2px solid #6d28d9;border-left:none;border-bottom:none;opacity:0.7"></div>
        <div style="position:absolute;bottom:10px;left:10px;width:14px;height:14px;border:2px solid #6d28d9;border-right:none;border-top:none;opacity:0.7"></div>
        <div style="position:absolute;bottom:10px;right:10px;width:14px;height:14px;border:2px solid #6d28d9;border-left:none;border-top:none;opacity:0.7"></div>

        <div style="position:relative;z-index:2;text-align:center;">
          <div style="font-size:13px;letter-spacing:4px;color:#f59e0b;margin-bottom:6px;animation:wcBlink 1s step-start infinite;">★ PLAYER IDENTIFICADO ★</div>
          <div style="width:100%;height:1px;background:linear-gradient(to right,transparent,#7c3aed,transparent);margin:16px 0;"></div>
          <div style="font-size:28px;letter-spacing:6px;color:#fff;margin-bottom:4px;">ARCHV ROOMS</div>
          <div style="font-size:14px;letter-spacing:3px;color:#4b3d72;margin-bottom:24px;">YOUR SPACE — YOUR GAME</div>
          <div style="width:100%;height:1px;background:linear-gradient(to right,transparent,#7c3aed,transparent);margin-bottom:24px;"></div>
          <div id="wb-lines" style="text-align:left;font-size:17px;letter-spacing:2px;color:#9d8ec9;line-height:1.8;min-height:100px;"></div>
          <div style="width:100%;height:1px;background:linear-gradient(to right,transparent,#7c3aed,transparent);margin:24px 0 20px;"></div>
          <button id="wb-start" style="
            display:none; background:#7c3aed; border:none;
            color:#fff; font-family:'VT323',monospace;
            font-size:20px; letter-spacing:4px;
            padding:12px 40px; cursor:pointer;
            animation:wcBlink 0.8s step-start infinite;
          ">▶ CONTINUAR</button>
        </div>
      </div>
      <style>
        @keyframes wcBlink { 0%,100%{opacity:1} 50%{opacity:0} }
      </style>
    `;

    document.body.appendChild(screen);

    const lines = [
      { text: `> BEM-VINDO DE VOLTA, ${name.toUpperCase()}.`, color: '#a78bfa' },
      { text: '', color: '' },
      { text: '  SEUS JOGOS ESTÃO TE', color: '#9d8ec9' },
      { text: '  ESPERANDO.', color: '#9d8ec9' },
      { text: '', color: '' },
      { text: '  BOA SORTE, JOGADOR.', color: '#4ade80' },
    ];

    const linesEl = document.getElementById('wb-lines')!;
    const startBtn = document.getElementById('wb-start') as HTMLButtonElement;
    let lineIndex = 0;

    const typeLine = () => {
      if (lineIndex >= lines.length) {
        startBtn.style.display = 'inline-block';
        startBtn.onclick = () => {
          screen.style.opacity = '0';
          setTimeout(() => screen.remove(), 800);
        };
        return;
      }

      const { text, color } = lines[lineIndex];
      const lineEl = document.createElement('div');
      lineEl.style.color = color;
      linesEl.appendChild(lineEl);

      if (!text) {
        lineIndex++;
        setTimeout(typeLine, 100);
        return;
      }

      let i = 0;
      const type = setInterval(() => {
        lineEl.textContent += text[i++];
        if (i >= text.length) {
          clearInterval(type);
          lineIndex++;
          setTimeout(typeLine, 200);
        }
      }, 35);
    };

    setTimeout(typeLine, 400);
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