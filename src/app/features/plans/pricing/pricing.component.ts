import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlanService, Plan } from '../../../core/services/plan.service';
import { AuthService } from '../../../core/services/auth.service';

interface PlanVisuals {
  icon: string;
  benefits: string[];
  buttonText: string;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit {

  private router = inject(Router);
  private planService = inject(PlanService);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);

  isLoggedIn = false;
  userName = '';

  plans: (Plan & PlanVisuals)[] = [];
  isLoading = true;
  errorMessage = '';

  private visualMap: Record<string, PlanVisuals> = {
    'Basic': {
      icon: '▣',
      benefits: [
        'Acesso ao acervo 8-bit',
        '1 dispositivo simultâneo',
        'Download padrão',
        'Atualizações mensais',
      ],
      buttonText: 'INITIALIZE BASIC',
    },
    'Pro': {
      icon: '◈',
      benefits: [
        'Acesso completo 16-bit',
        'Save states em nuvem',
        'Prioridade de sinal',
        '3 dispositivos simultâneos',
      ],
      buttonText: 'INITIALIZE PRO',
    },

    'Premium': {
      icon: '◈',
      benefits: [
        'Acesso completo 16-bit',
        'Save states em nuvem',
        'Prioridade de sinal',
        '3 dispositivos simultâneos',
      ],
      buttonText: 'INITIALIZE PRO',
    },

    'Ultimate': {
      icon: '⬢',
      benefits: [
        'Acesso total ao arquivo',
        'Multiplayer online',
        'Early access releases',
        'Transmissão premium ilimitada',
      ],
      buttonText: 'INITIALIZE ULTIMATE',
    },
    
    'Ultra Gamer': {
      icon: '⬢',
      benefits: [
        'Acesso total ao arquivo',
        'Multiplayer online',
        'Early access releases',
        'Transmissão premium ilimitada',
      ],
      buttonText: 'INITIALIZE ULTIMATE',
    },
  };

  ngOnInit(): void {
    this.checkAuth();
    this.loadPlans();
  }

private checkAuth(): void {
  this.isLoggedIn = this.authService.isAuthenticated();
  if (this.isLoggedIn) {
    this.userName = this.authService.getUserName();
  }
}

logout(): void {
  this.authService.logout();
  this.isLoggedIn = false;
  this.userName = '';
  this.router.navigate(['/login']);
}

  loadPlans(): void {
    this.planService.getPlans().subscribe({
      next: (response) => {
        console.log('RESPONSE:', response);
        this.plans = response.data.plans.map(plan => ({
          ...plan,
          ...(this.visualMap[plan.name] ?? {
            icon: '❓',
            benefits: ['Benefícios padrão'],
            buttonText: 'SELECT',
          }),
        }));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('ERROR:', err);
        this.errorMessage = 'FALHA AO CARREGAR PLANOS. VERIFIQUE O SINAL.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onSelectPlan(plan: Plan & PlanVisuals): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/checkout', plan.id]);
    } else {
      this.router.navigate(['/register']);
    }
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }
}