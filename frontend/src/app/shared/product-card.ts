import { Component, ChangeDetectionStrategy, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Auth } from '../core/auth';
import { Shop } from '../core/shop';
import { CompareStore } from '../core/compare';
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
        <button class="wishlist-btn" (click)="toggleWishlist($event)" [class.on]="inWishlist" [title]="inWishlist ? 'Remove from wishlist' : 'Save to wishlist'" aria-label="Toggle wishlist">
          {{ inWishlist ? '❤️' : '🤍' }}
        </button>
        <button class="compare-btn" (click)="toggleCompare($event)" [class.on]="inCompare"
          [title]="inCompare ? 'Remove from comparison' : 'Add to comparison'" [attr.aria-pressed]="inCompare">
          ⇄ {{ inCompare ? 'Comparing' : 'Compare' }}
        </button>
      </div>
      <div class="product-body">
        <h4><a [routerLink]="['/products', id()]">{{ product?.name }}</a></h4>
        <div class="product-meta">
          <span class="muted">{{ product?.category || categoryName() }}</span>
          <span class="stars" style="font-size:12px" *ngIf="product?.reviewCount > 0">
            ★ {{ product.averageRating | number:'1.1-1' }} <span class="muted" style="font-size:11px">({{ product.reviewCount }})</span>
          </span>
          <span class="muted" style="font-size:11px" *ngIf="!product?.reviewCount">★ New</span>
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
export class ProductCard implements OnInit, OnDestroy {
  @Input() product: any;
  inWishlist = false;
  inCompare = false;
  private compareSub?: Subscription;

  constructor(public auth: Auth, private shop: Shop, private toast: Toast, private compare: CompareStore) {}

  ngOnInit(): void {
    this.checkWishlist();
    this.inCompare = this.compare.has(this.id());
    this.shop.wishlistChanged.subscribe(() => this.checkWishlist());
    this.compareSub = this.compare.changed.subscribe((ids) => (this.inCompare = ids.includes(this.id())));
  }

  ngOnDestroy(): void {
    this.compareSub?.unsubscribe();
  }

  checkWishlist(): void {
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
  toggleCompare(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    const result = this.compare.toggle(this.id());
    if (!result.ok) { this.toast.err(result.message || 'Could not update comparison'); return; }
    this.toast.show(result.added
      ? 'Added to comparison — open Compare in the menu'
      : 'Removed from comparison');
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
