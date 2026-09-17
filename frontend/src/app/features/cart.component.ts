import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ShopService } from '../core/shop.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="card">
      <h2>Shopping Cart</h2>
      <table *ngIf="cart?.items?.length">
        <tr><th>Product</th><th>Qty</th><th>Unit price</th><th>Total</th><th></th></tr>
        <tr *ngFor="let i of cart.items">
          <td><a [routerLink]="['/products', i.productId]">{{ i.productId }}</a></td>
          <td><input [ngModel]="i.quantity" (ngModelChange)="update(i.productId, $event)" type="number" min="1" style="width:60px" [ngModelOptions]="{standalone: true}"></td>
          <td>₹{{ i.unitPrice }}</td>
          <td>₹{{ i.unitPrice * i.quantity }}</td>
          <td><button class="danger" (click)="remove(i.productId)">Remove</button></td>
        </tr>
      </table>
      <p class="muted" *ngIf="!cart?.items?.length">Cart is empty.</p>
      <div class="row" *ngIf="cart?.items?.length">
        <strong>Total: ₹{{ cart.totalAmount }}</strong>
        <a routerLink="/checkout"><button class="primary">Checkout</button></a>
      </div>
      <p class="error" *ngIf="error">{{ error }}</p>
    </div>
  `
})
export class CartComponent implements OnInit {
  cart: any = null;
  error = '';

  constructor(private shop: ShopService, private auth: AuthService) {}

  ngOnInit(): void {
    this.reload();
  }

  uid(): string {
    return this.auth.userId();
  }

  reload(): void {
    this.shop.cart(this.uid()).subscribe((c: any) => this.cart = c);
  }

  update(productId: string, qty: any): void {
    this.error = '';
    this.shop.cartQty(this.uid(), productId, +qty || 1).subscribe({
      next: (c: any) => this.cart = c,
      error: (e) => this.error = e.error?.message || 'Update failed'
    });
  }

  remove(productId: string): void {
    this.shop.cartRemove(this.uid(), productId).subscribe((c: any) => this.cart = c);
  }
}
