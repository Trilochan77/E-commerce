import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../core/auth';
import { AppLogo } from '../shared/app-logo';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterModule, AppLogo],
  template: `
    <div class="admin-shell">
      <aside class="admin-side">
        <div style="padding:4px 6px 14px 6px">
          <app-logo size="sm" link="/admin"></app-logo>
          <div class="muted" style="font-size:10.5px;letter-spacing:0.08em;margin-top:6px;font-weight:700">ADMIN COCKPIT</div>
        </div>
        <nav class="admin-nav" aria-label="Admin">
          <a routerLink="/admin/dashboard" routerLinkActive="active">📊 Overview</a>
          <a routerLink="/admin/products" routerLinkActive="active">📦 Product Catalog</a>
          <a routerLink="/admin/categories" routerLinkActive="active">🏷️ Categories</a>
          <a routerLink="/admin/orders" routerLinkActive="active">🛍️ Orders &amp; Logistics</a>
          <a routerLink="/admin/reviews" routerLinkActive="active">⭐ Review Moderation</a>
          <a routerLink="/admin/coupons" routerLinkActive="active">🎟️ Coupons &amp; Rewards</a>
          <a routerLink="/admin/reports" routerLinkActive="active">📈 Sales &amp; Stock Reports</a>
          <a routerLink="/admin/notifications" routerLinkActive="active">📢 Broadcast Alerts</a>
          <a routerLink="/admin/returns" routerLinkActive="active">🔄 Return Inspections</a>
          <a routerLink="/admin/users" routerLinkActive="active">👥 User Accounts</a>
        </nav>
        <div class="admin-side-foot">
          <a routerLink="/" style="color:var(--brand-3);font-weight:600">← Back to Store</a>
          <button class="btn-ghost btn-sm" (click)="logout()">Sign out</button>
        </div>
      </aside>
      <div class="admin-main">
        <header class="admin-top">
          <div>
            <div class="breadcrumb">Admin / {{ section() }}</div>
            <strong>{{ email() }}</strong>
          </div>
          <span class="badge violet">ADMIN CLEARANCE</span>
        </header>
        <div class="admin-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `
})
export class AdminLayout {
  constructor(public auth: Auth, private router: Router) {}

  email(): string {
    return localStorage.getItem('ecom_email') || 'admin@shop.com';
  }

  section(): string {
    const parts = this.router.url.split('?')[0].split('/');
    return parts[2] || 'dashboard';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}
