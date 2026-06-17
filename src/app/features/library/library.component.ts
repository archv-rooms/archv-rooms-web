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
      this.loadGames();
      this.loadFavorites();
    }
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
      error: () => {
        // Falha silenciosa: favoritos não são essenciais pra abrir a biblioteca
      }
    });
  }

  toggleFavorite(game: Game, event: Event): void {
    event.stopPropagation(); // evita abrir o jogo ao clicar na estrela

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
      error: () => {
        // Opcional: mostrar um toast de erro aqui
      }
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

  onGameClick(game: Game): void { this.router.navigate(['/rooms', game.id]); }
}