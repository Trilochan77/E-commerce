import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopService } from '../core/shop.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card"><h2>Admin Dashboard</h2>
      <p class="muted">Users {{ users.length }} · Products {{ products.length }} · Orders {{ orders.length }} · Pending returns {{ pendingReturns() }}</p>
    </div>
    <div class="tabs">
      <button [class.active]="tab === 'products'" (click)="tab = 'products'">Products</button>
      <button [class.active]="tab === 'categories'" (click)="tab = 'categories'">Categories</button>
      <button [class.active]="tab === 'orders'" (click)="tab = 'orders'">Orders</button>
      <button [class.active]="tab === 'returns'" (click)="tab = 'returns'">Returns & Rewards</button>
      <button [class.active]="tab === 'users'" (click)="tab = 'users'">Users</button>
    </div>

    <div class="card" *ngIf="tab === 'products'">
      <h3>{{ editId ? 'Edit' : 'Add' }} Product</h3>
      <div class="form-grid">
        <input [(ngModel)]="form.name" name="pname" placeholder="Name">
        <input [(ngModel)]="form.description" name="pdesc" placeholder="Description">
        <input [(ngModel)]="form.price" name="pprice" type="number" placeholder="Price">
        <input [(ngModel)]="form.categoryId" name="pcat" placeholder="Category ID (e.g. C-01)">
        <input [(ngModel)]="form.stockQuantity" name="pstock" type="number" placeholder="Stock">
        <label><input type="checkbox" [(ngModel)]="form.eligibleForReturn" name="pelig"> Eligible for return rewards</label>
        <div class="row">
          <button class="primary" (click)="saveProduct()">Save</button>
          <button *ngIf="editId" (click)="resetForm()">Cancel</button>
        </div>
      </div>
      <table>
        <tr><th>ID</th><th>Name</th><th>Price</th><th>Stock</th><th>Return?</th><th></th></tr>
        <tr *ngFor="let p of products">
          <td>{{ p.id || p._id }}</td><td>{{ p.name }}</td><td>₹{{ p.price }}</td>
          <td>{{ p.stockQuantity }}</td><td>{{ p.eligibleForReturn ? 'yes' : 'no' }}</td>
          <td><button (click)="edit(p)">Edit</button> <button class="danger" (click)="del(p)">Delete</button></td>
        </tr>
      </table>
      <p class="error" *ngIf="error">{{ error }}</p>
    </div>

    <div class="card" *ngIf="tab === 'categories'">
      <h3>Categories</h3>
      <div class="row">
        <input [(ngModel)]="catName" name="cname" placeholder="New category name">
        <button class="primary" (click)="addCategory()">Add</button>
      </div>
      <table>
        <tr><th>ID</th><th>Name</th></tr>
        <tr *ngFor="let c of categories"><td>{{ c.id || c._id }}</td><td>{{ c.name }}</td></tr>
      </table>
    </div>

    <div class="card" *ngIf="tab === 'orders'">
      <h3>Orders</h3>
      <table>
        <tr><th>ID</th><th>User</th><th>Payable</th><th>Pay</th><th>Status</th><th>Set</th></tr>
        <tr *ngFor="let o of orders">
          <td>{{ o.id || o._id }}</td><td>{{ o.userId }}</td><td>₹{{ o.payableAmount }}</td>
          <td>{{ o.paymentStatus }}</td><td>{{ o.orderStatus }}</td>
          <td>
            <select [ngModel]="o.orderStatus" (ngModelChange)="setOrderStatus(o, $event)" [ngModelOptions]="{standalone: true}">
              <option>PLACED</option><option>SHIPPED</option><option>DELIVERED</option><option>CANCELLED</option>
            </select>
          </td>
        </tr>
      </table>
    </div>

    <div class="card" *ngIf="tab === 'returns'">
      <h3>Return Requests</h3>
      <div class="row">
        <select [(ngModel)]="returnFilter" name="rfilter" (change)="loadReturns()">
          <option value="">All</option>
          <option>REQUESTED</option><option>APPROVED</option><option>PRODUCT_RECEIVED</option>
          <option>UNDER_INSPECTION</option><option>APPROVED_FOR_REWARD</option><option>REJECTED</option><option>COMPLETED</option>
        </select>
        <button (click)="loadReturns()">Refresh</button>
      </div>
      <div class="card" *ngFor="let r of returns">
        <div class="row"><strong>{{ r.id || r._id }}</strong><span class="badge info">{{ r.status }}</span></div>
        <p class="muted">User {{ r.userId }} · Order {{ r.orderId }} · Product {{ r.productId }} × {{ r.quantity }} · Claimed {{ r.claimedCondition }} · Est {{ r.estimatedReward }} · Final {{ r.finalReward ?? '-' }} ({{ r.verifiedCondition || '-' }})</p>
        <div class="row">
          <button (click)="advance(r, 'APPROVED')">Approve</button>
          <button (click)="advance(r, 'PRODUCT_RECEIVED')">Received</button>
          <button (click)="advance(r, 'UNDER_INSPECTION')">Inspect</button>
          <button (click)="advance(r, 'COMPLETED')">Complete</button>
          <button class="danger" (click)="advance(r, 'REJECTED')">Reject</button>
        </div>
        <div class="row">
          <select [(ngModel)]="r._evalCond" [ngModelOptions]="{standalone: true}">
            <option value="LIKE_NEW">LIKE_NEW</option><option value="GOOD">GOOD</option>
            <option value="FAIR">FAIR</option><option value="POOR">POOR</option><option value="NOT_ELIGIBLE">NOT_ELIGIBLE</option>
          </select>
          <input [(ngModel)]="r._evalNote" [ngModelOptions]="{standalone: true}" placeholder="Inspection note">
          <button class="primary" (click)="evaluate(r)">Evaluate & Credit</button>
        </div>
      </div>
    </div>

    <div class="card" *ngIf="tab === 'users'">
      <h3>Users</h3>
      <table>
        <tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr>
        <tr *ngFor="let u of users"><td>{{ u.userId }}</td><td>{{ u.name }}</td><td>{{ u.email }}</td><td>{{ u.role }}</td></tr>
      </table>
    </div>
  `
})
export class AdminComponent implements OnInit {
  tab = 'products';
  products: any[] = [];
  categories: any[] = [];
  orders: any[] = [];
  returns: any[] = [];
  users: any[] = [];
  returnFilter = '';
  editId = '';
  error = '';
  catName = '';
  form: any = { name: '', description: '', price: 0, categoryId: 'C-01', stockQuantity: 10, images: [], eligibleForReturn: true };

  constructor(private shop: ShopService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.shop.products().subscribe((r: any) => this.products = Array.isArray(r) ? r : []);
    this.shop.categories().subscribe((r: any) => this.categories = Array.isArray(r) ? r : []);
    this.shop.allOrders().subscribe((r: any) => this.orders = Array.isArray(r) ? r : []);
    this.shop.users().subscribe((r: any) => this.users = Array.isArray(r) ? r : []);
    this.loadReturns();
  }

  pendingReturns(): number {
    return this.returns.filter((r: any) => !['COMPLETED', 'REJECTED'].includes(r.status)).length;
  }

  loadReturns(): void {
    this.shop.allReturns(this.returnFilter).subscribe((r: any) => {
      this.returns = (Array.isArray(r) ? r : []).map((x: any) => ({ ...x, _evalCond: 'GOOD', _evalNote: '' }));
    });
  }

  resetForm(): void {
    this.editId = '';
    this.form = { name: '', description: '', price: 0, categoryId: 'C-01', stockQuantity: 10, images: [], eligibleForReturn: true };
  }

  edit(p: any): void {
    this.editId = p.id || p._id;
    this.form = { name: p.name, description: p.description, price: p.price, categoryId: p.categoryId, stockQuantity: p.stockQuantity, images: p.images || [], eligibleForReturn: p.eligibleForReturn };
  }

  saveProduct(): void {
    this.error = '';
    const body = { ...this.form, price: +this.form.price || 0, stockQuantity: +this.form.stockQuantity || 0 };
    const call = this.editId ? this.shop.productUpdate(this.editId, body) : this.shop.productCreate(body);
    call.subscribe({
      next: () => { this.resetForm(); this.shop.products().subscribe((r: any) => this.products = r); },
      error: (e) => this.error = e.error?.message || 'Save failed'
    });
  }

  del(p: any): void {
    this.shop.productDelete(p.id || p._id).subscribe(() =>
      this.shop.products().subscribe((r: any) => this.products = r));
  }

  addCategory(): void {
    if (!this.catName.trim()) return;
    this.shop.categoryCreate({ name: this.catName.trim() }).subscribe(() => {
      this.catName = '';
      this.shop.categories().subscribe((r: any) => this.categories = r);
    });
  }

  setOrderStatus(o: any, status: string): void {
    this.shop.orderStatus(o.id || o._id, status).subscribe((u: any) => o.orderStatus = u.orderStatus);
  }

  advance(r: any, status: string): void {
    this.shop.returnStatus(r.id || r._id, status).subscribe({
      next: (u: any) => r.status = u.status,
      error: (e) => alert(e.error?.message || 'Transition rejected')
    });
  }

  evaluate(r: any): void {
    this.shop.evaluate(r.id || r._id, r._evalCond, r._evalNote).subscribe({
      next: (u: any) => { r.status = u.status; r.finalReward = u.finalReward; r.verifiedCondition = u.verifiedCondition; },
      error: (e) => alert(e.error?.message || 'Evaluation failed')
    });
  }
}
