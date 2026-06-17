import { Component, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-theme-effects',
  standalone: true,
  imports: [CommonModule],
  template: `<canvas #canvas style="position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;opacity:0.8;"></canvas>`,
})
export class ThemeEffectsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private particles: any[] = [];
  private animationId!: number;
  private theme = 'none';

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
      for (let i = 0; i < 150; i++) {
        this.particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 3 + 1,
          speed: Math.random() * 1.2 + 0.3,
          wind: Math.random() * 0.6 - 0.3,
          opacity: Math.random() * 0.5 + 0.3,
        });
      }
    }

    if (this.theme === 'halloween') {
      for (let i = 0; i < 10; i++) {
        this.particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          speedX: (Math.random() - 0.5) * 0.6,
          speedY: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 30 + 20,
          opacity: Math.random() * 0.3 + 0.1,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: Math.random() * 0.02 + 0.01,
        });
      }
    }

    if (this.theme === 'valentines') {
      for (let i = 0; i < 25; i++) {
        this.particles.push({
          x: Math.random() * W,
          y: H + Math.random() * H,
          speedY: Math.random() * 0.6 + 0.2,
          size: Math.random() * 12 + 6,
          opacity: Math.random() * 0.4 + 0.2,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: Math.random() * 0.015 + 0.005,
        });
      }
    }

    if (this.theme === 'carnival') {
      const colors = ['#ffe600','#ff0080','#00e5ff','#ff4400','#00ff88','#ff44ff'];
      for (let i = 0; i < 80; i++) {
        this.particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          speedY: Math.random() * 1.5 + 0.5,
          speedX: (Math.random() - 0.5) * 1,
          w: Math.random() * 7 + 3,
          h: Math.random() * 3 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.08,
        });
      }
    }

    if (this.theme === 'newyear') {
      this.scheduleFirework();
    }
  }

  private scheduleFirework(): void {
    const delay = Math.random() * 2000 + 1000;
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
    const colors = ['#ffd700','#ff4400','#00cfff','#ff4081','#ffffff','#ffe600'];
    const color  = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 60; i++) {
      const angle = (Math.PI * 2 / 60) * i;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1, color,
        decay: Math.random() * 0.015 + 0.01,
      });
    }
  }

  private animate(): void {
    const canvas = this.canvasRef.nativeElement;
    const W = canvas.width;
    const H = canvas.height;
    this.ctx.clearRect(0, 0, W, H);

    if (this.theme === 'christmas')  this.drawSnow(W, H);
    if (this.theme === 'halloween')  this.drawGhosts(W, H);
    if (this.theme === 'valentines') this.drawHearts(W, H);
    if (this.theme === 'carnival')   this.drawConfetti(W, H);
    if (this.theme === 'newyear')    this.drawFireworks();

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private drawSnow(W: number, H: number): void {
    this.particles.forEach(p => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
      this.ctx.fill();
      p.y += p.speed;
      p.x += p.wind;
      if (p.y > H) { p.y = -5; p.x = Math.random() * W; }
      if (p.x > W) p.x = 0;
      if (p.x < 0) p.x = W;
    });
  }

  private drawGhosts(W: number, H: number): void {
    this.particles.forEach(p => {
      p.wobble += p.wobbleSpeed;
      p.x += p.speedX + Math.sin(p.wobble) * 0.3;
      p.y += p.speedY;
      const s = p.size;
      this.ctx.save();
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.translate(p.x, p.y);
      this.ctx.beginPath();
      this.ctx.arc(0, -s * 0.3, s * 0.5, Math.PI, 0);
      this.ctx.lineTo(s * 0.5, s * 0.4);
      this.ctx.quadraticCurveTo(s * 0.3,   s * 0.6,  s * 0.15,  s * 0.4);
      this.ctx.quadraticCurveTo(0,          s * 0.65, -s * 0.15, s * 0.4);
      this.ctx.quadraticCurveTo(-s * 0.3,  s * 0.6,  -s * 0.5,  s * 0.4);
      this.ctx.lineTo(-s * 0.5, -s * 0.3);
      this.ctx.fill();
      this.ctx.globalAlpha = p.opacity * 2;
      this.ctx.fillStyle = '#000000';
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
    });
  }

  private drawHearts(W: number, H: number): void {
    this.particles.forEach(p => {
      p.wobble += p.wobbleSpeed;
      p.y -= p.speedY;
      p.x += Math.sin(p.wobble) * 0.4;
      const s = p.size;
      this.ctx.save();
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = '#e91e63';
      this.ctx.translate(p.x, p.y);
      this.ctx.beginPath();
      this.ctx.moveTo(0, -s * 0.3);
      this.ctx.bezierCurveTo( s * 0.5, -s,  s, -s * 0.3, 0,  s * 0.5);
      this.ctx.bezierCurveTo(-s, -s * 0.3, -s * 0.5, -s, 0, -s * 0.3);
      this.ctx.fill();
      this.ctx.restore();
      if (p.y < -50) { p.y = H + 50; p.x = Math.random() * W; }
    });
  }

  private drawConfetti(W: number, H: number): void {
    this.particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotSpeed;
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = 0.85;
      this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      this.ctx.restore();
      this.ctx.globalAlpha = 1;
      if (p.y > H + 10) { p.y = -10; p.x = Math.random() * W; }
    });
  }

  private drawFireworks(): void {
    this.particles = this.particles.filter(p => p.alpha > 0.01);
    this.particles.forEach(p => {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.05;
      p.alpha -= p.decay;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fill();
      this.ctx.globalAlpha = 1;
    });
  }
}