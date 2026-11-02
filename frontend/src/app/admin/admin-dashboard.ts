import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Shop } from '../core/shop';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-head">
      <div>
        <h1>Store Cockpit</h1>
        <p class="muted">Live store vitals, inventory alerts, orders, and moderation queues.</p>
      </div>
      <button class="btn-ghost btn-sm" (click)="load()" [disabled]="loading">
        <span *ngIf="loading" class="spinner"></span> 🔄 Refresh
      </button>
    </div>

    <p class="error" *ngIf="error">{{ error }}</p>

    <!-- Top KPI Grid -->
    <div class="admin-stats" *ngIf="!loading">
      <div class="stat-card" style="border-left:4px solid #22c55e;">
        <div class="k">Store Revenue</div>
        <div class="v" style="color:#4ade80;">₹{{ grossRevenue | number:'1.2-2' }}</div>
        <div class="muted">{{ orders }} total orders</div>
      </div>
      <div class="stat-card">
        <div class="k">Customer Base</div>
        <div class="v">{{ users }}</div>
        <div class="muted">{{ admins }} admins</div>
      </div>
      <div class="stat-card" [class.warn]="lowStock > 0">
        <div class="k">Catalog Products</div>
        <div class="v">{{ products }}</div>
        <div class="muted">{{ lowStock }} low/critical stock</div>
      </div>
      <div class="stat-card" [class.warn]="pendingReviews > 0">
        <div class="k">Reviews Pending</div>
        <div class="v" [style.color]="pendingReviews > 0 ? '#f59e0b' : 'inherit'">{{ pendingReviews }}</div>
        <div class="muted">{{ approvedReviews }} approved reviews</div>
      </div>
      <div class="stat-card">
        <div class="k">Active Coupons</div>
        <div class="v">{{ activeCoupons }}</div>
        <div class="muted">Promo &amp; Spin &amp; Win</div>
      </div>
      <div class="stat-card" [class.warn]="pendingReturns > 0">
        <div class="k">Pending Returns</div>
        <div class="v">{{ pendingReturns }}</div>
        <div class="muted">{{ completedReturns }} completed</div>
      </div>
    </div>

    <p class="muted" *ngIf="loading"><span class="spinner"></span> Loading dashboard metrics…</p>

    <!-- Quick Navigation Hub -->
    <div class="card" style="margin-top:20px;border-radius:12px;padding:22px;border:1px solid var(--border);background:var(--bg-card);">
      <div class="section-title" style="margin-bottom:14px;"><h2 style="font-size:16px;">Admin Command Center</h2></div>
      <div class="row" style="flex-wrap:wrap;gap:10px;">
        <a routerLink="/admin/products" class="btn-ghost btn-sm">📦 Add / Edit Products</a>
        <a routerLink="/admin/orders" class="btn-ghost btn-sm">🛍️ Manage Orders</a>
        <a routerLink="/admin/reviews" class="btn-ghost btn-sm">⭐ Moderate Reviews ({{ pendingReviews }})</a>
        <a routerLink="/admin/coupons" class="btn-ghost btn-sm">🎟️ Create Promo Coupons</a>
        <a routerLink="/admin/reports" class="btn-ghost btn-sm">📈 Sales &amp; Stock Reports</a>
        <a routerLink="/admin/notifications" class="btn-ghost btn-sm">📢 Send Broadcast Alert</a>
        <a routerLink="/admin/returns" class="btn-ghost btn-sm">🔄 Inspect Returns ({{ pendingReturns }})</a>
        <a routerLink="/admin/users" class="btn-ghost btn-sm">👥 User Clearances</a>
      </div>
    </div>
  `
})
export class AdminDashboard implements OnInit {
  loading = true;
  error = '';
  users = 0;
  admins = 0;
  products = 0;
  lowStock = 0;
  orders = 0;
  delivered = 0;
  grossRevenue = 0;
  pendingReturns = 0;
  completedReturns = 0;
  pendingReviews = 0;
  approvedReviews = 0;
  activeCoupons = 0;

  constructor(private shop: Shop) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    let done = 0;
    const totalCalls = 6;
    const fin = () => { if (++done >= totalCalls) this.loading = false; };

    this.shop.users().subscribe({
      next: (r: any) => {
        const arr = Array.isArray(r) ? r : [];
        this.users = arr.length;
        this.admins = arr.filter((u: any) => u.role === 'ADMIN').length;
        fin();
      },
      error: () => fin()
    });

    this.shop.products().subscribe({
      next: (r: any) => {
        const arr = Array.isArray(r) ? r : [];
        this.products = arr.length;
        this.lowStock = arr.filter((p: any) => (p.stockQuantity ?? 0) <= 10).length;
        fin();
      },
      error: () => fin()
    });

    this.shop.allOrders().subscribe({
      next: (r: any) => {
        const arr = Array.isArray(r) ? r : [];
        this.orders = arr.length;
        this.delivered = arr.filter((o: any) => o.orderStatus === 'DELIVERED').length;
        this.grossRevenue = arr
          .filter((o: any) => o.orderStatus !== 'CANCELLED')
          .reduce((sum: number, o: any) => sum + (o.finalAmount || o.totalAmount || 0), 0);
        fin();
      },
      error: () => fin()
    });

    this.shop.allReturns().subscribe({
      next: (r: any) => {
        const arr = Array.isArray(r) ? r : [];
        this.pendingReturns = arr.filter((x: any) => !['COMPLETED', 'REJECTED'].includes(x.status)).length;
        this.completedReturns = arr.filter((x: any) => x.status === 'COMPLETED').length;
        fin();
      },
      error: () => fin()
    });

    this.shop.adminReviews().subscribe({
      next: (r: any) => {
        const arr = Array.isArray(r) ? r : [];
        this.pendingReviews = arr.filter((x: any) => x.status === 'PENDING').length;
        this.approvedReviews = arr.filter((x: any) => x.status === 'APPROVED').length;
        fin();
      },
      error: () => fin()
    });

    this.shop.adminCoupons().subscribe({
      next: (r: any) => {
        const arr = Array.isArray(r) ? r : [];
        this.activeCoupons = arr.filter((c: any) => (c.status || 'ACTIVE') === 'ACTIVE').length;
        fin();
      },
      error: () => fin()
    });
  }
}
