import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environments';

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
  ];

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('@ProjetoX:token');
    const userStr = localStorage.getItem('@ProjetoX:user');

    if (token) {
      this.isLoggedIn = true;
      this.userName = userStr ? JSON.parse(userStr).name : 'USER';
      this.loadGames();
    }
  }

  loadGames(): void {
    const token = localStorage.getItem('@ProjetoX:token');
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
          this.applyFilters(); // aplica filtro atual após carregar
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

  // ── Filtro + busca combinados ──────────────────────
  applyFilters(): void {
    const query = this.searchQuery.toLowerCase().trim();

    this.filteredGames = this.games.filter(game => {
      const matchesFilter =
        this.activeFilter === 'all' ||
        game.console.toLowerCase() === this.activeFilter;

      const matchesSearch =
        !query ||
        game.title.toLowerCase().includes(query) ||
        game.console.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }

  setFilter(value: string): void {
    this.activeFilter = value;
    this.applyFilters();
    this.cdr.detectChanges();
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/placeholder-game.png';
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  onGameClick(game: Game): void {
    this.router.navigate(['/rooms', game.id]);
  }
}