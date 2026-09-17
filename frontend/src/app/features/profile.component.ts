import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ShopService } from '../core/shop.service';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="breadcrumb"><a routerLink="/">Home</a> / Profile</div>
    <div class="profile-head card" *ngIf="!loading; else skel">
      <div class="avatar" aria-hidden="true">{{ initial() }}</div>
      <div class="profile-id">
        <h1>{{ me?.name || 'Your profile' }}</h1>
        <p class="muted">{{ me?.email }} · <span class="badge" [ngClass]="me?.role==='ADMIN' ? 'violet' : 'info'">{{ me?.role }}</span></p>
      </div>
      <div class="row profile-actions">
        <a routerLink="/orders" class="btn-ghost btn-sm">Orders</a>
        <a routerLink="/wallet" class="btn-ghost btn-sm">Wallet</a>
        <a routerLink="/returns" class="btn-ghost btn-sm">Returns</a>
        <button class="btn-ghost btn-sm" (click)="logout()">Logout</button>
      </div>
    </div>
    <ng-template #skel>
      <div class="card"><p class="muted"><span class="spinner"></span> Loading profile…</p></div>
    </ng-template>

    <div class="cart-layout profile-grid">
      <div class="stack">
        <form class="card" style="margin:0" (ngSubmit)="save()" novalidate>
          <div class="section-title"><h2>Account details</h2><span class="muted" *ngIf="saved">Saved</span></div>
          <div class="form-grid" style="max-width:none">
            <label>Full name
              <input [(ngModel)]="name" name="name" autocomplete="name" required minlength="2">
            </label>
            <div class="field-err" *ngIf="name && name.trim().length < 2">Min 2 characters.</div>
            <div class="profile-2col">
              <label>Phone<input [(ngModel)]="phone" name="phone" placeholder="+91 …" autocomplete="tel"></label>
              <label>Address<input [(ngModel)]="address" name="address" placeholder="Street, city, PIN" autocomplete="street-address"></label>
            </div>
            <div class="row">
              <button class="primary btn-sm" type="submit" [disabled]="saving || name.trim().length < 2">
                <span class="spinner" *ngIf="saving"></span> {{ saving ? 'Saving…' : 'Save changes' }}
              </button>
              <span class="success" *ngIf="saved">Saved</span>
            </div>
          </div>
          <p class="error" *ngIf="error">{{ error }}</p>
        </form>

        <div class="card" style="margin:0">
          <div class="section-title"><h2>Recently viewed</h2><span class="muted">powers recommendations</span></div>
          <div class="table-wrap" *ngIf="views.length; else noHist"><table>
            <tr><th>Product</th><th>Viewed</th><th></th></tr>
            <tr *ngFor="let v of views.slice(0,10)">
              <td><a [routerLink]="['/products', v.productId]">{{ v.name || v.productId }}</a></td>
              <td class="muted">{{ v.viewedAt || v.timestamp }}</td>
              <td><a [routerLink]="['/products', v.productId]">View</a></td>
            </tr>
          </table></div>
          <ng-template #noHist>
            <div class="empty"><div class="big">○</div><p class="muted">No browsing history yet — open any product to start personalizing.</p></div>
          </ng-template>
        </div>
      </div>

      <aside class="card summary">
        <h3>Your impact</h3>
        <p class="muted">Activity feeds scoring: 3× purchases · 2× views · 2× searches · 1× popularity</p>
        <div class="impact-row"><span>Views logged</span><strong>{{ views.length }}</strong></div>
        <div class="impact-row"><span>Wallet</span><a routerLink="/wallet">Open</a></div>
        <div class="impact-row"><span>Orders</span><a routerLink="/orders">Track</a></div>
        <div class="divider"></div>
        <p class="muted">Tip: search “headphones”, open 2–3 items, then check Home — your rail updates.</p>
      </aside>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  me: any = null;
  name = '';
  phone = '';
  address = '';
  views: any[] = [];
  saved = false;
  saving = false;
  loading = true;
  error = '';

  constructor(
    private shop: ShopService,
    private auth: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.auth.me().subscribe({
      next: (m: any) => {
        this.me = m;
        this.name = m.name || '';
        this.phone = m.phone === 'null' ? '' : m.phone || '';
        this.address = m.address === 'null' ? '' : m.address || '';
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
    this.shop.history(this.auth.userId()).subscribe({
      next: (r: any) => (this.views = r.items || r || []),
      error: () => (this.views = [])
    });
  }

  initial(): string {
    return (this.me?.name || this.me?.email || 'U').trim().charAt(0).toUpperCase();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  save(): void {
    if (this.name.trim().length < 2 || this.saving) return;
    this.saved = false;
    this.saving = true;
    this.error = '';
    this.auth.updateProfile({ name: this.name.trim(), phone: this.phone.trim(), address: this.address.trim() }).subscribe({
      next: (m: any) => {
        this.saving = false;
        this.saved = true;
        this.me = { ...this.me, ...(m || {}), name: this.name.trim() };
        this.toast.ok('Profile saved');
      },
      error: (e) => {
        this.saving = false;
        this.error = e.error?.message || 'Save failed';
      }
    });
  }
}
