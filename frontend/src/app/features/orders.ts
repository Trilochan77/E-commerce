import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Shop } from '../core/shop';
import { Auth } from '../core/auth';
import { EmptyState } from '../shared/empty-state';
import { ProductVisual } from '../shared/product-visual';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-orders',
  imports: [CommonModule, FormsModule, RouterModule, EmptyState, ProductVisual],
  template: `
    <div class="breadcrumb"><a routerLink="/">Home</a> / My Orders</div>

    <div class="page-head">
      <div>
        <h1 style="font-size:28px">📦 Order History &amp; Tracking</h1>
        <p>Live package GPS coordinates, return requests, and invoices.</p>
      </div>
      <div class="row" style="margin:0;gap:8px">
        <select [(ngModel)]="filter" aria-label="Filter orders" style="min-width:180px">
          <option value="">All Orders ({{ orders.length }})</option>
          <option value="PLACED">Placed</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PACKED">Packed</option>
          <option value="SHIPPED">Shipped</option>
          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <a routerLink="/returns"><button class="btn-ghost btn-sm">🔄 Return Center</button></a>
      </div>
    </div>

    <!-- Orders Stack -->
    <div class="stack" *ngIf="filtered().length; else noOrders" style="gap:16px">
      <div class="card order-card-premium" *ngFor="let o of filtered()">
        <!-- Order Header -->
        <div class="order-card-header">
          <div class="order-id-group">
            <span class="order-id-label">ORDER #{{ o.id || o._id }}</span>
            <span class="badge info">{{ statusLabel(o.orderStatus) }}</span>
            <span class="badge" [ngClass]="payClass(o.paymentStatus)">
              {{ o.paymentMethod || 'PAYMENT' }} · {{ o.paymentStatus }}
            </span>
          </div>

          <div class="order-actions-top">
            <a [routerLink]="['/orders', o.id || o._id, 'track']" class="btn-track-delivery">
              <span class="track-pulse"></span>
              <span>📍 Live GPS Tracking</span>
            </a>
            <span class="order-date-text">{{ o.orderDate | date:'mediumDate' }}</span>
          </div>
        </div>

        <!-- Visual Progress Timeline -->
        <div class="timeline-stepper">
          <div
            class="stepper-step"
            *ngFor="let s of stages"
            [ngClass]="tlClass(o.orderStatus, s.key)"
          >
            <div class="step-circle">{{ s.icon }}</div>
            <span class="step-label">{{ s.label }}</span>
          </div>
        </div>

        <!-- Ordered Items Table -->
        <div class="order-items-list">
          <div class="order-item-row" *ngFor="let i of o.items">
            <app-product-visual
              [product]="{ productId: i.productId, name: productNames[i.productId] || i.productId }"
              size="xs"
            ></app-product-visual>
            <div class="item-title-col">
              <strong>
                <a [routerLink]="['/products', i.productId]">{{ productNames[i.productId] || i.productId }}</a>
              </strong>
              <span class="muted" style="font-size:11.5px">Qty: {{ i.quantity }} · ₹{{ i.price | number:'1.0-0' }} each</span>
            </div>
            <div class="item-amount-col">
              <strong>₹{{ (i.price * i.quantity) | number:'1.0-0' }}</strong>
            </div>
            <div class="item-return-col">
              <ng-container *ngIf="o.orderStatus === 'DELIVERED'">
                <a
                  *ngIf="canReturn(o.deliveredDate || o.orderDate, i.productId); else returnClosed"
                  [routerLink]="['/returns/new']"
                  [queryParams]="{ orderId: o.id || o._id, productId: i.productId }"
                >
                  <button class="btn-ghost btn-sm" style="font-size:11.5px">
                    {{ returnLabel(o.deliveredDate || o.orderDate, i.productId) }}
                  </button>
                </a>
                <ng-template #returnClosed>
                  <span class="muted" style="font-size:11px">Return closed (&gt;7d)</span>
                </ng-template>
              </ng-container>
            </div>
          </div>
        </div>

        <!-- Order Footer Details -->
        <div class="order-card-footer">
          <div class="shipping-info-block" *ngIf="o.shippingAddress">
            <span class="muted" style="font-size:12px;display:block">
              Deliver to: <strong>{{ o.shippingAddress.fullName }}</strong> · {{ o.shippingAddress.addressLine }}, {{ o.shippingAddress.city }} ({{ o.shippingAddress.pincode }})
            </span>
          </div>
          <div class="order-totals-block">
            <span class="muted" style="font-size:12px">Points redeemed: -{{ o.pointsUsed || 0 }} pts</span>
            <div class="payable-val">
              <span class="muted" style="font-size:12px;margin-right:6px">Total Paid:</span>
              <strong>₹{{ o.payableAmount | number:'1.0-0' }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <ng-template #noOrders>
      <app-empty-state
        icon="📦"
        title="No orders yet"
        hint="When you place orders for flagship phones, laptops, and audio gear, your live GPS tracking and condition-based returns will show up here."
        ctaLink="/products"
        ctaLabel="Explore NEXGEN Catalog"
      ></app-empty-state>
    </ng-template>
  `,
  styles: [`
    .order-card-premium {
      background: rgba(13, 19, 39, 0.7);
      backdrop-filter: blur(14px);
      border: 1px solid rgba(148, 163, 255, 0.14);
      border-radius: 16px;
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      transition: border-color 0.15s ease;
    }
    .order-card-premium:hover {
      border-color: rgba(139, 92, 246, 0.35);
    }
    .order-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(148, 163, 255, 0.1);
    }
    .order-id-group {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .order-id-label {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: #ffffff;
    }
    .order-actions-top {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .btn-track-delivery {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #2563eb, #8b5cf6);
      color: #ffffff;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      transition: filter 0.15s ease;
    }
    .btn-track-delivery:hover {
      filter: brightness(1.12);
    }
    .track-pulse {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #34d399;
      box-shadow: 0 0 6px #34d399;
    }
    .order-date-text {
      color: var(--muted);
      font-size: 12px;
    }

    .timeline-stepper {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
      background: rgba(6, 9, 20, 0.45);
      border-radius: 12px;
      padding: 10px 12px;
    }
    .stepper-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 4px;
      opacity: 0.4;
      transition: opacity 0.2s ease;
    }
    .stepper-step.done {
      opacity: 0.85;
      color: #34d399;
    }
    .stepper-step.now {
      opacity: 1;
      font-weight: 700;
      color: #38bdf8;
    }
    .step-circle {
      font-size: 16px;
    }
    .step-label {
      font-size: 10.5px;
      white-space: nowrap;
    }

    .order-items-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .order-item-row {
      display: grid;
      grid-template-columns: 56px 1fr auto auto;
      gap: 12px;
      align-items: center;
      padding: 8px 10px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(148, 163, 255, 0.06);
    }
    .item-title-col a {
      color: #f1f5f9;
      text-decoration: none;
      font-size: 13.5px;
    }
    .item-title-col a:hover {
      color: #38bdf8;
    }
    .item-amount-col strong {
      color: #ffffff;
      font-size: 14px;
    }

    .order-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      padding-top: 10px;
      border-top: 1px solid rgba(148, 163, 255, 0.08);
    }
    .order-totals-block {
      display: flex;
      align-items: baseline;
      gap: 14px;
      margin-left: auto;
    }
    .payable-val strong {
      font-size: 20px;
      color: #ffffff;
      letter-spacing: -0.01em;
    }

    @media (max-width: 700px) {
      .timeline-stepper { grid-template-columns: repeat(3, 1fr); gap: 12px; }
      .order-item-row { grid-template-columns: 56px 1fr; }
    }
  `]
})
export class Orders implements OnInit {
  orders: any[] = [];
  filter = '';
  productNames: Record<string, string> = {};

