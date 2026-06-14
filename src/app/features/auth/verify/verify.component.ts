import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss']
})
export class VerifyComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isLoading: boolean = true;
  successMessage: string = '';
  errorMessage: string = '';

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token') || '';

    this.http.get(`${environment.apiUrl}/auth/verify-email?token=${token}`).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'E-mail verificado com sucesso!';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Token inválido ou expirado.';
      }
    });
  }
}