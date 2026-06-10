import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-donate-thanks',
  standalone: true,
  templateUrl: './donate-thanks.component.html',
  styleUrls: ['./donate-thanks.component.scss']
})
export class DonateThanksComponent {
  constructor(private router: Router) {}
  navigate(path: string) { this.router.navigate([path]); }
}