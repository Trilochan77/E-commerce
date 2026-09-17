import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopService } from '../core/shop.service';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head"><div><h1>Categories</h1><p>{{ categories.length }} categories.</p></div></div>
    <p class="error" *ngIf="error">{{ error }}</p>
    <div class="admin-grid">
      <div class="card">
        <h2>{{ editId ? 'Edit category' : 'Add category' }}</h2>
        <div class="form-grid" style="max-width:none">
          <label>Name<input [(ngModel)]="name" placeholder="e.g. Audio"></label>
          <label>Description<input [(ngModel)]="desc" placeholder="Optional"></label>
        </div>
        <div class="row">
          <button class="primary btn-sm" (click)="save()">{{ editId ? 'Update' : 'Add' }}</button>
          <button class="btn-ghost btn-sm" *ngIf="editId" (click)="cancel()">Cancel</button>
        </div>
      </div>
      <div class="card">
        <div class="table-wrap"><table>
          <tr><th>ID</th><th>Name</th><th></th></tr>
          <tr *ngFor="let c of categories">
            <td class="muted">{{ c.id || c._id }}</td><td><strong>{{ c.name }}</strong><div class="muted">{{ c.description || '' }}</div></td>
            <td><button class="btn-ghost btn-sm" (click)="editRow(c)">Edit</button>
              <button class="danger btn-sm" (click)="del(c)">Delete</button></td>
          </tr>
        </table></div>
        <p class="muted" *ngIf="!categories.length">No categories yet.</p>
      </div>
    </div>
  `
})
export class AdminCategoriesComponent implements OnInit {
  categories: any[] = [];
  name = '';
  desc = '';
  editId = '';
  error = '';

  constructor(private shop: ShopService, private toast: ToastService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.shop.categories().subscribe({
      next: (r: any) => (this.categories = Array.isArray(r) ? r : []),
      error: (e) => (this.error = e.error?.message || 'Failed to load categories')
    });
  }

  cancel(): void { this.editId = ''; this.name = ''; this.desc = ''; }

  editRow(c: any): void {
    this.editId = c.id || c._id;
    this.name = c.name;
    this.desc = c.description || '';
  }

  save(): void {
    this.error = '';
    if (!this.name.trim()) { this.error = 'Name is required.'; return; }
    const body = { name: this.name.trim(), description: this.desc.trim() };
    const call = this.editId
      ? this.shop.categoryUpdate(this.editId, body)
      : this.shop.categoryCreate(body);
    call.subscribe({
      next: () => { this.toast.ok('Category saved'); this.cancel(); this.load(); },
      error: (e) => (this.error = e.error?.message || 'Save failed')
    });
  }

  del(c: any): void {
    if (!confirm('Delete category ' + c.name + '?')) return;
    this.shop.categoryDelete(c.id || c._id).subscribe({
      next: () => { this.toast.show('Category deleted'); this.load(); },
      error: (e) => this.toast.err(e.error?.message || 'Delete failed')
    });
  }
}
