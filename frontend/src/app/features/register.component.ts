import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="card">
      <h2>Register</h2>
      <div class="form-grid">
        <input [(ngModel)]="name" name="name" placeholder="Full name">
        <input [(ngModel)]="email" name="email" placeholder="Email" type="email">
        <input [(ngModel)]="password" name="password" placeholder="Password (min 6 chars)" type="password">
        <button class="primary" (click)="submit()" [disabled]="!name || !email || !password">Create account</button>
      </div>
      <p class="error" *ngIf="error">{{ error }}</p>
      <p>Have an account? <a routerLink="/login">Login</a></p>
    </div>
  `
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit(): void {
    this.error = '';
    this.auth.register(this.name, this.email, this.password).subscribe({
      next: () => this.router.navigate(['/']),
      error: (e) => this.error = e.error?.message || 'Registration failed'
    });
  }
}
