import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environments';

export interface Theme {
  name: string;
  label: string;
  vars: Record<string, string>;
}

export const THEMES: Record<string, Theme> = {
  default: {
    name: 'default',
    label: '👾 Padrão',
    vars: {
      '--color-bg':           '#11131a',
      '--color-bg-panel':     '#181b24',
      '--color-bg-card':      '#202433',
      '--color-primary':      '#8b5cf6',
      '--color-primary-dim':  '#6d4ed8',
      '--color-secondary':    '#fbbf24',
      '--color-accent':       '#8b5cf6',
      '--color-text':         '#f2f4ff',
      '--color-text-muted':   '#9aa3c7',
      '--color-text-dim':     '#727896',
      '--color-border':       '#34384a',
      '--color-border-glow':  '#6d4ed8',
      '--color-glow':         '0 0 10px #8b5cf6',
      '--color-error':        '#fb7185',
    }
  },
  valentines: {
    name: 'valentines',
    label: '💝 Namorados',
    vars: {
      '--color-bg':           '#1a0010',
      '--color-bg-panel':     '#2a0820',
      '--color-bg-card':      '#3a1030',
      '--color-primary':      '#ff6eb4',
      '--color-primary-dim':  '#cc3380',
      '--color-secondary':    '#ffd700',
      '--color-accent':       '#ff1744',
      '--color-text':         '#ffe0ef',
      '--color-text-muted':   '#e8a0c0',
      '--color-text-dim':     '#b06080',
      '--color-border':       '#5a2040',
      '--color-border-glow':  '#ff6eb4',
      '--color-glow':         '0 0 10px #ff6eb4',
      '--color-error':        '#ff003c',
    }
  },
  carnival: {
    name: 'carnival',
    label: '🎊 Carnaval',
    vars: {
      '--color-bg':           '#0d0025',
      '--color-bg-panel':     '#1a0040',
      '--color-bg-card':      '#250060',
      '--color-primary':      '#ffe600',
      '--color-primary-dim':  '#ccb800',
      '--color-secondary':    '#00e676',
      '--color-accent':       '#d500f9',
      '--color-text':         '#fff9e0',
      '--color-text-muted':   '#d4c870',
      '--color-text-dim':     '#9a8840',
      '--color-border':       '#4a3a00',
      '--color-border-glow':  '#ffe600',
      '--color-glow':         '0 0 10px #ffe600',
      '--color-error':        '#ff003c',
    }
  },
  halloween: {
    name: 'halloween',
    label: '👻 Halloween',
    vars: {
      '--color-bg':           '#0a0005',
      '--color-bg-panel':     '#180a00',
      '--color-bg-card':      '#251000',
      '--color-primary':      '#ff6d00',
      '--color-primary-dim':  '#cc4400',
      '--color-secondary':    '#b300ff',
      '--color-accent':       '#ff3d00',
      '--color-text':         '#f5e6d3',
      '--color-text-muted':   '#c4a882',
      '--color-text-dim':     '#886644',
      '--color-border':       '#4a2200',
      '--color-border-glow':  '#ff6d00',
      '--color-glow':         '0 0 10px #ff6d00',
      '--color-error':        '#ff003c',
    }
  },
  christmas: {
    name: 'christmas',
    label: '🎄 Natal',
    vars: {
      '--color-bg':           '#00100a',
      '--color-bg-panel':     '#001a10',
      '--color-bg-card':      '#002818',
      '--color-primary':      '#00e676',
      '--color-primary-dim':  '#00b055',
      '--color-secondary':    '#ff1744',
      '--color-accent':       '#ffd700',
      '--color-text':         '#e0f5e9',
      '--color-text-muted':   '#90c8a0',
      '--color-text-dim':     '#507860',
      '--color-border':       '#004020',
      '--color-border-glow':  '#00e676',
      '--color-glow':         '0 0 10px #00e676',
      '--color-error':        '#ff1744',
    }
  },
  newyear: {
    name: 'newyear',
    label: '🎆 Ano Novo',
    vars: {
      '--color-bg':           '#05050f',
      '--color-bg-panel':     '#0d0d20',
      '--color-bg-card':      '#151530',
      '--color-primary':      '#ffd700',
      '--color-primary-dim':  '#ccaa00',
      '--color-secondary':    '#ffffff',
      '--color-accent':       '#ff6d00',
      '--color-text':         '#fff8e1',
      '--color-text-muted':   '#d4c870',
      '--color-text-dim':     '#887840',
      '--color-border':       '#2a2800',
      '--color-border-glow':  '#ffd700',
      '--color-glow':         '0 0 10px #ffd700',
      '--color-error':        '#ff003c',
    }
  }
}

@Injectable({ providedIn: 'root' })
export class ThemeService {

  private readonly apiUrl = `${environment.apiUrl}/api/admin/theme`;

  constructor(private http: HttpClient) {}

  // ─── Público: chamado no app.component.ts no ngOnInit ───
  async applyTheme(): Promise<void> {
    const key = await this.fetchGlobalTheme();
    this.applyThemeVars(key);
  }

  // ─── Admin: salva no backend e aplica imediatamente ─────
  async setGlobalTheme(themeName: string | null): Promise<void> {
    const key = themeName ?? 'default';
    await firstValueFrom(this.http.post(this.apiUrl, { themeKey: key }));
    this.applyThemeVars(key);
  }

  getActiveTheme(): Theme {
    return THEMES[this.getActiveThemeNameFromDate()] ?? THEMES['default'];
  }

  getAllThemes(): Theme[] {
    return Object.values(THEMES);
  }

  // ─── Privados ────────────────────────────────────────────
  private async fetchGlobalTheme(): Promise<string> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ themeKey: string }>(this.apiUrl)
      );
      return res.themeKey ?? 'default';
    } catch {
      // fallback: usa tema sazonal por data caso a API falhe
      return this.getActiveThemeNameFromDate();
    }
  }

  private applyThemeVars(name: string): void {
    const theme = THEMES[name] ?? THEMES['default'];
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }

  private getActiveThemeNameFromDate(): string {
    const now   = new Date();
    const month = now.getMonth() + 1;
    const day   = now.getDate();
    const year  = now.getFullYear();

    if (month === 12 && day >= 26) return 'newyear';
    if (month === 12 && day <= 25) return 'christmas';
    if (month === 10)              return 'halloween';

    const carnival = this.getCarnavalTuesday(year);
    const carnivalStart = new Date(carnival);
    carnivalStart.setDate(carnival.getDate() - 4);
    if (now >= carnivalStart && now <= carnival) return 'carnival';

    if (month === 2 && day <= 14) return 'valentines';

    return 'default';
  }

  private getCarnavalTuesday(year: number): Date {
    const easter = this.getEaster(year);
    const carnival = new Date(easter);
    carnival.setDate(easter.getDate() - 47);
    return carnival;
  }

  private getEaster(year: number): Date {
    const f = Math.floor;
    const G = year % 19;
    const C = f(year / 100);
    const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30;
    const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11));
    const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7;
    const L = I - J;
    const month = 3 + f((L + 40) / 44);
    const day   = L + 28 - 31 * f(month / 4);
    return new Date(year, month - 1, day);
  }
}