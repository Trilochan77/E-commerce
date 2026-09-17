import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShopService } from '../core/shop.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card">
      <h2>Order History</h2>
      <div class="card" *ngFor="let o of orders">
        <div class="row">
          <strong>{{ o.id || o._id }}</strong>
          <span class="badge info">{{ o.orderStatus }}</span>
          <span class="badge" [ngClass]="o.paymentStatus === 'PAID' ? 'ok' : 'bad'">{{ o.paymentStatus }}</span>
          <span class="muted">{{ o.orderDate }}</span>
        </div>
        <table>
          <tr><th>Product</th><th>Qty</th><th>Price</th><th></th></tr>
          <tr *ngFor="let i of o.items">
            <td><a [routerLink]="['/products', i.productId]">{{ i.productId }}</a></td>
            <td>{{ i.quantity }}</td>
            <td>₹{{ i.price }}</td>
            <td><a *ngIf="o.orderStatus === 'DELIVERED'" [routerLink]="['/returns/new']"
              [queryParams]="{orderId: o.id || o._id, productId: i.productId}">Return</a></td>
          </tr>
        </table>
        <p>Subtotal ₹{{ o.subTotal }} · Points used {{ o.pointsUsed || 0 }} · Payable <strong>₹{{ o.payableAmount }}</strong></p>
      </div>
      <p class="muted" *ngIf="!orders.length">No orders yet.</p>
    </div>
  `
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];

  constructor(private shop: ShopService, private auth: AuthService) {}

  ngOnInit(): void {
    this.shop.orderHistory(this.auth.userId()).subscribe((r: any) => this.orders = Array.isArray(r) ? r : []);
  }
}
