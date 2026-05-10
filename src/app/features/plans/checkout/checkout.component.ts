// checkout.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PlanService, Plan } from '../../../core/services/plan.service';
import { environment } from '../../../../environments/environments';

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
  private http = inject(HttpClient);

  planId: number | null = null;
  selectedPlan: Plan | null = null;

  isLoadingPlan = true;
  isSubscribing = false;
  errorMessage = '';
  successMessage = '';

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
    this.planService.getPlans().subscribe({
      next: (response) => {
        this.selectedPlan = response.data.plans.find(p => p.id === this.planId) || null;
        if (!this.selectedPlan) this.errorMessage = 'Plano não encontrado no sistema.';
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

    const token = localStorage.getItem('@ProjetoX:token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    // Usa POST /checkout conforme o backend
    this.http.post(
      `${environment.apiUrl}/checkout`,
      { planId: this.planId },
      { headers }
    ).subscribe({
      next: (res: any) => {
        this.isSubscribing = false;
        if (res.success) {
          this.router.navigate(['/library']);
        } else {
          this.errorMessage = res.message;
        }
      },
      error: (err) => {
        this.isSubscribing = false;
        this.errorMessage = err.error?.message || 'Erro ao processar a assinatura.';
      }
    });
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }
}