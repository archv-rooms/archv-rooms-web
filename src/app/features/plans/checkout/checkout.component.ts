import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

  planId: number | null = null;
  selectedPlan: Plan | null = null;

  isLoadingPlan = true;
  errorMessage = '';

  isLoggedIn = false;
  userName = '';

  pixCopied = false;
  readonly pixKey = 'contatoarchvrooms@gmail.com';
  readonly pixQrCode = 'images/qr-code-pix.png';
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
    const user  = localStorage.getItem('@archv:user');
    this.isLoggedIn = !!token;
    if (user) {
      try { this.userName = JSON.parse(user).name ?? 'USER'; }
      catch { this.userName = 'USER'; }
    }
  }

  logout(): void {
    localStorage.removeItem('@archv:token');
    localStorage.removeItem('@archv:user');
    this.isLoggedIn = false;
    this.userName = '';
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

  copyPixKey(): void {
    navigator.clipboard.writeText(this.pixKey).then(() => {
      this.pixCopied = true;
      setTimeout(() => this.pixCopied = false, 3000);
    });
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }
}