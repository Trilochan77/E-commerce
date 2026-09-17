import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="card">
      <h2>Login</h2>
      <div class="form-grid">
        <input [(ngModel)]="email" name="email" placeholder="Email" type="email">
        <input [(ngModel)]="password" name="password" placeholder="Password" type="password">
        <button class="primary" (click)="submit()" [disabled]="!email || !password">Login</button>
      </div>
      <p class="error" *ngIf="error">{{ error }}</p>
      <p>No account? <a routerLink="/register">Register</a></p>
      <p class="muted">Demo admin: admin@shop.com / Admin@123</p>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit(): void {
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate([this.auth.isAdmin() ? '/admin' : '/']),
      error: (e) => this.error = e.error?.message || 'Login failed'
    });
  }
}
