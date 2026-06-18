import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  imports: [CommonModule, RouterLink],
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss']
})
export class GamesComponent implements OnInit {
  games: Game[] = [];
  loading = true;
  error = false;
  selectedGame: Game | null = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.http.get<{ success: boolean; data: Game[] }>(`${environment.apiUrl}/games`)
      .subscribe({
        next: (res) => {
          this.games = res.data;
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

  openModal(game: Game) {
    this.selectedGame = game;
  }

  closeModal() {
    this.selectedGame = null;
  }

  isLocked(game: Game): boolean {
    return game.accessLevel > 0;
  }

  consoleName(code: string): string {
    const map: Record<string, string> = {
      NES:  'Nintendo Entertainment System',
      SNES: 'Super Nintendo',
      GBA:  'Game Boy Advance',
      GB:   'Game Boy',
      GBC:  'Game Boy Color',
      N64:  'Nintendo 64',
      PS1:  'PlayStation 1',
      PS2:  'PlayStation 2',
      GEN:  'Sega Genesis',
      SMS:  'Sega Master System',
    };
    return map[code.toUpperCase()] ?? code;
  }
}