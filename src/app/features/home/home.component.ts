import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  isLoggedIn = false;
  userName = '';
  games: Game[] = [];
  loadingGames = false;
  gamesError = '';

  stats = [
    { value: '14.832', label: 'ARQUIVOS'    },
    { value: '47',     label: 'PLATAFORMAS' },
    { value: '99.2%',  label: 'INTEGRIDADE' },
    { value: '3.104',  label: 'MEMBROS'     },
  ];

  platforms = [
    { icon: '🎮', name: 'SNES',        count: '3.241', pct: 92 },
    { icon: '📀', name: 'PS1',         count: '2.887', pct: 82 },
    { icon: '🕹️', name: 'N64',         count: '1.654', pct: 47 },
    { icon: '⚡', name: 'MEGA DRIVE',  count: '2.103', pct: 60 },
    { icon: '🔵', name: 'GAME BOY',    count: '1.820', pct: 52 },
    { icon: '🟡', name: 'GBA',         count: '1.440', pct: 41 },
    { icon: '🔴', name: 'NES',         count: '987',   pct: 28 },
    { icon: '⬛', name: 'SATURN',      count: '700',   pct: 20 },
  ];

  terminalLines: { text: string; status: string; value?: string }[] = [];

  feedLogs: { type: string; text: string }[] = [];

  private allLogs = [
    { type: 'info',  text: 'Node G-22A conectado. Latência: 4ms'              },
    { type: 'sync',  text: 'Fragmento recebido em /ARCHV/SOTN/02/'            },
    { type: 'data',  text: 'Stream buffer alocado: 61MB'                      },
    { type: 'warn',  text: 'Ruído de pacote detectado no Setor 4'             },
    { type: 'sync',  text: 'Handshake iniciado com nó 08_v1.0'               },
    { type: 'info',  text: 'Novo artefato indexado: CHRONO TRIGGER [SFC]'     },
    { type: 'data',  text: 'Integridade verificada: 99.2% — PASS'            },
    { type: 'info',  text: 'Membro #3104 entrou na rede'                      },
    { type: 'sync',  text: 'Sincronizando nó JP_CLUSTER_01...'               },
    { type: 'warn',  text: 'Sinal fraco no nó EU-44B — reconectando'         },
    { type: 'error', text: 'Timeout ao acessar nó ASIA-12 — retry em 30s'    },
    { type: 'data',  text: 'ROM validada: FINAL FANTASY VI [SFC] — VERIFIED' },
  ];

  private feedInterval: any;
  private logIndex = 5;
  private bootTimeout: any;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.checkAuth();
    this.runBootSequence();
    this.feedLogs = this.allLogs.slice(0, 5);
    this.feedInterval = setInterval(() => {
      if (this.logIndex >= this.allLogs.length) this.logIndex = 0;
      this.feedLogs = [this.allLogs[this.logIndex], ...this.feedLogs.slice(0, 7)];
      this.logIndex++;
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.feedInterval) clearInterval(this.feedInterval);
    if (this.bootTimeout)  clearTimeout(this.bootTimeout);
  }

  private checkAuth(): void {
    const token = localStorage.getItem('@ProjetoX:token');
    const userStr = localStorage.getItem('@ProjetoX:user');
    if (token) {
      this.isLoggedIn = true;
      this.userName = userStr ? JSON.parse(userStr).name : 'USER';
      this.loadGames(token);
    }
  }

  private loadGames(token: string): void {
    this.loadingGames = true;
    this.gamesError   = '';

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<{ success: boolean; data: { games: Game[] }; message: string }>(
      `${environment.apiUrl}/library`,
      { headers }
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.games = res.data.games;
        } else {
          this.gamesError = res.message;
        }
        this.loadingGames = false;
      },
      error: (err) => {
        this.gamesError   = 'FALHA AO CARREGAR ACERVO. VERIFIQUE O SINAL.';
        this.loadingGames = false;
        console.error(err);
      }
    });
  }

  private runBootSequence(): void {
    const lines = [
      { text: 'VERIFICANDO SINAL...', status: 'ok'  },
      { text: 'CARREGANDO ACERVO...', status: 'pct', value: '90.4%' },
    ];
    lines.forEach((line, i) => {
      this.bootTimeout = setTimeout(() => {
        this.terminalLines.push(line);
      }, 400 + i * 600);
    });
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  onInitializeLink(): void {
    this.isLoggedIn ? this.router.navigate(['/library']) : this.router.navigate(['/register']);
  }

  onGameClick(game: Game): void {
    this.router.navigate(['/rooms', game.id]);
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/placeholder-game.png';
  }
}