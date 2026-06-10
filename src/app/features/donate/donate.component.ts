import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-donate',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './donate.component.html',
  styleUrls: ['./donate.component.scss']
})
export class DonateComponent implements OnInit {
  private router = inject(Router);

  isLoggedIn = false;
  userName = '';

  pixCopied = false;
  readonly pixKey = 'pagamentos@archv.rooms';
  readonly pixQrCode = 'images/qr-code-pix.png';

  ngOnInit(): void {
    this.checkAuth();
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

}