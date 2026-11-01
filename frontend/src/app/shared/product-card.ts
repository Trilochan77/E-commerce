import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
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
        <button class="wishlist-btn" *ngIf="auth.isLoggedIn()" (click)="toggleWishlist($event)" [class.on]="inWishlist">
          {{ inWishlist ? '❤' : '♡' }}
        </button>
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
export class ProductCard implements OnInit {
  @Input() product: any;
  inWishlist = false;

  constructor(public auth: Auth, private shop: Shop, private toast: Toast) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) return;
    const id = this.id();
    if (!id) return;
    this.shop.wishlistContains(this.auth.userId(), id).subscribe({
      next: (r: any) => (this.inWishlist = !!r?.inWishlist),
      error: () => undefined
    });
  }

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
  toggleWishlist(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    if (!this.auth.isLoggedIn()) { this.toast.err('Please log in to save to wishlist'); return; }
    const id = this.id();
    const price = this.price();
    if (this.inWishlist) {
      this.shop.wishlistRemove(this.auth.userId(), id).subscribe({
        next: () => { this.inWishlist = false; this.toast.show('Removed from wishlist'); },
        error: () => this.toast.err('Could not remove from wishlist')
      });
    } else {
      this.shop.wishlistAdd(this.auth.userId(), id, price).subscribe({
        next: () => { this.inWishlist = true; this.toast.ok('Saved to wishlist'); },
        error: () => this.toast.err('Could not save to wishlist')
      });
    }
  }
}

