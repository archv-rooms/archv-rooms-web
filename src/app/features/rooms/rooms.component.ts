import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environments';
import { SaveService, SaveSlot } from '../../core/services/save.service';
import { SessionService } from '../../core/services/session.service';

interface Game {
  id: number;
  title: string;
  console: string;
  image: string;
  fileUrl?: string;
  accessLevel: number;
  planId?: number;
}

// ─── Conversão do estado do emulador (Uint8Array <-> base64) ───

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk))
    );
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
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
  private saveService = inject(SaveService);
  private sessionService = inject(SessionService);

  game: Game | null = null;
  isLoading = true;
  errorMessage = '';
  accessDenied = false;

  isLoggedIn = false;
  isAdmin = false;
  userName = '';

  // Emulador
  showEmulator = false;
  emulatorUrl: SafeResourceUrl | null = null;
  emulatorReady = false;

  // Save
  showSavePanel = false;
  saveSlots: SaveSlot[] = [];
  saveMessage = '';
  isSaving = false;

  // Sessão
  currentSessionId: number | null = null;

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
      error: (err) => {
        if (err.status === 403) {
          this.accessDenied = true;
          this.errorMessage = 'SEU PLANO NÃO PERMITE ACESSO A ESTE JOGO. FAÇA UPGRADE PARA CONTINUAR.';
        } else if (err.status === 404) {
          this.errorMessage = 'ARTEFATO NÃO ENCONTRADO NO ARQUIVO.';
        } else {
          this.errorMessage = 'FALHA AO CARREGAR ARTEFATO. VERIFIQUE O SINAL.';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  downloadRom(): void {
    if (!this.game?.fileUrl) { alert('Arquivo não disponível.'); return; }
    fetch(this.game.fileUrl)
      .then(res => res.blob())
      .then(blob => {
        const ext = this.game!.fileUrl!.split('.').pop()?.split('?')[0] ?? 'zip';
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.game!.title}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => alert('Erro ao baixar o arquivo.'));
  }

  // ─── Emulador ────────────────────────────────────────────

  playGame(): void {
    if (!this.game?.fileUrl) { alert('Arquivo não disponível.'); return; }

    // Inicia a sessão antes de abrir o emulador
    this.sessionService.startSession(this.game.id).subscribe({
      next: (res: any) => {
        this.currentSessionId = res.data.session.id;
      },
      error: () => {
        // Falha silenciosa: não impede o jogo de abrir
      }
    });

    this.showEmulator = true;
    this.emulatorReady = false;
    this.cdr.detectChanges();

    setTimeout(() => {
      (window as any).EJS_player = '#game-container';
      (window as any).EJS_core = this.getEmulatorCore();
      (window as any).EJS_gameUrl = this.game!.fileUrl;
      (window as any).EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
      (window as any).EJS_startOnLoaded = true;

      (window as any).EJS_onGameStart = () => {
        this.emulatorReady = true;
        this.cdr.detectChanges();
      };

      const script = document.createElement('script');
      script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
      document.body.appendChild(script);
    }, 100);
  }

  closeEmulator(): void {
    // Encerra a sessão ao fechar o emulador
    if (this.currentSessionId !== null) {
      this.sessionService.endSession(this.currentSessionId).subscribe({
        error: () => {
          // Falha silenciosa
        }
      });
      this.currentSessionId = null;
    }

    const ejs = (window as any).EJS_emulator;
    if (ejs) {
      try { ejs.pause(); } catch {}
      try {
        const ctx = ejs.gameManager?.audioContext;
        if (ctx && ctx.state !== 'closed') ctx.close();
      } catch {}
    }
    this.showEmulator = false;
    this.showSavePanel = false;
    this.emulatorUrl = null;
    this.cdr.detectChanges();
  }

  // ─── Save Panel ──────────────────────────────────────────

  async openSavePanel(): Promise<void> {
    if (!this.game) return;
    this.showSavePanel = true;
    this.saveMessage = '';

    this.saveSlots = await this.saveService.loadAllLocal(this.game.id);

    if (this.isLoggedIn) {
      const cloud = await this.saveService.loadFromCloud(this.game.id);
      cloud.forEach(cs => {
        const local = this.saveSlots.find(s => s.slot === cs.slot);
        const cloudDate = new Date(cs.updatedAt ?? 0).getTime();
        const localDate = new Date(local?.updatedAt ?? 0).getTime();
        if (!local || cloudDate > localDate) {
          const idx = this.saveSlots.findIndex(s => s.slot === cs.slot);
          if (idx >= 0) this.saveSlots[idx] = cs;
          else this.saveSlots.push(cs);
        }
      });
      this.saveSlots.sort((a, b) => a.slot - b.slot);
    } else {
      this.saveMessage = 'Sem login: o save fica só neste navegador.';
    }

    this.cdr.detectChanges();
  }

  closeSavePanel(): void {
    this.showSavePanel = false;
    this.cdr.detectChanges();
  }

  async saveToSlot(slot: number): Promise<void> {
    if (!this.game || this.isSaving) return;
    const ejs = (window as any).EJS_emulator;
    if (!ejs || !ejs.gameManager || typeof ejs.gameManager.getState !== 'function') {
      this.saveMessage = 'Emulador não pronto.';
      return;
    }

    this.isSaving = true;
    this.saveMessage = '';

    try {
      const raw = await ejs.gameManager.getState();
      if (!raw || !raw.length) throw new Error('estado vazio');

      const bytes: Uint8Array = raw instanceof Uint8Array ? raw : new Uint8Array(raw);
      const saveData = { state: bytesToBase64(bytes) };

      await this.saveService.save(this.game.id, slot, saveData);

      const idx = this.saveSlots.findIndex(s => s.slot === slot);
      const entry: SaveSlot = { slot, saveData, updatedAt: new Date().toISOString() };
      if (idx >= 0) this.saveSlots[idx] = entry;
      else this.saveSlots.push(entry);
      this.saveSlots.sort((a, b) => a.slot - b.slot);

      this.saveMessage = this.isLoggedIn
        ? `✔ Slot ${slot} salvo!`
        : `✔ Slot ${slot} salvo só neste navegador (sem login).`;
    } catch (e) {
      console.warn('[save] erro ao salvar:', e);
      this.saveMessage = '✖ Erro ao salvar.';
    }

    this.isSaving = false;
    this.cdr.detectChanges();
  }

  async loadFromSlot(slot: number): Promise<void> {
    if (!this.game) return;
    const ejs = (window as any).EJS_emulator;
    if (!ejs || !ejs.gameManager || typeof ejs.gameManager.loadState !== 'function') {
      this.saveMessage = 'Emulador não pronto.';
      return;
    }

    const entry = this.saveSlots.find(s => s.slot === slot);
    if (!entry) { this.saveMessage = `Slot ${slot} vazio.`; return; }

    let data: any = entry.saveData;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch { data = null; }
    }

    if (!data || typeof data.state !== 'string') {
      this.saveMessage = `Slot ${slot} é um save antigo e não pode ser carregado. Salve de novo.`;
      this.cdr.detectChanges();
      return;
    }

    try {
      const bytes = base64ToBytes(data.state);
      ejs.gameManager.loadState(bytes);
      this.saveMessage = `✔ Slot ${slot} carregado!`;
      this.showSavePanel = false;
    } catch (e) {
      console.warn('[save] erro ao carregar:', e);
      this.saveMessage = '✖ Erro ao carregar save.';
    }

    this.cdr.detectChanges();
  }

  slotDate(slot: number): string {
    const entry = this.saveSlots.find(s => s.slot === slot);
    if (!entry?.updatedAt) return 'vazio';
    return new Date(entry.updatedAt).toLocaleString('pt-BR');
  }

  // ─── Utilitários ─────────────────────────────────────────

  getEmulatorCore(): string {
    const cores: Record<string, string> = {
      'NES': 'nes', 'SNES': 'snes9x', 'SFC': 'snes9x',
      'GBA': 'gba', 'GB': 'gambatte', 'GBC': 'gambatte',
      'GAME BOY': 'gambatte', 'N64': 'n64',
      'PS1': 'pcsx_rearmed', 'PSX': 'pcsx_rearmed',
      'MD': 'genesis_plus_gx', 'MEGA DRIVE': 'genesis_plus_gx',
    };
    return cores[this.game?.console?.toUpperCase() ?? ''] ?? 'nes';
  }

  getRegion(console: string): string {
    const regions: Record<string, string> = {
      SNES: 'NTSC-J / PAL', SFC: 'NTSC-J', PS1: 'NTSC-U',
      PSX: 'NTSC-U', N64: 'NTSC-U / PAL', GBA: 'NTSC-U / PAL',
      MD: 'NTSC-U / PAL', NES: 'NTSC-U', GB: 'NTSC-J / U'
    };
    return regions[console?.toUpperCase()] ?? 'MULTI';
  }

  getFormat(console: string): string {
    const formats: Record<string, string> = {
      SNES: 'SFC CART [32MBIT]', SFC: 'SFC CART [32MBIT]',
      PS1: 'CD-ROM [700MB]', PSX: 'CD-ROM [700MB]',
      N64: 'N64 CART [64MBIT]', GBA: 'GBA CART [16MBIT]',
      MD: 'MD CART [16MBIT]', NES: 'NES CART [8MBIT]'
    };
    return formats[console?.toUpperCase()] ?? 'UNKNOWN';
  }

  formatId(id: number): string {
    return id.toString().padStart(6, '0');
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/placeholder-game.png';
  }
}