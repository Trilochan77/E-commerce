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
        <div class="row" style="justify-content:space-between"><span>To pay</span><span class="total">₹{{ payable() | number }}</span></div>
        <button class="primary" style="width:100%;margin-top:10px" (click)="pay()" [disabled]="!cart?.items?.length || paying">{{ paying ? 'Processing…' : 'Pay & Place Order' }}</button>
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

  constructor(private shop: ShopService, private auth: AuthService, private router: Router, private toast: ToastService) {}

  ngOnInit(): void {
    this.shop.cart(this.auth.userId()).subscribe((c: any) => (this.cart = c));
    this.shop.wallet(this.auth.userId()).subscribe({ next: (w: any) => (this.wallet = w), error: () => undefined });
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
    if (+this.points > this.maxUsable()) {
      this.error = 'Points exceed 20% cap (max ' + this.maxUsable() + ')';
      this.paying = false;
      return;
    }
    this.shop.checkout(this.auth.userId(), this.method, +this.points || 0).subscribe({
      next: () => { this.toast.ok('Order placed!'); this.router.navigate(['/orders']); },
      error: (e) => { this.error = e.error?.message || 'Payment failed — order not created'; this.paying = false; this.toast.err(this.error); }
    });
  }
}
