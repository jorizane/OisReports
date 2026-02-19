import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  if (authService.restoreChecked()) {
    router.navigate(['/login'], { queryParams: { redirect: state.url } });
    return false;
  }

  return authService.restoreSession().pipe(
    map(() => true),
    catchError(() => {
      router.navigate(['/login'], { queryParams: { redirect: state.url } });
      return of(false);
    })
  );
};
