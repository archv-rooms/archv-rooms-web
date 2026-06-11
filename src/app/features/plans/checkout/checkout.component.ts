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

get pixQrCode(): string {
  const qrMap: Record<number, string> = {
    1: 'images/qr-basic.png',
    2: 'images/qr-premium.png',
    10: 'images/qr-ultra.png',
  };
  return qrMap[this.planId ?? 0] ?? 'assets/images/qr-basic.png';
}
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

  isActive(path: string): boolean {
  return this.router.url === path;
  }

sendProof(): void {
  const subject = encodeURIComponent('Comprovante de pagamento - ARCHV.ROOMS');
  const body = encodeURIComponent(`Olá, segue o comprovante de pagamento do plano ${this.selectedPlan?.name}.`);
  window.open(`https://mail.google.com/mail/?view=cm&to=contatoarchvrooms@gmail.com&su=${subject}&body=${body}`, '_blank');
}

}