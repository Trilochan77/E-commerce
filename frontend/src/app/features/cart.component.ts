import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShopService } from '../core/shop.service';
import { AuthService } from '../core/auth.service';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, EmptyStateComponent],
  template: `
    <div class="breadcrumb"><a routerLink="/">Home</a> / Cart</div>
    <div class="steps-checkout"><span class="step now">1 · Cart</span><span>→</span><span class="step">2 · Checkout</span><span>→</span><span class="step">3 · Done</span></div>
    <div class="cart-layout" *ngIf="cart?.items?.length; else emptyCart">
      <div class="card" style="margin:0">
        <div class="section-title"><h2>🛒 Your Cart ({{ count() }})</h2><button class="btn-ghost btn-sm" (click)="clear()">Clear all</button></div>
        <div class="line-item" *ngFor="let i of cart.items">
          <img [src]="'https://picsum.photos/seed/'+i.productId+'/200/160'" [alt]="i.productId">
          <div>
            <strong><a [routerLink]="['/products', i.productId]">{{ names[i.productId] || i.productId }}</a></strong>
            <div class="muted">₹{{ i.unitPrice | number }} each · <span style="color:#15803d">in stock</span></div>
            <div class="row">
              <span class="qty-stepper"><button (click)="update(i.productId, i.quantity-1)">−</button><span>{{ i.quantity }}</span><button (click)="update(i.productId, i.quantity+1)">+</button></span>
              <button class="danger btn-sm" (click)="remove(i.productId)">Remove</button>
            </div>
          </div>
          <div style="text-align:right"><strong>₹{{ i.unitPrice * i.quantity | number }}</strong><div class="muted">{{ i.quantity }} × ₹{{ i.unitPrice }}</div></div>
        </div>
        <p class="error" *ngIf="error">{{ error }}</p>
      </div>
      <aside class="card summary">
        <h3>Order Summary</h3>
        <div class="muted">Free shipping over ₹999</div>
        <div class="progress" style="margin:8px 0"><div [style.width.%]="shipPct()"></div></div>
        <div class="muted" style="margin-bottom:8px">{{ shipMsg() }}</div>
        <div class="row" style="justify-content:space-between"><span>Subtotal</span><strong>₹{{ cart.totalAmount | number }}</strong></div>
        <div class="row" style="justify-content:space-between"><span>Delivery</span><strong>{{ cart.totalAmount >= 999 ? 'FREE' : '₹49' }}</strong></div>
        <div class="row" style="justify-content:space-between"><span>Wallet hint</span><span class="badge violet">up to 20% off at checkout</span></div>
        <div class="divider"></div>
        <div class="row" style="justify-content:space-between"><span>Total</span><span class="total">₹{{ grandTotal() | number }}</span></div>
        <a routerLink="/checkout" style="display:block;margin-top:10px"><button class="primary" style="width:100%">Proceed to Checkout →</button></a>
        <a routerLink="/products" style="display:block;margin-top:8px;text-align:center" class="muted">Continue shopping</a>
      </aside>
    </div>
    <ng-template #emptyCart>
      <app-empty-state icon="🛒" title="Your cart is empty" hint="Add something you love — rewards apply at checkout." ctaLink="/products"></app-empty-state>
    </ng-template>
  `
})
export class CartComponent implements OnInit {
  cart: any = null;
  error = '';
  names: Record<string, string> = {};

  constructor(private shop: ShopService, private auth: AuthService, private toast: ToastService) {}

  ngOnInit(): void { this.reload(); }

  uid(): string { return this.auth.userId(); }

  reload(): void {
    this.shop.cart(this.uid()).subscribe((c: any) => {
      this.cart = c;
      (c?.items || []).forEach((i: any) => {
        if (!this.names[i.productId]) {
          this.shop.product(i.productId).subscribe({ next: (p: any) => (this.names[i.productId] = p.name), error: () => undefined });
        }
      });
    });
  }

  count(): number { return (this.cart?.items || []).reduce((s: number, i: any) => s + i.quantity, 0); }
  grandTotal(): number { return (this.cart?.totalAmount || 0) + ((this.cart?.totalAmount || 0) >= 999 ? 0 : 49); }
  shipPct(): number { return Math.min(100, ((this.cart?.totalAmount || 0) / 999) * 100); }
  shipMsg(): string {
    const t = this.cart?.totalAmount || 0;
    return t >= 999 ? '🎉 You unlocked FREE delivery' : 'Add ₹' + (999 - t) + ' more for free delivery';
  }

  update(productId: string, qty: any): void {
    this.error = '';
    qty = +qty || 1;
    if (qty < 1) return this.remove(productId);
    this.shop.cartQty(this.uid(), productId, qty).subscribe({
      next: (c: any) => (this.cart = c),
      error: (e) => { this.error = e.error?.message || 'Update failed'; this.toast.err(this.error); }
    });
  }
  remove(productId: string): void {
    this.shop.cartRemove(this.uid(), productId).subscribe({ next: (c: any) => { this.cart = c; this.toast.show('Removed from cart'); } });
  }
  clear(): void {
    (this.cart?.items || []).forEach((i: any) => this.shop.cartRemove(this.uid(), i.productId).subscribe());
    this.cart = { items: [], totalAmount: 0 };
  }
}
