import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlanService, Plan } from '../../../core/services/plan.service';

interface PlanVisuals {
  icon: string;
  benefits: string[];
  buttonText: string;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit {
  private planService = inject(PlanService);
  
  plans: (Plan & PlanVisuals)[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  // Mapeamento visual para enriquecer os dados do banco
  private visualMap: Record<string, PlanVisuals> = {
    'Basic': {
      icon: '🕹️',
      benefits: ['Acesso a jogos 8-bit', 'Suporte padrão', '1 tela simultânea'],
      buttonText: 'SELECT BASIC'
    },
    'Pro': {
      icon: '📼',
      benefits: ['Acesso a jogos 16-bit', 'Suporte prioritário', 'Save na nuvem'],
      buttonText: 'SELECT PRO'
    },
    'Ultimate': {
      icon: '👑',
      benefits: ['Acesso total (32-bit+)', 'Multiplayer online', 'Acesso antecipado'],
      buttonText: 'SELECT ULTIMATE'
    }
  };

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.planService.getPlans().subscribe({
      next: (response) => {
        this.plans = response.data.plans.map(plan => {
          const visuals = this.visualMap[plan.name] || {
            icon: '❓',
            benefits: ['Benefícios padrão'],
            buttonText: 'SELECT'
          };
          return { ...plan, ...visuals };
        });
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Erro ao carregar os planos. Tente novamente.';
        this.isLoading = false;
      }
    });
  }
}
