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
          <div class="section-title"><h2>Delivery addresses</h2><span class="muted">{{ addresses.length }} saved · Flipkart-style</span></div>
          <div class="stack" *ngIf="addresses.length; else noAddr">
            <div class="pay-card" *ngFor="let a of addresses" [class.on]="a.default || a.isDefault">
              <div class="row" style="justify-content:space-between">
                <strong>{{ a.fullName }} <span class="badge info">{{ a.addressType || 'HOME' }}</span></strong>
                <span class="badge ok" *ngIf="a.default || a.isDefault">DEFAULT</span>
              </div>
              <span class="muted">{{ a.addressLine }}, {{ a.city }}, {{ a.state }} — {{ a.pincode }} · {{ a.phone }}</span>
              <div class="row">
                <button class="btn-ghost btn-sm" (click)="editAddr(a)">Edit</button>
                <button class="btn-ghost btn-sm" *ngIf="!(a.default || a.isDefault)" (click)="makeDefault(a)">Set default</button>
                <button class="btn-ghost btn-sm" (click)="delAddr(a)">Delete</button>
              </div>
            </div>
          </div>
          <ng-template #noAddr><p class="muted">No addresses yet — save your home / work / family addresses here.</p></ng-template>
          <div class="row" style="margin-top:8px"><button class="btn-ghost btn-sm" (click)="addrFormShow=!addrFormShow">{{ addrFormShow ? 'Cancel' : (editingId ? 'Editing…' : '+ Add address') }}</button></div>
          <div *ngIf="addrFormShow" class="form-grid" style="margin-top:10px;max-width:none">
            <div class="profile-2col">
              <label>Full name<input [(ngModel)]="addrForm.fullName" name="a-fullName"></label>
              <label>Phone<input [(ngModel)]="addrForm.phone" name="a-phone"></label>
            </div>
            <div class="profile-2col">
              <label>Pincode<input [(ngModel)]="addrForm.pincode" name="a-pin" maxlength="6"></label>
              <label>Type<select [(ngModel)]="addrForm.addressType" name="a-type"><option>HOME</option><option>WORK</option><option>OTHER</option></select></label>
            </div>
            <label>Address<input [(ngModel)]="addrForm.addressLine" name="a-line"></label>
            <div class="profile-2col">
              <label>City<input [(ngModel)]="addrForm.city" name="a-city"></label>
              <label>State<input [(ngModel)]="addrForm.state" name="a-state"></label>
            </div>
            <label>Landmark<input [(ngModel)]="addrForm.landmark" name="a-land"></label>
            <label class="row" style="gap:6px"><input type="checkbox" [(ngModel)]="addrForm.isDefault" name="a-def" style="width:auto"> Set as default</label>
            <div class="row"><button class="primary btn-sm" (click)="saveAddr()" [disabled]="addrSaving">{{ addrSaving ? 'Saving…' : (editingId ? 'Update' : 'Save') }}</button></div>
            <p class="error" *ngIf="addrError">{{ addrError }}</p>
          </div>
        </div>

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
  addresses: any[] = [];
  addrFormShow = false;
  addrSaving = false;
  addrError = '';
  editingId = '';
  addrForm: any = { fullName: '', phone: '', pincode: '', addressLine: '', city: '', state: '', landmark: '', addressType: 'HOME', isDefault: false };

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
    this.loadAddresses();
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

  addrId(a: any): string { return a.id || a._id || ''; }

  loadAddresses(): void {
    this.shop.addresses(this.auth.userId()).subscribe({
      next: (r: any) => (this.addresses = Array.isArray(r) ? r : []),
      error: () => (this.addresses = [])
    });
  }

  editAddr(a: any): void {
    this.editingId = this.addrId(a);
    this.addrForm = { ...a, isDefault: !!(a.default || a.isDefault) };
    this.addrFormShow = true;
  }

  saveAddr(): void {
    if (this.addrSaving) return;
    this.addrSaving = true; this.addrError = '';
    const body = { userId: this.auth.userId(), ...this.addrForm };
    const done = { next: () => { this.addrSaving = false; this.addrFormShow = false; this.editingId = ''; this.toast.ok('Address saved'); this.loadAddresses(); }, error: (e: any) => { this.addrSaving = false; this.addrError = e.error?.message || 'Save failed'; } };
    if (this.editingId) this.shop.addressUpdate(this.editingId, body).subscribe(done);
    else this.shop.addressCreate(body).subscribe(done);
  }

  delAddr(a: any): void {
    if (!confirm('Delete this address?')) return;
    this.shop.addressDelete(this.addrId(a), this.auth.userId()).subscribe({ next: () => { this.toast.ok('Deleted'); this.loadAddresses(); }, error: (e: any) => this.toast.err(e.error?.message || 'Delete failed') });
  }

  makeDefault(a: any): void {
    this.shop.addressDefault(this.addrId(a), this.auth.userId()).subscribe({ next: () => { this.toast.ok('Default updated'); this.loadAddresses(); }, error: (e: any) => this.toast.err(e.error?.message || 'Failed') });
  }
}
