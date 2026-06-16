import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environments';

export const onboardingGuard: CanActivateFn = () => {
  const router = inject(Router);
  const http = inject(HttpClient);
  const token = localStorage.getItem('@archv:token');

  if (!token) {
    router.navigate(['/login']);
    return of(false);
  }

  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  return http.get<any>(`${environment.apiUrl}/user/profile`, { headers }).pipe(
    map((res) => {
      if (res.success && res.data.user.onboardingDone) {
        router.navigate(['/library']);
        return false;
      }
      return true;
    }),
    catchError(() => {
      router.navigate(['/library']);
      return of(false);
    })
  );
};