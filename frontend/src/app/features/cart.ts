import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Shop } from '../core/shop';
import { Auth } from '../core/auth';
import { EmptyState } from '../shared/empty-state';
import { ProductVisual } from '../shared/product-visual';
import { Toast } from '../shared/toast';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-cart',
  imports: [CommonModule, RouterModule, ProductVisual],
  template: `
    <div class="breadcrumb"><a routerLink="/">Home</a> / Shopping Cart</div>

    <!-- Steps Indicator -->
    <div class="steps-checkout">
      <span class="step now">1 · Review Bag</span>
      <span>→</span>
      <span class="step">2 · Delivery &amp; Pay</span>
      <span>→</span>
      <span class="step">3 · Confirmation</span>
    </div>

    <div class="cart-layout" *ngIf="cart?.items?.length; else emptyCart">
      <!-- Main Cart Items List -->
      <div class="card" style="margin:0">
        <div class="section-title">
          <div style="display:flex;align-items:center;gap:10px">
            <h2>🛍️ Your Shopping Bag</h2>
            <span class="badge info">{{ count() }} item{{ count() === 1 ? '' : 's' }}</span>
          </div>
          <button class="btn-ghost btn-sm" (click)="clear()" style="color:#ef4444">Clear bag</button>
        </div>

        <!-- Free Delivery Progress Bar -->
        <div class="shipping-threshold-banner">
          <div class="threshold-header">
            <span *ngIf="cart.totalAmount >= 999" style="color:#34d399;font-weight:700">
              🎉 You unlocked FREE Express Delivery!
            </span>
            <span *ngIf="cart.totalAmount < 999" class="muted">
              Add <strong>₹{{ 999 - cart.totalAmount | number:'1.0-0' }}</strong> more to unlock <strong>FREE Express Delivery</strong>!
            </span>
            <span class="muted" style="font-size:11px">₹{{ cart.totalAmount | number:'1.0-0' }} / ₹999</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" [style.width.%]="shipPct()"></div>
          </div>
        </div>

        <div class="cart-items-stack">
          <div class="cart-line-item" *ngFor="let i of cart.items">
            <app-product-visual [product]="{ productId: i.productId, name: names[i.productId] || i.productId }" size="sm"></app-product-visual>
            <div class="line-item-info">
              <strong class="item-name">
                <a [routerLink]="['/products', i.productId]">{{ names[i.productId] || i.productId }}</a>
              </strong>
              <div class="item-meta">
                <span class="item-price">₹{{ i.unitPrice | number:'1.0-0' }}</span>
                <span class="badge ok" style="font-size:10.5px">In stock</span>
                <span class="badge violet" style="font-size:10.5px">7-Day Return</span>
              </div>
              <div class="item-actions-row">
                <div class="qty-stepper">
                  <button (click)="update(i.productId, i.quantity - 1)" aria-label="Decrease">−</button>
                  <span>{{ i.quantity }}</span>
                  <button (click)="update(i.productId, i.quantity + 1)" aria-label="Increase">+</button>
                </div>
                <button class="btn-remove" (click)="remove(i.productId)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  <span>Remove</span>
                </button>
              </div>
            </div>
            <div class="line-item-total">
              <div class="line-amount">₹{{ (i.unitPrice * i.quantity) | number:'1.0-0' }}</div>
              <span class="muted" style="font-size:11px">({{ i.quantity }} × ₹{{ i.unitPrice | number:'1.0-0' }})</span>
            </div>
          </div>
        </div>

        <p class="error" *ngIf="error" style="margin-top:14px">{{ error }}</p>
      </div>

      <!-- Order Summary Card -->
      <aside class="card summary" style="margin:0">
        <h3>Order Summary</h3>

        <div class="summary-breakdown">
          <div class="summary-row">
            <span class="muted">Bag Subtotal</span>
            <strong>₹{{ cart.totalAmount | number:'1.0-0' }}</strong>
          </div>
          <div class="summary-row">
            <span class="muted">Estimated Delivery</span>
            <strong [style.color]="cart.totalAmount >= 999 ? '#34d399' : '#ffffff'">
              {{ cart.totalAmount >= 999 ? 'FREE' : '₹49' }}
            </strong>
          </div>
          <div class="summary-row">
            <span class="muted">Reward Coins Eligible</span>
            <span class="badge ok">100% Guaranteed</span>
          </div>
          <div class="summary-row">
            <span class="muted">Wallet Discount Hint</span>
            <span class="badge violet">Up to 20% off at checkout</span>
          </div>

          <div class="divider"></div>

          <div class="summary-row total-row">
            <span>Estimated Total</span>
            <span class="total-amount">₹{{ grandTotal() | number:'1.0-0' }}</span>
          </div>
        </div>

        <div style="margin-top:16px">
          <a routerLink="/checkout" style="display:block;text-decoration:none">
            <button class="primary btn-checkout-large" style="width:100%">
              Proceed to Secure Checkout →
            </button>
          </a>
          <a routerLink="/products" class="continue-link">
            ← Continue browsing products
          </a>
        </div>

        <!-- Trust Features -->
        <div class="cart-trust-footer">
          <div class="trust-mini"><span class="ic">🔒</span> 256-bit Encrypted Checkout</div>
          <div class="trust-mini"><span class="ic">🛡️</span> 7-Day Doorstep Returns</div>
          <div class="trust-mini"><span class="ic">🪙</span> Instant Points Cashback</div>
        </div>
      </aside>
    </div>

    <!-- Empty State Template -->
    <ng-template #emptyCart>
      <div class="card empty-cart-box" style="text-align:center;padding:48px 20px">
        <div style="font-size:52px;margin-bottom:12px">🛍️</div>
        <h2 style="font-size:22px">Your Shopping Bag is Empty</h2>
        <p class="muted" style="max-width:440px;margin:8px auto 20px;font-size:14px">
          Explore our collection of flagship smartphones, ultrabooks, audiophile noise-cancelling headphones, and lifestyle gear.
        </p>
        <div class="row" style="justify-content:center;gap:10px">
          <a routerLink="/products"><button class="primary">Explore Catalog</button></a>
          <a routerLink="/wishlist" *ngIf="auth.isLoggedIn()"><button class="btn-ghost">View Saved Wishlist</button></a>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .shipping-threshold-banner {
      background: rgba(6, 9, 20, 0.6);
      border: 1px solid rgba(148, 163, 255, 0.12);
      border-radius: 12px;
      padding: 10px 14px;
      margin-bottom: 16px;
    }
    .threshold-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12.5px;
      margin-bottom: 6px;
    }
    .progress-bar-track {
      height: 6px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 999px;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #38bdf8);
      border-radius: 999px;
      transition: width 0.3s ease;
    }

    .cart-items-stack {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .cart-line-item {
      display: grid;
      grid-template-columns: 88px 1fr auto;
      gap: 14px;
      align-items: center;
      background: rgba(6, 9, 20, 0.5);
      border: 1px solid rgba(148, 163, 255, 0.1);
      border-radius: 14px;
      padding: 12px 14px;
      transition: border-color 0.15s ease;
    }
    .cart-line-item:hover {
      border-color: rgba(139, 92, 246, 0.35);
    }
    .line-item-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }
    .item-name {
      font-size: 14px;
      line-height: 1.35;
    }
    .item-name a {
      color: #e2e8f0;
      text-decoration: none;
    }
    .item-name a:hover {
      color: #38bdf8;
    }
    .item-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 2px;
      flex-wrap: wrap;
    }
    .item-price {
      font-weight: 700;
      color: #ffffff;
      font-size: 13.5px;
    }
    .item-actions-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 6px;
    }
    .btn-remove {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: transparent;
      border: 0;
      color: #f87171;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      padding: 4px 6px;
      border-radius: 6px;
      transition: background 0.15s ease;
    }
    .btn-remove:hover {
      background: rgba(239, 68, 68, 0.12);
    }

    .line-item-total {
      text-align: right;
    }
    .line-amount {
      font-size: 16px;
      font-weight: 800;
      color: #ffffff;
    }

    .summary-breakdown {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 12px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13.5px;
    }
    .total-row {
      margin-top: 4px;
      font-size: 16px;
      font-weight: 800;
      color: #ffffff;
    }
    .total-amount {
      font-size: 24px;
      color: #38bdf8;
      letter-spacing: -0.01em;
    }

    .btn-checkout-large {
      padding: 13px;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.02em;
    }
    .continue-link {
      display: block;
      text-align: center;
      margin-top: 10px;
      font-size: 12.5px;
      color: var(--muted);
      text-decoration: none;
    }
    .continue-link:hover {
      color: #ffffff;
    }

    .cart-trust-footer {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 20px;
      padding-top: 14px;
      border-top: 1px solid rgba(148, 163, 255, 0.12);
    }
    .trust-mini {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11.5px;
      color: #94a3b8;
    }

    @media (max-width: 600px) {
      .cart-line-item { grid-template-columns: 1fr; }
      .line-item-total { text-align: left; }
    }
  `]
})
export class Cart implements OnInit {
  cart: any = null;
  error = '';
  names: Record<string, string> = {};

