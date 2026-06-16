import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';

interface OnboardingStep {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-onboarding-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding-page.component.html',
  styleUrls: ['./onboarding-page.component.scss']
})
export class OnboardingPageComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

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
    this.router.navigate(['/plans']);
  }
}