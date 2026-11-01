import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Shop } from '../core/shop';
import { Auth } from '../core/auth';
import { Toast } from '../shared/toast';
import { ProductVisual } from '../shared/product-visual';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-wishlist',
  imports: [CommonModule, FormsModule, RouterModule, ProductVisual],
  template: `
    <div class="container">
      <div class="page-head">
        <div>
          <h1>❤️ Wishlist</h1>
          <p>{{ items.length }} saved product{{ items.length === 1 ? '' : 's' }}</p>
        </div>
        <a routerLink="/products"><button class="btn-ghost">Continue shopping</button></a>
      </div>

      <div *ngIf="loading"><p class="muted"><span class="spinner"></span> Loading wishlist…</p></div>

      <div *ngIf="!loading && items.length === 0" class="card">
        <div class="empty">
          <div class="big">💔</div>
          <p style="margin:8px 0;font-weight:600">Your wishlist is empty</p>
          <p class="muted">Save products you love to come back to them later.</p>
          <a routerLink="/products"><button class="primary" style="margin-top:10px">Browse products</button></a>
        </div>
      </div>

      <div class="grid" *ngIf="!loading && items.length">
        <div class="product" *ngFor="let w of items">
          <div class="product-media">
            <app-product-visual [product]="w.product" [categoryId]="w.product?.categoryId" size="md"></app-product-visual>
            <div class="tag-row">
              <span class="flag green" *ngIf="priceDropped(w)">Price dropped!</span>
              <span class="flag amber" *ngIf="!inStock(w)">Out of stock</span>
            </div>
          </div>
          <div class="product-body">
            <h4><a [routerLink]="['/products', w.product?.id || w.product?._id]">{{ w.product?.name || 'Loading…' }}</a></h4>
            <div class="price-row">
              <span class="price">₹{{ w.product?.price | number }}</span>
              <span class="price-note" *ngIf="priceDropped(w)" style="color:#15803d;text-decoration:line-through">was ₹{{ w.priceAtAdd | number }}</span>
              <span class="price-note" *ngIf="priceIncreased(w)" style="color:#b91c1c">was ₹{{ w.priceAtAdd | number }}</span>
            </div>
            <div class="product-meta">
              <span class="badge" [ngClass]="inStock(w) ? 'ok' : 'bad'">
                {{ inStock(w) ? 'In stock' : 'Out of stock' }}
              </span>
              <span class="muted" style="font-size:11px">Saved {{ w.addedAt | date:'mediumDate' }}</span>
            </div>
            <div class="quick-add" style="margin-top:6px">
              <button class="primary btn-sm" (click)="moveToCart(w)" [disabled]="!inStock(w) || moving===w.productId">
                {{ moving===w.productId ? 'Moving…' : 'Move to Cart' }}
              </button>
              <button class="btn-ghost btn-sm" (click)="remove(w.productId)" [disabled]="removing===w.productId">
                {{ removing===w.productId ? '…' : 'Remove' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class Wishlist implements OnInit {
  items: any[] = [];
  loading = false;
  moving = '';
  removing = '';
  error = '';

  constructor(private shop: Shop, public auth: Auth, private router: Router, private toast: Toast) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/login']); return; }
    this.load();
  }

  load(): void {
    this.loading = true;
    const uid = this.auth.userId();
    this.shop.wishlist(uid).subscribe({
      next: (w: any) => {
        const productIds = (w?.items || []).map((i: any) => i.productId);
        if (productIds.length === 0) { this.items = []; this.loading = false; return; }
        // fetch product details for each
        this.items = (w?.items || []).map((i: any) => ({
          productId: i.productId,
          priceAtAdd: i.priceAtAdd || 0,
          addedAt: i.addedAt,
          product: null
        }));
        let loaded = 0;
        this.items.forEach((it: any) => {
          this.shop.product(it.productId).subscribe({
            next: (p: any) => {
              it.product = p;
              // price-drop notification
              if (it.priceAtAdd > 0 && (p?.price ?? 0) < it.priceAtAdd) {
                this.toast.ok(`Price dropped! ${p?.name || 'Item'} now ₹${p?.price} (was ₹${it.priceAtAdd})`);
              }
              loaded++;
              if (loaded === this.items.length) this.loading = false;
            },
            error: () => { loaded++; if (loaded === this.items.length) this.loading = false; }
          });
        });
      },
      error: () => { this.loading = false; this.error = 'Could not load wishlist'; }
    });
  }

  inStock(w: any): boolean {
    return (w.product?.stockQuantity ?? 1) > 0;
  }

  priceDropped(w: any): boolean {
    return w.priceAtAdd > 0 && (w.product?.price ?? 0) < w.priceAtAdd;
  }

  priceIncreased(w: any): boolean {
    return w.priceAtAdd > 0 && (w.product?.price ?? 0) > w.priceAtAdd;
  }

  moveToCart(w: any): void {
    if (!w.product || !this.inStock(w)) return;
    this.moving = w.productId;
    const id = w.product.id || w.product._id;
    this.shop.cartAdd(this.auth.userId(), id, 1).subscribe({
      next: () => {
        this.shop.wishlistRemove(this.auth.userId(), w.productId).subscribe({
          next: () => {
            this.moving = '';
            this.toast.ok('Moved to cart');
            this.items = this.items.filter(x => x.productId !== w.productId);
          },
          error: () => { this.moving = ''; this.toast.err('Could not remove from wishlist'); }
        });
      },
      error: (e) => { this.moving = ''; this.toast.err(e.error?.message || 'Could not add to cart'); }
    });
  }

  remove(productId: string): void {
    this.removing = productId;
    this.shop.wishlistRemove(this.auth.userId(), productId).subscribe({
      next: () => {
        this.removing = '';
        this.toast.show('Removed from wishlist');
        this.items = this.items.filter(x => x.productId !== productId);
      },
      error: () => { this.removing = ''; this.toast.err('Could not remove'); }
    });
  }
}
