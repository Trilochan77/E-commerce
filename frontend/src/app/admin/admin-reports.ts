import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Shop } from '../core/shop';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-admin-reports',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-head">
      <div>
        <h1 style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:24px;">📈</span> Sales &amp; Inventory Analytics
        </h1>
        <p class="muted">Store revenue, order metrics, payment gateway split, and real-time stock levels.</p>
      </div>
      <button class="btn-ghost btn-sm" (click)="load()" [disabled]="loading">
        <span *ngIf="loading" class="spinner"></span> 🔄 Refresh
      </button>
    </div>

    <div *ngIf="loading" class="muted" style="padding:40px;text-align:center;">
      <span class="spinner"></span> Computing sales and inventory reports...
    </div>

    <div *ngIf="!loading">
      <!-- Top Financial KPIs -->
      <div class="admin-stats" style="grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:16px;margin-bottom:24px;">
        <div class="stat-card" style="border-left:4px solid #22c55e;">
          <div class="k">Gross Revenue</div>
          <div class="v" style="color:#4ade80;">₹{{ totalRevenue | number:'1.2-2' }}</div>
          <div class="muted">Across {{ orders.length }} total orders</div>
        </div>
        <div class="stat-card" style="border-left:4px solid var(--brand);">
          <div class="k">Avg Order Value (AOV)</div>
          <div class="v">₹{{ avgOrderValue | number:'1.2-2' }}</div>
          <div class="muted">Delivered &amp; completed</div>
        </div>
        <div class="stat-card" style="border-left:4px solid #06b6d4;">
          <div class="k">Delivered Orders</div>
          <div class="v">{{ countStatus('DELIVERED') }}</div>
          <div class="muted">{{ deliveryRate | number:'1.0-0' }}% fulfillment rate</div>
        </div>
        <div class="stat-card warn" style="border-left:4px solid #f59e0b;">
          <div class="k">Low Stock Products</div>
          <div class="v">{{ lowStockProducts.length }}</div>
          <div class="muted">Inventory &lt;= 10 units</div>
        </div>
      </div>

      <!-- Two column: Order Status breakdown + Payment Breakdown -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:20px;margin-bottom:28px;">
        <!-- Order Pipeline Status -->
        <div class="card" style="padding:22px;border-radius:12px;border:1px solid var(--border);background:var(--bg-card);">
          <h3 style="margin-top:0;font-size:16px;display:flex;align-items:center;gap:8px;">
            <span>📦</span> Order Pipeline Breakdown
          </h3>
          <div style="display:flex;flex-direction:column;gap:12px;margin-top:16px;">
            <div *ngFor="let s of statusPipeline" style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-radius:8px;background:rgba(255,255,255,0.02);border:1px solid var(--border);">
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="badge" [ngClass]="s.badge">{{ s.label }}</span>
              </div>
              <div style="font-weight:700;">{{ countStatus(s.status) }} orders</div>
            </div>
          </div>
        </div>

        <!-- Payment Gateway Split -->
        <div class="card" style="padding:22px;border-radius:12px;border:1px solid var(--border);background:var(--bg-card);">
          <h3 style="margin-top:0;font-size:16px;display:flex;align-items:center;gap:8px;">
            <span>💳</span> Payment Methods
          </h3>
          <div style="display:flex;flex-direction:column;gap:12px;margin-top:16px;">
            <div *ngFor="let m of paymentMethods" style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-radius:8px;background:rgba(255,255,255,0.02);border:1px solid var(--border);">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:16px;">{{ m.icon }}</span>
                <span>{{ m.label }}</span>
              </div>
              <div style="font-weight:700;">{{ countPayment(m.key) }} orders</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Inventory & Stock Management Table -->
      <div class="card" style="padding:22px;border-radius:12px;border:1px solid var(--border);background:var(--bg-card);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
          <div>
            <h3 style="margin:0;font-size:16px;display:flex;align-items:center;gap:8px;">
              <span>⚠️</span> Inventory Alert: Low &amp; Critical Stock
            </h3>
            <p class="muted" style="margin:4px 0 0 0;font-size:12.5px;">Products requiring immediate replenishment.</p>
          </div>
          <a routerLink="/admin/products" class="btn-ghost btn-sm">Manage All Products →</a>
        </div>

        <div *ngIf="lowStockProducts.length === 0" class="muted" style="text-align:center;padding:24px;">
          ✅ All products have healthy inventory levels (&gt; 10 units in stock).
        </div>

        <div *ngIf="lowStockProducts.length > 0" style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:13.5px;text-align:left;">
            <thead>
              <tr style="border-bottom:1px solid var(--border);color:var(--fg-dim);font-size:12px;text-transform:uppercase;">
                <th style="padding:10px 12px;">Product</th>
                <th style="padding:10px 12px;">Category</th>
                <th style="padding:10px 12px;">Price</th>
                <th style="padding:10px 12px;">In Stock</th>
                <th style="padding:10px 12px;">Status</th>
                <th style="padding:10px 12px;text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of lowStockProducts" style="border-bottom:1px solid rgba(255,255,255,0.04);">
                <td style="padding:12px;font-weight:600;">
                  {{ p.name }}
                  <div class="muted" style="font-size:11px;">ID: {{ p.id }}</div>
                </td>
                <td style="padding:12px;"><span class="badge" style="background:var(--bg-glass);">{{ p.category || 'Tech' }}</span></td>
                <td style="padding:12px;font-weight:700;">₹{{ p.price | number:'1.2-2' }}</td>
                <td style="padding:12px;font-weight:800;" [style.color]="(p.stockQuantity || 0) <= 0 ? '#ef4444' : '#f59e0b'">
                  {{ p.stockQuantity ?? 0 }} units
                </td>
                <td style="padding:12px;">
                  <span class="badge" [ngClass]="(p.stockQuantity || 0) <= 0 ? 'red' : 'warn'">
                    {{ (p.stockQuantity || 0) <= 0 ? 'OUT OF STOCK' : 'LOW STOCK' }}
                  </span>
                </td>
                <td style="padding:12px;text-align:right;">
                  <a routerLink="/admin/products" class="btn-ghost btn-sm" style="font-size:11.5px;">Edit Stock</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminReports implements OnInit {
  orders: any[] = [];
  products: any[] = [];
  loading = true;

  statusPipeline = [
    { status: 'PLACED', label: 'Placed', badge: 'cyan' },
    { status: 'CONFIRMED', label: 'Confirmed', badge: 'cyan' },
    { status: 'SHIPPED', label: 'Shipped', badge: 'violet' },
    { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', badge: 'warn' },
    { status: 'DELIVERED', label: 'Delivered', badge: 'green' },
    { status: 'CANCELLED', label: 'Cancelled', badge: 'red' }
  ];

  paymentMethods = [
    { key: 'UPI_QR', label: 'UPI Instant QR', icon: '⚡' },
    { key: 'CARD', label: 'Credit / Debit Card', icon: '💳' },
    { key: 'NET_BANKING', label: 'Net Banking', icon: '🏦' },
    { key: 'WALLET', label: 'Store Wallet', icon: '💰' },
    { key: 'COD', label: 'Cash on Delivery', icon: '💵' }
  ];

  constructor(private shop: Shop) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    let done = 0;
    const fin = () => { if (++done >= 2) this.loading = false; };

    this.shop.adminAllOrders().subscribe({
      next: (res: any) => {
        this.orders = Array.isArray(res) ? res : [];
        fin();
      },
      error: () => fin()
    });

    this.shop.products().subscribe({
      next: (res: any) => {
        this.products = Array.isArray(res) ? res : [];
        fin();
      },
      error: () => fin()
    });
  }

  get totalRevenue(): number {
    return this.orders
      .filter(o => o.orderStatus !== 'CANCELLED')
      .reduce((sum, o) => sum + (o.finalAmount || o.totalAmount || 0), 0);
  }

  get avgOrderValue(): number {
    const valid = this.orders.filter(o => o.orderStatus !== 'CANCELLED');
    if (valid.length === 0) return 0;
    return this.totalRevenue / valid.length;
  }

  get deliveryRate(): number {
    if (this.orders.length === 0) return 100;
    return (this.countStatus('DELIVERED') / this.orders.length) * 100;
  }

  get lowStockProducts(): any[] {
    return this.products.filter(p => (p.stockQuantity ?? 0) <= 10);
  }

  countStatus(status: string): number {
    return this.orders.filter(o => (o.orderStatus || '').toUpperCase() === status).length;
  }

  countPayment(method: string): number {
    return this.orders.filter(o => (o.paymentMethod || '').toUpperCase() === method).length;
  }
}

