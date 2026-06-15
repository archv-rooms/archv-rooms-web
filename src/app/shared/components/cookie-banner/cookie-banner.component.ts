import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookie-banner.component.html',
  styleUrls: ['./cookie-banner.component.scss']
})
export class CookieBannerComponent {
  visible = signal(!localStorage.getItem('cookies-accepted'));

  accept(): void {
    localStorage.setItem('cookies-accepted', 'true');
    this.visible.set(false);
  }
}