// rooms.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
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
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  game: Game | null = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadGame(Number(id));
    } else {
      this.errorMessage = 'ID do jogo não encontrado.';
      this.isLoading = false;
    }
  }

  loadGame(id: number): void {
    const token = localStorage.getItem('@ProjetoX:token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    // Busca todos os jogos e filtra pelo ID
    // (se quiser criar um endpoint GET /library/:id no backend, fica ainda mais limpo)
    this.http.get<{ success: boolean; data: { games: Game[] }; message: string }>(
      `${environment.apiUrl}/library`,
      { headers }
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.game = res.data.games.find(g => g.id === id) || null;
          if (!this.game) this.errorMessage = 'ARTEFATO NÃO ENCONTRADO NO ARQUIVO.';
        } else {
          this.errorMessage = res.message;
        }
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'FALHA AO CARREGAR ARTEFATO. VERIFIQUE O SINAL.';
        this.isLoading = false;
      }
    });
  }

  getRegion(console: string): string {
    const regions: Record<string, string> = {
      'SNES': 'NTSC-J / PAL', 'SFC': 'NTSC-J',
      'PS1': 'NTSC-U', 'PSX': 'NTSC-U',
      'N64': 'NTSC-U / PAL', 'GBA': 'NTSC-U / PAL',
      'MD': 'NTSC-U / PAL', 'NES': 'NTSC-U', 'GB': 'NTSC-J / U',
    };
    return regions[console?.toUpperCase()] ?? 'MULTI';
  }

  getFormat(console: string): string {
    const formats: Record<string, string> = {
      'SNES': 'SFC CART [32MBIT]', 'SFC': 'SFC CART [32MBIT]',
      'PS1': 'CD-ROM [700MB]', 'PSX': 'CD-ROM [700MB]',
      'N64': 'N64 CART [64MBIT]', 'GBA': 'GBA CART [16MBIT]',
      'MD': 'MD CART [16MBIT]', 'NES': 'NES CART [8MBIT]',
    };
    return formats[console?.toUpperCase()] ?? 'UNKNOWN';
  }

  formatId(id: number): string {
    return id.toString().padStart(6, '0');
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/placeholder-game.png';
  }
}