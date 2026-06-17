import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CookieBannerComponent } from './shared/components/cookie-banner/cookie-banner.component';
import { ThemeService } from './core/services/theme.service';
import { ThemeEffectsComponent } from './shared/components/theme-effects/theme-effects.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CookieBannerComponent, ThemeEffectsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('frontend');
  private themeService = inject(ThemeService);

  ngOnInit(): void {
    this.themeService.applyTheme();
  }
}