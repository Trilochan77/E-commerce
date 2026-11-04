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
    <article class="product-card" [class.out-of-stock]="!inStock()">
      <div class="product-media-wrap">
        <a [routerLink]="['/products', id()]" class="media-link" aria-label="View product details">
          <app-product-visual [product]="product" size="md"></app-product-visual>
        </a>

        <!-- Top Badges Overlay -->
        <div class="media-badges">
          <span class="badge-status in-stock" *ngIf="inStock()">● In stock</span>
          <span class="badge-status out-stock" *ngIf="!inStock()">Sold out</span>
          <span class="badge-return" *ngIf="product?.eligibleForReturn || product?.isEligibleForReturn">Returnable</span>
        </div>

        <!-- Floating Wishlist Button -->
        <button
          type="button"
          class="wish-floating-btn"
          [class.active]="inWishlist"
          (click)="toggleWishlist($event)"
          [title]="inWishlist ? 'Remove from wishlist' : 'Save to wishlist'"
          aria-label="Wishlist"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" [attr.fill]="inWishlist ? '#ef4444' : 'none'" [attr.stroke]="inWishlist ? '#ef4444' : 'currentColor'" stroke-width="2">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
        </button>

        <!-- Floating Compare Pill -->
        <button
          type="button"
          class="compare-floating-pill"
          [class.active]="inCompare"
          (click)="toggleCompare($event)"
          [title]="inCompare ? 'Remove from comparison' : 'Compare with other products'"
          [attr.aria-pressed]="inCompare"
        >
          ⇄ {{ inCompare ? 'Comparing' : 'Compare' }}
        </button>
      </div>

      <div class="product-content">
        <div class="meta-header">
          <div style="display:flex;align-items:center;gap:5px;overflow:hidden">
            <span class="brand-pill" *ngIf="brandName()">{{ brandName() }}</span>
            <span class="category-pill" *ngIf="categoryName()" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">· {{ categoryName() }}</span>
          </div>

          <div class="rating-badge" *ngIf="product?.reviewCount > 0">
            <span class="star-icon">★</span>
            <span class="rating-num">{{ product.averageRating | number:'1.1-1' }}</span>
            <span class="rating-count">({{ product.reviewCount }})</span>
          </div>
          <span class="rating-new" *ngIf="!product?.reviewCount">★ 5.0 (New)</span>
        </div>

        <h4 class="product-title">
          <a [routerLink]="['/products', id()]" [title]="product?.name">{{ product?.name }}</a>
        </h4>

        <p class="product-snippet" *ngIf="product?.description" style="margin:2px 0 0;font-size:11.5px;color:#94a3b8;line-height:1.4;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden">
          {{ product.description }}
        </p>

        <div class="pricing-container">
          <div class="price-stack">
            <span class="current-price">₹{{ price() | number:'1.0-0' }}</span>
            <span class="mrp-price" *ngIf="originalMrp() > price()">₹{{ originalMrp() | number:'1.0-0' }}</span>
          </div>
          <span class="discount-pill" *ngIf="discountPct() > 0">{{ discountPct() }}% OFF</span>
        </div>

        <div class="card-footer-actions">
          <a [routerLink]="['/products', id()]" class="btn-explore">
            Details
          </a>
          <button
            type="button"
            class="btn-quick-add"
            *ngIf="inStock()"
            (click)="quickAdd($event)"
            title="Quick add to cart"
            [disabled]="adding"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M6 7h15l-1.5 9h-12z"/><path d="M6 7 5 4H2"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/>
            </svg>
            <span>{{ adding ? '…' : '+ Add' }}</span>
          </button>
        </div>
      </div>
    </article>
  `,
  styles: [`
    .product-card {
      background: rgba(13, 19, 39, 0.75);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(148, 163, 255, 0.12);
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1),
                  border-color 0.22s ease,
                  box-shadow 0.22s ease;
      position: relative;
    }
    .product-card:hover {
      transform: translateY(-4px);
      border-color: rgba(139, 92, 246, 0.45);
      box-shadow: 0 16px 36px rgba(2, 5, 12, 0.55), 0 0 0 1px rgba(139, 92, 246, 0.25);
    }
    .product-card.out-of-stock {
      opacity: 0.8;
    }

    .product-media-wrap {
      position: relative;
      aspect-ratio: 4/3;
      background: rgba(8, 12, 25, 0.65);
      overflow: hidden;
    }
    .media-link {
      display: block;
      width: 100%;
      height: 100%;
      transition: transform 0.35s ease;
    }
    .product-card:hover .media-link {
      transform: scale(1.035);
    }

    .media-badges {
      position: absolute;
      top: 9px;
      left: 9px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      z-index: 2;
      pointer-events: none;
    }
    .badge-status {
      font-size: 10.5px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 999px;
      backdrop-filter: blur(8px);
      letter-spacing: 0.02em;
    }
    .badge-status.in-stock {
      background: rgba(16, 185, 129, 0.85);
      color: #032817;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
    }
    .badge-status.out-stock {
      background: rgba(239, 68, 68, 0.85);
      color: #fff;
    }
    .badge-return {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 999px;
      background: rgba(139, 92, 246, 0.82);
      color: #ffffff;
      backdrop-filter: blur(8px);
    }

    .wish-floating-btn {
      position: absolute;
      top: 9px;
      right: 9px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: rgba(6, 9, 20, 0.65);
      backdrop-filter: blur(10px);
      color: #cbd5e1;
      display: grid;
      place-items: center;
      cursor: pointer;
      z-index: 3;
      transition: all 0.18s ease;
    }
    .wish-floating-btn:hover {
      transform: scale(1.12);
      background: rgba(6, 9, 20, 0.85);
      color: #ffffff;
      border-color: rgba(239, 68, 68, 0.4);
    }
    .wish-floating-btn.active {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.6);
      color: #ef4444;
      box-shadow: 0 0 12px rgba(239, 68, 68, 0.4);
    }

    .compare-floating-pill {
      position: absolute;
      left: 9px;
      bottom: 9px;
      border: 1px solid rgba(167, 139, 250, 0.35);
      border-radius: 999px;
      background: rgba(6, 9, 20, 0.7);
      backdrop-filter: blur(8px);
      color: #cbd5e1;
      font-size: 10.5px;
      font-weight: 700;
      padding: 3px 9px;
      cursor: pointer;
      z-index: 3;
      transition: all 0.15s ease;
    }
    .compare-floating-pill:hover {
      border-color: var(--brand);
      color: #fff;
      background: rgba(139, 92, 246, 0.25);
    }
    .compare-floating-pill.active {
      background: var(--brand);
      color: #fff;
      border-color: transparent;
      box-shadow: 0 2px 10px rgba(139, 92, 246, 0.4);
    }

    .product-content {
      padding: 12px 14px 14px;
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 6px;
    }

    .meta-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }
    .brand-pill {
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #38bdf8;
    }
    .category-pill {
      font-size: 10.5px;
      font-weight: 600;
      color: var(--muted);
    }
    .rating-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 11px;
    }
    .star-icon { color: #fbbf24; font-size: 12px; }
    .rating-num { font-weight: 700; color: #f8fafc; }
    .rating-count { color: var(--muted); font-size: 10px; }
    .rating-new { color: var(--muted); font-size: 10px; font-weight: 600; }

    .product-title {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 38px;
    }
    .product-title a {
      color: #e2e8f0;
      text-decoration: none;
      transition: color 0.15s ease;
    }
    .product-title a:hover {
      color: #c084fc;
    }

    .pricing-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-top: 2px;
    }
    .price-stack {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }
    .current-price {
      font-size: 16px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.01em;
    }
    .mrp-price {
      font-size: 12px;
      color: #64748b;
      text-decoration: line-through;
    }
    .discount-pill {
      font-size: 10px;
      font-weight: 800;
      color: #34d399;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(52, 211, 153, 0.3);
      padding: 2px 6px;
      border-radius: 6px;
    }

    .card-footer-actions {
      display: flex;
      gap: 8px;
      margin-top: auto;
      padding-top: 6px;
    }
    .btn-explore {
      flex: 1;
      text-align: center;
      padding: 7px 10px;
      border-radius: 9px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(148, 163, 255, 0.18);
      color: #cbd5e1;
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .btn-explore:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(167, 139, 250, 0.4);
      color: #ffffff;
    }
    .btn-quick-add {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 7px 12px;
      border-radius: 9px;
      background: linear-gradient(135deg, #8b5cf6, #d946ef);
      border: 0;
      color: #ffffff;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.35);
      transition: all 0.15s ease;
    }
    .btn-quick-add:hover {
      filter: brightness(1.12);
      transform: translateY(-1px);
    }
    .btn-quick-add:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  `]
})
export class ProductCard implements OnInit, OnDestroy {
  @Input() product: any;
  inWishlist = false;
  inCompare = false;
  adding = false;
  private compareSub?: Subscription;

  constructor(
    public auth: Auth,
    private shop: Shop,
    private toast: Toast,
    private compare: CompareStore
  ) {}

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

  originalMrp(): number {
    const p = this.price();
    // Simulate realistic market MSRP + 15-22% savings
    return Math.round(p * 1.18);
  }

  discountPct(): number {
    const mrp = this.originalMrp();
    const cur = this.price();
    if (!mrp || mrp <= cur) return 0;
    return Math.round(((mrp - cur) / mrp) * 100);
  }

  brandName(): string {
    if (this.product?.brand && this.product.brand !== 'Other') return this.product.brand;
    const name = (this.product?.name || '').toLowerCase();
    const brands = ['Apple', 'Samsung', 'Sony', 'OnePlus', 'boAt', 'Realme', 'Boult', 'Noise', 'Dell', 'ASUS', 'HP', 'Lenovo', 'Acer', 'JBL', 'Bose', 'Marshall'];
    for (const b of brands) {
      if (name.includes(b.toLowerCase())) return b;
    }
    return '';
  }

  categoryName(): string {
    return this.product?.categoryName || this.product?.category || this.product?.categoryId || '';
  }

  inStock(): boolean {
    if (typeof this.product?.availability === 'boolean') return this.product.availability;
    return (this.product?.stockQuantity ?? 1) > 0;
  }

  quickAdd(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    if (!this.auth.isLoggedIn()) {
      this.toast.show('Please log in to add items to your cart', 'info');
      return;
    }
    this.adding = true;
    this.shop.cartAdd(this.auth.userId(), this.id(), 1).subscribe({
      next: () => {
        this.adding = false;
        this.toast.ok(`Added "${this.product.name}" to cart`);
      },
      error: (err) => {
        this.adding = false;
        this.toast.err(err.error?.message || 'Could not add to cart');
      }
    });
  }

  toggleCompare(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    const result = this.compare.toggle(this.id());
    if (!result.ok) {
      this.toast.err(result.message || 'Could not update comparison');
      return;
    }
    this.toast.show(result.added ? 'Added to comparison ⇄' : 'Removed from comparison');
  }

  toggleWishlist(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    if (!this.auth.isLoggedIn()) {
      this.toast.err('Please log in to save to wishlist');
      return;
    }
    const id = this.id();
    const price = this.price();
    if (this.inWishlist) {
      this.shop.wishlistRemove(this.auth.userId(), id).subscribe({
        next: () => {
          this.inWishlist = false;
          this.toast.show('Removed from wishlist');
        },
        error: () => this.toast.err('Could not remove from wishlist')
      });
    } else {
      this.shop.wishlistAdd(this.auth.userId(), id, price).subscribe({
        next: () => {
          this.inWishlist = true;
          this.toast.ok('Saved to wishlist ❤️');
        },
        error: () => this.toast.err('Could not save to wishlist')
      });
    }
  }
}
