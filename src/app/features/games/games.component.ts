import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environments';

interface Game {
  id: number;
  title: string;
  console: string;
  image: string;
  accessLevel: number;
  fileUrl: string | null;
}

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss']
})
export class GamesComponent implements OnInit {
  games: Game[] = [];
  filteredGames: Game[] = [];
  consoles: string[] = [];
  activeFilter = 'TODOS';
  searchQuery = '';
  loading = true;
  error = false;
  selectedGame: Game | null = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.http.get<{ success: boolean; data: Game[] }>(`${environment.apiUrl}/games`)
      .subscribe({
        next: (res) => {
          this.games = res.data;
          this.filteredGames = res.data;
          this.consoles = [...new Set(res.data.map(g => g.console))];
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = true;
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  setFilter(console: string) {
    this.activeFilter = console;
    this.applyFilters();
  }

  onSearch() {
    this.applyFilters();
  }

  applyFilters() {
    let result = this.games;
    if (this.activeFilter !== 'TODOS') {
      result = result.filter(g => g.console === this.activeFilter);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(g => g.title.toLowerCase().includes(q));
    }
    this.filteredGames = result;
    this.cdr.detectChanges();
  }

  openModal(game: Game) { this.selectedGame = game; }
  closeModal() { this.selectedGame = null; }
  isLocked(game: Game): boolean { return game.accessLevel > 0; }

  formatId(id: number): string {
    return id.toString().padStart(6, '0');
  }

  getRegion(console: string): string {
    const map: Record<string, string> = {
      NES: 'NTSC-U', SNES: 'NTSC-J / PAL', SFC: 'NTSC-J',
      GBA: 'NTSC-U / PAL', GB: 'NTSC-J / U', GBC: 'NTSC-J / U',
      N64: 'NTSC-U / PAL', PS1: 'NTSC-U', PSX: 'NTSC-U',
      MD: 'NTSC-U / PAL',
    };
    return map[console?.toUpperCase()] ?? 'MULTI';
  }

  getFormat(console: string): string {
    const map: Record<string, string> = {
      NES: 'NES CART [8MBIT]', SNES: 'SFC CART [32MBIT]',
      SFC: 'SFC CART [32MBIT]', GBA: 'GBA CART [16MBIT]',
      GB: 'GB CART [8MBIT]', GBC: 'GBC CART [8MBIT]',
      N64: 'N64 CART [64MBIT]', PS1: 'CD-ROM [700MB]',
      PSX: 'CD-ROM [700MB]', MD: 'MD CART [16MBIT]',
    };
    return map[console?.toUpperCase()] ?? 'UNKNOWN';
  }
}