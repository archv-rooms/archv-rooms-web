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
    private authService: AuthService  // ← adicionado
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();

    if (this.isLoggedIn) {
      this.userName = this.authService.getUserName();
      this.loadGames();
    }
  }

  loadGames(): void {
    const token = this.authService.getToken(); // ← corrigido
    if (!token) return;

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

    return matchesFilter && matchesSearch;
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