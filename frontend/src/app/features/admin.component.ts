import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopService } from '../core/shop.service';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="breadcrumb">Admin / Dashboard</div>
    <div class="page-head"><div><h1 style="font-size:28px">Command Center</h1><p>Catalog, orders, condition inspections & wallet ledger at a glance.</p></div>
      <button class="btn-ghost btn-sm" (click)="loadAll()">↻ Refresh all</button></div>

    <div class="admin-stats">
      <div class="stat-card"><div class="k"> Users</div><div class="v">{{ users.length }}</div><div class="bar"><div [style.width.%]="pct(users.length, 50)"></div></div></div>
      <div class="stat-card"><div class="k"> Products</div><div class="v">{{ products.length }}</div><div class="bar"><div [style.width.%]="pct(products.length, 60)"></div></div></div>
      <div class="stat-card"><div class="k"> Orders</div><div class="v">{{ orders.length }}</div><div class="bar"><div [style.width.%]="pct(orders.length, 60)"></div></div></div>
      <div class="stat-card" style="border-color:#fcd34d"><div class="k"> Pending returns</div><div class="v">{{ pendingReturns() }}</div><div class="bar"><div [style.width.%]="pct(pendingReturns(), 20)"></div></div></div>
    </div>

    <div class="tabs">
      <button *ngFor="let t of tabs" [class.active]="tab===t.id" (click)="tab=t.id">{{ t.icon }} {{ t.label }} <span class="badge" *ngIf="t.id==='returns' && pendingReturns()">{{ pendingReturns() }}</span></button>
    </div>

    <div class="card" *ngIf="tab === 'products'">
      <div class="section-title"><h2>{{ editId ? 'Edit product' : '＋ Add product' }}</h2><span class="muted">saves sync to search index</span></div>
      <div class="form-grid" style="max-width:none;grid-template-columns:1fr 1fr;gap:10px">
        <label>Name<input [(ngModel)]="form.name" placeholder="Bluetooth Headphones X"></label>
        <label>Category ID<input [(ngModel)]="form.categoryId" placeholder="C-01"></label>
        <label style="grid-column:1/-1">Description<textarea [(ngModel)]="form.description" rows="2" placeholder="Key features, warranty…"></textarea></label>
        <label>Price (Rs.)<input [(ngModel)]="form.price" type="number"></label>
        <label>Stock<input [(ngModel)]="form.stockQuantity" type="number"></label>
        <label style="grid-column:1/-1">Image URL<input [(ngModel)]="form.imageUrl" placeholder="https://... (leave empty for placeholder)"></label>
        <label style="grid-column:1/-1"><span><input type="checkbox" [(ngModel)]="form.eligibleForReturn" style="width:auto"> Eligible for reward returns ( up to 80% back)</span></label>
      </div>
      <div class="row"><button class="primary btn-sm" (click)="saveProduct()">Save product</button><button class="btn-ghost btn-sm" *ngIf="editId" (click)="resetForm()">Cancel</button></div>
      <p class="error" *ngIf="error">{{ error }}</p>
      <div class="table-wrap" style="margin-top:12px"><table>
        <tr><th></th><th>ID</th><th>Name</th><th>Price</th><th>Stock</th><th>Return?</th><th></th></tr>
        <tr *ngFor="let p of products">
          <td><img [src]="(p.images && p.images[0]) || ('https://picsum.photos/seed/'+(p.id||p._id)+'/100/80')" [alt]="p.name" style="width:48px;height:36px;object-fit:cover;border-radius:6px"></td>
          <td class="muted">{{ p.id || p._id }}</td><td><strong>{{ p.name }}</strong></td><td>₹{{ p.price }}</td>
          <td><span class="badge" [ngClass]="(p.stockQuantity??0)>5 ? 'ok' : 'warn'">{{ p.stockQuantity }}</span></td>
          <td>{{ p.eligibleForReturn ? ' yes' : '—' }}</td>
          <td><button class="btn-ghost btn-sm" (click)="edit(p)">Edit</button> <button class="danger btn-sm" (click)="del(p)">Delete</button></td>
        </tr>
      </table></div>
    </div>

    <div class="card" *ngIf="tab === 'categories'">
      <h2>Categories</h2>
      <div class="row"><input [(ngModel)]="catName" placeholder="e.g. Audio" style="max-width:280px"><button class="primary btn-sm" (click)="addCategory()">Add</button></div>
      <div class="cat-row" style="margin-top:10px"><span class="chip" *ngFor="let c of categories">{{ c.id || c._id }} · {{ c.name }}</span></div>
    </div>

    <div class="card" *ngIf="tab === 'orders'">
      <div class="section-title"><h2>Orders ({{ orders.length }})</h2><span class="muted">DELIVERED unlocks customer returns</span></div>
      <div class="table-wrap"><table>
        <tr><th>ID</th><th>User</th><th>Payable</th><th>Pay</th><th>Status</th><th>Advance</th></tr>
        <tr *ngFor="let o of orders">
          <td class="muted">{{ o.id || o._id }}</td><td class="muted">{{ o.userId }}</td><td><strong>₹{{ o.payableAmount }}</strong></td>
          <td><span class="badge" [ngClass]="o.paymentStatus==='PAID' ? 'ok' : 'warn'">{{ o.paymentStatus }}</span></td>
          <td><span class="badge info">{{ o.orderStatus }}</span></td>
          <td><select [ngModel]="o.orderStatus" (ngModelChange)="setOrderStatus(o, $event)" style="max-width:150px">
            <option>PLACED</option><option>SHIPPED</option><option>DELIVERED</option><option>CANCELLED</option></select></td>
        </tr>
      </table></div>
    </div>

    <div class="card" *ngIf="tab === 'returns'">
      <div class="section-title"><h2>Return inspections</h2>
        <span class="row" style="margin:0"><select [(ngModel)]="returnFilter" (change)="loadReturns()" style="max-width:200px">
          <option value="">All statuses</option><option>REQUESTED</option><option>APPROVED</option><option>PRODUCT_RECEIVED</option>
          <option>UNDER_INSPECTION</option><option>APPROVED_FOR_REWARD</option><option>REJECTED</option><option>COMPLETED</option>
        </select><button class="btn-ghost btn-sm" (click)="loadReturns()">Refresh</button></span></div>
      <div class="card tight" *ngFor="let r of returns" style="background:#f8fafc">
        <div class="row" style="justify-content:space-between">
          <div class="row"><strong>{{ r.id || r._id }}</strong><span class="badge info">{{ r.status.replaceAll('_',' ') }}</span></div>
          <span class="badge violet">Est {{ r.estimatedReward }} → Final {{ r.finalReward ?? '—' }}</span>
        </div>
        <p class="muted">User {{ r.userId }} · Order {{ r.orderId }} · Product {{ r.productId }} × {{ r.quantity }} · Claimed <strong>{{ r.claimedCondition }}</strong> · Verified {{ r.verifiedCondition || '—' }}</p>
        <div class="timeline">
          <span class="t" *ngFor="let s of ['REQUESTED','APPROVED','PRODUCT_RECEIVED','UNDER_INSPECTION','APPROVED_FOR_REWARD','COMPLETED']" [ngClass]="s===r.status ? 'now' : ''">○ {{ s.replaceAll('_',' ') }}</span>
        </div>
        <div class="row">
          <button class="btn-ghost btn-sm" (click)="advance(r, 'APPROVED')">Approve pickup</button>
          <button class="btn-ghost btn-sm" (click)="advance(r, 'PRODUCT_RECEIVED')">Mark received</button>
          <button class="btn-ghost btn-sm" (click)="advance(r, 'UNDER_INSPECTION')">Start inspection</button>
          <button class="btn-ghost btn-sm" (click)="advance(r, 'COMPLETED')">Complete</button>
          <button class="danger btn-sm" (click)="advance(r, 'REJECTED')">Reject</button>
        </div>
        <div class="row" style="background:#fff;border:1px solid var(--line);border-radius:12px;padding:10px">
          <select [(ngModel)]="r._evalCond" style="max-width:170px">
            <option>LIKE_NEW</option><option>GOOD</option><option>FAIR</option><option>POOR</option><option>NOT_ELIGIBLE</option>
          </select>
          <input [(ngModel)]="r._evalNote" placeholder="Inspection note (e.g. box intact, light scuff)" style="flex:1;min-width:200px">
          <button class="primary btn-sm" (click)="evaluate(r)">Evaluate & credit →</button>
        </div>
      </div>
      <p class="muted" *ngIf="!returns.length">No returns for this filter.</p>
    </div>

    <div class="card" *ngIf="tab === 'users'">
      <h2>Users</h2>
      <div class="table-wrap"><table>
        <tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr>
        <tr *ngFor="let u of users"><td class="muted">{{ u.userId || u.id }}</td><td>{{ u.name }}</td><td>{{ u.email }}</td><td><span class="badge" [ngClass]="u.role==='ADMIN' ? 'violet' : ''">{{ u.role }}</span></td></tr>
      </table></div>
    </div>
  `
})
export class AdminComponent implements OnInit {
  tabs = [
    { id: 'products', label: 'Products', icon: '' },
    { id: 'categories', label: 'Categories', icon: '' },
    { id: 'orders', label: 'Orders', icon: '' },
    { id: 'returns', label: 'Returns', icon: '' },
    { id: 'users', label: 'Users', icon: '' }
  ];
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
  form: any = { name: '', description: '', price: 0, categoryId: 'C-01', stockQuantity: 10, images: [], imageUrl: '', eligibleForReturn: true };

  constructor(private shop: ShopService, private toast: ToastService) {}

  ngOnInit(): void { this.loadAll(); }

  pct(v: number, max: number): number { return Math.min(100, (v / max) * 100); }

  loadAll(): void {
    this.shop.products().subscribe((r: any) => (this.products = Array.isArray(r) ? r : []));
    this.shop.categories().subscribe((r: any) => (this.categories = Array.isArray(r) ? r : []));
    this.shop.allOrders().subscribe((r: any) => (this.orders = Array.isArray(r) ? r : []));
    this.shop.users().subscribe((r: any) => (this.users = Array.isArray(r) ? r : []));
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
    this.form = { name: '', description: '', price: 0, categoryId: 'C-01', stockQuantity: 10, images: [], imageUrl: '', eligibleForReturn: true };
  }

  edit(p: any): void {
    this.editId = p.id || p._id;
    this.form = { name: p.name, description: p.description, price: p.price, categoryId: p.categoryId, stockQuantity: p.stockQuantity, images: p.images || [], imageUrl: (p.images && p.images[0]) || '', eligibleForReturn: p.eligibleForReturn };
  }

  saveProduct(): void {
    this.error = '';
    if (!this.form.name?.trim()) { this.error = 'Name is required.'; return; }
    const images = this.form.imageUrl?.trim() ? [this.form.imageUrl.trim()] : (this.form.images || []);
    const body = { ...this.form, images, price: +this.form.price || 0, stockQuantity: +this.form.stockQuantity || 0 };
    delete body.imageUrl;
    const call = this.editId ? this.shop.productUpdate(this.editId, body) : this.shop.productCreate(body);
    call.subscribe({
      next: () => { this.toast.ok('Product saved'); this.resetForm(); this.shop.products().subscribe((r: any) => (this.products = r)); },
      error: (e) => (this.error = e.error?.message || 'Save failed')
    });
  }

  del(p: any): void {
    if (!confirm('Delete ' + p.name + '?')) return;
    this.shop.productDelete(p.id || p._id).subscribe(() => {
      this.toast.show('Product deleted');
      this.shop.products().subscribe((r: any) => (this.products = r));
    });
  }

  addCategory(): void {
    if (!this.catName.trim()) return;
    this.shop.categoryCreate({ name: this.catName.trim() }).subscribe(() => {
      this.catName = '';
      this.toast.ok('Category added');
      this.shop.categories().subscribe((r: any) => (this.categories = r));
    });
  }

  setOrderStatus(o: any, status: string): void {
    this.shop.orderStatus(o.id || o._id, status).subscribe({
      next: (u: any) => { o.orderStatus = u.orderStatus; this.toast.ok('Order → ' + status); },
      error: (e) => this.toast.err(e.error?.message || 'Update failed')
    });
  }

  advance(r: any, status: string): void {
    this.shop.returnStatus(r.id || r._id, status).subscribe({
      next: (u: any) => { r.status = u.status; this.toast.ok('Return → ' + status); },
      error: (e) => this.toast.err(e.error?.message || 'Transition rejected')
    });
  }

  evaluate(r: any): void {
    this.shop.evaluate(r.id || r._id, r._evalCond, r._evalNote).subscribe({
      next: (u: any) => { r.status = u.status; r.finalReward = u.finalReward; r.verifiedCondition = u.verifiedCondition; this.toast.ok('Credited ' + (u.finalReward || 0) + ' pts'); },
      error: (e) => this.toast.err(e.error?.message || 'Evaluation failed')
    });
  }
}
