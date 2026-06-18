import { Component, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-theme-effects',
  standalone: true,
  imports: [CommonModule],
  template: `
    <canvas #canvas style="position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;opacity:0.85;"></canvas>

    <div *ngIf="showBanner" class="halloween-banner" [class.visible]="bannerVisible" [class.hiding]="bannerHiding">
      <div class="banner-inner">
        <span class="banner-icon">💀</span>
        <span class="banner-text">{{ bannerMessage }}</span>
        <span class="banner-icon">💀</span>
      </div>
    </div>
  `,
  styles: [`
    .halloween-banner {
      position: fixed;
      top: -120px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      pointer-events: none;
      transition: top 1.2s cubic-bezier(0.22, 1, 0.36, 1), opacity 1s ease;
      opacity: 0;
    }
    .halloween-banner.visible {
      top: 32px;
      opacity: 1;
    }
    .halloween-banner.hiding {
      top: 32px;
      opacity: 0;
    }
    .banner-inner {
      display: flex;
      align-items: center;
      gap: 14px;
      background: #0f0500;
      border: 1px solid #b84a00;
      padding: 14px 28px;
      box-shadow: 0 0 24px #b84a0088, inset 0 0 16px #1c0a00;
    }
    .banner-text {
      font-family: 'Courier New', monospace;
      font-size: 13px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #c8a060;
      text-shadow: 0 0 8px #b84a00;
      white-space: nowrap;
    }
    .banner-icon {
      font-size: 18px;
      filter: grayscale(0.4);
    }
  `]
})
export class ThemeEffectsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private particles: any[] = [];
  private animationId!: number;
  private theme = 'none';

  showBanner = false;
  bannerVisible = false;
  bannerHiding = false;
  bannerMessage = '';

  private readonly halloweenMessages = [
    'Os mortos estão acordados. Jogue com cuidado.',
    'Esta noite, o arquivo está amaldiçoado.',
    'Algo te observa nas sombras do cartucho.',
    'Nem todo save file sobrevive à esta noite.',
    'Os dados corrompidos voltaram para assombrar.',
  ];

  constructor(private http: HttpClient) {}

  async ngAfterViewInit(): Promise<void> {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', () => this.resize());

    try {
      const res = await firstValueFrom(
        this.http.get<{ themeKey: string }>(`${environment.apiUrl}/admin/theme`)
      );
      this.theme = res.themeKey ?? 'none';
    } catch {
      this.theme = 'none';
    }

    this.initParticles();
    this.animate();

    if (this.theme === 'halloween') {
      this.triggerBanner();
    }
  }

  private triggerBanner(): void {
    const msg = this.halloweenMessages[Math.floor(Math.random() * this.halloweenMessages.length)];
    this.bannerMessage = msg;
    this.showBanner = true;

    setTimeout(() => { this.bannerVisible = true; }, 800);
    setTimeout(() => { this.bannerHiding = true; this.bannerVisible = false; }, 5000);
    setTimeout(() => { this.showBanner = false; this.bannerHiding = false; }, 6200);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
  }

  private resize(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private initParticles(): void {
    this.particles = [];
    const W = window.innerWidth;
    const H = window.innerHeight;

    if (this.theme === 'christmas') {
      for (let i = 0; i < 120; i++) {
        this.particles.push({
          type: 'snow',
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 2.5 + 0.8,
          speed: Math.random() * 0.8 + 0.2,
          wind: Math.random() * 0.4 - 0.2,
          opacity: Math.random() * 0.4 + 0.2,
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
        });
      }
      for (let i = 0; i < 60; i++) {
        this.particles.push({
          type: 'star',
          x: Math.random() * W,
          y: Math.random() * H * 0.7,
          r: Math.random() * 1.2 + 0.3,
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.03 + 0.01,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
    }

    if (this.theme === 'halloween') {
      for (let i = 0; i < 8; i++) {
        this.particles.push({
          type: 'ghost',
          x: Math.random() * W,
          y: Math.random() * H,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 28 + 18,
          opacity: Math.random() * 0.22 + 0.07,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: Math.random() * 0.018 + 0.008,
        });
      }
      for (let i = 0; i < 40; i++) {
        this.particles.push({
          type: 'ember',
          x: Math.random() * W,
          y: H + Math.random() * H,
          speedY: Math.random() * 0.8 + 0.3,
          speedX: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
          flicker: Math.random() * Math.PI * 2,
          flickerSpeed: Math.random() * 0.05 + 0.02,
        });
      }
    }

    if (this.theme === 'valentines') {
      for (let i = 0; i < 28; i++) {
        this.particles.push({
          type: 'heart',
          x: Math.random() * W,
          y: H + Math.random() * H,
          speedY: Math.random() * 0.45 + 0.1,
          size: Math.random() * 14 + 4,
          opacity: Math.random() * 0.4 + 0.08,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: Math.random() * 0.01 + 0.003,
          drift: (Math.random() - 0.5) * 0.3,
        });
      }
    }

    if (this.theme === 'carnival') {
      const colors = ['#c9a800','#b8005a','#007a8a','#8a3000','#6a0080','#c9a800'];
      for (let i = 0; i < 70; i++) {
        this.particles.push({
          type: 'confetti',
          x: Math.random() * W,
          y: Math.random() * H,
          speedY: Math.random() * 1.2 + 0.4,
          speedX: (Math.random() - 0.5) * 0.8,
          w: Math.random() * 6 + 2,
          h: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.06,
          opacity: Math.random() * 0.5 + 0.3,
        });
      }
      for (let i = 0; i < 12; i++) {
        const segCount = 18;
        const segs: {x: number, y: number}[] = [];
        const startX = Math.random() * W;
        for (let s = 0; s < segCount; s++) {
          segs.push({ x: startX + Math.sin(s * 0.6) * 12, y: -s * 14 - Math.random() * 40 });
        }
        this.particles.push({
          type: 'streamer',
          segs,
          speedY: Math.random() * 1.0 + 0.5,
          wave: Math.random() * Math.PI * 2,
          waveSpeed: Math.random() * 0.04 + 0.02,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.5 + 0.3,
        });
      }
    }

    if (this.theme === 'newyear') {
      for (let i = 0; i < 80; i++) {
        this.particles.push({
          type: 'glitter',
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.5 + 0.5,
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.05 + 0.02,
          opacity: Math.random() * 0.4 + 0.1,
        });
      }
      this.scheduleFirework();
    }
  }

  private scheduleFirework(): void {
    const delay = Math.random() * 2500 + 1200;
    setTimeout(() => {
      if (this.theme !== 'newyear') return;
      this.spawnFirework();
      this.scheduleFirework();
    }, delay);
  }

  private spawnFirework(): void {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const x = Math.random() * W * 0.8 + W * 0.1;
    const y = Math.random() * H * 0.5 + H * 0.05;
    const colors = ['#a88a00','#c8a000','#8a6000','#d4a800','#706000','#e0b800'];
    const color  = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 50; i++) {
      const angle = (Math.PI * 2 / 50) * i;
      const speed = Math.random() * 2.5 + 0.8;
      this.particles.push({
        type: 'firework',
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1, color,
        decay: Math.random() * 0.018 + 0.008,
      });
    }
  }

  private animate(): void {
    const canvas = this.canvasRef.nativeElement;
    const W = canvas.width;
    const H = canvas.height;
    this.ctx.clearRect(0, 0, W, H);

    if (this.theme === 'christmas')  this.drawChristmas(W, H);
    if (this.theme === 'halloween')  this.drawHalloween(W, H);
    if (this.theme === 'valentines') this.drawValentines(W, H);
    if (this.theme === 'carnival')   this.drawCarnival(W, H);
    if (this.theme === 'newyear')    this.drawNewYear(W, H);

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private drawChristmas(W: number, H: number): void {
    this.particles.forEach(p => {
      if (p.type === 'star') {
        p.twinkle += p.twinkleSpeed;
        const op = p.opacity * (0.5 + Math.sin(p.twinkle) * 0.5);
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(200,255,200,${op})`;
        this.ctx.fill();
      }
      if (p.type === 'snow') {
        p.twinkle += p.twinkleSpeed;
        const opacity = p.opacity * (0.7 + Math.sin(p.twinkle) * 0.3);
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(180,220,180,${opacity})`;
        this.ctx.fill();
        p.y += p.speed;
        p.x += p.wind;
        if (p.y > H) { p.y = -5; p.x = Math.random() * W; }
        if (p.x > W) p.x = 0;
        if (p.x < 0) p.x = W;
      }
    });
  }

  private drawHalloween(W: number, H: number): void {
    this.particles.forEach(p => {
      if (p.type === 'ghost') {
        p.wobble += p.wobbleSpeed;
        p.x += p.speedX + Math.sin(p.wobble) * 0.25;
        p.y += p.speedY;
        const s = p.size;
        this.ctx.save();
        this.ctx.globalAlpha = p.opacity;
        this.ctx.fillStyle = '#c8a880';
        this.ctx.translate(p.x, p.y);
        this.ctx.beginPath();
        this.ctx.arc(0, -s * 0.3, s * 0.5, Math.PI, 0);
        this.ctx.lineTo(s * 0.5, s * 0.4);
        this.ctx.quadraticCurveTo(s * 0.3,   s * 0.6,  s * 0.15,  s * 0.4);
        this.ctx.quadraticCurveTo(0,          s * 0.65, -s * 0.15, s * 0.4);
        this.ctx.quadraticCurveTo(-s * 0.3,  s * 0.6,  -s * 0.5,  s * 0.4);
        this.ctx.lineTo(-s * 0.5, -s * 0.3);
        this.ctx.fill();
        this.ctx.globalAlpha = p.opacity * 1.8;
        this.ctx.fillStyle = '#1c0a00';
        this.ctx.beginPath();
        this.ctx.ellipse(-s * 0.15, -s * 0.3, s * 0.08, s * 0.1, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.ellipse(s * 0.15, -s * 0.3, s * 0.08, s * 0.1, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
        if (p.x < -100) p.x = W + 100;
        if (p.x > W + 100) p.x = -100;
        if (p.y < -100) p.y = H + 100;
        if (p.y > H + 100) p.y = -100;
      }

      if (p.type === 'ember') {
        p.flicker += p.flickerSpeed;
        p.y -= p.speedY;
        p.x += p.speedX + Math.sin(p.flicker) * 0.3;
        const opacity = p.opacity * (0.6 + Math.sin(p.flicker) * 0.4);
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(180,70,0,${opacity})`;
        this.ctx.fill();
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      }
    });
  }

  private drawValentines(W: number, H: number): void {
    this.particles.forEach(p => {
      if (p.type === 'heart') {
        p.wobble += p.wobbleSpeed;
        p.y -= p.speedY;
        p.x += Math.sin(p.wobble) * 0.35 + p.drift;
        const s = p.size;
        this.ctx.save();
        this.ctx.globalAlpha = p.opacity;
        this.ctx.fillStyle = '#a0143c';
        this.ctx.translate(p.x, p.y);
        this.ctx.beginPath();
        this.ctx.moveTo(0, -s * 0.3);
        this.ctx.bezierCurveTo( s * 0.5, -s,  s, -s * 0.3, 0,  s * 0.5);
        this.ctx.bezierCurveTo(-s, -s * 0.3, -s * 0.5, -s, 0, -s * 0.3);
        this.ctx.fill();
        this.ctx.restore();
        if (p.y < -50) { p.y = H + 50; p.x = Math.random() * W; }
      }
    });
  }

  private drawCarnival(W: number, H: number): void {
    this.particles.forEach(p => {
      if (p.type === 'confetti') {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotSpeed;
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.opacity;
        this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        this.ctx.restore();
        this.ctx.globalAlpha = 1;
        if (p.y > H + 10) { p.y = -10; p.x = Math.random() * W; }
      }

      if (p.type === 'streamer') {
        p.wave += p.waveSpeed;
        p.segs.forEach((seg: any) => { seg.y += p.speedY; });
        p.segs.forEach((seg: any, i: number) => {
          seg.x += Math.sin(p.wave + i * 0.4) * 0.6;
        });
        this.ctx.save();
        this.ctx.globalAlpha = p.opacity;
        this.ctx.strokeStyle = p.color;
        this.ctx.lineWidth = 2.5;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(p.segs[0].x, p.segs[0].y);
        for (let i = 1; i < p.segs.length; i++) {
          this.ctx.lineTo(p.segs[i].x, p.segs[i].y);
        }
        this.ctx.stroke();
        this.ctx.restore();
        if (p.segs[0].y > H + 20) {
          const startX = Math.random() * W;
          p.segs.forEach((seg: any, i: number) => {
            seg.x = startX + Math.sin(i * 0.6) * 12;
            seg.y = -i * 14 - Math.random() * 40;
          });
        }
      }
    });
  }

  private drawNewYear(W: number, H: number): void {
    this.particles.forEach(p => {
      if (p.type === 'glitter') {
        p.twinkle += p.twinkleSpeed;
        const op = p.opacity * (0.4 + Math.abs(Math.sin(p.twinkle)) * 0.6);
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(180,150,0,${op})`;
        this.ctx.fill();
      }
    });

    this.particles = this.particles.filter(p => p.type === 'glitter' || p.alpha > 0.01);
    this.particles.forEach(p => {
      if (p.type === 'firework') {
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.04;
        p.alpha -= p.decay;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.alpha;
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
      }
    });
  }
}