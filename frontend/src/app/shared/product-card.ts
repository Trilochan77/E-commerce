import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Auth } from '../core/auth';
import { Shop } from '../core/shop';
import { Toast } from './toast';
import { ProductVisual } from './product-visual';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-product-card',
  imports: [CommonModule, RouterModule, ProductVisual],
  template: `
    <article class="product">
      <div class="product-media">
        <app-product-visual [product]="product" size="md"></app-product-visual>
        <div class="tag-row">
          <span class="flag green" *ngIf="inStock()">In stock</span>
          <span class="flag amber" *ngIf="!inStock()">Out of stock</span>
          <span class="flag violet" *ngIf="product?.eligibleForReturn || product?.isEligibleForReturn">Return eligible</span>
        </div>
      </div>
      <div class="product-body">
        <h4><a [routerLink]="['/products', id()]">{{ product?.name }}</a></h4>
        <div class="product-meta">
          <span class="muted">{{ product?.category || categoryName() }}</span>
        </div>
        <div class="price-row">
          <span class="price">Rs.{{ price() | number }}</span>
        </div>
        <div class="quick-add">
          <a [routerLink]="['/products', id()]"><button class="btn-ghost btn-sm">View</button></a>
          <button class="primary btn-sm" style="padding:7px 12px" *ngIf="auth.isLoggedIn() && inStock()" (click)="quickAdd()">Add</button>
        </div>
      </div>
    </article>
  `
})
export class ProductCard {
  @Input() product: any;

  constructor(public auth: Auth, private shop: Shop, private toast: Toast) {}

  id(): string {
    return this.product?.productId || this.product?.id || this.product?._id || '';
  }
  price(): number {
    return this.product?.price || 0;
  }
  categoryName(): string {
    return this.product?.categoryName || this.product?.categoryId || '';
  }
  inStock(): boolean {
    if (typeof this.product?.availability === 'boolean') return this.product.availability;
    return (this.product?.stockQuantity ?? 1) > 0;
  }
  quickAdd(): void {
    this.shop.cartAdd(this.auth.userId(), this.id(), 1).subscribe({
      next: () => this.toast.ok('Added to cart'),
      error: (e) => this.toast.err(e.error?.message || 'Could not add to cart')
    });
  }
}