  constructor(private shop: Shop, private auth: Auth, private toast: Toast) {}

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    const uid = this.auth.userId();
    this.shop.cart(uid).subscribe({
      next: (c: any) => {
        this.cart = c;
        (c?.items || []).forEach((i: any) => {
          if (!this.names[i.productId]) {
            this.shop.product(i.productId).subscribe({
              next: (p: any) => (this.names[i.productId] = p?.name || i.productId),
              error: () => (this.names[i.productId] = i.productId)
            });
          }
        });
      },
      error: () => (this.cart = { items: [], totalAmount: 0 })
    });
  }

  count(): number {
    return (this.cart?.items || []).reduce((s: number, i: any) => s + (i.quantity || 0), 0);
  }

  shipPct(): number {
    const amt = this.cart?.totalAmount || 0;
    return Math.min(100, Math.round((amt / 999) * 100));
  }

  grandTotal(): number {
    const sub = this.cart?.totalAmount || 0;
    const ship = sub >= 999 ? 0 : 49;
    return sub + ship;
  }

  update(productId: string, quantity: number): void {
    this.error = '';
    const uid = this.auth.userId();
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    this.shop.cartUpdate(uid, productId, quantity).subscribe({
      next: () => {
        this.reload();
        this.toast.ok('Cart updated');
      },
      error: (e: any) => {
        this.error = e.error?.message || 'Could not update cart';
        this.toast.err(this.error);
      }
    });
  }

  remove(productId: string): void {
    this.error = '';
    const uid = this.auth.userId();
    this.shop.cartRemove(uid, productId).subscribe({
      next: () => {
        this.reload();
        this.toast.ok('Item removed from cart');
      },
      error: (e) => {
        this.error = e.error?.message || 'Could not remove';
        this.toast.err(this.error);
      }
    });
  }

  clear(): void {
    this.error = '';
    const uid = this.auth.userId();
    this.shop.cartClear(uid).subscribe({
      next: () => {
        this.reload();
        this.toast.ok('Shopping bag cleared');
      },
      error: () => undefined
    });
  }
}
