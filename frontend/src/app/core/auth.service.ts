import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

const GATEWAY = 'http://localhost:8080';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post(`${GATEWAY}/api/users/register`, { name, email, password })
      .pipe(tap((r: any) => this.store(r)));
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${GATEWAY}/api/users/login`, { email, password })
      .pipe(tap((r: any) => this.store(r)));
  }

  private store(r: any): void {
    if (!r || !r.token) return;
    localStorage.setItem('ecom_token', r.token);
    localStorage.setItem('ecom_userId', r.userId || '');
    localStorage.setItem('ecom_role', r.role || 'CUSTOMER');
    localStorage.setItem('ecom_email', r.email || '');
  }

  logout(): void {
    localStorage.clear();
  }

  /** Logged in = token present AND not expired (JWT exp, 24h ttl). */
  isLoggedIn(): boolean {
    const t = localStorage.getItem('ecom_token');
    return !!t && !this.tokenExpired(t);
  }

  isAdmin(): boolean {
    return this.isLoggedIn() && localStorage.getItem('ecom_role') === 'ADMIN';
  }

  userId(): string {
    return localStorage.getItem('ecom_userId') || '';
  }

  private tokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (!payload.exp) return false;
      return Date.now() / 1000 > payload.exp;
    } catch {
      return true;
    }
  }

  me(): Observable<any> {
    return this.http.get(`${GATEWAY}/api/users/me`);
  }

  updateProfile(body: any): Observable<any> {
    return this.http.put(`${GATEWAY}/api/users/me`, body);
  }
}
