import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ShopService } from '../core/shop.service';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <article class="product">
      <div class="product-media">
        <img [src]="img()" [alt]="product?.name" loading="lazy">
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
export class ProductCardComponent {
  @Input() product: any;

  constructor(public auth: AuthService, private shop: ShopService, private toast: ToastService) {}

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
  img(): string {
    if (this.product?.image) return this.product.image;
    if (this.product?.images && this.product.images.length) return this.product.images[0];
    return 'https://picsum.photos/seed/' + (this.id() || 'shop') + '/400/300';
  }
  quickAdd(): void {
    this.shop.cartAdd(this.auth.userId(), this.id(), 1).subscribe({
      next: () => this.toast.ok('Added to cart'),
      error: (e) => this.toast.err(e.error?.message || 'Could not add to cart')
    });
  }
}
