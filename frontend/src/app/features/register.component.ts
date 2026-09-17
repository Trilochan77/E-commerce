import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
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
          <h2>Create account</h2>
          <p class="muted">One account for shop, orders, returns and rewards.</p>
          <label>Full name
            <input [(ngModel)]="name" name="name" placeholder="Aarav Sharma" autocomplete="name" required autofocus>
          </label>
          <div class="field-err" *ngIf="name && name.trim().length < 2">Enter your name (min 2 characters).</div>
          <label>Email
            <input [(ngModel)]="email" name="email" type="email" placeholder="you@shop.com" autocomplete="email" required>
          </label>
          <div class="field-err" *ngIf="email && !validEmail()">Enter a valid email.</div>
          <label>Password
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
          <button class="primary auth-submit" type="submit" [disabled]="!canSubmit() || busy">
            <span class="spinner" *ngIf="busy"></span> {{ busy ? 'Creating…' : 'Create account' }}
          </button>
          <p class="error" *ngIf="error">{{ error }}</p>
          <p class="auth-switch">Have an account? <a routerLink="/login" [queryParams]="returnUrl ? { returnUrl } : {}">Login</a></p>
        </form>
      </div>
    </div>
  `
})
export class RegisterComponent implements OnInit {
  name = '';
  email = '';
  password = '';
  confirm = '';
  error = '';
  busy = false;
  show = false;
  returnUrl = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '';
    if (this.auth.isLoggedIn()) {
      this.router.navigate([this.auth.isAdmin() ? '/admin' : (this.returnUrl || '/')]);
    }
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
    return this.name.trim().length >= 2
      && this.validEmail()
      && this.password.length >= 6
      && this.confirm === this.password;
  }

  submit(): void {
    if (!this.canSubmit() || this.busy) return;
    this.error = '';
    this.busy = true;
    this.auth.register(this.name.trim(), this.email.trim(), this.password).subscribe({
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
          : (e.error?.message || 'Registration failed (email may exist)');
      }
    });
  }
}
