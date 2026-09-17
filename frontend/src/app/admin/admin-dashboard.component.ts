import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShopService } from '../core/shop.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-head">
      <div><h1>Dashboard</h1><p>Store health at a glance.</p></div>
      <button class="btn-ghost btn-sm" (click)="load()">Refresh</button>
    </div>
    <p class="error" *ngIf="error">{{ error }}</p>
    <div class="admin-stats" *ngIf="!loading">
      <div class="stat-card"><div class="k">Users</div><div class="v">{{ users }}</div><div class="muted">{{ admins }} admins</div></div>
      <div class="stat-card"><div class="k">Products</div><div class="v">{{ products }}</div><div class="muted">{{ lowStock }} low stock</div></div>
      <div class="stat-card"><div class="k">Orders</div><div class="v">{{ orders }}</div><div class="muted">{{ delivered }} delivered</div></div>
      <div class="stat-card warn"><div class="k">Pending returns</div><div class="v">{{ pending }}</div><div class="muted">{{ completed }} completed</div></div>
    </div>
    <p class="muted" *ngIf="loading"><span class="spinner"></span> Loading stats…</p>
    <div class="card">
      <div class="section-title"><h2>Quick actions</h2></div>
      <div class="row">
        <a routerLink="/admin/products" class="btn-ghost btn-sm">Add product</a>
        <a routerLink="/admin/orders" class="btn-ghost btn-sm">Review orders</a>
        <a routerLink="/admin/returns" class="btn-ghost btn-sm">Inspect returns ({{ pending }})</a>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  loading = true;
  error = '';
  users = 0;
  admins = 0;
  products = 0;
  lowStock = 0;
  orders = 0;
  delivered = 0;
  pending = 0;
  completed = 0;

  constructor(private shop: ShopService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    let done = 0;
    const fin = () => { if (++done >= 4) this.loading = false; };
    this.shop.users().subscribe({
      next: (r: any) => {
        const arr = Array.isArray(r) ? r : [];
        this.users = arr.length;
        this.admins = arr.filter((u: any) => u.role === 'ADMIN').length;
        fin();
      },
      error: (e) => { this.error = e.error?.message || 'Failed to load users'; fin(); }
    });
    this.shop.products().subscribe({
      next: (r: any) => {
        const arr = Array.isArray(r) ? r : [];
        this.products = arr.length;
        this.lowStock = arr.filter((p: any) => (p.stockQuantity ?? 0) <= 5).length;
        fin();
      },
      error: () => fin()
    });
    this.shop.allOrders().subscribe({
      next: (r: any) => {
        const arr = Array.isArray(r) ? r : [];
        this.orders = arr.length;
        this.delivered = arr.filter((o: any) => o.orderStatus === 'DELIVERED').length;
        fin();
      },
      error: () => fin()
    });
    this.shop.allReturns().subscribe({
      next: (r: any) => {
        const arr = Array.isArray(r) ? r : [];
        this.pending = arr.filter((x: any) => !['COMPLETED', 'REJECTED'].includes(x.status)).length;
        this.completed = arr.filter((x: any) => x.status === 'COMPLETED').length;
        fin();
      },
      error: () => fin()
    });
  }
}
