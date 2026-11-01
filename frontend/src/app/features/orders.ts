import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Shop } from '../core/shop';
import { Auth } from '../core/auth';
import { EmptyState } from '../shared/empty-state';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-orders',
  imports: [CommonModule, FormsModule, RouterModule, EmptyState],
  template: `
    <div class="breadcrumb"><a routerLink="/">Home</a> / Orders</div>
    <div class="page-head">
      <div><h1 style="font-size:28px">Order History</h1><p>Track, reorder, or start a reward return on delivered items.</p></div>
      <select [(ngModel)]="filter" aria-label="Filter orders" style="max-width:220px">
        <option value="">All statuses</option><option>PLACED</option><option>SHIPPED</option><option>DELIVERED</option><option>CANCELLED</option>
      </select>
    </div>
    <div class="stack" *ngIf="filtered().length; else noOrders">
      <div class="card" style="margin:0" *ngFor="let o of filtered()">
        <div class="row" style="justify-content:space-between">
          <div class="row"><strong>{{ o.id || o._id }}</strong>
            <span class="badge info">{{ o.orderStatus }}</span>
            <span class="badge" [ngClass]="payClass(o.paymentStatus)">{{ o.paymentMethod || '' }} · {{ o.paymentStatus }}</span>
          </div>
          <span class="muted">{{ o.orderDate }}</span>
        </div>
        <div class="timeline">
          <span class="t" *ngFor="let s of ['PLACED','SHIPPED','DELIVERED']" [ngClass]="tlClass(o.orderStatus, s)">● {{ s }}</span>
        </div>
        <div class="table-wrap"><table>
          <tr><th>Product</th><th>Qty</th><th>Price</th><th></th></tr>
          <tr *ngFor="let i of o.items">
            <td><a [routerLink]="['/products', i.productId]">{{ i.productId }}</a></td>
            <td>{{ i.quantity }}</td><td>₹{{ i.price | number }}</td>
            <td>
              <ng-container *ngIf="o.orderStatus === 'DELIVERED'">
                <a *ngIf="canReturn(o.deliveredDate || o.orderDate, i.productId); else returnClosed"
                   [routerLink]="['/returns/new']" [queryParams]="{orderId: o.id || o._id, productId: i.productId}">
                  <button class="btn-ghost btn-sm">{{ returnLabel(o.deliveredDate || o.orderDate, i.productId) }}</button>
                </a>
                <ng-template #returnClosed>
                  <span class="muted" style="font-size:12px">Return closed (>7d)</span>
                </ng-template>
              </ng-container>
            </td>
          </tr>
        </table></div>
        <div class="row" style="justify-content:space-between;margin-top:8px">
          <span class="muted">Subtotal ₹{{ o.subTotal }} · Points −{{ o.pointsUsed || 0 }}</span>
          <span>Payable <strong style="font-size:18px">₹{{ o.payableAmount | number }}</strong></span>
        </div>
        <p class="muted" *ngIf="o.shippingAddress" style="margin-top:6px">Deliver to: <strong>{{ o.shippingAddress.fullName }}</strong> · {{ o.shippingAddress.addressLine }}, {{ o.shippingAddress.city }}, {{ o.shippingAddress.state }} — {{ o.shippingAddress.pincode }} · {{ o.shippingAddress.phone }}</p>
        <p class="muted" *ngIf="o.paymentMethod==='COD' && o.paymentStatus==='PENDING'" style="margin-top:4px">Cash on delivery — please keep ₹{{ o.payableAmount | number }} ready.</p>
      </div>
    </div>
    <ng-template #noOrders><app-empty-state icon="" title="No orders yet" hint="Your placed orders, tracking and return buttons will live here." ctaLink="/products"></app-empty-state></ng-template>
  `
})
export class Orders implements OnInit {
  orders: any[] = [];
  filter = '';

  constructor(private shop: Shop, private auth: Auth) {}

  ngOnInit(): void {
    this.shop.orderHistory(this.auth.userId()).subscribe((r: any) => (this.orders = Array.isArray(r) ? r : []));
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
    if (this.ageDays(orderDate) <= 7) return 'Return · full refund';
    if (this.canEarnPoints(productId)) return 'Return · earn points';
    return 'Return expired (>7d)';
  }
  ageDays(d: any): number {
    const t = d ? new Date(d).getTime() : NaN;
    if (isNaN(t)) return 0;
    return Math.floor((Date.now() - t) / 86400000);
  }
  tlClass(cur: string, s: string): string {
    const order = ['PLACED', 'SHIPPED', 'DELIVERED'];
    if (cur === 'CANCELLED') return s === 'PLACED' ? 'bad' : '';
    const ci = order.indexOf(cur), si = order.indexOf(s);
    if (si < ci) return 'done';
    if (si === ci) return 'now';
    return '';
  }
}
