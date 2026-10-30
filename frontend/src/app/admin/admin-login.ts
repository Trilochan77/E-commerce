import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Auth } from '../core/auth';
import { Toast } from '../shared/toast';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-admin-login',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-login-page">
      <form class="admin-login-card" (ngSubmit)="submit()" novalidate>
        <div class="admin-login-brand">
          <span class="brand-mark">N</span>
          <div><strong>Admin Console</strong><span>Restricted access · NextGen Shop</span></div>
        </div>
        <h1>Admin sign in</h1>
        <p class="muted">Customer accounts are rejected here. Use <a routerLink="/login">shop login</a> for shopping.</p>
        <label>Admin email
          <input [(ngModel)]="email" name="email" type="email" autocomplete="username"
            placeholder="trilochan@nextgen.com" required autofocus>
        </label>
        <div class="field-err" *ngIf="email && !validEmail()">Enter a valid email address.</div>
        <label>Password
          <span class="pwd-wrap">
            <input [(ngModel)]="password" name="password" [type]="show ? 'text' : 'password'"
              placeholder="••••••••" autocomplete="current-password" required style="flex:1">
            <button class="btn-ghost btn-sm" type="button" (click)="show=!show">{{ show ? 'Hide' : 'Show' }}</button>
          </span>
        </label>
        <button class="primary auth-submit" type="submit" [disabled]="!email || !password || !validEmail() || busy">
          <span class="spinner" *ngIf="busy"></span> {{ busy ? 'Verifying…' : 'Sign in to console' }}
        </button>
        <p class="error" *ngIf="error">{{ error }}</p>
        <!-- Demo admin removed -->
        <p class="auth-switch"><a routerLink="/">Back to shop</a> · <a routerLink="/login">Customer login</a></p>
      </form>
    </div>
  `
})
export class AdminLogin implements OnInit {
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
    private toast: Toast
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/admin/dashboard';
    if (this.auth.isLoggedIn() && this.auth.isAdmin()) {
      this.router.navigateByUrl(this.returnUrl);
    }
  }

  validEmail(): boolean { return /.+@.+\..+/.test(this.email); }
  fill(): void { this.error = ''; }

  submit(): void {
    if (!this.email || !this.password || !this.validEmail() || this.busy) return;
    this.error = '';
    this.busy = true;
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: () => {
        if (!this.auth.isAdmin()) {
          this.auth.logout();
          this.busy = false;
          this.error = 'This account is CUSTOMER — admin access required. Use shop login.';
          return;
        }
        this.toast.ok('Welcome, Admin!');
        const target = this.returnUrl.startsWith('/admin') ? this.returnUrl : '/admin/dashboard';
        this.router.navigateByUrl(target);
      },
      error: (e) => {
        this.busy = false;
        this.error = e?.status === 401
          ? 'Invalid admin credentials.'
          : (e.error?.message || 'Admin login failed');
      }
    });
  }
}
