import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { ShopService } from '../core/shop.service';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head">
      <div><h1>Users</h1><p>{{ filtered().length }} accounts (passwords never shown). Blocked users cannot log in.</p></div>
      <div class="row" style="margin:0">
        <input [(ngModel)]="q" placeholder="Filter name/email…" style="max-width:220px">
        <button class="btn-ghost btn-sm" (click)="load()">Refresh</button>
      </div>
    </div>
    <p class="error" *ngIf="error">{{ error }}</p>
    <div class="card">
      <div class="table-wrap"><table>
        <tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr>
        <tr *ngFor="let u of filtered()">
          <td class="muted">{{ uid(u) }}</td>
          <td>{{ u.name }}{{ isSelf(u) ? ' (you)' : '' }}</td><td>{{ u.email }}</td>
          <td><span class="badge" [ngClass]="u.role==='ADMIN' ? 'violet' : ''">{{ u.role }}</span></td>
          <td><span class="badge" [ngClass]="u.active === false ? 'bad' : 'ok'">{{ u.active === false ? 'Blocked' : 'Active' }}</span></td>
          <td>
            <button class="btn-ghost btn-sm" *ngIf="!isSelf(u)" (click)="toggleBlock(u)">{{ u.active === false ? 'Unblock' : 'Block' }}</button>
            <button class="danger btn-sm" *ngIf="!isSelf(u)" (click)="remove(u)">Delete</button>
          </td>
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

  constructor(private shop: ShopService, private auth: AuthService, private toast: ToastService) {}

  ngOnInit(): void { this.load(); }

  uid(u: any): string { return u.userId || u.id || u._id; }

  isSelf(u: any): boolean { return this.uid(u) === this.auth.userId(); }

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

  toggleBlock(u: any): void {
    const blocking = u.active !== false;
    if (!confirm((blocking ? 'Block ' : 'Unblock ') + u.email + '?')) return;
    this.shop.userBlock(this.uid(u), blocking).subscribe({
      next: (r: any) => {
        u.active = r.active !== false;
        this.toast.ok((blocking ? 'Blocked ' : 'Unblocked ') + u.email);
      },
      error: (e) => this.toast.err(e.error?.message || 'Update failed')
    });
  }

  remove(u: any): void {
    if (!confirm('Delete user ' + u.email + '? Their wallet goes too. This cannot be undone.')) return;
    this.shop.userDelete(this.uid(u)).subscribe({
      next: () => { this.toast.show('User deleted'); this.load(); },
      error: (e) => this.toast.err(e.error?.message || 'Delete failed')
    });
  }
}
