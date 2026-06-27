import { Component, inject, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';

interface OnboardingStep {
  icon: string;
  title: string;
  description: string;
}

interface Star {
  x: number; y: number; r: number;
  a: number; speed: number; phase: number;
}

interface Particle {
  x: number; y: number; size: number;
  color: string; vy: number; alpha: number;
}

@Component({
  selector: 'app-onboarding-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding-page.component.html',
  styleUrls: ['./onboarding-page.component.scss']
})
export class OnboardingPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private http = inject(HttpClient);
  private router = inject(Router);
  private animFrameId = 0;
  private t = 0;
  private stars: Star[] = [];
  private particles: Particle[] = [];

  currentStep = 0;

  steps: OnboardingStep[] = [
    {
      icon: '🎮',
      title: 'Bem-vindo ao Archv Rooms!',
      description: 'Sua plataforma de jogos retrô. Reviva os clássicos diretamente no navegador, sem instalar nada.'
    },
    {
      icon: '🕹️',
      title: 'Explore o Acervo',
      description: 'Temos jogos de diversas plataformas clássicas. Navegue pela biblioteca e encontre seus favoritos.'
    },
    {
      icon: '⭐',
      title: 'Desbloqueie Mais com um Plano',
      description: 'Jogos exclusivos estão disponíveis nos planos pagos. Assine e tenha acesso completo ao acervo.'
    },
    {
      icon: '💾',
      title: 'Salve seu Progresso',
      description: 'Seu progresso fica salvo na nuvem. Continue de onde parou a qualquer momento.'
    }
  ];

  get isLastStep(): boolean {
    return this.currentStep === this.steps.length - 1;
  }

  get progressPct(): number {
    return ((this.currentStep + 1) / this.steps.length) * 100;
  }

  ngAfterViewInit(): void {
    this.initCanvas();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animFrameId);
  }

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#7c55f5', '#a78bfa', '#5e3db3', '#c4b5fd', '#4ade80'];

    this.stars = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      a: Math.random(),
      speed: Math.random() * 0.004 + 0.002,
      phase: Math.random() * Math.PI * 2
    }));

    this.particles = Array.from({ length: 18 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.floor(Math.random() * 3 + 2) * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      vy: -(Math.random() * 0.3 + 0.1),
      alpha: Math.random() * 0.5 + 0.15
    }));

    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(100, 60, 200, 0.06)';
      ctx.lineWidth = 1;
      const size = 28;
      for (let x = 0; x < canvas.width; x += size) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += size) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
    };

    const draw = () => {
      this.t += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const grad = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.4, 40,
        canvas.width * 0.5, canvas.height * 0.4, canvas.width * 0.75
      );
      grad.addColorStop(0, '#1a1440');
      grad.addColorStop(1, '#0d0d1a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawGrid();

      this.stars.forEach(s => {
        const alpha = 0.4 + 0.5 * Math.sin(this.t * s.speed * 60 + s.phase);
        ctx.globalAlpha = alpha * s.a;
        ctx.fillStyle = '#e0d9ff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      this.particles.forEach(p => {
        p.y += p.vy;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      });

      const glow = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.5, 0,
        canvas.width * 0.5, canvas.height * 0.5, 220
      );
      glow.addColorStop(0, 'rgba(124, 85, 245, 0.08)');
      glow.addColorStop(1, 'transparent');
      ctx.globalAlpha = 1;
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalAlpha = 1;
      this.animFrameId = requestAnimationFrame(draw);
    };

    draw();
  }

  next(): void {
    if (!this.isLastStep) {
      this.currentStep++;
    } else {
      this.finish();
    }
  }

  prev(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  finish(): void {
    cancelAnimationFrame(this.animFrameId);
    const token = localStorage.getItem('@archv:token');
    if (!token) {
      this.router.navigate(['/library']);
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.patch(`${environment.apiUrl}/user/onboarding`, {}, { headers }).subscribe({
      next: () => this.router.navigate(['/library']),
      error: () => this.router.navigate(['/library'])
    });
  }

  goToPlans(): void {
    this.finish();
  }
}