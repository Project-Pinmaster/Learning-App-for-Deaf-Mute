import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const hasUser = !!localStorage.getItem('userId');
  if (!hasUser) {
    router.navigate(['/auth']);
    return false;
  }
  const userType = localStorage.getItem('userType');
  const url = state.url || '';
  if (url.startsWith('/user-profile') && userType === 'handicap') {
    router.navigate(['/handicap-profile']);
    return false;
  }
  if (url.startsWith('/handicap-profile') && userType !== 'handicap') {
    router.navigate(['/user-profile']);
    return false;
  }
  return true;
};
