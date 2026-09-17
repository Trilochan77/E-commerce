import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ShopService } from '../core/shop.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="card">
      <h2>Checkout</h2>
      <p *ngIf="cart">Items: {{ itemCount() }} · Subtotal: ₹{{ cart.totalAmount }}</p>
      <p *ngIf="wallet">Reward balance: <strong>{{ wallet.balance }}</strong> pts (₹1 each, max 20% of order)</p>
      <div class="form-grid">
        <label>Reward points to use
          <input [(ngModel)]="points" name="points" type="number" min="0" [max]="wallet?.balance || 0">
        </label>
        <label>Payment method
          <select [(ngModel)]="method" name="method">
            <option value="COD">Cash on Delivery</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
          </select>
        </label>
        <p>Payable: <strong>₹{{ payable() }}</strong></p>
        <button class="primary" (click)="pay()" [disabled]="!cart?.items?.length">Pay & Place Order</button>
      </div>
      <p class="error" *ngIf="error">{{ error }}</p>
    </div>
  `
})
export class CheckoutComponent implements OnInit {
  cart: any = null;
  wallet: any = null;
  points = 0;
  method = 'COD';
  error = '';

  constructor(private shop: ShopService, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.shop.cart(this.auth.userId()).subscribe((c: any) => this.cart = c);
    this.shop.wallet(this.auth.userId()).subscribe({ next: (w: any) => this.wallet = w, error: () => undefined });
  }

  itemCount(): number {
    return (this.cart?.items || []).reduce((s: number, i: any) => s + i.quantity, 0);
  }

  payable(): number {
    const sub = this.cart?.totalAmount || 0;
    return Math.max(0, sub - (+this.points || 0));
  }

  pay(): void {
    this.error = '';
    this.shop.checkout(this.auth.userId(), this.method, +this.points || 0).subscribe({
      next: () => this.router.navigate(['/orders']),
      error: (e) => this.error = e.error?.message || 'Payment failed — order not created'
    });
  }
}
