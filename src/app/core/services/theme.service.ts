import { Injectable } from '@angular/core';

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
      '--color-bg':        '#0a0015',
      '--color-primary':   '#00ffff',
      '--color-secondary': '#ffd700',
      '--color-text':      '#e0e0e0',
      '--color-accent':    '#ff00ff',
      '--color-glow':      '0 0 10px #00ffff',
    }
  },
  valentines: {
    name: 'valentines',
    label: '💝 Namorados',
    vars: {
      '--color-bg':        '#1a0010',
      '--color-primary':   '#ff6eb4',
      '--color-secondary': '#ffd700',
      '--color-text':      '#ffe0ef',
      '--color-accent':    '#ff1744',
      '--color-glow':      '0 0 10px #ff6eb4',
    }
  },
  carnival: {
    name: 'carnival',
    label: '🎊 Carnaval',
    vars: {
      '--color-bg':        '#0d0025',
      '--color-primary':   '#ffe600',
      '--color-secondary': '#00e676',
      '--color-text':      '#fff9e0',
      '--color-accent':    '#d500f9',
      '--color-glow':      '0 0 10px #ffe600',
    }
  },
  halloween: {
    name: 'halloween',
    label: '👻 Halloween',
    vars: {
      '--color-bg':        '#0a0005',
      '--color-primary':   '#ff6d00',
      '--color-secondary': '#b300ff',
      '--color-text':      '#f5e6d3',
      '--color-accent':    '#ff3d00',
      '--color-glow':      '0 0 10px #ff6d00',
    }
  },
  christmas: {
    name: 'christmas',
    label: '🎄 Natal',
    vars: {
      '--color-bg':        '#00100a',
      '--color-primary':   '#00e676',
      '--color-secondary': '#ff1744',
      '--color-text':      '#e0f5e9',
      '--color-accent':    '#ffd700',
      '--color-glow':      '0 0 10px #00e676',
    }
  },
  newyear: {
    name: 'newyear',
    label: '🎆 Ano Novo',
    vars: {
      '--color-bg':        '#05050f',
      '--color-primary':   '#ffd700',
      '--color-secondary': '#ffffff',
      '--color-text':      '#fff8e1',
      '--color-accent':    '#ff6d00',
      '--color-glow':      '0 0 10px #ffd700',
    }
  }
}

@Injectable({ providedIn: 'root' })
export class ThemeService {

  private readonly STORAGE_KEY = 'archv_theme_override';

  // Calcula a terça de carnaval para o ano atual
  private getCarnavalTuesday(year: number): Date {
    // Carnaval = 47 dias antes da Páscoa
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
    const day = L + 28 - 31 * f(month / 4);
    return new Date(year, month - 1, day);
  }

  private getActiveThemeName(): string {
    // Override manual do admin
    const override = localStorage.getItem(this.STORAGE_KEY);
    if (override && THEMES[override]) return override;

    const now = new Date();
    const month = now.getMonth() + 1; // 1–12
    const day   = now.getDate();
    const year  = now.getFullYear();

    // Ano Novo: 26–31 dez
    if (month === 12 && day >= 26) return 'newyear';

    // Natal: 1–25 dez
    if (month === 12 && day <= 25) return 'christmas';

    // Halloween: todo outubro
    if (month === 10) return 'halloween';

    // Carnaval: sexta-feira até terça-feira gorda
    const carnival = this.getCarnavalTuesday(year);
    const carnivalStart = new Date(carnival);
    carnivalStart.setDate(carnival.getDate() - 4); // sexta antes
    if (now >= carnivalStart && now <= carnival) return 'carnival';

    // Namorados: 1–14 fev
    if (month === 2 && day <= 14) return 'valentines';

    return 'default';
  }

  applyTheme(themeName?: string): void {
    const name = themeName ?? this.getActiveThemeName();
    const theme = THEMES[name] ?? THEMES['default'];
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }

  setOverride(themeName: string | null): void {
    if (themeName) {
      localStorage.setItem(this.STORAGE_KEY, themeName);
    } else {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.applyTheme();
  }

  getActiveTheme(): Theme {
    return THEMES[this.getActiveThemeName()] ?? THEMES['default'];
  }

  getAllThemes(): Theme[] {
    return Object.values(THEMES);
  }
}