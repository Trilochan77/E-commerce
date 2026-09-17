import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ShopService } from '../core/shop.service';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="breadcrumb"><a routerLink="/">Home</a> / Profile</div>
    <div class="cart-layout">
      <div class="stack">
        <div class="card" style="margin:0">
          <div class="row"><span style="font-size:40px">👤</span><div><h2 style="margin:0">{{ me?.name || 'Your profile' }}</h2><p class="muted" style="margin:0">{{ me?.email }} · <span class="badge violet">{{ me?.role }}</span></p></div></div>
          <div class="divider"></div>
          <div class="form-grid" style="max-width:none">
            <label>Full name<input [(ngModel)]="name" name="name"></label>
            <div class="row" style="margin:0">
              <label style="flex:1">Phone<input [(ngModel)]="phone" name="phone" placeholder="+91 …"></label>
              <label style="flex:2">Address<input [(ngModel)]="address" name="address" placeholder="Street, city, PIN"></label>
            </div>
            <div class="row"><button class="primary btn-sm" (click)="save()">Save changes</button><span class="success" *ngIf="saved">✅ Saved</span></div>
          </div>
          <p class="error" *ngIf="error">{{ error }}</p>
          <div class="row">
            <a routerLink="/orders"><button class="btn-ghost btn-sm">📦 Orders</button></a>
            <a routerLink="/wallet"><button class="btn-ghost btn-sm">⭐ Wallet</button></a>
            <a routerLink="/returns"><button class="btn-ghost btn-sm">↩ Returns</button></a>
          </div>
        </div>
        <div class="card" style="margin:0">
          <div class="section-title"><h2>🕘 Recently viewed</h2><span class="muted">powers recommendations</span></div>
          <div class="table-wrap" *ngIf="views.length; else noHist"><table>
            <tr><th>Product</th><th>Viewed</th><th></th></tr>
            <tr *ngFor="let v of views.slice(0,10)">
              <td><a [routerLink]="['/products', v.productId]">{{ v.name || v.productId }}</a></td>
              <td class="muted">{{ v.viewedAt || v.timestamp }}</td>
              <td><a [routerLink]="['/products', v.productId]">View →</a></td>
            </tr>
          </table></div>
          <ng-template #noHist><p class="muted">No browsing history yet — open any product to start personalizing.</p></ng-template>
        </div>
      </div>
      <aside class="card summary">
        <h3>Your impact</h3>
        <p class="muted">Activity feeds the scoring engine: 3× purchases · 2× views · 2× searches · 1× popularity</p>
        <div class="row" style="justify-content:space-between"><span>Views logged</span><strong>{{ views.length }}</strong></div>
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
  error = '';

  constructor(private shop: ShopService, private auth: AuthService, private toast: ToastService) {}

  ngOnInit(): void {
    this.auth.me().subscribe((m: any) => {
      this.me = m;
      this.name = m.name || '';
      this.phone = m.phone === 'null' ? '' : m.phone || '';
      this.address = m.address === 'null' ? '' : m.address || '';
    });
    this.shop.history(this.auth.userId()).subscribe((r: any) => (this.views = r.items || r || []));
  }

  save(): void {
    this.saved = false; this.error = '';
    this.auth.updateProfile({ name: this.name, phone: this.phone, address: this.address }).subscribe({
      next: () => { this.saved = true; this.toast.ok('Profile saved'); },
      error: (e) => (this.error = e.error?.message || 'Save failed')
    });
  }
}
