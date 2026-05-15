import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'admin',
    loadComponent: () =>
    import('./features/admin/adm.component')
      .then(m => m.AdmComponent)
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
    path: '**',
    redirectTo: ''
  }
];