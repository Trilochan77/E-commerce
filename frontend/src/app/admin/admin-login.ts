import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Auth } from '../core/auth';
import { Toast } from '../shared/toast';
import { AppLogo } from '../shared/app-logo';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-admin-login',
  imports: [CommonModule, FormsModule, RouterModule, AppLogo],
  template: `
    <div class="admin-login-page">
      <form class="admin-login-card" (ngSubmit)="submit()" novalidate>
        <div class="admin-login-brand" style="margin-bottom:12px">
          <app-logo size="md" link="/admin"></app-logo>
          <div class="muted" style="font-size:11px;font-weight:700;letter-spacing:0.06em;margin-top:4px">RESTRICTED ADMIN CONSOLE</div>
        </div>
        <h1>Admin Sign In</h1>
        <p class="muted">Customer accounts are rejected here. Use <a routerLink="/login">customer login</a> for shopping.</p>
        <label>Admin email
          <input [(ngModel)]="email" name="email" type="email" autocomplete="username"
            placeholder="admin@shop.com" required autofocus>
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
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
  }

  validEmail(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
  }

  submit(): void {
    if (!this.validEmail() || !this.password || this.busy) return;
    this.busy = true;
    this.error = '';
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: (u: any) => {
        this.busy = false;
        if (u.role !== 'ADMIN') {
          this.auth.logout();
          this.error = 'Access denied: not an admin account. Use customer login instead.';
          return;
        }
        this.toast.ok('Welcome, admin');
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (e) => {
        this.busy = false;
        this.error = e.error?.message || 'Invalid admin credentials';
      }
    });
  }
}
