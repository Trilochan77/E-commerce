import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopService } from '../core/shop.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head">
      <div><h1>Users</h1><p>{{ filtered().length }} accounts (passwords never shown).</p></div>
      <div class="row" style="margin:0">
        <input [(ngModel)]="q" placeholder="Filter name/email…" style="max-width:220px">
        <button class="btn-ghost btn-sm" (click)="load()">Refresh</button>
      </div>
    </div>
    <p class="error" *ngIf="error">{{ error }}</p>
    <div class="card">
      <div class="table-wrap"><table>
        <tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr>
        <tr *ngFor="let u of filtered()">
          <td class="muted">{{ u.userId || u.id || u._id }}</td>
          <td>{{ u.name }}</td><td>{{ u.email }}</td>
          <td><span class="badge" [ngClass]="u.role==='ADMIN' ? 'violet' : ''">{{ u.role }}</span></td>
        </tr>
      </table></div>
      <p class="muted" *ngIf="!users.length">No users found.</p>
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  q = '';
  error = '';

  constructor(private shop: ShopService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.error = '';
    this.shop.users().subscribe({
      next: (r: any) => (this.users = Array.isArray(r) ? r : []),
      error: (e) => (this.error = e.error?.message || 'Failed to load users')
    });
  }

  filtered(): any[] {
    const needle = this.q.trim().toLowerCase();
    if (!needle) return this.users;
    return this.users.filter((u: any) =>
      (u.name || '').toLowerCase().includes(needle) || (u.email || '').toLowerCase().includes(needle));
  }
}
