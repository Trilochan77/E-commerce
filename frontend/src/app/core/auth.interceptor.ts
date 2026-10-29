import { NgZone, ApplicationRef, inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('ecom_token');
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  const router = inject(Router);
  const zone = inject(NgZone);
  const appRef = inject(ApplicationRef);
  const errorHandled = next(req).pipe(
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
  // Re-enter the Angular zone and force an application tick after every
  // response so new data always renders, even when the request fired during
  // the initial bootstrap before change-detection scheduling is attached.
  return new Observable((subscriber) => {
    const sub = errorHandled.subscribe({
      next: (evt) => {
        zone.run(() => subscriber.next(evt));
        queueMicrotask(() => {
          try {
            appRef.tick();
          } catch (e) {
            console.error('[authInterceptor] tick failed', e);
          }
        });
      },
      error: (err) => zone.run(() => subscriber.error(err)),
      complete: () => zone.run(() => subscriber.complete())
    });
    return () => sub.unsubscribe();
  });
};
