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
    '--color-bg':          '#120008',
    '--color-bg-panel':    '#200010',
    '--color-bg-card':     '#30001a',
    '--color-primary':     '#e91e63',
    '--color-primary-dim': '#ad1457',
    '--color-secondary':   '#f48fb1',
    '--color-accent':      '#ff1744',
    '--color-text':        '#fce4ec',
    '--color-text-muted':  '#f48fb1',
    '--color-text-dim':    '#c2185b',
    '--color-border':      '#6a0030',
    '--color-border-glow': '#e91e63',
    '--color-glow':        '0 0 20px #e91e63',
    '--color-error':       '#ff003c',
  }
},
carnival: {
  name: 'carnival',
  label: '🎊 Carnaval',
  vars: {
    '--color-bg':          '#0a0020',
    '--color-bg-panel':    '#130040',
    '--color-bg-card':     '#1e0060',
    '--color-primary':     '#ffe600',
    '--color-primary-dim': '#ccb800',
    '--color-secondary':   '#ff0080',
    '--color-accent':      '#00e5ff',
    '--color-text':        '#fff9e0',
    '--color-text-muted':  '#d4c040',
    '--color-text-dim':    '#8a7a10',
    '--color-border':      '#3a0080',
    '--color-border-glow': '#ffe600',
    '--color-glow':        '0 0 16px #ffe600',
    '--color-error':       '#ff003c',
  }
},
halloween: {
  name: 'halloween',
  label: '👻 Halloween',
  vars: {
    '--color-bg':          '#0f0500',
    '--color-bg-panel':    '#1a0800',
    '--color-bg-card':     '#2b1000',
    '--color-primary':     '#ff6d00',
    '--color-primary-dim': '#cc4400',
    '--color-secondary':   '#9c00ff',
    '--color-accent':      '#ff3d00',
    '--color-text':        '#ffe8d0',
    '--color-text-muted':  '#cc9966',
    '--color-text-dim':    '#7a4a22',
    '--color-border':      '#5a1e00',
    '--color-border-glow': '#ff6d00',
    '--color-glow':        '0 0 16px #ff6d00',
    '--color-error':       '#ff003c',
  }
},
christmas: {
  name: 'christmas',
  label: '🎄 Natal',
  vars: {
    '--color-bg':          '#020f05',
    '--color-bg-panel':    '#041a09',
    '--color-bg-card':     '#072b10',
    '--color-primary':     '#00e676',
    '--color-primary-dim': '#00a854',
    '--color-secondary':   '#ff1744',
    '--color-accent':      '#ffd700',
    '--color-text':        '#d6f5e0',
    '--color-text-muted':  '#7abf90',
    '--color-text-dim':    '#3d7a52',
    '--color-border':      '#0a4020',
    '--color-border-glow': '#00e676',
    '--color-glow':        '0 0 16px #00e676',
    '--color-error':       '#ff1744',
  }
},
newyear: {
  name: 'newyear',
  label: '🎆 Ano Novo',
  vars: {
    '--color-bg':          '#04000f',
    '--color-bg-panel':    '#0a0020',
    '--color-bg-card':     '#100035',
    '--color-primary':     '#ff4081',
    '--color-primary-dim': '#c2185b',
    '--color-secondary':   '#00e5ff',
    '--color-accent':      '#ffe600',
    '--color-text':        '#f8f0ff',
    '--color-text-muted':  '#ce93d8',
    '--color-text-dim':    '#7b3f9e',
    '--color-border':      '#3a0060',
    '--color-border-glow': '#ff4081',
    '--color-glow':        '0 0 20px #ff4081',
    '--color-error':       '#ff003c',
  }
 }
}

@Injectable({ providedIn: 'root' })
export class ThemeService {

  private readonly apiUrl = `${environment.apiUrl}/admin/theme`;

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