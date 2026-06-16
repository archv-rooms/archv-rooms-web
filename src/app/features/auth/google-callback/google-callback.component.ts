import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  template: `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0a0a0a;color:#fff;font-family:monospace;letter-spacing:2px;">
      <p>// AUTENTICANDO...</p>
    </div>
  `
})
export class GoogleCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const name  = params['name'];
      const role  = params['role'];

      if (token) {
        this.authService.handleGoogleCallback(token, name, role);
        this.router.navigate(['/onboarding']);
      } else {
        this.router.navigate(['/login'], { queryParams: { error: 'google' } });
      }
    });
  }
}