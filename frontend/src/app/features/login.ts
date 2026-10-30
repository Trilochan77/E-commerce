import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../core/auth';
import { Toast } from '../shared/toast';

const GATEWAY = 'http://localhost:8080';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-side">
          <span class="hero-eyebrow">NEXTGEN SHOP</span>
          <h1>Welcome back</h1>
          <p class="auth-sub">AI rails and wallet rewards pick up where you left off.</p>
          <ul class="auth-points">
            <li><strong>Recommended for You</strong><span>personalized from views, searches, purchases</span></li>
            <li><strong>Condition-based returns</strong><span>transparent estimate vs final reward</span></li>
            <li><strong>Reward wallet</strong><span>1 pt = Rs.1, up to 20% off checkout</span></li>
          </ul>
        </div>
        <form class="auth-form" (ngSubmit)="submit()" #f="ngForm" novalidate>
          <h2>Login</h2>
          <p class="muted">Use your account or one-tap demo credentials.</p>
          <label>Email
            <input [(ngModel)]="email" name="email" type="email" autocomplete="email"
              placeholder="you@shop.com" required autofocus>
          </label>
          <div class="field-err" *ngIf="email && !validEmail()">Enter a valid email address.</div>
          <label>Password
            <span class="pwd-wrap">
              <input [(ngModel)]="password" name="password" [type]="show ? 'text' : 'password'"
                placeholder="••••••••" autocomplete="current-password" required style="flex:1">
              <button class="btn-ghost btn-sm" type="button" (click)="show=!show" [attr.aria-label]="show ? 'Hide password' : 'Show password'">{{ show ? 'Hide' : 'Show' }}</button>
            </span>
          </label>
          <button class="primary auth-submit" type="submit" [disabled]="!email || !password || !validEmail() || busy">
            <span class="spinner" *ngIf="busy"></span> {{ busy ? 'Logging in…' : 'Login' }}
          </button>
          <p class="error" *ngIf="error">{{ error }}</p>
          <!-- Example login removed -->
          <p class="auth-switch">No account? <a routerLink="/register" [queryParams]="returnUrl ? { returnUrl } : {}">Create one</a> · Admin? <a routerLink="/admin/login">Console sign in</a></p>
        </form>
      </div>
    </div>
  `
})
export class Login implements OnInit {
  email = '';
  password = '';
  error = '';
  busy = false;
  show = false;
  returnUrl = '';

  constructor(
    private auth: Auth,
    private router: Router,
    private route: ActivatedRoute,
    private toast: Toast,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '';
    if (this.auth.isLoggedIn()) {
      this.router.navigate([this.auth.isAdmin() ? '/admin' : (this.returnUrl || '/')]);
    }
  }

  validEmail(): boolean { return /.+@.+\..+/.test(this.email); }
  fill(e: string, p: string): void { this.email = e; this.password = p; this.error = ''; }

  private target(): string {
    if (this.returnUrl && !this.returnUrl.startsWith('/login') && !this.returnUrl.startsWith('/register')) {
      return this.returnUrl;
    }
    return this.auth.isAdmin() ? '/admin' : '/';
  }

  submit(): void {
    if (!this.email || !this.password || !this.validEmail() || this.busy) return;
    this.error = '';
    this.busy = true;
    this.http.post(`${GATEWAY}/api/users/login`, { email: this.email.trim(), password: this.password }).subscribe({
      next: (r: any) => {
        if (r?.role === 'ADMIN') {
          this.busy = false;
          this.error = 'Admin accounts must sign in from the Admin Console.';
          this.toast.err('Use Admin Console to login');
          this.router.navigate(['/admin/login']);
          return;
        }
        if (r?.token) {
          localStorage.setItem('ecom_token', r.token);
          localStorage.setItem('ecom_userId', r.userId || '');
          localStorage.setItem('ecom_role', r.role || 'CUSTOMER');
          localStorage.setItem('ecom_email', r.email || '');
        }
        this.toast.ok('Welcome back!');
        this.router.navigateByUrl(this.target());
      },
      error: (e) => {
        this.busy = false;
        const status = e?.status;
        this.error = status === 401
          ? 'Invalid email or password. Try a demo account below.'
          : (e.error?.message || 'Login failed — check email / password');
      }
    });
  }
}
