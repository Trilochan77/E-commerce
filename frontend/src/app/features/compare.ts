import { Component, ChangeDetectionStrategy, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Shop } from '../core/shop';
import { Auth } from '../core/auth';
import { CompareStore, COMPARE_MAX, COMPARE_MIN } from '../core/compare';
import { ProductVisual } from '../shared/product-visual';
import { Toast } from '../shared/toast';

type RowKind = 'text' | 'price' | 'rating' | 'number' | 'list';

interface Cell {
  productId: string;
  display?: string;
  raw?: number;
  count?: number;
  chips?: string[];
  uniqueChips?: string[];
  unique?: boolean;
  best?: boolean;
}

interface Row {
  key: string;
  label: string;
  kind: RowKind;
  cells: Cell[];
  different: boolean;
}

/**
 * Side-by-side product comparison.
 *
 * Everything shown comes from stored catalogue values fetched through
 * `/api/products/compare`; the backend derives specification/feature chips from
 * the stored description. Missing values render as "Not specified" — nothing
 * is guessed or invented.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-compare',
  imports: [CommonModule, RouterModule, FormsModule, ProductVisual],
  styles: [`
    .cmp-hint { display: flex; flex-wrap: wrap; gap: 6px 12px; align-items: baseline; }
    .compare-shell { display: grid; gap: 10px; }
    .cmp-scroll {
      overflow: auto; border: 1px solid var(--line-soft); border-radius: var(--radius);
      background: var(--glass); max-height: 76vh;
    }
    .cmp-table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 640px; }
    .cmp-table th, .cmp-table td {
      text-align: left; padding: 11px 12px; border-bottom: 1px solid var(--line-soft);
      vertical-align: top; font-size: 13px;
    }
    .cmp-table thead th {
      position: sticky; top: 0; z-index: 3; background: var(--surface-2);
      border-bottom: 1px solid var(--line);
    }
    .cmp-table .attr-col {
      position: sticky; left: 0; z-index: 2; background: var(--surface-2);
      min-width: 150px; max-width: 190px; color: var(--ink-2);
      font-size: 11px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase;
    }
    .cmp-table thead .attr-col { z-index: 4; }
    .prod-col { min-width: 210px; position: relative; text-transform: none; letter-spacing: 0; font-size: 13px; }
    .cmp-remove {
      position: absolute; top: 8px; right: 8px; width: 26px; height: 26px;
      border-radius: 50%; border: 1px solid var(--line); background: rgba(6, 9, 20, .7);
      color: var(--ink-2); cursor: pointer; display: grid; place-items: center; font-size: 12px;
    }
    .cmp-remove:hover { color: var(--bad); border-color: rgba(248, 113, 113, .6); }
    .cmp-prod-visual { margin-bottom: 8px; }
    .cmp-prod-name { display: block; font-weight: 700; color: var(--ink); line-height: 1.35; margin-bottom: 3px; }
    .cmp-prod-name:hover { color: var(--brand-2); }
    .cmp-prod-brand { color: var(--muted); font-size: 12px; margin-bottom: 8px; }
    .cmp-badges { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 8px; }
    .cmp-table tbody tr.cmp-diff { background: rgba(251, 191, 36, .045); }
    .cmp-table tbody tr.cmp-diff td.unique {
      background: rgba(251, 191, 36, .13);
      box-shadow: inset 3px 0 0 rgba(251, 191, 36, .75);
      color: #fde68a; font-weight: 600;
    }
    .cmp-table tbody td.best {
      background: rgba(52, 211, 153, .13);
      box-shadow: inset 3px 0 0 rgba(52, 211, 153, .8);
      color: #a7f3d0; font-weight: 700;
    }
    .diff-tag {
      display: inline-block; margin-left: 6px; padding: 1px 5px; border-radius: 5px;
      background: var(--warn-bg); color: var(--warn); font-size: 9px; letter-spacing: .04em;
    }
    .chip-list { display: flex; flex-wrap: wrap; gap: 5px; }
    .cmp-chip {
      display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 8px;
      background: var(--surface-3); border: 1px solid var(--line-soft); font-size: 11.5px;
    }
    .cmp-chip.unique-chip {
      background: var(--warn-bg); border-color: rgba(251, 191, 36, .45); color: #fde68a; font-weight: 700;
    }
    .cmp-legend {
      display: flex; flex-wrap: wrap; gap: 8px 18px; align-items: center;
      padding: 9px 12px; border: 1px solid var(--line-soft); border-radius: var(--radius);
      background: var(--glass); font-size: 12px; color: var(--ink-2);
    }
    .cmp-legend .dot { width: 9px; height: 9px; border-radius: 3px; display: inline-block; margin-right: 5px; }
    .diff-dot { background: rgba(251, 191, 36, .7); }
    .unique-dot { background: rgba(251, 191, 36, .95); }
    .cmp-legend label { margin-left: auto; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; }
    .cmp-legend input { width: auto; }
    .picker-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 8px; }
    .picker-item {
      display: flex; align-items: center; gap: 10px; padding: 8px 10px;
      border: 1px solid var(--line-soft); border-radius: 10px; background: rgba(9, 14, 28, .55);
    }
    .picker-meta { flex: 1; min-width: 0; display: grid; gap: 2px; }
    .picker-meta strong { font-size: 12.5px; line-height: 1.3; }
    .picker-meta .muted { font-size: 11px; }
    @media (max-width: 640px) {
      .cmp-table .attr-col { min-width: 118px; max-width: 130px; }
      .prod-col { min-width: 180px; }
      .picker-grid { grid-template-columns: 1fr; }
    }
  `],
  template: `
    <div class="breadcrumb"><a routerLink="/">Home</a> / Compare</div>
    <div class="page-head">
      <div>
        <h1 style="font-size:28px">Compare Products</h1>
        <p class="muted">{{ products.length }} of {{ max }} selected · prices, ratings, brands, specifications and features</p>
      </div>
      <div class="row" style="margin:0">
        <button class="btn-ghost btn-sm" (click)="showPicker = !showPicker">{{ showPicker ? 'Hide picker' : 'Add product' }}</button>
        <button class="btn-ghost btn-sm" *ngIf="products.length" (click)="clearAll()">Clear all</button>
      </div>
    </div>

    <p class="error" *ngIf="error">{{ error }}</p>
    <div *ngIf="loading" class="card"><span class="spinner"></span> Loading comparison…</div>

    <div class="card" *ngIf="!loading && products.length < min">
      <div class="cmp-hint">
        <strong>Select at least {{ min }} products to compare.</strong>
        <span class="muted">You have {{ products.length }} selected. Use the “⇄ Compare” button on any product, or add from the picker below.</span>
      </div>
    </div>

    <div class="compare-shell" *ngIf="!loading && products.length >= min">
      <div class="cmp-scroll">
        <table class="cmp-table">
          <thead>
            <tr>
              <th class="attr-col">Attribute</th>
              <th class="prod-col" *ngFor="let p of products">
                <button class="cmp-remove" (click)="remove(p.id)" title="Remove from comparison" aria-label="Remove from comparison">✕</button>
                <div class="cmp-prod-visual"><app-product-visual [product]="p" size="sm"></app-product-visual></div>
                <a class="cmp-prod-name" [routerLink]="['/products', p.id]">{{ p.name }}</a>
                <div class="cmp-prod-brand">{{ p.brand ? ('Brand: ' + p.brand) : 'Brand: Not specified' }}</div>
                <div class="cmp-badges">
                  <span class="badge ok" *ngIf="isBestPrice(p)">Best price</span>
                  <span class="badge violet" *ngIf="isTopRated(p)">Top rated</span>
                  <span class="badge bad" *ngIf="!inStock(p)">Out of stock</span>
                </div>
                <button class="primary btn-sm" (click)="addToCart(p)" [disabled]="!inStock(p) || addingId === p.id">
                  {{ addingId === p.id ? 'Adding…' : 'Add to cart' }}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of visibleRows()" [class.cmp-diff]="row.different">
              <th class="attr-col">
                {{ row.label }}
                <span class="diff-tag" *ngIf="row.different">differs</span>
              </th>
              <td *ngFor="let cell of row.cells" [class.unique]="row.different && cell.unique" [class.best]="cell.best">
                <ng-container [ngSwitch]="row.kind">
                  <ng-container *ngSwitchCase="'price'">₹{{ cell.raw | number }}</ng-container>
                  <ng-container *ngSwitchCase="'number'">{{ cell.raw | number }}</ng-container>
                  <ng-container *ngSwitchCase="'rating'">
                    <span *ngIf="(cell.count || 0) > 0">★ {{ cell.raw | number:'1.1-1' }} <span class="muted">({{ cell.count }} rating{{ cell.count === 1 ? '' : 's' }})</span></span>
                    <span class="muted" *ngIf="!(cell.count || 0)">No ratings yet</span>
                  </ng-container>
                  <ng-container *ngSwitchCase="'list'">
                    <span class="chip-list" *ngIf="cell.chips?.length; else noChips">
                      <span class="cmp-chip" *ngFor="let c of cell.chips" [class.unique-chip]="cell.uniqueChips?.includes(c)">{{ c }}</span>
                    </span>
                    <ng-template #noChips><span class="muted">Not specified</span></ng-template>
                  </ng-container>
                  <ng-container *ngSwitchDefault>{{ cell.display }}</ng-container>
                </ng-container>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="cmp-legend">
        <span><i class="dot diff-dot"></i>Row differs between products</span>
        <span><i class="dot unique-dot"></i>Value unique to this product</span>
        <label><input type="checkbox" [(ngModel)]="onlyDifferences" name="onlyDifferences"> Show only differences</label>
      </div>
    </div>

    <div class="card cmp-picker" *ngIf="showPicker && !loading">
      <div class="section-title">
        <h2>{{ products.length ? 'Add another product' : 'Choose products to compare' }}</h2>
        <span class="badge violet">{{ products.length }}/{{ max }} selected</span>
      </div>
      <input [(ngModel)]="search" name="compareSearch" placeholder="Filter by name, brand or category…" style="max-width:340px;margin-bottom:10px">
      <div class="picker-grid">
        <div class="picker-item" *ngFor="let p of pickerProducts()">
          <app-product-visual [product]="p" size="xs"></app-product-visual>
          <div class="picker-meta">
            <strong>{{ p.name }}</strong>
            <span class="muted">₹{{ p.price | number }} · {{ p.brand || 'Not specified' }}</span>
          </div>
          <button class="btn-ghost btn-sm" (click)="add(p)"
            [disabled]="isSelected(p.id) || products.length >= max">
            {{ isSelected(p.id) ? 'Selected' : 'Add' }}
          </button>
        </div>
      </div>
      <p class="muted" *ngIf="!pickerProducts().length">No matching products.</p>
      <p class="muted" *ngIf="products.length >= max">Maximum of {{ max }} products reached. Remove one to add another.</p>
    </div>
  `
})
export class Compare implements OnInit, OnDestroy {
  readonly min = COMPARE_MIN;
  readonly max = COMPARE_MAX;

  products: any[] = [];
  allProducts: any[] = [];
  categories: any[] = [];
  ids: string[] = [];
  loading = true;
  error = '';
  addingId = '';
  showPicker = true;
  search = '';
  onlyDifferences = false;
  private changedSub?: Subscription;

  constructor(
    private shop: Shop,
    public auth: Auth,
    private store: CompareStore,
    private router: Router,
    private toast: Toast
  ) {}

  ngOnInit(): void {
    this.shop.categories().subscribe({
      next: (r: any) => (this.categories = Array.isArray(r) ? r : []),
      error: () => undefined
    });
    this.allProducts = [];
    this.shop.products().subscribe({
      next: (r: any) => (this.allProducts = Array.isArray(r) ? r : []),
      error: () => undefined
    });
    this.changedSub = this.store.changed.subscribe((ids) => {
      if (ids.join(',') !== this.ids.join(',')) this.load(ids);
    });
    this.load(this.store.ids());
  }

  ngOnDestroy(): void {
    this.changedSub?.unsubscribe();
  }

  load(ids: string[]): void {
    this.ids = ids;
    if (!ids.length) {
      this.products = [];
      this.loading = false;
      return;
    }
    this.loading = true;
    this.shop.compareProducts(ids).subscribe({
      next: (r: any) => {
        this.products = r.products || [];
        const unknown = r.unknownIds || [];
        if (unknown.length) {
          unknown.forEach((id: string) => this.store.remove(id));
          this.toast.err('Some products are no longer available and were removed');
          this.loading = false;
          return;
        }
        this.loading = false;
      },
      error: (e) => {
        this.error = e.error?.message || 'Could not load the comparison';
        this.loading = false;
      }
    });
  }

  remove(id: string): void {
    this.store.remove(id);
  }

  clearAll(): void {
    this.store.clear();
  }

  add(p: any): void {
    const id = p.id || p._id || p.productId;
    const result = this.store.add(id);
    if (!result.ok) this.toast.err(result.message || 'Could not add product');
  }

  isSelected(id: string): boolean {
    return this.products.some((p) => p.id === id);
  }

  pickerProducts(): any[] {
    const needle = this.search.trim().toLowerCase();
    return this.allProducts.filter((p) => {
      const id = p.id || p._id;
      if (this.isSelected(id)) return false;
      if (!needle) return true;
      const hay = ((p.name || '') + ' ' + (p.brand || '') + ' ' + this.categoryName(p.categoryId)).toLowerCase();
      return hay.includes(needle);
    });
  }

  categoryName(id: string): string {
    const found = this.categories.find((c) => (c.id || c._id) === id);
    return found?.name || id || 'Not specified';
  }

  inStock(p: any): boolean {
    if (typeof p.availability === 'boolean') return p.availability;
    return (p.stockQuantity ?? 0) > 0;
  }

  isBestPrice(p: any): boolean {
    const best = this.bestPrice();
    return best !== null && this.inStock(p) && (Number(p.price) || 0) === best;
  }

  private bestPrice(): number | null {
    const prices = this.products.filter((p) => this.inStock(p)).map((p) => Number(p.price) || 0);
    return prices.length ? Math.min(...prices) : null;
  }

  isTopRated(p: any): boolean {
    const rated = this.products.filter((x) => (x.reviewCount || 0) > 0);
    if (!rated.length) return false;
    const max = Math.max(...rated.map((x) => Number(x.averageRating) || 0));
    return (p.reviewCount || 0) > 0 && (Number(p.averageRating) || 0) === max;
  }

  addToCart(p: any): void {
    if (!this.inStock(p)) { this.toast.err('This product is out of stock'); return; }
    if (!this.auth.isLoggedIn()) {
      this.toast.err('Please log in to add items to your cart');
      this.router.navigate(['/login']);
      return;
    }
    this.addingId = p.id;
    this.shop.cartAdd(this.auth.userId(), p.id, 1).subscribe({
      next: () => {
        this.addingId = '';
        this.toast.ok(p.name + ' added to cart');
      },
      error: (e) => {
        this.addingId = '';
        this.toast.err(e.error?.message || 'Could not add to cart');
      }
    });
  }

  visibleRows(): Row[] {
    const rows = this.buildRows();
    return this.onlyDifferences ? rows.filter((r) => r.different) : rows;
  }

  private buildRows(): Row[] {
    const ps = this.products;
    if (!ps.length) return [];

    const category = this.textRow('category', 'Category',
      ps.map((p) => ({ p, display: this.categoryName(p.categoryId), norm: p.categoryId || '' })));

    const brand = this.textRow('brand', 'Brand',
      ps.map((p) => ({ p, display: p.brand || 'Not specified', norm: (p.brand || '').toLowerCase().trim() })));

    const priceValues = ps.map((p) => Number(p.price) || 0);
    const minPrice = this.bestPrice();
    const price: Row = {
      key: 'price', label: 'Price', kind: 'price',
      different: new Set(priceValues).size > 1,
      cells: ps.map((p) => ({
        productId: p.id,
        raw: Number(p.price) || 0,
        best: minPrice !== null && this.inStock(p) && (Number(p.price) || 0) === minPrice
      }))
    };

    const rated = ps.filter((p) => (p.reviewCount || 0) > 0);
    const maxRating = rated.length ? Math.max(...rated.map((p) => Number(p.averageRating) || 0)) : null;
    const rating: Row = {
      key: 'rating', label: 'Rating', kind: 'rating',
      different: new Set(ps.map((p) => (p.reviewCount || 0) > 0 ? (Number(p.averageRating) || 0) : -1)).size > 1,
      cells: ps.map((p) => ({
        productId: p.id,
        raw: Number(p.averageRating) || 0,
        count: p.reviewCount || 0,
        best: maxRating !== null && (p.reviewCount || 0) > 0 && (Number(p.averageRating) || 0) === maxRating
      }))
    };

    const availability = this.textRow('availability', 'Availability',
      ps.map((p) => ({
        p,
        display: this.inStock(p) ? 'In stock' : 'Out of stock',
        norm: this.inStock(p) ? 'in' : 'out'
      })));

    const stock: Row = {
      key: 'stock', label: 'Stock quantity', kind: 'number',
      different: new Set(ps.map((p) => Number(p.stockQuantity) || 0)).size > 1,
      cells: ps.map((p) => ({ productId: p.id, raw: Number(p.stockQuantity) || 0 }))
    };

    const returns = this.textRow('returns', 'Return policy',
      ps.map((p) => ({
        p,
        display: p.eligibleForReturn ? 'Eligible for reward returns' : 'Not eligible for returns',
        norm: p.eligibleForReturn ? 'yes' : 'no'
      })));

    const specs = this.listRow('specs', 'Specifications', ps.map((p) => ({ p, chips: p.specifications || [] })));
    const features = this.listRow('features', 'Features', ps.map((p) => ({ p, chips: p.features || [] })));

    return [price, rating, brand, category, availability, stock, returns, specs, features];
  }

  private textRow(
    key: string,
    label: string,
    values: { p: any; display: string; norm: string }[]
  ): Row {
    const counts = new Map<string, number>();
    values.forEach((v) => counts.set(v.norm, (counts.get(v.norm) || 0) + 1));
    const different = counts.size > 1;
    return {
      key, label, kind: 'text', different,
      cells: values.map((v) => ({
        productId: v.p.id,
        display: v.display,
        unique: different && (counts.get(v.norm) || 0) === 1
      }))
    };
  }

  private listRow(key: string, label: string, values: { p: any; chips: string[] }[]): Row {
    const norm = (c: string) => (c || '').toLowerCase().replace(/\s+/g, ' ').trim();
    const sets = values.map((v) => new Set((v.chips || []).map(norm)));
    const counts = new Map<string, number>();
    sets.forEach((set) => set.forEach((c) => counts.set(c, (counts.get(c) || 0) + 1)));
    const signatures = sets.map((set) => Array.from(set).sort().join('|'));
    const different = new Set(signatures).size > 1;

    return {
      key, label, kind: 'list', different,
      cells: values.map((v) => ({
        productId: v.p.id,
        chips: v.chips || [],
        uniqueChips: different ? (v.chips || []).filter((c) => (counts.get(norm(c)) || 0) === 1) : []
      }))
    };
  }
}