  stages = [
    { key: 'PLACED', label: 'Placed', icon: '📝' },
    { key: 'CONFIRMED', label: 'Confirmed', icon: '✓' },
    { key: 'PACKED', label: 'Packed', icon: '📦' },
    { key: 'SHIPPED', label: 'Shipped', icon: '🚚' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🚴' },
    { key: 'DELIVERED', label: 'Delivered', icon: '🎉' }
  ];

  constructor(private shop: Shop, private auth: Auth) {}

  ngOnInit(): void {
    this.shop.orderHistory(this.auth.userId()).subscribe((r: any) => {
      this.orders = Array.isArray(r) ? r : [];
      // Resolve product names
      this.orders.forEach(o => {
        (o.items || []).forEach((i: any) => {
          if (!this.productNames[i.productId]) {
            this.shop.product(i.productId).subscribe({
              next: (p: any) => (this.productNames[i.productId] = p?.name || i.productId),
              error: () => (this.productNames[i.productId] = i.productId)
            });
          }
        });
      });
    });
  }

  filtered(): any[] {
    return this.filter ? this.orders.filter((o) => o.orderStatus === this.filter) : this.orders;
  }

  payClass(s: string): string {
    if (s === 'PAID') return 'ok';
    if (s === 'PENDING') return 'info';
    return 'warn';
  }

  canEarnPoints(productId: string): boolean {
    const p = (productId || '').toUpperCase();
    return p.startsWith('P-1') || p === 'P-3005';
  }

  canReturn(orderDate: any, productId: string): boolean {
    return this.ageDays(orderDate) <= 7 || this.canEarnPoints(productId);
  }

  returnLabel(orderDate: any, productId: string): string {
    if (this.ageDays(orderDate) <= 7) return 'Return · Full refund';
    if (this.canEarnPoints(productId)) return 'Return · Earn points';
    return 'Return expired (>7d)';
  }

  ageDays(d: any): number {
    const t = d ? new Date(d).getTime() : NaN;
    if (isNaN(t)) return 0;
    return Math.floor((Date.now() - t) / 86400000);
  }

  statusLabel(s: string): string {
    const f = this.stages.find(x => x.key === s);
    return f ? f.label : (s || '').replace(/_/g, ' ');
  }

  tlClass(cur: string, s: string): string {
    const order = ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    if (cur === 'CANCELLED') return s === 'PLACED' ? 'bad' : '';
    const ci = order.indexOf(cur), si = order.indexOf(s);
    if (si < ci) return 'done';
    if (si === ci) return 'now';
    return '';
  }
}
