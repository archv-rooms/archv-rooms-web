import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PlanService, Plan } from '../../../core/services/plan.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private planService = inject(PlanService);

  planId: number | null = null;
  selectedPlan: Plan | null = null;
  
  isLoadingPlan: boolean = true;
  isSubscribing: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    this.planId = Number(this.route.snapshot.paramMap.get('planId'));
    
    if (this.planId) {
      this.loadPlanDetails();
    } else {
      this.errorMessage = 'ID do plano inválido.';
      this.isLoadingPlan = false;
    }
  }

  loadPlanDetails(): void {
    // Como a API retorna todos os planos, buscamos a lista e filtramos pelo ID
    this.planService.getPlans().subscribe({
      next: (response) => {
        this.selectedPlan = response.data.plans.find(p => p.id === this.planId) || null;
        
        if (!this.selectedPlan) {
          this.errorMessage = 'Plano não encontrado no sistema.';
        }
        
        this.isLoadingPlan = false;
      },
      error: () => {
        this.errorMessage = 'Erro ao carregar os detalhes do plano.';
        this.isLoadingPlan = false;
      }
    });
  }

  confirmSubscription(): void {
    if (!this.planId) return;

    this.isSubscribing = true;
    this.errorMessage = '';

    this.planService.subscribe(this.planId).subscribe({
      next: () => {
        this.isSubscribing = false;
        // Redireciona para a biblioteca após o sucesso
        this.router.navigate(['/library']);
      },
      error: (err) => {
        this.isSubscribing = false;
        this.errorMessage = err.error?.message || 'Erro ao processar a assinatura. Tente novamente.';
      }
    });
  }
}
