import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

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
      this.cdr.detectChanges();
    }
  }

  loadPlanDetails(): void {
    this.planService.getPlans().subscribe({
      next: (response) => {
        this.selectedPlan = response.data.plans.find(p => p.id === this.planId) || null;
        if (!this.selectedPlan) this.errorMessage = 'Plano não encontrado no sistema.';
        this.isLoadingPlan = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Erro ao carregar os detalhes do plano.';
        this.isLoadingPlan = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmSubscription(): void {
    if (!this.planId) return;

    this.isSubscribing = true;
    this.errorMessage = '';

    const token = localStorage.getItem('@ProjetoX:token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.post(
      `${environment.apiUrl}/plans/subscribe`,
      { planId: this.planId },
      { headers }
    ).subscribe({
      next: (res: any) => {
        this.isSubscribing = false;
        if (res.success) {
          this.router.navigate(['/library']);
        } else {
          this.errorMessage = res.message;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.isSubscribing = false;
        this.errorMessage = err.error?.message || 'Erro ao processar a assinatura.';
        this.cdr.detectChanges();
      }
    });
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }
}