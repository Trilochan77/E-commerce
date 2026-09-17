import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ShopService } from '../core/shop.service';
import { ProductCardComponent } from '../shared/product-card.component';
import { EmptyStateComponent } from '../shared/empty-state.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProductCardComponent, EmptyStateComponent],
  template: `
    <div class="breadcrumb"><a routerLink="/">Home</a> / Shop</div>
    <div class="page-head">
      <div><h1 style="font-size:28px">Catalog</h1><p>{{ total }} results · {{ source || 'catalog' }} · filters apply instantly</p></div>
      <div class="view-toggle" role="tablist" aria-label="View mode">
        <button [class.on]="view==='grid'" (click)="view='grid'">▦ Grid</button>
        <button [class.on]="view==='list'" (click)="view='list'">☰ List</button>
      </div>
    </div>
    <div class="shop-layout">
      <aside class="card filters">
        <h3> Search</h3>
        <input [(ngModel)]="q" name="q" placeholder="Search…" (keyup.enter)="load()" aria-label="Search">
        <div class="divider"></div>
        <h3>Categories</h3>
        <div class="cat-row">
          <button class="chip" [class.on]="!category" (click)="category=''; load()">All</button>
          <button class="chip" *ngFor="let c of categories" [class.on]="category===(c.id||c._id)" (click)="category=(c.id||c._id); load()">{{ c.name }}</button>
        </div>
        <div class="divider"></div>
        <div class="row" style="justify-content:space-between">
          <h3 style="margin:0">Price</h3><span class="muted">₹{{ minPrice || 0 }} – ₹{{ maxPrice || '∞' }}</span>
        </div>
        <div class="row">
          <input [(ngModel)]="minPrice" type="number" placeholder="Min" aria-label="Min price" style="width:100%">
          <input [(ngModel)]="maxPrice" type="number" placeholder="Max" aria-label="Max price" style="width:100%">
        </div>
        <label style="margin-top:8px"><input type="checkbox" [(ngModel)]="inStockOnly" (change)="load()" style="width:auto"> In-stock only</label>
        <label><input type="checkbox" [(ngModel)]="returnableOnly" (change)="load()" style="width:auto"> Reward-eligible returns</label>
        <div class="divider"></div>
        <label>Sort by
          <select [(ngModel)]="sort" (change)="load()">
            <option value="">Relevance</option>
            <option value="price_asc">Price: low → high</option>
            <option value="price_desc">Price: high → low</option>
            <option value="popular">Most popular</option>
          </select>
        </label>
        <div class="row" style="margin-top:12px">
          <button class="primary btn-sm" (click)="load()">Apply</button>
          <button class="btn-ghost btn-sm" (click)="clear()">Clear</button>
        </div>
      </aside>
      <section>
        <div class="toolbar">
          <span class="badge info" *ngIf="q">“{{ q }}”</span>
          <span class="muted" *ngIf="loading"><span class="spinner"></span> Searching…</span>
          <span class="muted" *ngIf="!loading">{{ items.length }} shown</span>
        </div>
        <div class="grid" *ngIf="view==='grid' && items.length">
          <app-product-card *ngFor="let p of items" [product]="p"></app-product-card>
        </div>
        <div class="stack" *ngIf="view==='list' && items.length">
          <div class="list-row" *ngFor="let p of items">
            <img [src]="(p.images && p.images[0]) || ('https://picsum.photos/seed/'+(p.id||p._id)+'/300/200')" [alt]="p.name">
            <div><strong><a [routerLink]="['/products', p.id || p._id]">{{ p.name }}</a></strong>
              <div class="muted">{{ p.description?.slice(0,90) }}</div>
              <div class="row"><span class="price">₹{{ p.price }}</span><span class="badge ok" *ngIf="(p.stockQuantity??1)>0">In stock</span><span class="badge bad" *ngIf="(p.stockQuantity??1)<=0">Out</span></div>
            </div>
            <a [routerLink]="['/products', p.id || p._id]"><button class="primary btn-sm">View →</button></a>
          </div>
        </div>
        <div class="grid" *ngIf="loading"><div class="skeleton" style="height:230px" *ngFor="let s of [1,2,3,4,5,6]"></div></div>
        <app-empty-state *ngIf="!loading && !items.length" icon="" title="No matches" hint="Try fewer filters or a broader keyword." ctaLink="/products" ctaLabel="Reset catalog"></app-empty-state>
      </section>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  q = '';
  category = '';
  sort = '';
  minPrice: any = '';
  maxPrice: any = '';
  inStockOnly = false;
  returnableOnly = false;
  view: 'grid' | 'list' = 'grid';
  items: any[] = [];
  categories: any[] = [];
  total = 0;
  source = '';
  loading = false;

  constructor(private shop: ShopService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.shop.categories().subscribe((r: any) => (this.categories = Array.isArray(r) ? r : []));
    this.route.queryParams.subscribe((p: any) => {
      this.category = p['category'] || this.category;
      this.q = p['q'] || this.q;
      this.load();
    });
  }

  clear(): void {
    this.q = ''; this.category = ''; this.sort = '';
    this.minPrice = ''; this.maxPrice = '';
    this.inStockOnly = false; this.returnableOnly = false;
    this.load();
  }

  load(): void {
    this.loading = true;
    const fetch$ = this.q.trim()
      ? this.shop.search(this.q, this.category, this.sort)
      : this.shop.products(this.category);
    fetch$.subscribe({
      next: (r: any) => {
        let list: any[] = r.items || (Array.isArray(r) ? r : []);
        if (this.sort === 'price_asc') list = [...list].sort((a, b) => a.price - b.price);
        if (this.sort === 'price_desc') list = [...list].sort((a, b) => b.price - a.price);
        if (this.minPrice !== '' && this.minPrice != null) list = list.filter((p) => p.price >= +this.minPrice);
        if (this.maxPrice !== '' && this.maxPrice != null) list = list.filter((p) => p.price <= +this.maxPrice);
        if (this.inStockOnly) list = list.filter((p) => (p.stockQuantity ?? 1) > 0 || p.availability);
        if (this.returnableOnly) list = list.filter((p) => p.eligibleForReturn || p.isEligibleForReturn);
        this.items = list;
        this.total = r.total ?? list.length;
        this.source = r.source || 'catalog';
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }
}
