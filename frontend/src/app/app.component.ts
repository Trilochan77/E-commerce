import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="nav">
      <a routerLink="/">Shop</a>
      <a routerLink="/products">Products</a>
      <a routerLink="/cart" *ngIf="auth.isLoggedIn()">Cart</a>
      <a routerLink="/orders" *ngIf="auth.isLoggedIn()">Orders</a>
      <a routerLink="/returns" *ngIf="auth.isLoggedIn()">Returns</a>
      <a routerLink="/wallet" *ngIf="auth.isLoggedIn()">Wallet</a>
      <a routerLink="/admin" *ngIf="auth.isAdmin()">Admin</a>
      <span class="spacer"></span>
      <a routerLink="/profile" *ngIf="auth.isLoggedIn()">Profile</a>
      <a routerLink="/login" *ngIf="!auth.isLoggedIn()">Login</a>
      <a routerLink="/register" *ngIf="!auth.isLoggedIn()">Register</a>
      <button *ngIf="auth.isLoggedIn()" (click)="logout()">Logout</button>
    </nav>
    <div class="container"><router-outlet></router-outlet></div>
  `
})
export class AppComponent {
  constructor(public auth: AuthService, private router: Router) {}
  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
