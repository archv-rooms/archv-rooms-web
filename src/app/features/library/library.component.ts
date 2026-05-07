import { Component, OnInit } from '@angular/core';
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
    { label: 'PLATAFORMA', value: 'all'    },
    { label: 'NAÇÃO',      value: 'nation' },
    { label: 'FORMATO',    value: 'format' },
  ];

  constructor(private router: Router, private http: HttpClient) {}

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
    this.gamesError   = '';

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<{ success: boolean; data: { games: Game[] }; message: string }>(
      `${environment.apiUrl}/library`,
      { headers }
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.games         = res.data.games;
          this.filteredGames = res.data.games;
        } else {
          this.gamesError = res.message;
        }
        this.loadingGames = false;
      },
      error: () => {
        this.gamesError   = 'FALHA AO CARREGAR ACERVO. VERIFIQUE O SINAL.';
        this.loadingGames = false;
      }
    });
  }

  onSearch(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredGames = this.games.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.console.toLowerCase().includes(q)
    );
  }

  clearSearch(): void {
    this.searchQuery   = '';
    this.filteredGames = this.games;
  }

  toggleSearch(): void {
    const input = document.querySelector('.search-input') as HTMLInputElement;
    input?.focus();
  }

  setFilter(value: string): void {
    this.activeFilter = value;
  }

  getRegion(console: string): string {
    const regions: Record<string, string> = {
      'SNES': 'JP_PAL', 'SFC': 'JP', 'PS1': 'NTSC',
      'PSX': 'NTSC', 'N64': 'US_PAL', 'GBA': 'US_PAL',
      'MD': 'US_EU', 'NES': 'US', 'GB': 'JP_US',
    };
    return regions[console.toUpperCase()] ?? 'MULTI';
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