import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-set-username',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wrapper">
      <div class="card">
        <div class="card__header">
          <span class="bracket">[</span>ARCHV<span class="bracket">]</span>
        </div>
        <h1 class="title">ESCOLHA SEU USERNAME</h1>
        <p class="subtitle">// Este será seu identificador único na plataforma</p>

        <div class="input-wrap" [class.error]="errorMsg">
          <span class="prompt">&gt;</span>
          <input
            class="input"
            type="text"
            [(ngModel)]="username"
            placeholder="SEU_USERNAME"
            maxlength="20"
            (input)="errorMsg = ''"/>
        </div>

        <p class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</p>

        <button class="btn" (click)="submit()" [disabled]="loading || !username">
          {{ loading ? 'SALVANDO...' : 'CONFIRMAR_USERNAME' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .wrapper {
      display: flex; align-items: center; justify-content: center;
      height: 100vh; background: #11131a; font-family: 'Share Tech Mono', monospace;
    }
    .card {
      background: #181b24; border: 1px solid rgba(109,78,216,0.4);
      border-radius: 8px; padding: 40px; width: 420px; max-width: 95vw;
      display: flex; flex-direction: column; gap: 16px;
      box-shadow: 0 0 40px rgba(139,92,246,0.1);
    }
    .card__header { font-size: 13px; color: #555d7a; letter-spacing: 4px; }
    .bracket { color: #8b5cf6; }
    .title { font-family: 'VT323', monospace; font-size: 28px; color: #f2f4ff; letter-spacing: 3px; margin: 0; }
    .subtitle { font-size: 11px; color: #555d7a; letter-spacing: 1px; margin: 0; }
    .input-wrap {
      display: flex; align-items: center; gap: 8px;
      background: #141720; border: 1px solid #2a2e3f;
      border-radius: 4px; padding: 0 14px; transition: border-color 0.2s;
    }
    .input-wrap:focus-within { border-color: #6d4ed8; box-shadow: 0 0 0 1px rgba(109,78,216,0.2); }
    .input-wrap.error { border-color: #fb7185; }
    .prompt { color: #8b5cf6; font-size: 15px; }
    .input {
      flex: 1; background: transparent; border: none; outline: none;
      color: #f2f4ff; font-family: 'Share Tech Mono', monospace;
      font-size: 13px; padding: 12px 0; letter-spacing: 2px; text-transform: lowercase;
    }
    .input::placeholder { color: #454a62; }
    .error-msg { font-size: 11px; color: #fb7185; letter-spacing: 1px; margin: 0; }
    .btn {
      background: transparent; border: 1px solid #f2f4ff; color: #f2f4ff;
      font-family: 'Share Tech Mono', monospace; font-size: 12px; letter-spacing: 2px;
      padding: 12px; border-radius: 4px; cursor: pointer; transition: all 0.2s;
      text-transform: uppercase;
    }
    .btn:hover:not(:disabled) { background: rgba(139,92,246,0.15); border-color: #8b5cf6; box-shadow: 0 0 14px rgba(139,92,246,0.3); }
    .btn:disabled { opacity: 0.35; cursor: not-allowed; }
  `]
})
export class SetUsernameComponent {
  private http        = inject(HttpClient);
  private router      = inject(Router);
  private authService = inject(AuthService);
  private api         = environment.apiUrl;

  username = '';
  errorMsg = '';
  loading  = false;

  submit(): void {
    const trimmed = this.username.trim().toLowerCase();

    if (trimmed.length < 3) {
      this.errorMsg = 'Mínimo de 3 caracteres.';
      return;
    }

    if (!/^[a-z0-9_]+$/.test(trimmed)) {
      this.errorMsg = 'Apenas letras, números e underscore.';
      return;
    }

    this.loading = true;

    const token = this.authService.getToken();

    this.http.patch(`${this.api}/user/username`, { username: trimmed }, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/onboarding']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Erro ao salvar username.';
      }
    });
  }
}