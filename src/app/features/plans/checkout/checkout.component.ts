import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PlanService, Plan } from '../../../core/services/plan.service';
import { CheckoutService } from '../../../core/services/checkout.service';

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
  private checkoutService = inject(CheckoutService);
  private cdr = inject(ChangeDetectorRef);

  planId: number | null = null;
  selectedPlan: Plan | null = null;

  isLoadingPlan = true;
  isProcessing = false;
  errorMessage = '';

  isLoggedIn = false;
  userName = '';
  isAdmin = false;

  ngOnInit(): void {
    this.checkAuth();
    this.planId = Number(this.route.snapshot.paramMap.get('planId'));
    if (this.planId) {
      this.loadPlanDetails();
    } else {
      this.errorMessage = 'ID do plano inválido.';
      this.isLoadingPlan = false;
      this.cdr.detectChanges();
    }
  }

  checkAuth(): void {
    const token = localStorage.getItem('@archv:token');
    const user = localStorage.getItem('@archv:user');
    this.isLoggedIn = !!token;
    if (user) {
      try {
        const parsed = JSON.parse(user);
        this.userName = parsed.name ?? 'USER';
        this.isAdmin = parsed.role === 'admin';
      }
      catch { this.userName = 'USER'; }
    }
  }

  logout(): void {
    localStorage.removeItem('@archv:token');
    localStorage.removeItem('@archv:user');
    this.isLoggedIn = false;
    this.userName = '';
    this.isAdmin = false;
    this.router.navigate(['/']);
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

  startCheckout(): void {
    if (!this.planId || this.isProcessing) return;

    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.checkoutService.createCheckout(this.planId).subscribe({
      next: (response) => {
        if (response.success && response.data.initPoint) {
          window.location.href = response.data.initPoint;
        } else {
          this.errorMessage = 'Erro ao iniciar pagamento. Tente novamente.';
          this.isProcessing = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Erro ao iniciar pagamento. Tente novamente.';
        this.isProcessing = false;
        this.cdr.detectChanges();
      }
    });
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }
}