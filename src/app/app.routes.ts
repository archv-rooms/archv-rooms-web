import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/adm.component').then(m => m.AdmComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'pricing',
    loadComponent: () => import('./features/plans/pricing/pricing.component').then(m => m.PricingComponent)
  },
  {
    path: 'checkout/:planId',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/plans/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'library',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/library/library.component').then(m => m.LibraryComponent)
  },
  {
    path: 'rooms/:id',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/rooms/rooms.component').then(m => m.RoomsComponent)
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },

  {
  path: 'banned',
  loadComponent: () => import('./features/banned/banned.component').then(m => m.BannedComponent)
  },

  { path: 'donate', loadComponent: () => import('./features/donate/donate.component').then(m => m.DonateComponent) 

  },

  {
  path: 'payment-success',
  loadComponent: () => import('./features/plans/payment-success/payment-success.component').then(m => m.PaymentSuccessComponent)
  },

  {
  path: 'donate-thanks',
  loadComponent: () => import('./features/donate/donate-thanks/donate-thanks.component').then(m => m.DonateThanksComponent)
  },
  
  {
  path: 'forgot',
  loadComponent: () => import('./features/auth/forgot/forgot.component').then(m => m.ForgotComponent)
  },

  {
  path: 'reset-password',
  loadComponent: () => import('./features/auth/reset/reset.component').then(m => m.ResetComponent)
  },

  {
  path: 'verify-email',
  loadComponent: () => import('./features/auth/verify/verify.component').then(m => m.VerifyComponent)
  },

  {
  path: 'terms',
  loadComponent: () => import('./features/terms/terms.component').then(m => m.TermsComponent)
  },

  {
  path: 'privacy',
  loadComponent: () => import('./features/privacy/privacy.component').then(m => m.PrivacyComponent)
  },
 
  {
  path: 'about',
  loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent)
  },

  {
    path: 'error',
    loadComponent: () => import('./features/error/error.component').then(m => m.ErrorComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./features/error/error.component').then(m => m.ErrorComponent),
    data: { code: 404 }
  }
];