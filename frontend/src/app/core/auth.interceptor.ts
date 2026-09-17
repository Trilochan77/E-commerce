import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('ecom_token');
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  const router = inject(Router);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const isAuthCall = req.url.includes('/api/users/login') || req.url.includes('/api/users/register');
      if (err.status === 401 && !isAuthCall) {
        const onAdmin = router.url.split('?')[0].startsWith('/admin');
        localStorage.clear();
        router.navigate([onAdmin ? '/admin/login' : '/login'], {
          queryParams: { returnUrl: router.url, expired: '1' }
        });
      }
      return throwError(() => err);
    })
  );
};
