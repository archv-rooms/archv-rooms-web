import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

  game: Game | null = null;
  isLoading = true;
  errorMessage = '';

  isLoggedIn = false;
  userName = '';

  ngOnInit(): void {
    this.checkAuth();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadGame(Number(id));
    } else {
      this.errorMessage = 'ID do jogo não encontrado.';
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

checkAuth(): void {
  const token = localStorage.getItem('@archv:token');  // ← corrigido
  const user  = localStorage.getItem('@archv:user');   // ← corrigido

  this.isLoggedIn = !!token;

  if (user) {
    try {
      const parsed = JSON.parse(user);
      this.userName = parsed.name ?? parsed.email ?? 'USER';
    } catch {
      this.userName = 'USER';
    }
  }
}

logout(): void {
  localStorage.removeItem('@archv:token');  // ← corrigido
  localStorage.removeItem('@archv:user');   // ← corrigido
  this.isLoggedIn = false;
  this.userName = '';
  this.router.navigate(['/']);
}

loadGame(id: number): void {
  const token = localStorage.getItem('@archv:token');
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

  this.http.get<{ success: boolean; data: Game; message: string }>(
    `${environment.apiUrl}/games/${id}`,
    { headers }
  ).subscribe({
    next: (res) => {
      if (res.success) {
        this.game = res.data;
        if (!this.game) this.errorMessage = 'ARTEFATO NÃO ENCONTRADO NO ARQUIVO.';
      } else {
        this.errorMessage = res.message;
      }
      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: () => {
      this.errorMessage = 'FALHA AO CARREGAR ARTEFATO. VERIFIQUE O SINAL.';
      this.isLoading = false;
      this.cdr.detectChanges();
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