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
      '--color-bg':           '#0d0008',
      '--color-bg-panel':     '#160010',
      '--color-bg-card':      '#200018',
      '--color-primary':      '#a0143c',
      '--color-primary-dim':  '#700d2a',
      '--color-secondary':    '#6b2040',
      '--color-accent':       '#c41e3a',
      '--color-text':         '#e8d0d8',
      '--color-text-muted':   '#9a6070',
      '--color-text-dim':     '#5a3040',
      '--color-border':       '#3a0820',
      '--color-border-glow':  '#a0143c',
      '--color-glow':         '0 0 12px #a0143c',
      '--color-error':        '#c41e3a',
    }
  },

  carnival: {
    name: 'carnival',
    label: '🎊 Carnaval',
    vars: {
      '--color-bg':           '#08000f',
      '--color-bg-panel':     '#100020',
      '--color-bg-card':      '#180030',
      '--color-primary':      '#c9a800',
      '--color-primary-dim':  '#8a7200',
      '--color-secondary':    '#b8005a',
      '--color-accent':       '#007a8a',
      '--color-text':         '#f0e8c0',
      '--color-text-muted':   '#a08840',
      '--color-text-dim':     '#5a4a10',
      '--color-border':       '#280050',
      '--color-border-glow':  '#c9a800',
      '--color-glow':         '0 0 14px #c9a800',
      '--color-error':        '#c41e3a',
    }
  },

  halloween: {
    name: 'halloween',
    label: '👻 Halloween',
    vars: {
      '--color-bg':           '#080400',
      '--color-bg-panel':     '#110600',
      '--color-bg-card':      '#1c0a00',
      '--color-primary':      '#b84a00',
      '--color-primary-dim':  '#7a3000',
      '--color-secondary':    '#5a0080',
      '--color-accent':       '#d45000',
      '--color-text':         '#e0cdb8',
      '--color-text-muted':   '#9a7050',
      '--color-text-dim':     '#5a3a18',
      '--color-border':       '#3a1400',
      '--color-border-glow':  '#b84a00',
      '--color-glow':         '0 0 14px #b84a00',
      '--color-error':        '#c41e3a',
    }
  },

  christmas: {
    name: 'christmas',
    label: '🎄 Natal',
    vars: {
      '--color-bg':           '#020a04',
      '--color-bg-panel':     '#041208',
      '--color-bg-card':      '#071c0c',
      '--color-primary':      '#1a7a40',
      '--color-primary-dim':  '#0f5028',
      '--color-secondary':    '#8a1020',
      '--color-accent':       '#a07800',
      '--color-text':         '#cce0d0',
      '--color-text-muted':   '#608060',
      '--color-text-dim':     '#2e4e34',
      '--color-border':       '#0a2e10',
      '--color-border-glow':  '#1a7a40',
      '--color-glow':         '0 0 14px #1a7a40',
      '--color-error':        '#8a1020',
    }
  },

  newyear: {
    name: 'newyear',
    label: '🎆 Ano Novo',
    vars: {
      '--color-bg':           '#04040e',
      '--color-bg-panel':     '#080818',
      '--color-bg-card':      '#0c0c24',
      '--color-primary':      '#a88a00',
      '--color-primary-dim':  '#706000',
      '--color-secondary':    '#006080',
      '--color-accent':       '#8a3000',
      '--color-text':         '#e8e0c0',
      '--color-text-muted':   '#908060',
      '--color-text-dim':     '#504830',
      '--color-border':       '#18183a',
      '--color-border-glow':  '#a88a00',
      '--color-glow':         '0 0 18px #a88a00, 0 0 36px #8a3000',
      '--color-error':        '#c41e3a',
    }
  }
}

@Injectable({ providedIn: 'root' })
export class ThemeService {

  private readonly apiUrl = `${environment.apiUrl}/admin/theme`;

  constructor(private http: HttpClient) {}

  async applyTheme(): Promise<void> {
    const key = await this.fetchGlobalTheme();
    this.applyThemeVars(key);
  }

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

  private async fetchGlobalTheme(): Promise<string> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ themeKey: string }>(this.apiUrl)
      );
      return res.themeKey ?? 'default';
    } catch {
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