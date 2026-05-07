// home.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  // ── STATS ──────────────────────────────────────────────
  stats = [
    { value: '14.832', label: 'ARQUIVOS' },
    { value: '47',     label: 'PLATAFORMAS' },
    { value: '99.2%',  label: 'INTEGRIDADE' },
    { value: '3.104',  label: 'MEMBROS' },
  ];

  // ── FEATURED BROADCAST ────────────────────────────────
  broadcastCards = [
    { label: 'TOP SIGNAL REPORT', type: 'featured',  imgClass: 'dark-castle' },
    { label: 'TOP ARCHIVE NODE',  type: 'secondary', imgClass: 'figure-1'   },
    { label: '',                   type: '',          imgClass: 'figure-2'   },
    { label: '',                   type: 'small',     imgClass: 'figure-3'   },
  ];

  // ── PLATFORMS ─────────────────────────────────────────
  platforms = [
    { icon: '🎮', name: 'SNES',       count: '3.241', pct: 92 },
    { icon: '📀', name: 'PS1',        count: '2.887', pct: 82 },
    { icon: '🕹️', name: 'N64',        count: '1.654', pct: 47 },
    { icon: '⚡', name: 'MEGA DRIVE', count: '2.103', pct: 60 },
    { icon: '🔵', name: 'GAME BOY',   count: '1.820', pct: 52 },
    { icon: '🟡', name: 'GBA',        count: '1.440', pct: 41 },
    { icon: '🔴', name: 'NES',        count: '987',   pct: 28 },
    { icon: '⬛', name: 'SATURN',     count: '700',   pct: 20 },
  ];

  // ── RECENT UPLOADS ────────────────────────────────────
  recentItems = [
    { title: 'CHRONO TRIGGER',    id: 'ID: 000452-SFC', platform: 'SNES', imgClass: 'img-ct'  },
    { title: 'CASTLEVANIA SOTN',  id: 'ID: 000891-PSX', platform: 'PS1',  imgClass: 'img-cv'  },
    { title: 'METROID FUSION',    id: 'ID: 001203-GBA', platform: 'GBA',  imgClass: 'img-mf'  },
    { title: 'SONIC 3 & KNUCKLES',id: 'ID: 000334-MD',  platform: 'MD',   imgClass: 'img-sk'  },
    { title: 'FINAL FANTASY VI',  id: 'ID: 000112-SFC', platform: 'SNES', imgClass: 'img-ff6' },
    { title: 'SILENT HILL',       id: 'ID: 001445-PSX', platform: 'PS1',  imgClass: 'img-sh'  },
  ];

  // ── LIVE FEED ─────────────────────────────────────────
  feedLogs: { type: string; text: string }[] = [];

  private allLogs = [
    { type: 'info',  text: 'Node G-22A conectado. Latência: 4ms' },
    { type: 'sync',  text: 'Fragmento recebido em /ARCHV/SOTN/02/' },
    { type: 'data',  text: 'Stream buffer alocado: 61MB' },
    { type: 'warn',  text: 'Ruído de pacote detectado no Setor 4' },
    { type: 'sync',  text: 'Handshake iniciado com nó 08_v1.0' },
    { type: 'info',  text: 'Novo artefato indexado: CHRONO TRIGGER [SFC]' },
    { type: 'data',  text: 'Integridade verificada: 99.2% — PASS' },
    { type: 'info',  text: 'Membro #3104 entrou na rede' },
    { type: 'sync',  text: 'Sincronizando nó JP_CLUSTER_01...' },
    { type: 'warn',  text: 'Sinal fraco no nó EU-44B — reconectando' },
    { type: 'error', text: 'Timeout ao acessar nó ASIA-12 — retry em 30s' },
    { type: 'data',  text: 'ROM validada: FINAL FANTASY VI [SFC] — VERIFIED' },
  ];

  private feedInterval: any;
  private logIndex = 0;

  // ── LIFECYCLE ─────────────────────────────────────────
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Seed com os primeiros 5 logs
    this.feedLogs = this.allLogs.slice(0, 5);
    this.logIndex = 5;

    // Adiciona novo log a cada 3 segundos
    this.feedInterval = setInterval(() => {
      if (this.logIndex >= this.allLogs.length) this.logIndex = 0;
      this.feedLogs = [
        this.allLogs[this.logIndex],
        ...this.feedLogs.slice(0, 7),
      ];
      this.logIndex++;
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.feedInterval) clearInterval(this.feedInterval);
  }

  // ── NAVIGATION ────────────────────────────────────────
  onInitializeLink(): void {
    this.router.navigate(['/dashboard']);
  }

  onViewNodes(): void {
    this.router.navigate(['/library']);
  }

  onViewPricing(): void {
    this.router.navigate(['/pricing']);
  }
}