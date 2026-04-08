import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="pixel-header">
      <div class="logo" routerLink="/">
        <span class="logo-text">PROJETO X</span>
      </div>
      <nav class="nav-menu">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
        <a routerLink="/library" routerLinkActive="active">Library</a>
        <a routerLink="/pricing" routerLinkActive="active">Pricing</a>
        
        <ng-container *ngIf="authService.isAuthenticated(); else unauth">
          <a routerLink="/profile" routerLinkActive="active" class="user-name">[{{ authService.getUserName() }}]</a>
          <button class="btn-logout" (click)="logout()">Logout</button>
        </ng-container>
        
        <ng-template #unauth>
          <a routerLink="/login" routerLinkActive="active">Login</a>
        </ng-template>
      </nav>
    </header>
  `,
  styles: [`
    .pixel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 40px;
      background-color: var(--color-black);
      border-bottom: 4px solid var(--color-primary);
    }
    .logo {
      cursor: pointer;
    }
    .logo-text {
      font-family: var(--font-title);
      color: var(--color-primary);
      font-size: 1.5rem;
      text-shadow: 2px 2px 0px var(--color-secondary);
    }
    .nav-menu {
      display: flex;
      gap: 20px;
      align-items: center;
    }
    .nav-menu a {
      color: var(--color-text);
      text-decoration: none;
      font-family: var(--font-title);
      font-size: 0.8rem;
      text-transform: uppercase;
      transition: color 0.2s;
    }
    .nav-menu a:hover, .nav-menu a.active {
      color: var(--color-secondary);
    }
    .user-name {
      color: var(--color-primary) !important;
    }
    .btn-logout {
      background: none;
      border: none;
      color: var(--color-error);
      font-family: var(--font-title);
      font-size: 0.8rem;
      cursor: pointer;
      text-transform: uppercase;
    }
    .btn-logout:hover {
      color: #ff4d4d;
    }
  `]
})
export class HeaderComponent {
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
