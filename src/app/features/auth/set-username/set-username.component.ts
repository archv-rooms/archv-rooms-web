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

      <div class="bg-grid"></div>
      <div class="bg-vignette"></div>
      <div class="scanlines"></div>

      <div class="card">
        <div class="card-top">
          <span class="logo"><span class="bracket">[</span>ARCHV<span class="bracket">]</span></span>
          <span class="card-tag">SETUP_01</span>
        </div>

        <div class="card-title-wrap">
          <div class="card-accent"></div>
          <h1 class="card-title">ESCOLHA SEU<br/>USERNAME</h1>
        </div>

        <p class="card-hint">// Identificador único · mín. 3 caracteres · apenas letras, números e _</p>

        <div class="input-wrap" [class.has-error]="errorMsg">
          <span class="prompt">&gt;</span>
          <input
            class="input"
            type="text"
            [(ngModel)]="username"
            placeholder="seu_username"
            maxlength="20"
            (input)="errorMsg = ''"/>
          <span class="input-count">{{ username.length }}/20</span>
        </div>

        <p class="error-msg" *ngIf="errorMsg">⚠ {{ errorMsg }}</p>

        <button class="btn" (click)="submit()" [disabled]="loading || !username">
          <span *ngIf="!loading">CONFIRMAR_USERNAME →</span>
          <span *ngIf="loading">// SALVANDO...</span>
        </button>

        <p class="card-footer">Este nome aparecerá no seu perfil público e não poderá ser alterado facilmente.</p>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=VT323&display=swap');

    .wrapper {
      display: flex; align-items: center; justify-content: center;
      height: 100vh; font-family: 'Share Tech Mono', monospace;
      background: #11131a; position: relative; overflow: hidden;
    }

    .bg-grid {
      position: absolute; inset: 0; pointer-events: none;
      background-image:
        linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px);
      background-size: 48px 48px;
    }

    .scanlines {
      position: absolute; inset: 0; pointer-events: none;
      background: repeating-linear-gradient(
        0deg, transparent, transparent 3px,
        rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px
      );
    }

    .bg-vignette {
      position: absolute; inset: 0; pointer-events: none;
      background: radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.75) 100%);
    }

    .card {
      position: relative; z-index: 1;
      background: rgba(24,27,36,0.92);
      border: 1px solid rgba(109,78,216,0.35);
      border-radius: 8px; padding: 36px 40px;
      width: 460px; max-width: 95vw;
      display: flex; flex-direction: column; gap: 20px;
      box-shadow: 0 0 60px rgba(139,92,246,0.08), 0 0 0 1px rgba(139,92,246,0.05);
      backdrop-filter: blur(8px);
    }

    .card-top {
      display: flex; align-items: center; justify-content: space-between;
    }

    .logo {
      font-size: 12px; color: #555d7a; letter-spacing: 4px;
    }
    .bracket { color: #8b5cf6; }

    .card-tag {
      font-size: 9px; color: #555d7a; letter-spacing: 3px;
      border: 1px solid #2a2e3f; padding: 3px 10px; border-radius: 3px;
    }

    .card-title-wrap {
      display: flex; align-items: flex-start; gap: 14px;
    }

    .card-accent {
      width: 3px; border-radius: 2px; background: #8b5cf6;
      align-self: stretch; flex-shrink: 0;
      box-shadow: 0 0 10px rgba(139,92,246,0.5);
    }

    .card-title {
      font-family: 'VT323', monospace; font-size: 36px;
      color: #f2f4ff; letter-spacing: 3px; line-height: 1.1; margin: 0;
    }

    .card-hint {
      font-size: 10px; color: #555d7a; letter-spacing: 1px;
      line-height: 1.6; margin: 0;
      border-left: 2px solid #2a2e3f; padding-left: 10px;
    }

    .input-wrap {
      display: flex; align-items: center; gap: 8px;
      background: #141720; border: 1px solid #2a2e3f;
      border-radius: 4px; padding: 0 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .input-wrap:focus-within {
      border-color: #6d4ed8;
      box-shadow: 0 0 0 1px rgba(109,78,216,0.2);
    }
    .input-wrap.has-error { border-color: #fb7185; }

    .prompt { color: #8b5cf6; font-size: 15px; flex-shrink: 0; }

    .input {
      flex: 1; background: transparent; border: none; outline: none;
      color: #f2f4ff; font-family: 'Share Tech Mono', monospace;
      font-size: 14px; padding: 13px 0; letter-spacing: 2px;
    }
    .input::placeholder { color: #454a62; }

    .input-count { font-size: 10px; color: #555d7a; flex-shrink: 0; }

    .error-msg {
      font-size: 11px; color: #fb7185; letter-spacing: 1px; margin: 0;
    }

    .btn {
      background: transparent; border: 1px solid rgba(242,244,255,0.6);
      color: #f2f4ff; font-family: 'Share Tech Mono', monospace;
      font-size: 12px; letter-spacing: 2px; padding: 13px;
      border-radius: 4px; cursor: pointer; transition: all 0.2s;
      text-transform: uppercase;
    }
    .btn:hover:not(:disabled) {
      background: rgba(139,92,246,0.12);
      border-color: #8b5cf6;
      box-shadow: 0 0 16px rgba(139,92,246,0.25);
    }
    .btn:disabled { opacity: 0.3; cursor: not-allowed; }

    .card-footer {
      font-size: 10px; color: #454a62; letter-spacing: 0.5px;
      line-height: 1.6; margin: 0; text-align: center;
    }
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

    this.http.patch(`${this.api}/user/username`, { username: trimmed }, {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
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