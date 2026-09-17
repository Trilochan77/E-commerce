import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopService } from '../core/shop.service';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head">
      <div><h1>Products</h1><p>{{ products.length }} items · saves sync to search index.</p></div>
      <div class="row" style="margin:0">
        <input [(ngModel)]="q" placeholder="Filter by name…" style="max-width:220px">
        <button class="btn-ghost btn-sm" (click)="resetForm()">New product</button>
      </div>
    </div>
    <p class="error" *ngIf="error">{{ error }}</p>
    <div class="admin-grid">
      <div class="card">
        <h2>{{ editId ? 'Edit product' : 'Add product' }}</h2>
        <div class="form-grid" style="max-width:none">
          <label>Name<input [(ngModel)]="form.name" placeholder="Bluetooth Headphones X"></label>
          <label>Category
            <select [(ngModel)]="form.categoryId">
              <option *ngFor="let c of categories" [value]="c.id || c._id">{{ c.name }} ({{ c.id || c._id }})</option>
            </select>
          </label>
          <label>Description<textarea [(ngModel)]="form.description" rows="2"></textarea></label>
          <label>Price (Rs.)<input [(ngModel)]="form.price" type="number" min="0"></label>
          <label>Stock<input [(ngModel)]="form.stockQuantity" type="number" min="0"></label>
          <label><span><input type="checkbox" [(ngModel)]="form.eligibleForReturn" style="width:auto"> Eligible for returns (up to 80% back)</span></label>
        </div>
        <div class="row">
          <button class="primary btn-sm" (click)="save()" [disabled]="saving">{{ saving ? 'Saving…' : 'Save product' }}</button>
          <button class="btn-ghost btn-sm" *ngIf="editId" (click)="resetForm()">Cancel</button>
        </div>
      </div>
      <div class="card">
        <div class="table-wrap"><table>
          <tr><th>Name</th><th>Price</th><th>Stock</th><th>Return?</th><th></th></tr>
          <tr *ngFor="let p of filtered()">
            <td><strong>{{ p.name }}</strong><div class="muted">{{ p.id || p._id }} · {{ p.categoryId }}</div></td>
            <td>Rs.{{ p.price }}</td>
            <td><span class="badge" [ngClass]="(p.stockQuantity??0)>5 ? 'ok' : 'warn'">{{ p.stockQuantity }}</span></td>
            <td>{{ p.eligibleForReturn ? 'Yes' : '—' }}</td>
            <td><button class="btn-ghost btn-sm" (click)="edit(p)">Edit</button>
              <button class="danger btn-sm" (click)="del(p)">Delete</button></td>
          </tr>
        </table></div>
        <p class="muted" *ngIf="!products.length && !loading">No products yet.</p>
        <p class="muted" *ngIf="loading"><span class="spinner"></span> Loading…</p>
      </div>
    </div>
  `
})
export class AdminProductsComponent implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  q = '';
  editId = '';
  error = '';
  loading = true;
  saving = false;
  form: any = { name: '', description: '', price: 0, categoryId: '', stockQuantity: 10, eligibleForReturn: true };

  constructor(private shop: ShopService, private toast: ToastService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.shop.categories().subscribe((r: any) => {
      this.categories = Array.isArray(r) ? r : [];
      if (!this.form.categoryId && this.categories.length) {
        const c = this.categories[0];
        this.form.categoryId = c.id || c._id;
      }
    });
    this.shop.products().subscribe({
      next: (r: any) => { this.products = Array.isArray(r) ? r : []; this.loading = false; },
      error: (e) => { this.error = e.error?.message || 'Failed to load products'; this.loading = false; }
    });
  }

  filtered(): any[] {
    const needle = this.q.trim().toLowerCase();
    if (!needle) return this.products;
    return this.products.filter((p: any) => (p.name || '').toLowerCase().includes(needle));
  }

  resetForm(): void {
    this.editId = '';
    const firstCat = this.categories.length ? (this.categories[0].id || this.categories[0]._id) : '';
    this.form = { name: '', description: '', price: 0, categoryId: firstCat, stockQuantity: 10, eligibleForReturn: true };
  }

  edit(p: any): void {
    this.editId = p.id || p._id;
    this.form = {
      name: p.name, description: p.description, price: p.price,
      categoryId: p.categoryId, stockQuantity: p.stockQuantity,
      eligibleForReturn: !!p.eligibleForReturn
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  save(): void {
    this.error = '';
    if (!this.form.name?.trim()) { this.error = 'Name is required.'; return; }
    if (!this.form.categoryId) { this.error = 'Pick a category.'; return; }
    if (+this.form.price < 0 || +this.form.stockQuantity < 0) { this.error = 'Price/stock cannot be negative.'; return; }
    this.saving = true;
    const body = {
      ...this.form,
      price: +this.form.price || 0,
      stockQuantity: +this.form.stockQuantity || 0,
      images: []
    };
    const call = this.editId ? this.shop.productUpdate(this.editId, body) : this.shop.productCreate(body);
    call.subscribe({
      next: () => {
        this.toast.ok('Product saved');
        this.saving = false;
        this.resetForm();
        this.load();
      },
      error: (e) => { this.error = e.error?.message || 'Save failed'; this.saving = false; }
    });
  }

  del(p: any): void {
    if (!confirm('Delete ' + p.name + '?')) return;
    this.shop.productDelete(p.id || p._id).subscribe({
      next: () => { this.toast.show('Product deleted'); this.load(); },
      error: (e) => this.toast.err(e.error?.message || 'Delete failed')
    });
  }
}
