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
  styles: [`
    .wishlist-hero {
      background: linear-gradient(135deg, rgba(124,58,237,.12), rgba(99,102,241,.08));
      border: 1px solid rgba(124,58,237,.25);
      border-radius: var(--radius);
      padding: 20px 24px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .price-drop-banner {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
      border-radius: var(--radius);
      padding: 14px 18px;
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }
    .filter-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; align-items: center; }
    .tab-pill {
      padding: 7px 14px; border: 1px solid var(--line); background: #fff;
      border-radius: 999px; cursor: pointer; font-weight: 600; font-size: 13px; color: var(--ink-2);
      transition: all .15s;
    }
    .tab-pill.active { background: var(--brand); color: #fff; border-color: var(--brand); }
    .price-savings {
      display: inline-flex; align-items: center; gap: 4px;
      background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 700;
      padding: 2px 7px; border-radius: 4px;
    }
    .price-up {
      display: inline-flex; align-items: center; gap: 4px;
      background: #fee2e2; color: #b91c1c; font-size: 11px; font-weight: 700;
      padding: 2px 7px; border-radius: 4px;
    }
    .demo-pill {
      font-size: 11px; font-weight: 600; padding: 3px 8px;
      border-radius: 4px; border: 1px dashed #cbd5e1;
      background: #f8fafc; color: #64748b; cursor: pointer;
    }
    .demo-pill:hover { background: #ede9fe; color: #7c3aed; border-color: #7c3aed; }
  `],
  template: `
    <div class="container">
      <div class="page-head">
        <div>
          <h1>❤️ Wishlist</h1>
          <p>Saved items with real-time stock availability and price drop alerts.</p>
        </div>
        <div class="row" style="margin:0">
          <button *ngIf="items.length && inStockItems().length" class="primary btn-sm" (click)="moveAllToCart()" [disabled]="movingAll">
            {{ movingAll ? 'Moving all…' : 'Move All In-Stock to Cart (' + inStockItems().length + ')' }}
          </button>
          <button *ngIf="items.length" class="btn-ghost btn-sm" (click)="clearWishlist()" [disabled]="clearing">
            {{ clearing ? 'Clearing…' : 'Clear Wishlist' }}
          </button>
          <a routerLink="/products"><button class="btn-ghost btn-sm">Continue Shopping</button></a>
        </div>
      </div>

      <!-- Price Drop Alert Notification Banner -->
      <div class="price-drop-banner" *ngIf="priceDropItems().length > 0">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:24px">🎉</span>
          <div>
            <strong style="font-size:15px">Price Drop Alert! {{ priceDropItems().length }} product{{ priceDropItems().length === 1 ? '' : 's' }} are now cheaper!</strong>
            <p style="margin:2px 0 0;font-size:13px">You save a total of <strong>₹{{ totalSavings() | number }}</strong> if you buy now.</p>
          </div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="primary btn-sm" style="background:#059669" (click)="filter = 'DROPPED'">
            View Cheaper Items ({{ priceDropItems().length }})
          </button>
        </div>
      </div>

      <!-- Summary Stats Hero -->
      <div class="wishlist-hero" *ngIf="items.length > 0">
        <div>
          <div style="font-size:13px;font-weight:700;color:var(--brand);text-transform:uppercase;letter-spacing:.05em">Wishlist Overview</div>
          <div style="font-size:22px;font-weight:800;margin-top:2px">{{ items.length }} Product{{ items.length === 1 ? '' : 's' }} Saved</div>
        </div>
        <div class="row" style="margin:0;gap:16px">
          <div class="stat-card" style="padding:8px 14px;border-radius:8px">
            <div class="k">In Stock</div>
            <div class="v" style="font-size:18px;color:#15803d">{{ inStockItems().length }}</div>
          </div>
          <div class="stat-card" style="padding:8px 14px;border-radius:8px">
            <div class="k">Price Drops</div>
            <div class="v" style="font-size:18px;color:#7c3aed">{{ priceDropItems().length }}</div>
          </div>
          <div class="stat-card" style="padding:8px 14px;border-radius:8px" *ngIf="totalSavings() > 0">
            <div class="k">Total Savings</div>
            <div class="v" style="font-size:18px;color:#059669">₹{{ totalSavings() | number }}</div>
          </div>
        </div>
      </div>

      <!-- Filters & Sorting Bar -->
      <div class="filter-tabs" *ngIf="items.length > 0">
        <button class="tab-pill" [class.active]="filter==='ALL'" (click)="filter='ALL'">
          All Items ({{ items.length }})
        </button>
        <button class="tab-pill" [class.active]="filter==='DROPPED'" (click)="filter='DROPPED'">
          🔥 Cheaper / Price Dropped ({{ priceDropItems().length }})
        </button>
        <button class="tab-pill" [class.active]="filter==='INSTOCK'" (click)="filter='INSTOCK'">
          ✓ In Stock ({{ inStockItems().length }})
        </button>
        <button class="tab-pill" [class.active]="filter==='OUTOFSTOCK'" (click)="filter='OUTOFSTOCK'">
          ✕ Out of Stock ({{ outOfStockItems().length }})
        </button>

        <div style="margin-left:auto;display:flex;align-items:center;gap:8px">
          <label style="font-size:12px;margin:0;white-space:nowrap">Sort by:</label>
          <select [(ngModel)]="sortBy" style="width:auto;padding:6px 10px;font-size:13px">
            <option value="NEWEST">Recently Added</option>
            <option value="SAVINGS">Biggest Price Drop</option>
            <option value="PRICE_LOW">Price: Low to High</option>
            <option value="PRICE_HIGH">Price: High to Low</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading"><p class="muted"><span class="spinner"></span> Loading wishlist items & price updates…</p></div>

      <!-- Empty State -->
      <div *ngIf="!loading && items.length === 0" class="card">
        <div class="empty">
          <div class="big">💔</div>
          <p style="margin:8px 0;font-weight:700;font-size:17px">Your wishlist is empty</p>
          <p class="muted">Click the heart (❤️) icon on any product to save it here. We'll track price changes and availability for you!</p>
          <a routerLink="/products"><button class="primary" style="margin-top:14px">Explore Products</button></a>
        </div>
      </div>

      <!-- Filter Empty State -->
      <div *ngIf="!loading && items.length > 0 && displayedItems().length === 0" class="card">
        <div class="empty">
          <p style="font-weight:600">No items match this filter.</p>
          <button class="btn-ghost btn-sm" (click)="filter='ALL'">Show all items</button>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="grid" *ngIf="!loading && displayedItems().length">
        <div class="product" *ngFor="let w of displayedItems()">
          <div class="product-media">
            <app-product-visual [product]="w.product" [categoryId]="w.product?.categoryId" size="md"></app-product-visual>
            <div class="tag-row">
              <span class="flag green" *ngIf="priceDropped(w)">🔥 Price Dropped!</span>
              <span class="flag amber" *ngIf="isLowStock(w)">⚡ Only {{ w.product?.stockQuantity }} left!</span>
              <span class="flag bad" *ngIf="!inStock(w)">Out of stock</span>
            </div>
            <button class="wishlist-btn on" (click)="remove(w.productId)" title="Remove from wishlist" aria-label="Remove from wishlist">
              ❤️
            </button>
          </div>
          <div class="product-body">
            <h4><a [routerLink]="['/products', w.product?.id || w.product?._id]">{{ w.product?.name || 'Loading item…' }}</a></h4>

            <!-- Price with Drop / Change display -->
            <div class="price-row" style="flex-wrap:wrap;gap:6px">
              <span class="price">₹{{ (w.product?.price ?? w.priceAtAdd) | number }}</span>
              <span class="price-note" *ngIf="priceDropped(w)" style="text-decoration:line-through;color:#64748b">
                ₹{{ w.priceAtAdd | number }}
              </span>
              <span class="price-savings" *ngIf="priceDropped(w)">
                Save ₹{{ savings(w) | number }} ({{ savingsPercent(w) }}% OFF)
              </span>
              <span class="price-up" *ngIf="priceIncreased(w)">
                +₹{{ priceDiff(w) | number }} higher
              </span>
            </div>

            <!-- Availability & Metadata -->
            <div class="product-meta" style="margin-top:4px">
              <span class="badge" [ngClass]="inStock(w) ? 'ok' : 'bad'">
                {{ inStock(w) ? (isLowStock(w) ? '⚡ Low Stock (' + w.product?.stockQuantity + ' left)' : '✓ In stock') : '✕ Out of stock' }}
              </span>
              <span class="muted" style="font-size:11px">Saved {{ w.addedAt | date:'mediumDate' }}</span>
            </div>

            <!-- Actions -->
            <div class="quick-add" style="margin-top:10px">
              <button class="primary btn-sm" (click)="moveToCart(w)" [disabled]="!inStock(w) || moving===w.productId" style="flex:2">
                {{ moving===w.productId ? 'Moving…' : (inStock(w) ? '🛒 Move to Cart' : 'Out of Stock') }}
              </button>
              <button class="btn-ghost btn-sm" (click)="remove(w.productId)" [disabled]="removing===w.productId" style="flex:1">
                {{ removing===w.productId ? '…' : 'Remove' }}
              </button>
            </div>

            <!-- Interactive Demo Tool: Simulate Price Drop for quick testing -->
            <div style="margin-top:8px;padding-top:6px;border-top:1px dashed var(--line);display:flex;justify-content:space-between;align-items:center">
              <span class="muted" style="font-size:10px">Saved at: ₹{{ w.priceAtAdd | number }}</span>
              <button class="demo-pill" (click)="simulatePriceDrop(w)" title="Simulate a price drop to test notification and badges">
                {{ priceDropped(w) ? '↻ Reset Price' : '⚡ Simulate ₹500 Drop' }}
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
  movingAll = false;
  removing = '';
  clearing = false;
  error = '';
  filter: 'ALL' | 'DROPPED' | 'INSTOCK' | 'OUTOFSTOCK' = 'ALL';
  sortBy: 'NEWEST' | 'SAVINGS' | 'PRICE_LOW' | 'PRICE_HIGH' = 'NEWEST';

  constructor(private shop: Shop, public auth: Auth, private router: Router, private toast: Toast) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/login']); return; }
    this.load();
    this.shop.wishlistChanged.subscribe(() => this.loadSilently());
  }

  load(): void {
    this.loading = true;
    this.fetchItems(true);
  }

  loadSilently(): void {
    this.fetchItems(false);
  }

  private fetchItems(notifyPriceDrops: boolean): void {
    const uid = this.auth.userId();
    this.shop.wishlist(uid).subscribe({
      next: (w: any) => {
        const rawItems = w?.items || [];
        if (rawItems.length === 0) {
          this.items = [];
          this.loading = false;
          return;
        }

        this.items = rawItems.map((i: any) => ({
          productId: i.productId,
          priceAtAdd: i.priceAtAdd || 0,
          addedAt: i.addedAt,
          product: null
        }));

        let loaded = 0;
        let droppedCount = 0;
        this.items.forEach((it: any) => {
          this.shop.product(it.productId).subscribe({
            next: (p: any) => {
              it.product = p;
              if (it.priceAtAdd > 0 && (p?.price ?? 0) < it.priceAtAdd) {
                droppedCount++;
              }
              loaded++;
              if (loaded === this.items.length) {
                this.loading = false;
                if (notifyPriceDrops && droppedCount > 0) {
                  this.toast.ok(`🔥 Price Drop Alert: ${droppedCount} item${droppedCount === 1 ? '' : 's'} in your wishlist ${droppedCount === 1 ? 'is' : 'are'} now cheaper!`);
                }
              }
            },
            error: () => {
              loaded++;
              if (loaded === this.items.length) this.loading = false;
            }
          });
        });
      },
      error: () => {
        this.loading = false;
        this.error = 'Could not load wishlist';
      }
    });
  }

  inStock(w: any): boolean {
    if (typeof w.product?.availability === 'boolean') return w.product.availability;
    return (w.product?.stockQuantity ?? 1) > 0;
  }

  isLowStock(w: any): boolean {
    const qty = w.product?.stockQuantity;
    return typeof qty === 'number' && qty > 0 && qty <= 5;
  }

  priceDropped(w: any): boolean {
    return w.priceAtAdd > 0 && (w.product?.price ?? 0) < w.priceAtAdd;
  }

  priceIncreased(w: any): boolean {
    return w.priceAtAdd > 0 && (w.product?.price ?? 0) > w.priceAtAdd;
  }

  savings(w: any): number {
    return Math.max(0, (w.priceAtAdd || 0) - (w.product?.price || 0));
  }

  savingsPercent(w: any): number {
    if (!w.priceAtAdd || w.priceAtAdd <= 0) return 0;
    return Math.round((this.savings(w) / w.priceAtAdd) * 100);
  }

  priceDiff(w: any): number {
    return Math.max(0, (w.product?.price || 0) - (w.priceAtAdd || 0));
  }

  priceDropItems(): any[] {
    return this.items.filter(w => this.priceDropped(w));
  }

  inStockItems(): any[] {
    return this.items.filter(w => this.inStock(w));
  }

  outOfStockItems(): any[] {
    return this.items.filter(w => !this.inStock(w));
  }

  totalSavings(): number {
    return this.priceDropItems().reduce((sum, w) => sum + this.savings(w), 0);
  }

  displayedItems(): any[] {
    let list = [...this.items];
    if (this.filter === 'DROPPED') list = list.filter(w => this.priceDropped(w));
    else if (this.filter === 'INSTOCK') list = list.filter(w => this.inStock(w));
    else if (this.filter === 'OUTOFSTOCK') list = list.filter(w => !this.inStock(w));

    if (this.sortBy === 'SAVINGS') {
      list.sort((a, b) => this.savings(b) - this.savings(a));
    } else if (this.sortBy === 'PRICE_LOW') {
      list.sort((a, b) => (a.product?.price ?? a.priceAtAdd) - (b.product?.price ?? b.priceAtAdd));
    } else if (this.sortBy === 'PRICE_HIGH') {
      list.sort((a, b) => (b.product?.price ?? b.priceAtAdd) - (a.product?.price ?? a.priceAtAdd));
    } else {
      list.sort((a, b) => new Date(b.addedAt || 0).getTime() - new Date(a.addedAt || 0).getTime());
    }
    return list;
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
            this.toast.ok(`Moved "${w.product?.name || 'item'}" to cart`);
            this.items = this.items.filter(x => x.productId !== w.productId);
          },
          error: () => { this.moving = ''; this.toast.err('Could not remove from wishlist'); }
        });
      },
      error: (e) => { this.moving = ''; this.toast.err(e.error?.message || 'Could not add to cart'); }
    });
  }

  moveAllToCart(): void {
    const available = this.inStockItems();
    if (available.length === 0) {
      this.toast.err('No items are currently in stock to move');
      return;
    }
    this.movingAll = true;
    let completed = 0;
    available.forEach(w => {
      const id = w.product.id || w.product._id;
      this.shop.cartAdd(this.auth.userId(), id, 1).subscribe({
        next: () => {
          this.shop.wishlistRemove(this.auth.userId(), w.productId).subscribe({
            next: () => {
              completed++;
              if (completed === available.length) {
                this.movingAll = false;
                this.toast.ok(`Moved all ${completed} in-stock item(s) to cart!`);
                this.load();
              }
            },
            error: () => {
              completed++;
              if (completed === available.length) { this.movingAll = false; this.load(); }
            }
          });
        },
        error: () => {
          completed++;
          if (completed === available.length) { this.movingAll = false; this.load(); }
        }
      });
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
      error: () => { this.removing = ''; this.toast.err('Could not remove item'); }
    });
  }

  clearWishlist(): void {
    if (!confirm('Are you sure you want to clear all items from your wishlist?')) return;
    this.clearing = true;
    this.shop.wishlistClear(this.auth.userId()).subscribe({
      next: () => {
        this.clearing = false;
        this.items = [];
        this.toast.show('Wishlist cleared');
      },
      error: () => { this.clearing = false; this.toast.err('Could not clear wishlist'); }
    });
  }

  simulatePriceDrop(w: any): void {
    const curPrice = w.product?.price || 1000;
    const newPriceAtAdd = this.priceDropped(w) ? curPrice : curPrice + 500;
    this.shop.wishlistUpdatePrice(this.auth.userId(), w.productId, newPriceAtAdd).subscribe({
      next: () => {
        w.priceAtAdd = newPriceAtAdd;
        if (newPriceAtAdd > curPrice) {
          this.toast.ok(`🔥 Price Drop detected! ${w.product?.name || 'Item'} is now ₹500 cheaper!`);
        } else {
          this.toast.show(`Price reference reset to ₹${curPrice}`);
        }
      },
      error: () => this.toast.err('Could not update price reference')
    });
  }
}
