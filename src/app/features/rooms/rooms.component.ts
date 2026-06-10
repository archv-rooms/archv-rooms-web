import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environments';

interface Game {
  id: number;
  title: string;
  console: string;
  image: string;
  fileUrl?: string;
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
  private sanitizer = inject(DomSanitizer);

  game: Game | null = null;
  isLoading = true;
  errorMessage = '';

  isLoggedIn = false;
  userName = '';

  // Estado do emulador
  showEmulator = false;
  emulatorUrl: SafeResourceUrl | null = null;

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
    const token = localStorage.getItem('@archv:token');
    const user = localStorage.getItem('@archv:user');

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
    localStorage.removeItem('@archv:token');
    localStorage.removeItem('@archv:user');

    this.isLoggedIn = false;
    this.userName = '';

    this.router.navigate(['/']);
  }

  loadGame(id: number): void {
    const token = localStorage.getItem('@archv:token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http
      .get<{ success: boolean; data: Game; message: string }>(
        `${environment.apiUrl}/games/${id}`,
        { headers }
      )
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.game = res.data;

            if (!this.game) {
              this.errorMessage = 'ARTEFATO NÃO ENCONTRADO NO ARQUIVO.';
            }
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

  downloadRom(): void {
    if (!this.game?.fileUrl) {
      alert('Arquivo não disponível.');
      return;
    }

    fetch(this.game.fileUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const ext = this.game!.fileUrl!.split('.').pop()?.split('?')[0] ?? 'zip';
        const fileName = `${this.game!.title}.${ext}`;
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();

        URL.revokeObjectURL(url);
      })
      .catch(() => {
        alert('Erro ao baixar o arquivo.');
      });
  }

  // =========================
  // EmulatorJS
  // =========================

  playGame(): void {
    if (!this.game?.fileUrl) {
      alert('Arquivo não disponível.');
      return;
    }

    this.showEmulator = true;
    this.cdr.detectChanges();

    // Aguarda o *ngIf renderizar o #game-container no DOM
    setTimeout(() => {
      (window as any).EJS_player = '#game-container';
      (window as any).EJS_core = this.getEmulatorCore();
      (window as any).EJS_gameUrl = this.game!.fileUrl;
      (window as any).EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
      (window as any).EJS_startOnLoaded = true;

      const script = document.createElement('script');
      script.id = 'emulatorjs-script';
      // Cache-bust garante que o browser re-executa o loader a cada abertura
      script.src = `https://cdn.emulatorjs.org/stable/data/loader.js?t=${Date.now()}`;
      document.body.appendChild(script);
    }, 300);
  }

  closeEmulator(): void {
    const ejs = (window as any).EJS_emulator;

    if (ejs) {
      try { ejs.pause(); } catch {}
      try {
        const ctx = ejs.gameManager?.audioContext;
        if (ctx && ctx.state !== 'closed') ctx.close();
      } catch {}
    }

    // Remove todos os scripts do EmulatorJS injetados
    document.querySelectorAll('script[src*="emulatorjs.org"]')
      .forEach(s => s.remove());

    // Limpa variáveis globais do EmulatorJS
    ['EJS_emulator', 'EJS_player', 'EJS_core', 'EJS_gameUrl',
     'EJS_pathtodata', 'EJS_startOnLoaded', 'EJS_GameManager',
     'EJS_Buttons', 'EJS_VirtualGamepad'
    ].forEach(key => { try { delete (window as any)[key]; } catch {} });

    this.showEmulator = false;
    this.cdr.detectChanges();
  }

  getEmulatorCore(): string {
    const cores: Record<string, string> = {
      'NES': 'nes',
      'SNES': 'snes9x',
      'SFC': 'snes9x',
      'GBA': 'gba',
      'GB': 'gambatte',
      'GBC': 'gambatte',
      'GAME BOY': 'gambatte',
      'N64': 'n64',
      'PS1': 'pcsx_rearmed',
      'PSX': 'pcsx_rearmed',
      'MD': 'genesis_plus_gx',
      'MEGA DRIVE': 'genesis_plus_gx',
    };

    return cores[this.game?.console?.toUpperCase() ?? ''] ?? 'nes';
  }

  // =========================
  // Utilitários
  // =========================

  getRegion(console: string): string {
    const regions: Record<string, string> = {
      SNES: 'NTSC-J / PAL',
      SFC: 'NTSC-J',
      PS1: 'NTSC-U',
      PSX: 'NTSC-U',
      N64: 'NTSC-U / PAL',
      GBA: 'NTSC-U / PAL',
      MD: 'NTSC-U / PAL',
      NES: 'NTSC-U',
      GB: 'NTSC-J / U'
    };

    return regions[console?.toUpperCase()] ?? 'MULTI';
  }

  getFormat(console: string): string {
    const formats: Record<string, string> = {
      SNES: 'SFC CART [32MBIT]',
      SFC: 'SFC CART [32MBIT]',
      PS1: 'CD-ROM [700MB]',
      PSX: 'CD-ROM [700MB]',
      N64: 'N64 CART [64MBIT]',
      GBA: 'GBA CART [16MBIT]',
      MD: 'MD CART [16MBIT]',
      NES: 'NES CART [8MBIT]'
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