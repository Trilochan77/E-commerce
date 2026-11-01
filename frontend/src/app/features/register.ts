import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Auth } from '../core/auth';
import { Toast } from '../shared/toast';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-side">
          <span class="hero-eyebrow">JOIN IN 30 SECONDS</span>
          <h1>Earn from day one</h1>
          <p class="auth-sub">Wallet auto-created on signup. Returns earn up to 80% back.</p>
          <ul class="auth-points">
            <li><strong>No card required</strong><span>mock COD / UPI / Card checkout</span></li>
            <li><strong>Smart from first search</strong><span>cold-start falls back to trending</span></li>
            <li><strong>Transparent tracking</strong><span>order → return → wallet timeline</span></li>
          </ul>
        </div>
        <form class="auth-form" (ngSubmit)="submit()" novalidate>
          <h2>{{ stepTitle() }}</h2>
          <p class="muted">{{ stepSubtitle() }}</p>

          <!-- STEP 1: email -->
          <div *ngIf="step === 1">
            <label>Email
              <input [(ngModel)]="email" name="email" type="email" autocomplete="email"
                placeholder="you@shop.com" required autofocus>
            </label>
            <div class="field-err" *ngIf="email && !validEmail()">Enter a valid email address.</div>
            <div class="row">
              <button class="primary" type="submit"
                [disabled]="!email || !validEmail() || busy">
                <span class="spinner" *ngIf="busy"></span>
                {{ busy ? 'Sending OTP…' : 'Send OTP' }}
              </button>
            </div>
          </div>

          <!-- STEP 2: verify OTP -->
          <div *ngIf="step === 2">
            <p class="muted">A 6-digit OTP was sent to <strong>{{ maskedEmail() }}</strong>.</p>
            <label>OTP code
              <input [(ngModel)]="otpCode" name="otpCode" inputmode="numeric" maxlength="6"
                placeholder="123456" autocomplete="one-time-code" required autofocus>
            </label>
            <div class="field-err" *ngIf="otpCode && otpCode.length !== 6">Enter the 6-digit code.</div>
            <div class="row" style="gap:8px">
              <button type="button" class="btn-ghost" (click)="resend()" [disabled]="busy">
                {{ busy ? '…' : 'Resend OTP' }}
              </button>
              <button class="primary" type="submit" [disabled]="!otpCode || otpCode.length !== 6 || busy">
                <span class="spinner" *ngIf="busy"></span>
                {{ busy ? 'Verifying…' : 'Verify OTP' }}
              </button>
            </div>
          </div>

          <!-- STEP 3: set name + password -->
          <div *ngIf="step === 3">
            <label>Full name
              <input [(ngModel)]="name" name="name" placeholder="Trilochan Sahoo" autocomplete="name" required autofocus>
            </label>
            <div class="field-err" *ngIf="name && name.trim().length < 2">Enter your name (min 2 characters).</div>
            <label>Set password
              <span class="pwd-wrap">
                <input [(ngModel)]="password" name="password" [type]="show ? 'text' : 'password'"
                  placeholder="Min 6 characters" autocomplete="new-password" required style="flex:1">
                <button class="btn-ghost btn-sm" type="button" (click)="show=!show">{{ show ? 'Hide' : 'Show' }}</button>
              </span>
            </label>
            <div class="strength-row">
              <div class="strength-segs">
                <span [class.on]="strengthPct() >= 25"></span>
                <span [class.on]="strengthPct() >= 50"></span>
                <span [class.on]="strengthPct() >= 75"></span>
                <span [class.on]="strengthPct() >= 100"></span>
              </div>
              <span class="muted">Strength: <strong>{{ strength() }}</strong></span>
            </div>
            <label>Confirm password
              <input [(ngModel)]="confirm" name="confirm" [type]="show ? 'text' : 'password'"
                placeholder="Repeat password" autocomplete="new-password" required>
            </label>
            <div class="field-err" *ngIf="confirm && confirm !== password">Passwords do not match.</div>
            <button class="primary auth-submit" type="submit"
              [disabled]="!canSubmit() || busy">
              <span class="spinner" *ngIf="busy"></span>
              {{ busy ? 'Creating account…' : 'Create account' }}
            </button>
          </div>

          <p class="error" *ngIf="error">{{ error }}</p>
          <p class="auth-switch">Have an account? <a routerLink="/login" [queryParams]="returnUrl ? { returnUrl } : {}">Login</a></p>
        </form>
      </div>
    </div>
  `
})
export class Register implements OnInit {
  step = 1;                      // 1 = email, 2 = otp, 3 = set-password
  email = '';
  otpCode = '';
  otpToken = '';
  name = '';
  password = '';
  confirm = '';
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
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '';
    if (this.auth.isLoggedIn()) {
      this.router.navigate([this.auth.isAdmin() ? '/admin' : (this.returnUrl || '/')]);
    }
  }

  stepTitle(): string {
    switch (this.step) {
      case 1: return 'Create account';
      case 2: return 'Verify your email';
      case 3: return 'Set your password';
      default: return 'Create account';
    }
  }

  stepSubtitle(): string {
    switch (this.step) {
      case 1: return 'One account for shop, orders, returns and rewards.';
      case 2: return 'Enter the 6-digit code sent to your inbox.';
      case 3: return 'Finish by choosing your name and a password.';
      default: return '';
    }
  }

  maskedEmail(): string {
    const at = this.email.indexOf('@');
    if (at < 0) return this.email;
    return this.email.slice(0, 2) + '****' + this.email.slice(at);
  }

  validEmail(): boolean { return /.+@.+\..+/.test(this.email); }

  strength(): string {
    if (this.password.length < 6) return 'Too short';
    if (this.password.length < 9) return 'Okay';
    return /[^A-Za-z0-9]/.test(this.password) ? 'Strong' : 'Good';
  }

  strengthPct(): number {
    if (!this.password) return 0;
    let s = Math.min(100, (this.password.length / 12) * 100);
    if (/[^A-Za-z0-9]/.test(this.password)) s = Math.min(100, s + 15);
    if (/[A-Z]/.test(this.password) && /[a-z]/.test(this.password)) s = Math.min(100, s + 10);
    return s;
  }

  canSubmit(): boolean {
    if (this.step === 3) {
      return this.name.trim().length >= 2
        && this.password.length >= 6
        && this.confirm === this.password;
    }
    return true;
  }

  resend(): void {
    if (!this.email || this.busy) return;
    this.error = '';
    this.busy = true;
    this.auth.sendOtp(this.email.trim()).subscribe({
      next: () => { this.busy = false; this.toast.ok('A new OTP was sent.'); },
      error: () => { this.busy = false; this.error = 'Could not resend OTP. Try again.'; }
    });
  }

  submit(): void {
    if (this.busy) return;
    this.error = '';

    if (this.step === 1) {
      if (!this.email || !this.validEmail()) return;
      this.busy = true;
      this.auth.sendOtp(this.email.trim()).subscribe({
        next: () => {
          this.busy = false;
          this.step = 2;
        },
        error: (e) => {
          this.busy = false;
          this.error = e?.status === 409
            ? 'This email is already registered. Try logging in.'
            : (e.error?.message || 'Could not send OTP');
        }
      });
      return;
    }

    if (this.step === 2) {
      if (!this.otpCode || this.otpCode.length !== 6) return;
      this.busy = true;
      this.auth.verifyOtp(this.email.trim(), this.otpCode).subscribe({
        next: (r: any) => {
          this.busy = false;
          this.otpToken = r?.otpToken || '';
          if (this.otpToken) {
            this.step = 3;
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
      return;
    }

    // step 3
    if (!this.canSubmit()) return;
    this.busy = true;
    this.auth.registerViaOtp(this.otpToken, this.name.trim(), this.password).subscribe({
      next: () => {
        this.toast.ok('Account created — wallet ready!');
        const target = this.returnUrl && !this.returnUrl.startsWith('/login') && !this.returnUrl.startsWith('/register')
          ? this.returnUrl : '/';
        this.router.navigateByUrl(target);
      },
      error: (e) => {
        this.busy = false;
        this.error = e?.status === 409
          ? 'This email is already registered. Try logging in.'
          : (e.error?.message || 'Registration failed');
      }
    });
  }
}
