import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Auth } from '../core/auth';
import { Toast } from '../shared/toast';

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
          <h2>{{ modeTitle() }}</h2>
          <p class="muted">{{ modeSubtitle() }}</p>

          <!-- sign-in / password-reset method selector -->
          <div class="row" style="margin-bottom:14px">
            <button type="button" class="btn-ghost"
              [class.on]="mode === 'password'"
              (click)="switchMode('password')">Password</button>
            <button type="button" class="btn-ghost"
              [class.on]="mode === 'otp'"
              (click)="switchMode('otp')">OTP</button>
            <button type="button" class="btn-ghost"
              [class.on]="mode === 'forgot'"
              (click)="switchMode('forgot')">Forgot password</button>
          </div>

          <!-- METHOD 1: password login -->
          <div *ngIf="mode === 'password'">
            <label>Email
              <input [(ngModel)]="email" name="email" type="email" autocomplete="email"
                placeholder="you@shop.com" required autofocus>
            </label>
            <div class="field-err" *ngIf="email && !validEmail()">Enter a valid email address.</div>
            <label>Password
              <span class="pwd-wrap">
                <input [(ngModel)]="password" name="password" [type]="show ? 'text' : 'password'"
                  placeholder="••••••••" autocomplete="current-password" required style="flex:1">
                <button class="btn-ghost btn-sm" type="button" (click)="show=!show"
                  [attr.aria-label]="show ? 'Hide password' : 'Show password'">{{ show ? 'Hide' : 'Show' }}</button>
              </span>
            </label>
          </div>

          <!-- METHOD 2: OTP login -->
          <div *ngIf="mode === 'otp' && otpStep === 1">
            <label>Email
              <input [(ngModel)]="email" name="emailOtp" type="email" autocomplete="email"
                placeholder="you@shop.com" required autofocus>
            </label>
            <div class="field-err" *ngIf="email && !validEmail()">Enter a valid email address.</div>
            <button type="button" class="primary" (click)="sendLoginOtp()" [disabled]="!email || !validEmail() || busy">
              <span class="spinner" *ngIf="busy"></span>
              {{ busy ? 'Sending OTP…' : 'Send OTP' }}
            </button>
          </div>

          <div *ngIf="mode === 'otp' && otpStep === 2">
            <p class="muted">A 6-digit OTP was sent to <strong>{{ maskedEmail() }}</strong>.</p>
            <label>OTP code
              <input [(ngModel)]="otpCode" name="otpCode" inputmode="numeric" maxlength="6"
                placeholder="123456" autocomplete="one-time-code" required autofocus>
            </label>
            <div class="field-err" *ngIf="otpCode && otpCode.length !== 6">Enter the 6-digit code.</div>
            <div class="row" style="gap:8px">
              <button type="button" class="btn-ghost" (click)="resendLoginOtp()" [disabled]="busy">
                {{ busy ? '…' : 'Resend OTP' }}
              </button>
              <button class="primary" type="submit" [disabled]="!otpCode || otpCode.length !== 6 || busy">
                <span class="spinner" *ngIf="busy"></span>
                {{ busy ? 'Logging in…' : 'Login with OTP' }}
              </button>
            </div>
          </div>

          <!-- METHOD 3: forgot password -->
          <div *ngIf="mode === 'forgot' && forgotStep === 1">
            <label>Email
              <input [(ngModel)]="email" name="emailForgot" type="email" autocomplete="email"
                placeholder="you@shop.com" required autofocus>
            </label>
            <div class="field-err" *ngIf="email && !validEmail()">Enter a valid email address.</div>
            <button type="button" class="primary" (click)="sendForgotOtp()" [disabled]="!email || !validEmail() || busy">
              <span class="spinner" *ngIf="busy"></span>
              {{ busy ? 'Sending OTP…' : 'Send OTP' }}
            </button>
          </div>

          <div *ngIf="mode === 'forgot' && forgotStep === 2">
            <p class="muted">A 6-digit OTP was sent to <strong>{{ maskedEmail() }}</strong>.</p>
            <label>OTP code
              <input [(ngModel)]="otpCode" name="otpCodeForgot" inputmode="numeric" maxlength="6"
                placeholder="123456" autocomplete="one-time-code" required autofocus>
            </label>
            <div class="field-err" *ngIf="otpCode && otpCode.length !== 6">Enter the 6-digit code.</div>
            <div class="row" style="gap:8px">
              <button type="button" class="btn-ghost" (click)="resendForgotOtp()" [disabled]="busy">
                {{ busy ? '…' : 'Resend OTP' }}
              </button>
              <button class="primary" type="button" (click)="verifyForgotOtp()" [disabled]="!otpCode || otpCode.length !== 6 || busy">
                <span class="spinner" *ngIf="busy"></span>
                {{ busy ? 'Verifying…' : 'Verify OTP' }}
              </button>
            </div>
          </div>

          <div *ngIf="mode === 'forgot' && forgotStep === 3">
            <p class="muted">OTP verified. Set your new password.</p>
            <label>New password
              <span class="pwd-wrap">
                <input [(ngModel)]="newPassword" name="newPassword" [type]="showNew ? 'text' : 'password'"
                  placeholder="Min 6 characters" autocomplete="new-password" required style="flex:1">
                <button class="btn-ghost btn-sm" type="button" (click)="showNew=!showNew"
                  [attr.aria-label]="showNew ? 'Hide password' : 'Show password'">{{ showNew ? 'Hide' : 'Show' }}</button>
              </span>
            </label>
            <div class="field-err" *ngIf="newPassword && newPassword.length < 6">Password must be at least 6 characters.</div>
            <label>Confirm new password
              <input [(ngModel)]="confirmNew" name="confirmNew" [type]="showNew ? 'text' : 'password'"
                placeholder="Repeat password" autocomplete="new-password" required>
            </label>
            <div class="field-err" *ngIf="confirmNew && confirmNew !== newPassword">Passwords do not match.</div>
            <button class="primary auth-submit" type="submit"
              [disabled]="!newPassword || newPassword.length < 6 || confirmNew !== newPassword || busy">
              <span class="spinner" *ngIf="busy"></span>
              {{ busy ? 'Resetting…' : 'Reset password' }}
            </button>
          </div>

          <button class="primary auth-submit" type="submit"
            *ngIf="mode === 'password'"
            [disabled]="!email || !password || !validEmail() || busy">
            <span class="spinner" *ngIf="busy"></span>
            {{ busy ? 'Logging in…' : 'Login' }}
          </button>

          <p class="error" *ngIf="error">{{ error }}</p>
          <p class="auth-switch">No account? <a routerLink="/register" [queryParams]="returnUrl ? { returnUrl } : {}">Create one</a> · Admin? <a routerLink="/admin/login">Console sign in</a></p>
        </form>
      </div>
    </div>
  `
})
export class Login implements OnInit {
  mode = 'password';        // 'password' | 'otp' | 'forgot'
  otpStep = 1;              // 1 = send email, 2 = enter code (for OTP login)
  forgotStep = 1;           // 1 = send email, 2 = enter code, 3 = set new password (for forgot)
  email = '';
  password = '';
  otpCode = '';
  newPassword = '';
  confirmNew = '';
  error = '';
  busy = false;
  show = false;
  showNew = false;
  returnUrl = '';

  constructor(
    private auth: Auth,
    private router: Router,
    private route: ActivatedRoute,
    private toast: Toast
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '';
    if (this.auth.isLoggedIn()) {
      this.router.navigate([this.auth.isAdmin() ? '/admin' : (this.returnUrl || '/')]);
    }
  }

  modeTitle(): string {
    switch (this.mode) {
      case 'password': return 'Login';
      case 'otp': return 'Login with OTP';
      case 'forgot': return 'Forgot password';
      default: return 'Login';
    }
  }

  modeSubtitle(): string {
    switch (this.mode) {
      case 'password': return 'Sign in with your email and password.';
      case 'otp': return 'Sign in with a one-time code sent to your email.';
      case 'forgot': return 'Reset your password using a one-time code sent to your email.';
      default: return '';
    }
  }

  switchMode(m: string): void {
    this.mode = m;
    this.otpStep = 1;
    this.forgotStep = 1;
    this.error = '';
    this.email = '';
    this.password = '';
    this.otpCode = '';
    this.newPassword = '';
    this.confirmNew = '';
  }

  validEmail(): boolean { return /.+@.+\..+/.test(this.email); }

  maskedEmail(): string {
    const at = this.email.indexOf('@');
    if (at < 0) return this.email;
    return this.email.slice(0, 2) + '****' + this.email.slice(at);
  }

  private target(): string {
    if (this.returnUrl && !this.returnUrl.startsWith('/login') && !this.returnUrl.startsWith('/register')) {
      return this.returnUrl;
    }
    return this.auth.isAdmin() ? '/admin' : '/';
  }

  /* ---------- Password login ---------- */
  sendLoginOtp(): void {
    if (!this.email || !this.validEmail() || this.busy) return;
    this.error = '';
    this.busy = true;
    this.auth.sendOtp(this.email.trim()).subscribe({
      next: () => { this.busy = false; this.otpStep = 2; },
      error: (e) => {
        this.busy = false;
        this.error = e?.status === 409
          ? 'This email is already registered. Try the Password tab.'
          : (e.error?.message || 'Could not send OTP');
      }
    });
  }

  resendLoginOtp(): void {
    if (!this.email || this.busy) return;
    this.error = '';
    this.busy = true;
    this.auth.sendOtp(this.email.trim()).subscribe({
      next: () => { this.busy = false; this.toast.ok('A new OTP was sent.'); },
      error: () => { this.busy = false; this.error = 'Could not resend OTP. Try again.'; }
    });
  }

  /* ---------- Forgot password ---------- */
  sendForgotOtp(): void {
    if (!this.email || !this.validEmail() || this.busy) return;
    this.error = '';
    this.busy = true;
    this.auth.forgotPassword(this.email.trim()).subscribe({
      next: () => { this.busy = false; this.forgotStep = 2; },
      error: (e) => {
        this.busy = false;
        this.error = e.error?.message || 'Could not send OTP';
      }
    });
  }

  resendForgotOtp(): void {
    if (!this.email || this.busy) return;
    this.error = '';
    this.busy = true;
    this.auth.forgotPassword(this.email.trim()).subscribe({
      next: () => { this.busy = false; this.toast.ok('A new OTP was sent.'); },
      error: () => { this.busy = false; this.error = 'Could not resend OTP. Try again.'; }
    });
  }

  verifyForgotOtp(): void {
    if (!this.otpCode || this.otpCode.length !== 6 || this.busy) return;
    this.error = '';
    this.busy = true;
    this.auth.verifyOtp(this.email.trim(), this.otpCode).subscribe({
      next: (r: any) => {
        this.busy = false;
        const otpToken = r?.otpToken || '';
        if (otpToken) {
          this.forgotStep = 3;
        } else {
          this.error = 'Verification failed — try again.';
        }
      },
      error: (e) => {
        this.busy = false;
        this.error = e?.status === 400 || e?.status === 401
          ? 'Invalid or expired OTP. Request a new one.'
          : (e.error?.message || 'Verification failed');
      }
    });
  }

  /* ---------- submit handler ---------- */
  submit(): void {
    if (this.busy) return;
    this.error = '';

    if (this.mode === 'password') {
      if (!this.email || !this.password || !this.validEmail()) return;
      this.busy = true;
      this.auth.login(this.email.trim(), this.password).subscribe({
        next: (r: any) => {
          if (r?.role === 'ADMIN') {
            this.busy = false;
            this.error = 'Admin accounts must sign in from the Admin Console.';
            this.toast.err('Use Admin Console to login');
            this.router.navigate(['/admin/login']);
            return;
          }
          localStorage.setItem('ecom_token', r.token);
          localStorage.setItem('ecom_userId', r.userId || '');
          localStorage.setItem('ecom_role', r.role || 'CUSTOMER');
          localStorage.setItem('ecom_email', r.email || '');
          localStorage.setItem('ecom_name', r.name || '');
          this.toast.ok('Welcome back!');
          this.router.navigateByUrl(this.target());
        },
        error: (e) => {
          this.busy = false;
          const status = e?.status;
          this.error = status === 401
            ? 'Invalid email or password.'
            : (e.error?.message || 'Login failed — check email / password');
        }
      });
      return;
    }

    if (this.mode === 'forgot') {
      if (!this.newPassword || this.newPassword.length < 6 || this.confirmNew !== this.newPassword) return;
      this.busy = true;
      this.auth.resetPassword(this.otpCode, this.newPassword).subscribe({
        next: (r: any) => {
          this.busy = false;
          localStorage.setItem('ecom_token', r.token);
          localStorage.setItem('ecom_userId', r.userId || '');
          localStorage.setItem('ecom_role', r.role || 'CUSTOMER');
          localStorage.setItem('ecom_email', r.email || '');
          localStorage.setItem('ecom_name', r.name || '');
          this.toast.ok('Password reset — welcome back!');
          this.router.navigateByUrl(this.target());
        },
        error: (e) => {
          this.busy = false;
          this.error = e?.status === 401 || e?.status === 404
            ? 'OTP session expired — start over.'
            : (e.error?.message || 'Password reset failed');
        }
      });
      return;
    }

    // OTP login
    if (!this.otpCode || this.otpCode.length !== 6) return;
    this.busy = true;
    this.auth.verifyOtp(this.email.trim(), this.otpCode).subscribe({
      next: (r: any) => {
        const otpToken = r?.otpToken || '';
        if (!otpToken) {
          this.busy = false;
          this.error = 'Verification failed — try again.';
          return;
        }
        this.auth.loginViaOtp(otpToken).subscribe({
          next: (rr: any) => {
            if (rr?.role === 'ADMIN') {
              this.busy = false;
              this.error = 'Admin accounts must sign in from the Admin Console.';
              this.toast.err('Use Admin Console to login');
              this.router.navigate(['/admin/login']);
              return;
            }
            localStorage.setItem('ecom_token', rr.token);
            localStorage.setItem('ecom_userId', rr.userId || '');
            localStorage.setItem('ecom_role', rr.role || 'CUSTOMER');
            localStorage.setItem('ecom_email', rr.email || '');
            localStorage.setItem('ecom_name', rr.name || '');
            this.toast.ok('Welcome back!');
            this.router.navigateByUrl(this.target());
          },
          error: (e) => {
            this.busy = false;
            this.error = e?.status === 401 || e?.status === 404
              ? 'No account for this email — register first.'
              : (e.error?.message || 'OTP login failed');
          }
        });
      },
      error: (e) => {
        this.busy = false;
        this.error = e?.status === 400 || e?.status === 401
          ? 'Invalid or expired OTP. Request a new one.'
          : (e.error?.message || 'Verification failed');
      }
    });
  }
}
