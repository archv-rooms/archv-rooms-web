import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService, UserProfile, Subscription } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  userProfile: UserProfile | null = null;
  activeSubscription: Subscription | null = null;
  
  isLoading: boolean = true;
  errorMessage: string = '';

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.userService.getProfile().subscribe({
      next: (response) => {
        this.userProfile = response.data.user;
        
        // Pega a primeira assinatura ativa, se houver
        if (this.userProfile.subscriptions && this.userProfile.subscriptions.length > 0) {
          this.activeSubscription = this.userProfile.subscriptions[0];
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erro ao carregar os dados do perfil.';
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}