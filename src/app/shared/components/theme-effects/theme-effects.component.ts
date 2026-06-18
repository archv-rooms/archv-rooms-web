import { Component, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-theme-effects',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="crt-overlay"></div>
<div class="glitch-overlay" [class.active]="glitchActive"></div>

<div *ngIf="showBanner" class="halloween-banner" [class.visible]="bannerVisible" [class.hiding]="bannerHiding">
  <div class="correntes">
    <div class="corrente"></div>
    <div class="corrente"></div>
  </div>
  <div class="plaquinha">
    <div class="parafuso tl"></div>
    <div class="parafuso tr"></div>
    <div class="parafuso bl"></div>
    <div class="parafuso br"></div>
    <p class="titulo">☠ sistema corrompido ☠</p>
    <p class="mensagem">{{ bannerMessage }}</p>
    <button class="btn-terror" (click)="explorarTerror()">▸ explorar jogos de terror</button>
  </div>
</div>
  `,
  styles: [`
.crt-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 9998;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.18) 0px,
    rgba(0, 0, 0, 0.18) 1px,
    transparent 1px,
    transparent 2px
  );
}
.glitch-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 9997;
  opacity: 0;
  background: rgba(180, 60, 0, 0.06);
  transition: opacity 0.05s;
}
.glitch-overlay.active {
  opacity: 1;
  animation: glitch-flicker 0.15s steps(1) forwards;
}
@keyframes glitch-flicker {
  0%   { transform: translateX(0);    opacity: 0.7; }
  25%  { transform: translateX(-4px); opacity: 0.3; }
  50%  { transform: translateX(3px);  opacity: 0.6; }
  75%  { transform: translateX(-2px); opacity: 0.4; }
  100% { transform: translateX(0);    opacity: 0; }
}
.halloween-banner {
  position: fixed;
  top: -320px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  pointer-events: none;
  transition: top 1.2s cubic-bezier(0.22, 1, 0.36, 1), opacity 1s ease;
  opacity: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.halloween-banner.visible {
  top: 0;
  opacity: 1;
  pointer-events: all;
}
.halloween-banner.hiding {
  top: 0;
  opacity: 0;
}
.correntes {
  display: flex;
  gap: 160px;
}
.corrente {
  width: 10px;
  height: 50px;
  border-left: 2px dashed #4a4030;
  border-right: 2px dashed #4a4030;
}
.plaquinha {
  background: #1c0f06;
  border: 2px solid #4a2e10;
  border-radius: 5px;
  padding: 28px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  position: relative;
  animation: swing 4s ease-in-out infinite;
  transform-origin: top center;
  min-width: 360px;
}
.parafuso {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #1a0a02;
  border: 1.5px solid #7a4010;
  position: absolute;
}
.parafuso.tl { top: 12px; left: 16px; }
.parafuso.tr { top: 12px; right: 16px; }
.parafuso.bl { bottom: 12px; left: 16px; }
.parafuso.br { bottom: 12px; right: 16px; }
.titulo {
  font-family: 'Courier New', monospace;
  font-size: 10px;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #6b3e10;
  margin: 0;
}
.mensagem {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  letter-spacing: 1.5px;
  color: #b8712a;
  margin: 0;
  text-align: center;
}
.btn-terror {
  margin-top: 8px;
  background: #0d0500;
  border: 1.5px solid #7a3a08;
  color: #cc6010;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  letter-spacing: 3px;
  text-transform: uppercase;
  padding: 10px 20px;
  cursor: pointer;
  animation: flicker 5s infinite;
}
.btn-terror:hover {
  background: #1a0a02;
  color: #ff8030;
}
@keyframes swing {
  0%   { transform: rotate(-4deg); }
  50%  { transform: rotate(4deg); }
  100% { transform: rotate(-4deg); }
}
@keyframes flicker {
  0%, 91%, 94%, 97%, 100% { opacity: 1; }
  92%, 95% { opacity: 0.4; }
}
  `]
})
export class ThemeEffectsComponent implements AfterViewInit, OnDestroy {
  private theme = 'none';

  showBanner = false;
  bannerVisible = false;
  bannerHiding = false;
  bannerMessage = '';
  glitchActive = false;

  private readonly halloweenMessages = [
    'Os mortos estão acordados. Jogue com cuidado.',
    'Esta noite, o arquivo está amaldiçoado.',
    'Algo te observa nas sombras do cartucho.',
    'Nem todo save file sobrevive à esta noite.',
    'Os dados corrompidos voltaram para assombrar.',
  ];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  async ngAfterViewInit(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ themeKey: string }>(`${environment.apiUrl}/admin/theme`)
      );
      this.theme = res.themeKey ?? 'none';
    } catch {
      this.theme = 'none';
    }

    const isHome = this.router.url === '/' || this.router.url === '/home';

    if (this.theme === 'halloween' && isHome) {
      this.triggerBanner();
      this.scheduleGlitch();
    }
  }

  private triggerBanner(): void {
    const msg = this.halloweenMessages[Math.floor(Math.random() * this.halloweenMessages.length)];
    this.bannerMessage = msg;
    this.showBanner = true;
    this.cdr.detectChanges();

    setTimeout(() => { this.bannerVisible = true; this.cdr.detectChanges(); }, 100);
    setTimeout(() => { this.bannerHiding = true; this.bannerVisible = false; this.cdr.detectChanges(); }, 10000);
    setTimeout(() => { this.showBanner = false; this.bannerHiding = false; this.cdr.detectChanges(); }, 11200);
    setTimeout(() => { this.triggerBanner(); }, 30000);
  }

  private scheduleGlitch(): void {
    const delay = Math.random() * 8000 + 4000;
    setTimeout(() => {
      this.glitchActive = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.glitchActive = false;
        this.cdr.detectChanges();
        this.scheduleGlitch();
      }, 200);
    }, delay);
  }

  explorarTerror(): void {
    window.location.href = '/biblioteca?genero=terror';
  }

  ngOnDestroy(): void {}
}