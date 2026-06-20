import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environments';
import { AuthService } from '../../core/services/auth.service';

interface Game {
  id: number;
  title: string;
  console: string;
  image: string;
  accessLevel: number;
  planId?: number;
}

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit {

  isLoggedIn = false;
  userName = '';
  isAdmin = false;

  games: Game[] = [];
  filteredGames: Game[] = [];

  favoriteIds = new Set<number>();
  showOnlyFavorites = false;

  loadingGames = false;
  gamesError = '';

  searchQuery = '';
  activeFilter = 'all';

  filters = [
    { label: 'TODOS', value: 'all' },
    { label: 'NES',   value: 'nes' },
    { label: 'SNES',  value: 'snes' },
    { label: 'GBA',   value: 'gba' },
    { label: 'PS1',   value: 'ps1' },
    { label: 'N64',   value: 'n64' },
    { label: 'MEGA DRIVE', value: 'mega drive' },
    { label: 'GAME BOY',   value: 'game boy'  },
  ];

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();

    if (this.isLoggedIn) {
      this.userName = this.authService.getUserName();
      this.isAdmin = this.authService.isAdmin();
      this.loadGames();
      this.loadFavorites();
      this.showWelcomeBack();
    }
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  private showWelcomeBack(): void {
    const shouldShow = sessionStorage.getItem('show-welcome');
    if (!shouldShow) return;
    sessionStorage.removeItem('show-welcome');

    const name = this.authService.getUserName();
    const isFirstLogin = !localStorage.getItem('archv-logged');
    if (isFirstLogin) localStorage.setItem('archv-logged', '1');

    const lines = isFirstLogin ? [
      { text: `> BEM-VINDO, ${name.toUpperCase()}.`, color: '#a78bfa' },
      { text: '', color: '' },
      { text: '  SEU FLIPERAMA ESTÁ PRONTO.', color: '#9d8ec9' },
      { text: '', color: '' },
      { text: '  EXPLORE O CATÁLOGO E', color: '#4ade80' },
      { text: '  COMECE A JOGAR AGORA.', color: '#4ade80' },
    ] : [
      { text: `> BEM-VINDO DE VOLTA, ${name.toUpperCase()}.`, color: '#a78bfa' },
      { text: '', color: '' },
      { text: '  SEUS JOGOS ESTÃO TE', color: '#9d8ec9' },
      { text: '  ESPERANDO.', color: '#9d8ec9' },
      { text: '', color: '' },
      { text: '  BOA SORTE, JOGADOR.', color: '#4ade80' },
    ];

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

  private get authHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadGames(): void {
    const token = this.authService.getToken();
    if (!token) return;

    this.loadingGames = true;
    this.gamesError = '';

    this.http.get<{
      success: boolean;
      data: { games: Game[] };
      message: string;
    }>(`${environment.apiUrl}/library`, { headers: this.authHeaders }).subscribe({
      next: (res) => {
        if (res.success) {
          this.games = res.data.games;
          this.applyFilters();
        } else {
          this.gamesError = res.message;
        }
        this.loadingGames = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.gamesError = 'FALHA AO CARREGAR ACERVO.';
        this.loadingGames = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadFavorites(): void {
    this.http.get<{
      success: boolean;
      data: { games: Game[] };
      message: string;
    }>(`${environment.apiUrl}/user/favorites`, { headers: this.authHeaders }).subscribe({
      next: (res) => {
        if (res.success) {
          this.favoriteIds = new Set(res.data.games.map(g => g.id));
          this.cdr.detectChanges();
        }
      },
      error: () => {}
    });
  }

  toggleFavorite(game: Game, event: Event): void {
    event.stopPropagation();

    this.http.post<{
      success: boolean;
      data: { favorited: boolean };
      message: string;
    }>(`${environment.apiUrl}/user/favorites/${game.id}`, {}, { headers: this.authHeaders }).subscribe({
      next: (res) => {
        if (res.success) {
          if (res.data.favorited) {
            this.favoriteIds.add(game.id);
          } else {
            this.favoriteIds.delete(game.id);
            if (this.showOnlyFavorites) this.applyFilters();
          }
          this.cdr.detectChanges();
        }
      },
      error: () => {}
    });
  }

  isFavorite(gameId: number): boolean {
    return this.favoriteIds.has(gameId);
  }

  toggleShowFavorites(): void {
    this.showOnlyFavorites = !this.showOnlyFavorites;
    this.applyFilters();
  }

  applyFilters(): void {
    const query = this.searchQuery.toLowerCase().trim();

    const filterMap: Record<string, string[]> = {
      'mega drive': ['md', 'mega drive', 'genesis'],
      'game boy':   ['gb', 'game boy', 'gbc', 'gameboy'],
    };

    this.filteredGames = this.games.filter(game => {
      const consoleLC = game.console.toLowerCase();
      const filterLC = this.activeFilter.toLowerCase();

      const matchesFilter =
        this.activeFilter === 'all' ||
        consoleLC === filterLC ||
        (filterMap[filterLC]?.includes(consoleLC) ?? false);

      const matchesSearch =
        !query ||
        game.title.toLowerCase().includes(query) ||
        consoleLC.includes(query);

      const matchesFavorites = !this.showOnlyFavorites || this.favoriteIds.has(game.id);

      return matchesFilter && matchesSearch && matchesFavorites;
    });
  }

  setFilter(value: string): void {
    this.activeFilter = value;
    this.applyFilters();
    this.cdr.detectChanges();
  }

  onSearch(): void { this.applyFilters(); }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/placeholder-game.png';
  }

  navigate(path: string): void { this.router.navigate([path]); }

  isActive(path: string): boolean { return this.router.url === path; }

  onGameClick(game: Game): void { this.router.navigate(['/rooms', game.id]); }
}