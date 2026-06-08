import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-banned',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banned.component.html',
  styleUrls: ['./banned.component.scss']
})
export class BannedComponent {
  private authService = inject(AuthService);

  userName = this.authService.getUserName() ?? 'ANON';
}