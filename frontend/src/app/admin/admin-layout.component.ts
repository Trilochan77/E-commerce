import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-shell">
      <aside class="admin-side">
        <a routerLink="/admin" class="admin-brand">
          <span class="brand-mark">N</span>
          <span>Admin Console<small>NextGen Shop</small></span>
        </a>
        <nav class="admin-nav" aria-label="Admin">
          <a routerLink="/admin/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/admin/products" routerLinkActive="active">Products</a>
          <a routerLink="/admin/categories" routerLinkActive="active">Categories</a>
          <a routerLink="/admin/orders" routerLinkActive="active">Orders</a>
          <a routerLink="/admin/returns" routerLinkActive="active">Returns</a>
          <a routerLink="/admin/users" routerLinkActive="active">Users</a>
        </nav>
        <div class="admin-side-foot">
          <a routerLink="/">Back to shop</a>
          <button class="btn-ghost btn-sm" (click)="logout()">Logout</button>
        </div>
      </aside>
      <div class="admin-main">
        <header class="admin-top">
          <div>
            <div class="breadcrumb">Admin / {{ section() }}</div>
            <strong>{{ email() }}</strong>
          </div>
          <span class="badge violet">ADMIN</span>
        </header>
        <div class="admin-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `
})
export class AdminLayoutComponent {
  constructor(public auth: AuthService, private router: Router) {}

  email(): string {
    return localStorage.getItem('ecom_email') || 'admin@shop.com';
  }

  section(): string {
    const parts = this.router.url.split('?')[0].split('/');
    return parts[2] || 'dashboard';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
