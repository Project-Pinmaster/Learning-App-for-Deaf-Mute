import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const hasUser = !!localStorage.getItem('userId');
  if (!hasUser) {
    router.navigate(['/auth']);
    return false;
  }
  return true;
};
