import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="card auth-split">
      <div class="auth-panel">
        <span class="hero-eyebrow">NEXTGEN SHOP</span>
        <h1 style="font-size:30px">Welcome back 👋</h1>
        <p style="color:#e0e7ff">AI rails + wallet rewards pick up where you left off.</p>
        <ul><li>🧠 Personalized “Recommended for You”</li><li>↩️ Track condition-based returns</li><li>⭐ Spend wallet points (20% cap)</li></ul>
      </div>
      <div class="auth-form">
        <h2>Login</h2>
        <p class="muted">Use your account or one-tap demo credentials.</p>
        <div class="form-grid">
          <label>Email<input [(ngModel)]="email" name="email" placeholder="you@shop.com" type="email" autocomplete="email"></label>
          <div class="field-err" *ngIf="email && !validEmail()">Enter a valid email address.</div>
          <label>Password
            <span style="display:flex;gap:6px"><input [(ngModel)]="password" name="password" [type]="show ? 'text' : 'password'" placeholder="••••••••" autocomplete="current-password" style="flex:1">
            <button class="btn-ghost btn-sm" type="button" (click)="show=!show">{{ show ? 'Hide' : 'Show' }}</button></span>
          </label>
          <button class="primary" (click)="submit()" [disabled]="!email || !password || !validEmail() || busy">{{ busy ? 'Logging in…' : 'Login →' }}</button>
        </div>
        <p class="error" *ngIf="error">{{ error }}</p>
        <div class="demo-box" style="margin-top:12px">
          <strong>Demo accounts</strong>
          <div class="row">
            <button class="btn-ghost btn-sm" (click)="fill('admin@shop.com','Admin@123')">Admin</button>
            <button class="btn-ghost btn-sm" (click)="fill('user@shop.com','User@123')">Customer</button>
          </div>
        </div>
        <p>No account? <a routerLink="/register">Create one</a></p>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  busy = false;
  show = false;

  constructor(private auth: AuthService, private router: Router, private toast: ToastService) {}

  validEmail(): boolean { return /.+@.+\..+/.test(this.email); }
  fill(e: string, p: string): void { this.email = e; this.password = p; }

  submit(): void {
    this.error = ''; this.busy = true;
    this.auth.login(this.email, this.password).subscribe({
      next: () => { this.toast.ok('Welcome back!'); this.router.navigate([this.auth.isAdmin() ? '/admin' : '/']); },
      error: (e) => { this.error = e.error?.message || 'Login failed — check email / password'; this.busy = false; }
    });
  }
}
