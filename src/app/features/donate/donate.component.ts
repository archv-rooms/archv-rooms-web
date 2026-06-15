import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-donate',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './donate.component.html',
  styleUrls: ['./donate.component.scss']
})
export class DonateComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);

  isLoggedIn = false;
  userName = '';
  userEmail = '';

  donorName = '';
  donorEmail = '';
  donationAmount: number | null = null;

  isProcessing = false;
  errorMessage = '';

  ngOnInit(): void {
    this.checkAuth();
  }

  checkAuth(): void {
    const token = localStorage.getItem('@archv:token');
    const user = localStorage.getItem('@archv:user');
    this.isLoggedIn = !!token;
    if (user) {
      try {
        const parsed = JSON.parse(user);
        this.userName = parsed.name ?? '';
        this.userEmail = parsed.email ?? '';
        this.donorName = this.userName;
        this.donorEmail = this.userEmail;
      } catch {
        this.userName = '';
      }
    }
  }

  logout(): void {
    localStorage.removeItem('@archv:token');
    localStorage.removeItem('@archv:user');
    this.isLoggedIn = false;
    this.userName = '';
    this.router.navigate(['/']);
  }

  startDonation(): void {
    this.errorMessage = '';

    if (!this.donationAmount || this.donationAmount <= 0) {
      this.errorMessage = 'Informe um valor válido para a doação.';
      return;
    }

    if (!this.donorEmail) {
      this.errorMessage = 'Informe seu e-mail para receber a confirmação.';
      return;
    }

    this.isProcessing = true;

    this.http.post<any>(`${environment.apiUrl}/donation`, {
      amount: this.donationAmount,
      name: this.donorName || 'Apoiador',
      email: this.donorEmail
    }).subscribe({
      next: (response) => {
        if (response.success && response.data.initPoint) {
          window.location.href = response.data.initPoint;
        } else {
          this.errorMessage = 'Erro ao iniciar doação. Tente novamente.';
          this.isProcessing = false;
        }
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Erro ao iniciar doação. Tente novamente.';
        this.isProcessing = false;
      }
    });
  }

  setAmount(value: number): void {
    this.donationAmount = value;
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }
}