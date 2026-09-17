import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ShopService } from '../core/shop.service';
import { AuthService } from '../core/auth.service';
import { EmptyStateComponent } from '../shared/empty-state.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, EmptyStateComponent],
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
            <span class="badge" [ngClass]="o.paymentStatus === 'PAID' ? 'ok' : 'warn'">{{ o.paymentStatus }}</span>
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
            <td><a *ngIf="o.orderStatus === 'DELIVERED'" [routerLink]="['/returns/new']" [queryParams]="{orderId: o.id || o._id, productId: i.productId}"><button class="btn-ghost btn-sm"> Return & earn</button></a></td>
          </tr>
        </table></div>
        <div class="row" style="justify-content:space-between;margin-top:8px">
          <span class="muted">Subtotal ₹{{ o.subTotal }} · Points −{{ o.pointsUsed || 0 }}</span>
          <span>Payable <strong style="font-size:18px">₹{{ o.payableAmount | number }}</strong></span>
        </div>
      </div>
    </div>
    <ng-template #noOrders><app-empty-state icon="" title="No orders yet" hint="Your placed orders, tracking and return buttons will live here." ctaLink="/products"></app-empty-state></ng-template>
  `
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  filter = '';

  constructor(private shop: ShopService, private auth: AuthService) {}

  ngOnInit(): void {
    this.shop.orderHistory(this.auth.userId()).subscribe((r: any) => (this.orders = Array.isArray(r) ? r : []));
  }
  filtered(): any[] {
    return this.filter ? this.orders.filter((o) => o.orderStatus === this.filter) : this.orders;
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
