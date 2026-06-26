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
    <div class="page">
      <div class="grid"></div>
      <div class="glow-l"></div>
      <div class="glow-r"></div>
      <div class="scanlines"></div>
      <div class="vignette"></div>

      <div class="card">
        <div class="card-top-bar">
          <span class="card-top-logo"><span class="bracket">[</span>ARCHV<span class="bracket">]</span></span>
          <div class="card-top-dots">
            <div class="dot dot-r"></div>
            <div class="dot dot-y"></div>
            <div class="dot dot-g"></div>
          </div>
        </div>

        <div class="card-body">
          <div class="step-row">
            <span class="step-done">✓ CONTA CRIADA</span>
            <div class="step-line"></div>
            <span class="step-active">► SETUP_01</span>
            <div class="step-line step-line--dim"></div>
            <span class="step-todo">ONBOARDING</span>
          </div>

          <div class="title-block">
            <div class="title-pre">// IDENTIFICAÇÃO DO JOGADOR</div>
            <h1 class="title">ESCOLHA<br/>SEU <span class="title-accent">_USERNAME</span></h1>
          </div>

          <div class="hint">
            Mínimo 3 caracteres · apenas letras, números e _ · este será seu nome público na plataforma
          </div>

          <div class="inp-label">USERNAME_INPUT</div>
          <div class="inp-wrap" [class.has-error]="errorMsg">
            <span class="inp-prompt">&gt;</span>
            <input
              class="inp"
              type="text"
              [(ngModel)]="username"
              placeholder="seu_username_aqui"
              maxlength="20"
              (input)="errorMsg = ''"/>
            <span class="inp-count">{{ username.length }}/20</span>
          </div>

          <p class="error-msg" *ngIf="errorMsg">⚠ {{ errorMsg }}</p>

          <button class="btn" (click)="submit()" [disabled]="loading || !username">
            <span *ngIf="!loading">CONFIRMAR_USERNAME <span class="btn-arrow">→</span></span>
            <span *ngIf="loading">// SALVANDO...</span>
          </button>
        </div>

        <div class="card-bottom">
          <span class="cb-text">ARCHV_OS v2.4</span>
          <span class="cb-text">SETUP 1 DE 2</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=VT323&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .page {
      font-family: 'Share Tech Mono', monospace;
      background: #0b0d14;
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      position: relative; overflow: hidden;
    }

    .grid {
      position: absolute; inset: 0; pointer-events: none;
      background-image:
        linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px);
      background-size: 52px 52px;
    }

    .glow-l {
      position: absolute; left: -120px; top: 50%; transform: translateY(-50%);
      width: 400px; height: 400px; border-radius: 50%; pointer-events: none;
      background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%);
    }

    .glow-r {
      position: absolute; right: -80px; bottom: -80px;
      width: 300px; height: 300px; border-radius: 50%; pointer-events: none;
      background: radial-gradient(circle, rgba(109,78,216,0.08) 0%, transparent 70%);
    }

    .scanlines {
      position: absolute; inset: 0; pointer-events: none;
      background: repeating-linear-gradient(
        0deg, transparent, transparent 3px,
        rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px
      );
    }

    .vignette {
      position: absolute; inset: 0; pointer-events: none;
      background: radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.8) 100%);
    }

    .card {
      position: relative; z-index: 2;
      background: rgba(18,21,32,0.92);
      border: 1px solid rgba(139,92,246,0.3);
      border-radius: 2px;
      width: 480px; max-width: 95vw;
      overflow: hidden;
    }

    .card-top-bar {
      background: rgba(139,92,246,0.08);
      border-bottom: 1px solid rgba(139,92,246,0.2);
      padding: 10px 24px;
      display: flex; align-items: center; justify-content: space-between;
    }

    .card-top-logo { font-size: 11px; color: #6d4ed8; letter-spacing: 4px; }
    .bracket { color: #8b5cf6; }

    .card-top-dots { display: flex; gap: 6px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot-r { background: #fb7185; opacity: 0.6; }
    .dot-y { background: #fbbf24; opacity: 0.6; }
    .dot-g { background: #4ade80; opacity: 0.6; }

    .card-body { padding: 32px 36px 36px; display: flex; flex-direction: column; gap: 0; }

    .step-row {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 28px;
    }

    .step-done {
      font-size: 9px; color: #4ade80; letter-spacing: 2px;
      border: 1px solid rgba(74,222,128,0.3); padding: 3px 8px; border-radius: 2px;
      white-space: nowrap;
    }

    .step-active {
      font-size: 9px; color: #8b5cf6; letter-spacing: 2px;
      border: 1px solid rgba(139,92,246,0.4); padding: 3px 8px; border-radius: 2px;
      white-space: nowrap;
    }

    .step-todo {
      font-size: 9px; color: #2a2e3f; letter-spacing: 2px;
      border: 1px solid #1a1d28; padding: 3px 8px; border-radius: 2px;
      white-space: nowrap;
    }

    .step-line {
      flex: 1; height: 1px;
      background: linear-gradient(90deg, rgba(74,222,128,0.3), transparent);
    }

    .step-line--dim {
      background: linear-gradient(90deg, rgba(109,78,216,0.3), transparent);
    }

    .title-block { margin-bottom: 20px; }

    .title-pre {
      font-size: 10px; color: #555d7a; letter-spacing: 3px; margin-bottom: 10px;
    }

    .title {
      font-family: 'VT323', monospace; font-size: 48px; color: #f2f4ff;
      letter-spacing: 2px; line-height: 1;
      text-shadow: 0 0 30px rgba(139,92,246,0.25);
    }

    .title-accent { color: #8b5cf6; }

    .hint {
      font-size: 10px; color: #555d7a; letter-spacing: 1px; line-height: 1.7;
      margin-bottom: 22px; padding: 10px 14px;
      border-left: 2px solid rgba(139,92,246,0.4);
      background: rgba(139,92,246,0.04);
    }

    .inp-label {
      font-size: 9px; color: #8b5cf6; letter-spacing: 3px; margin-bottom: 8px;
    }

    .inp-wrap {
      display: flex; align-items: center; gap: 10px;
      background: #090b12; border: 1px solid rgba(109,78,216,0.4);
      border-radius: 2px; padding: 0 16px; margin-bottom: 20px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .inp-wrap:focus-within {
      border-color: #8b5cf6;
      box-shadow: 0 0 0 1px rgba(139,92,246,0.2);
    }

    .inp-wrap.has-error { border-color: #fb7185; }

    .inp-prompt { color: #8b5cf6; font-size: 16px; flex-shrink: 0; }

    .inp {
      flex: 1; background: transparent; border: none; outline: none;
      color: #f2f4ff; font-family: 'Share Tech Mono', monospace;
      font-size: 15px; padding: 14px 0; letter-spacing: 2px;
    }

    .inp::placeholder { color: #2a2e3f; }
    .inp-count { font-size: 10px; color: #2a2e3f; flex-shrink: 0; }

    .error-msg {
      font-size: 11px; color: #fb7185; letter-spacing: 1px;
      margin-bottom: 16px; margin-top: -12px;
    }

    .btn {
      width: 100%; background: transparent;
      border: 1px solid rgba(242,244,255,0.5); color: #f2f4ff;
      font-family: 'Share Tech Mono', monospace; font-size: 12px;
      letter-spacing: 3px; padding: 15px; border-radius: 2px;
      cursor: pointer; transition: all 0.2s; text-transform: uppercase;
    }

    .btn:hover:not(:disabled) {
      background: rgba(139,92,246,0.12);
      border-color: #8b5cf6;
      box-shadow: 0 0 20px rgba(139,92,246,0.2);
    }

    .btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .btn-arrow { color: #8b5cf6; }

    .card-bottom {
      border-top: 1px solid rgba(139,92,246,0.15);
      padding: 10px 24px;
      display: flex; align-items: center; justify-content: space-between;
    }

    .cb-text { font-size: 9px; color: #2a2e3f; letter-spacing: 2px; }
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