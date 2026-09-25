import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ShopService } from '../core/shop.service';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="breadcrumb"><a routerLink="/">Home</a> / <a routerLink="/cart">Cart</a> / Checkout</div>
    <div class="steps-checkout"><span class="step done">✓ Cart</span><span>→</span><span class="step now">2 · Checkout</span><span>→</span><span class="step">3 · Done</span></div>
    <div class="cart-layout">
      <div class="stack">
        <div class="card" style="margin:0">
          <div class="section-title"><h2>Delivery Address</h2><span class="muted" *ngIf="addresses.length">{{ addresses.length }} saved</span></div>
          <div *ngIf="addrLoading"><p class="muted"><span class="spinner"></span> Loading addresses…</p></div>
          <div class="stack" *ngIf="!addrLoading && addresses.length">
            <label class="pay-card" *ngFor="let a of addresses" [class.on]="selectedId===addrId(a)" (click)="select(a)" style="cursor:pointer;display:block">
              <div class="row" style="justify-content:space-between">
                <strong>{{ a.fullName }} <span class="badge info">{{ a.addressType || 'HOME' }}</span></strong>
                <span class="badge ok" *ngIf="a.default || a.isDefault">DEFAULT</span>
              </div>
              <span class="muted">{{ a.addressLine }}, {{ a.city }}, {{ a.state }} — {{ a.pincode }}</span>
              <span class="muted">Phone: {{ a.phone }}<span *ngIf="a.landmark"> · {{ a.landmark }}</span></span>
            </label>
          </div>
          <p class="muted" *ngIf="!addrLoading && !addresses.length">No saved address yet — add one below (e.g. order for family).</p>
          <div class="row" style="margin-top:8px">
            <button class="btn-ghost btn-sm" (click)="showForm=!showForm">{{ showForm ? 'Cancel' : '+ Add / New address' }}</button>
            <button class="btn-ghost btn-sm" *ngIf="selected && showForm" (click)="fillSelected()">Use selected</button>
          </div>
          <div *ngIf="showForm" class="form-grid" style="margin-top:10px;max-width:none">
            <div class="profile-2col">
              <label>Full name (or receiver)<input [(ngModel)]="form.fullName" name="f-fullName" placeholder="e.g. Rahul Sharma"></label>
              <label>Phone<input [(ngModel)]="form.phone" name="f-phone" placeholder="10-digit mobile"></label>
            </div>
            <div class="profile-2col">
              <label>Pincode<input [(ngModel)]="form.pincode" name="f-pincode" maxlength="6" placeholder="6-digit PIN"></label>
              <label>Type<select [(ngModel)]="form.addressType" name="f-type"><option>HOME</option><option>WORK</option><option>OTHER</option></select></label>
            </div>
            <label>Address<input [(ngModel)]="form.addressLine" name="f-line" placeholder="House no, street, area"></label>
            <div class="profile-2col">
              <label>City<input [(ngModel)]="form.city" name="f-city"></label>
              <label>State<input [(ngModel)]="form.state" name="f-state"></label>
            </div>
            <label>Landmark (optional)<input [(ngModel)]="form.landmark" name="f-land" placeholder="Near…"></label>
            <label class="row" style="gap:6px"><input type="checkbox" [(ngModel)]="form.isDefault" name="f-def" style="width:auto"> Save & set as default</label>
            <div class="row">
              <button class="primary btn-sm" (click)="saveAddress()" [disabled]="savingAddr || !formValid()">{{ savingAddr ? 'Saving…' : 'Save address' }}</button>
              <span class="muted" *ngIf="!formValid()">Fill name, phone, 6-digit PIN, address, city, state.</span>
            </div>
          </div>
          <p class="error" *ngIf="addrError">{{ addrError }}</p>
        </div>
        <div class="card" style="margin:0">
          <h2> Reward Wallet</h2>
          <p class="muted" *ngIf="wallet">Balance <strong>{{ wallet.balance ?? wallet.pointBalance ?? 0 }} pts</strong> · 1 pt = ₹1 · max 20% of subtotal (₹{{ maxUsable() | number }})</p>
          <div class="row">
            <input [(ngModel)]="points" name="points" type="number" min="0" [max]="wallet?.balance || 0" style="max-width:160px" placeholder="0" aria-label="Points to use">
            <button class="btn-ghost btn-sm" (click)="points=maxUsable()">Apply max</button>
            <button class="btn-ghost btn-sm" (click)="points=0">Clear</button>
            <span class="badge ok" *ngIf="points>0">− ₹{{ points }} saved</span>
          </div>
          <div class="progress"><div [style.width.%]="walletPct()"></div></div>
        </div>
        <div class="card" style="margin:0">
          <h2> Payment Method</h2>
          <div class="pay-grid">
            <div class="pay-card" [class.on]="method==='COD'" (click)="method='COD'"><strong> COD</strong><span class="muted">Pay on delivery</span></div>
            <div class="pay-card" [class.on]="method==='UPI'" (click)="method='UPI'"><strong> UPI</strong><span class="muted">Instant mock pay</span></div>
            <div class="pay-card" [class.on]="method==='CARD'" (click)="method='CARD'"><strong> Card</strong><span class="muted">Mock gateway</span></div>
          </div>
          <p class="muted">Mock payment: always succeeds in demo. Failure path surfaces “order not created”.</p>
        </div>
      </div>
      <aside class="card summary">
        <h3>Payable</h3>
        <p class="muted">{{ itemCount() }} items · Subtotal ₹{{ cart?.totalAmount || 0 }}</p>
        <div class="row" style="justify-content:space-between"><span>Subtotal</span><span>₹{{ cart?.totalAmount || 0 }}</span></div>
        <div class="row" style="justify-content:space-between"><span>Wallet (−)</span><span style="color:#15803d">− ₹{{ points || 0 }}</span></div>
        <div class="divider"></div>
        <p class="muted" *ngIf="selected">Deliver to: <strong>{{ selected.fullName }}</strong>, {{ selected.addressLine }}, {{ selected.city }} — {{ selected.pincode }}</p>
        <div class="row" style="justify-content:space-between"><span>To pay</span><span class="total">₹{{ payable() | number }}</span></div>
        <button class="primary" style="width:100%;margin-top:10px" (click)="pay()" [disabled]="!cart?.items?.length || paying || !selected">{{ paying ? 'Processing…' : (selected ? 'Pay & Place Order' : 'Select address first') }}</button>
        <p class="error" *ngIf="error">{{ error }}</p>
        <p class="muted" style="text-align:center">Stock re-validated · wallet deducted atomically</p>
      </aside>
    </div>
  `
})
export class CheckoutComponent implements OnInit {
  cart: any = null;
  wallet: any = null;
  points = 0;
  method = 'COD';
  error = '';
  paying = false;

  addresses: any[] = [];
  selected: any = null;
  selectedId = '';
  showForm = false;
  addrLoading = true;
  addrError = '';
  savingAddr = false;
  form: any = { fullName: '', phone: '', pincode: '', addressLine: '', city: '', state: '', landmark: '', addressType: 'HOME', isDefault: false };

  constructor(private shop: ShopService, private auth: AuthService, private router: Router, private toast: ToastService) {}

  ngOnInit(): void {
    this.shop.cart(this.auth.userId()).subscribe((c: any) => (this.cart = c));
    this.shop.wallet(this.auth.userId()).subscribe({ next: (w: any) => (this.wallet = w), error: () => undefined });
    this.loadAddresses();
  }

  addrId(a: any): string { return a.id || a._id || ''; }

  loadAddresses(): void {
    this.addrLoading = true;
    this.shop.addresses(this.auth.userId()).subscribe({
      next: (r: any) => {
        this.addresses = Array.isArray(r) ? r : [];
        this.addrLoading = false;
        const def = this.addresses.find((a) => a.default || a.isDefault) || this.addresses[0];
        if (def && !this.selected) this.select(def);
        if (!this.addresses.length) this.showForm = true;
      },
      error: () => { this.addrLoading = false; this.showForm = true; }
    });
  }

  select(a: any): void {
    this.selected = { ...a };
    this.selectedId = this.addrId(a);
    this.error = '';
  }

  fillSelected(): void {
    if (!this.selected) return;
    this.form = { ...this.selected, isDefault: false };
  }

  formValid(): boolean {
    return !!(this.form.fullName?.trim() && this.form.phone?.trim()
      && /^\d{6}$/.test((this.form.pincode || '').trim())
      && this.form.addressLine?.trim() && this.form.city?.trim() && this.form.state?.trim());
  }

  saveAddress(): void {
    if (!this.formValid() || this.savingAddr) return;
    this.savingAddr = true; this.addrError = '';
    const body = { userId: this.auth.userId(), ...this.form };
    this.shop.addressCreate(body).subscribe({
      next: (a: any) => {
        this.savingAddr = false; this.showForm = false;
        this.toast.ok('Address saved');
        this.loadAddresses();
        this.selected = { ...a }; this.selectedId = this.addrId(a);
      },
      error: (e) => { this.savingAddr = false; this.addrError = e.error?.message || 'Save failed'; }
    });
  }

  itemCount(): number { return (this.cart?.items || []).reduce((s: number, i: any) => s + i.quantity, 0); }
  maxUsable(): number {
    const sub = this.cart?.totalAmount || 0;
    const bal = this.wallet?.balance ?? this.wallet?.pointBalance ?? 0;
    return Math.min(bal, Math.floor(sub * 0.2));
  }
  walletPct(): number {
    const bal = this.wallet?.balance || 1;
    return Math.min(100, ((+this.points || 0) / bal) * 100);
  }
  payable(): number {
    const sub = this.cart?.totalAmount || 0;
    return Math.max(0, sub - (+this.points || 0));
  }
  pay(): void {
    this.error = ''; this.paying = true;
    if (!this.selected) { this.error = 'Please select or add a delivery address'; this.paying = false; return; }
    if (+this.points > this.maxUsable()) {
      this.error = 'Points exceed 20% cap (max ' + this.maxUsable() + ')';
      this.paying = false;
      return;
    }
    const snap = {
      fullName: this.selected.fullName, phone: this.selected.phone, pincode: this.selected.pincode,
      addressLine: this.selected.addressLine, city: this.selected.city, state: this.selected.state,
      landmark: this.selected.landmark || '', addressType: this.selected.addressType || 'HOME'
    };
    this.shop.checkout(this.auth.userId(), this.method, +this.points || 0, this.selectedId, snap).subscribe({
      next: () => { this.toast.ok('Order placed!'); this.router.navigate(['/orders']); },
      error: (e) => { this.error = e.error?.message || 'Payment failed — order not created'; this.paying = false; this.toast.err(this.error); }
    });
  }
}
