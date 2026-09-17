import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="card auth-split">
      <div class="auth-panel">
        <span class="hero-eyebrow">JOIN IN 30 SECONDS</span>
        <h1 style="font-size:30px">Earn from day one ⭐</h1>
        <p style="color:#e0e7ff">Wallet auto-created on signup. Returns earn up to 80% back.</p>
        <ul><li>✅ No card required</li><li>🧠 Recommendations from first search</li><li>↩️ Transparent return tracking</li></ul>
      </div>
      <div class="auth-form">
        <h2>Create account</h2>
        <div class="form-grid">
          <label>Full name<input [(ngModel)]="name" name="name" placeholder="Aarav Sharma" autocomplete="name"></label>
          <label>Email<input [(ngModel)]="email" name="email" placeholder="you@shop.com" type="email" autocomplete="email"></label>
          <div class="field-err" *ngIf="email && !validEmail()">Enter a valid email.</div>
          <label>Password<input [(ngModel)]="password" name="password" placeholder="Min 6 characters" type="password" autocomplete="new-password"></label>
          <div class="muted">Strength: <strong>{{ strength() }}</strong></div>
          <div class="progress"><div [style.width.%]="strengthPct()"></div></div>
          <button class="primary" (click)="submit()" [disabled]="!name || !email || password.length<6 || busy">{{ busy ? 'Creating…' : 'Create account →' }}</button>
        </div>
        <p class="error" *ngIf="error">{{ error }}</p>
        <p>Have an account? <a routerLink="/login">Login</a></p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  error = '';
  busy = false;

  constructor(private auth: AuthService, private router: Router, private toast: ToastService) {}

  strength(): string {
    if (this.password.length < 6) return 'Too short';
    if (this.password.length < 9) return 'Okay';
    return /[^A-Za-z0-9]/.test(this.password) ? 'Strong' : 'Good';
  }
  strengthPct(): number {
    return Math.min(100, (this.password.length / 12) * 100);
  }
  validEmail(): boolean { return this.email.indexOf('@') > 0 && this.email.indexOf('.') > 2; }

  submit(): void {
    this.error = ''; this.busy = true;
    this.auth.register(this.name, this.email, this.password).subscribe({
      next: () => { this.toast.ok('Account created — wallet ready!'); this.router.navigate(['/']); },
      error: (e) => { this.error = e.error?.message || 'Registration failed (email may exist)'; this.busy = false; }
    });
  }
}
