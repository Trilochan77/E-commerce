import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopService } from '../core/shop.service';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head">
      <div><h1>Orders</h1><p>{{ filtered().length }} of {{ orders.length }} · DELIVERED unlocks returns.</p></div>
      <div class="row" style="margin:0">
        <select [(ngModel)]="statusFilter" style="max-width:180px">
          <option value="">All statuses</option><option>PLACED</option><option>SHIPPED</option><option>DELIVERED</option><option>CANCELLED</option>
        </select>
        <button class="btn-ghost btn-sm" (click)="load()">Refresh</button>
      </div>
    </div>
    <p class="error" *ngIf="error">{{ error }}</p>
    <div class="card">
      <div class="table-wrap"><table>
        <tr><th>Order</th><th>Items</th><th>Payable</th><th>Payment</th><th>Status</th><th>Advance</th></tr>
        <tr *ngFor="let o of filtered()">
          <td><strong>{{ o.id || o._id }}</strong><div class="muted">{{ o.userId }} · {{ o.orderDate || o.createdAt || '' }}</div></td>
          <td class="muted">{{ itemCount(o) }} items</td>
          <td><strong>Rs.{{ o.payableAmount ?? o.totalAmount }}</strong></td>
          <td><span class="badge" [ngClass]="o.paymentStatus==='PAID' ? 'ok' : 'warn'">{{ o.paymentStatus }}</span></td>
          <td><span class="badge info">{{ o.orderStatus }}</span></td>
          <td><select [ngModel]="o.orderStatus" (ngModelChange)="setStatus(o, $event)" style="max-width:150px">
            <option>PLACED</option><option>SHIPPED</option><option>DELIVERED</option><option>CANCELLED</option>
          </select></td>
        </tr>
      </table></div>
      <p class="muted" *ngIf="!orders.length && !loading">No orders yet.</p>
      <p class="muted" *ngIf="loading"><span class="spinner"></span> Loading…</p>
    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  statusFilter = '';
  error = '';
  loading = true;

  constructor(private shop: ShopService, private toast: ToastService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.shop.allOrders().subscribe({
      next: (r: any) => { this.orders = Array.isArray(r) ? r : []; this.loading = false; },
      error: (e) => { this.error = e.error?.message || 'Failed to load orders'; this.loading = false; }
    });
  }

  filtered(): any[] {
    if (!this.statusFilter) return this.orders;
    return this.orders.filter((o: any) => o.orderStatus === this.statusFilter);
  }

  itemCount(o: any): number {
    return (o.items || []).reduce((s: number, i: any) => s + (i.quantity || 1), 0);
  }

  setStatus(o: any, status: string): void {
    if (o.orderStatus === status) return;
    if (!confirm('Move order ' + (o.id || o._id) + ' to ' + status + '?')) return;
    this.shop.orderStatus(o.id || o._id, status).subscribe({
      next: (u: any) => { o.orderStatus = u.orderStatus || status; this.toast.ok('Order → ' + o.orderStatus); },
      error: (e) => this.toast.err(e.error?.message || 'Update failed')
    });
  }
}
