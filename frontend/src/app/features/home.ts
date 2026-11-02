import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Shop } from '../core/shop';
import { Auth } from '../core/auth';
import { ProductCard } from '../shared/product-card';
import { EmptyState } from '../shared/empty-state';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-home',
  imports: [CommonModule, RouterModule, FormsModule, ProductCard, EmptyState],
  template: `
    <section class="hero">
      <div>
        <span class="hero-eyebrow">PERSONALIZED RECOMMENDATIONS</span>
        <h1>Quality products, transparent returns, real rewards.</h1>
        <p class="lead">Recommendations based on your browsing and purchase history. Eligible returns earn up to 80% back in wallet points.</p>
        <form class="hero-cta" (ngSubmit)="search()">
          <input [(ngModel)]="q" name="q" placeholder="Search products…" aria-label="Search products">
          <button class="primary">Search</button>
          <a routerLink="/products"><button type="button" class="btn-ghost">Browse all</button></a>
        </form>
        <div class="stat-row">
          <div class="stat"><strong>{{ products.length }}+</strong><span>Products</span></div>
          <div class="stat"><strong>80%</strong><span>Max return reward</span></div>
          <div class="stat"><strong>20%</strong><span>Wallet redeem limit</span></div>
        </div>
      </div>
      <div class="hero-art">
        <div class="mini-card"><div><strong>Recommended for You</strong><div class="muted">{{ strategy || 'Based on your activity' }}</div></div></div>
        <div class="mini-card"><div><strong>Condition-based returns</strong><div class="muted">Verified after inspection</div></div></div>
        <div class="mini-card"><div><strong>Reward wallet</strong><div class="muted">1 point = Rs.1 at checkout</div></div></div>
      </div>
    </section>

    <div class="quick-category-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:16px 0">
      <a [routerLink]="['/products']" [queryParams]="{ q: 'mobile' }" style="text-decoration:none">
        <div class="card tight" style="display:flex;align-items:center;gap:12px;cursor:pointer">
          <span style="font-size:30px">📱</span>
          <div>
            <strong style="color:#f8fafc;font-size:14px">Smartphones</strong>
            <p class="muted" style="margin:2px 0 0;font-size:11px">Galaxy, iPhone, OnePlus &amp; more</p>
          </div>
        </div>
      </a>
      <a [routerLink]="['/products']" [queryParams]="{ q: 'laptop' }" style="text-decoration:none">
        <div class="card tight" style="display:flex;align-items:center;gap:12px;cursor:pointer">
          <span style="font-size:30px">💻</span>
          <div>
            <strong style="color:#f8fafc;font-size:14px">Laptops</strong>
            <p class="muted" style="margin:2px 0 0;font-size:11px">MacBook, Dell XPS, Gaming rigs</p>
          </div>
        </div>
      </a>
      <a [routerLink]="['/products']" [queryParams]="{ q: 'bluetooth' }" style="text-decoration:none">
        <div class="card tight" style="display:flex;align-items:center;gap:12px;cursor:pointer">
          <span style="font-size:30px">🎧</span>
          <div>
            <strong style="color:#f8fafc;font-size:14px">Bluetooth &amp; Audio</strong>
            <p class="muted" style="margin:2px 0 0;font-size:11px">Sony, AirPods, JBL &amp; Bose</p>
          </div>
        </div>
      </a>
      <a [routerLink]="['/products']" [queryParams]="{ q: 'neckband' }" style="text-decoration:none">
        <div class="card tight" style="display:flex;align-items:center;gap:12px;cursor:pointer">
          <span style="font-size:30px">📿</span>
          <div>
            <strong style="color:#f8fafc;font-size:14px">Wireless Neckbands</strong>
            <p class="muted" style="margin:2px 0 0;font-size:11px">OnePlus, Realme &amp; boAt</p>
          </div>
        </div>
      </a>
    </div>

    <div class="card" style="display:flex;justify-content:space-between;align-items:center;gap:18px;flex-wrap:wrap;background:linear-gradient(120deg, rgba(139,92,246,.18), rgba(34,211,238,.07));border-color:rgba(139,92,246,.35)">
      <div>
        <span class="badge violet">✦ AI SHOPPING ASSISTANT</span>
        <h2 style="margin:8px 0 4px">Tell me your budget. I'll find the real product.</h2>
        <p class="muted" style="margin:0">Budget and requirement search, side-by-side comparisons, feature and stock answers, alternatives and history-based picks — all read from the live catalog. No invented products, prices or ratings.</p>
      </div>
      <a routerLink="/assistant"><button class="primary">Ask the assistant →</button></a>
    </div>

    <div class="card" *ngIf="auth.isLoggedIn()">
      <div class="section-title">
        <h2>Recommended for You</h2>
        <span class="badge violet" *ngIf="strategy">{{ strategy }}</span>
      </div>
      <div class="rail" *ngIf="recommendations.length">
        <app-product-card *ngFor="let p of recommendations" [product]="p"></app-product-card>
      </div>
      <div *ngIf="loadingRec"><div class="skeleton" style="height:120px"></div></div>
      <p class="muted" *ngIf="!loadingRec && !recommendations.length">Browse or search to personalize this section. New accounts see trending items.</p>
    </div>

    <!-- Recently Viewed Products -->
    <div class="card" *ngIf="recentlyViewedProducts.length" style="border-color:rgba(168,85,247,0.3);background:linear-gradient(145deg,rgba(15,23,42,0.95),rgba(30,27,75,0.25))">
      <div class="section-title">
        <div style="display:flex;align-items:center;gap:10px">
          <h2 style="display:flex;align-items:center;gap:8px"><span>🕒</span> Recently Viewed Products</h2>
          <span class="badge violet">Browsing History ({{ recentlyViewedProducts.length }})</span>
        </div>
        <button class="btn-ghost btn-sm" (click)="clearRecentlyViewed()" style="font-size:12px;color:#94a3b8">Clear history</button>
      </div>
      <div class="rail">
        <app-product-card *ngFor="let p of recentlyViewedProducts" [product]="p"></app-product-card>
      </div>
    </div>

    <!-- Recommendations Based on Browsing History -->
    <div class="card" *ngIf="browsingRecommendations.length">
      <div class="section-title">
        <div style="display:flex;align-items:center;gap:10px">
          <h2 style="display:flex;align-items:center;gap:8px"><span>🎯</span> Inspired by Your Browsing History</h2>
          <span class="badge violet">Relevant recommendations</span>
        </div>
        <span class="muted" style="font-size:12px" *ngIf="browsingSources.length">Based on: {{ browsingSources.slice(0, 2).join(', ') }}</span>
      </div>
      <div class="rail">
        <app-product-card *ngFor="let p of browsingRecommendations" [product]="p"></app-product-card>
      </div>
    </div>

    <div class="card" *ngIf="becauseItems.length">
      <div class="section-title">
        <h2>Because You Viewed {{ becauseSource }}</h2>
        <span class="badge violet">Content-based similarity</span>
      </div>
      <div class="rail">
        <app-product-card *ngFor="let p of becauseItems" [product]="p"></app-product-card>
      </div>
    </div>

    <div class="card">
      <div class="section-title">
        <h2>Trending Now</h2>
        <span class="badge violet">Last 30 days · time-decayed orders + views</span>
      </div>
      <div class="rail" *ngIf="trendingItems.length">
        <app-product-card *ngFor="let p of trendingItems" [product]="p"></app-product-card>
      </div>
      <div class="rail" *ngIf="loadingTrending">
        <div class="skeleton" style="height:120px;min-width:180px" *ngFor="let s of [1,2,3]"></div>
      </div>
    </div>

    <div class="card">
      <div class="section-title">
        <h2>Best Sellers</h2>
        <span class="badge violet">All-time order popularity</span>
      </div>
      <div class="rail" *ngIf="popularItems.length">
        <app-product-card *ngFor="let p of popularItems" [product]="p"></app-product-card>
      </div>
      <div class="rail" *ngIf="loadingPopular">
        <div class="skeleton" style="height:120px;min-width:180px" *ngFor="let s of [1,2,3]"></div>
      </div>
    </div>

    <div class="card">
      <div class="section-title"><h2>Shop by Category</h2><a routerLink="/products">View all</a></div>
      <div class="cat-row">
        <button class="chip" [class.on]="activeCat===''" (click)="filterCat('')">All</button>
        <button class="chip" *ngFor="let c of categories" [class.on]="activeCat===(c.id||c._id)" (click)="filterCat(c.id || c._id)">{{ c.name }}</button>
      </div>
    </div>

    <div class="card">
      <div class="section-title"><h2>{{ activeCatName() ? activeCatName() : 'All Products' }}</h2><a routerLink="/products">Open catalog</a></div>
      <div class="grid" *ngIf="visibleProducts().length">
        <app-product-card *ngFor="let p of visibleProducts().slice(0,8)" [product]="p"></app-product-card>
      </div>
      <app-empty-state *ngIf="!loading && !visibleProducts().length" title="No products in this category" hint="Try another category or browse everything." ctaLink="/products"></app-empty-state>
      <div class="grid" *ngIf="loading"><div class="skeleton" style="height:220px" *ngFor="let s of [1,2,3,4]"></div></div>
    </div>

    <div class="value-grid">
      <div class="value"><h3>Personalized</h3><p class="muted">Home and product pages adapt to views, searches and purchases.</p></div>
      <div class="value"><h3>Transparent returns</h3><p class="muted">Estimated reward upfront, final amount after inspection.</p></div>
      <div class="value"><h3>Reward wallet</h3><p class="muted">Redeem points for up to 20% off every order.</p></div>
    </div>
  `
})
export class Home implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  recommendations: any[] = [];
  trendingItems: any[] = [];
  popularItems: any[] = [];
  recentlyViewedProducts: any[] = [];
  browsingRecommendations: any[] = [];
  browsingSources: string[] = [];
  becauseItems: any[] = [];
  becauseSource = '';
  strategy = '';
  q = '';
  loading = true;
  loadingRec = false;
  loadingTrending = false;
  loadingPopular = false;
  activeCat = '';

  constructor(private shop: Shop, public auth: Auth, private router: Router) {}

  ngOnInit(): void {
    this.shop.products().subscribe((r: any) => {
      this.products = Array.isArray(r) ? r : [];
      this.loading = false;
    });
    this.shop.categories().subscribe((r: any) => (this.categories = Array.isArray(r) ? r : []));

    // Public rails: trending (time-decayed) and all-time best sellers.
    this.loadingTrending = true;
    this.shop.trending(8).subscribe({
      next: (r: any) => { this.trendingItems = r.items || []; this.loadingTrending = false; },
      error: () => (this.loadingTrending = false)
    });
    this.loadingPopular = true;
    this.shop.popularProducts(8).subscribe({
      next: (r: any) => { this.popularItems = r.items || []; this.loadingPopular = false; },
      error: () => (this.loadingPopular = false)
    });

    // Initialize recently viewed products (local cache + server sync)
    this.recentlyViewedProducts = this.shop.getLocalRecentlyViewed();

    if (this.auth.isLoggedIn()) {
      const userId = this.auth.userId();
      this.loadingRec = true;
      this.shop.recommendations(userId, 8).subscribe({
        next: (r: any) => {
          this.recommendations = r.items || [];
          this.strategy = r.strategy || '';
          this.loadingRec = false;
        },
        error: () => (this.loadingRec = false)
      });
      // "Because you viewed X" — content-based recommendations from recent views.
      this.shop.history(userId).subscribe({
        next: (r: any) => {
          if (r?.items && r.items.length) {
            this.recentlyViewedProducts = r.items;
          }
        },
        error: () => undefined
      });
      this.shop.recentlyViewedRecommendations(userId, 8).subscribe({
        next: (r: any) => {
          this.browsingRecommendations = r.coldStart ? [] : (r.items || []);
          this.browsingSources = r.sources || [];
          this.becauseItems = r.coldStart ? [] : (r.items || []);
          this.becauseSource = (r.sources && r.sources.length) ? r.sources[0] : '';
        },
        error: () => undefined
      });
    }
  }

  clearRecentlyViewed(): void {
    this.recentlyViewedProducts = [];
    this.browsingRecommendations = [];
    this.shop.clearLocalRecentlyViewed();
    if (this.auth.isLoggedIn()) {
      this.shop.clearHistory(this.auth.userId()).subscribe({ error: () => undefined });
    }
  }

  search(): void {
    this.router.navigate(['/products'], { queryParams: { q: this.q } });
  }
  filterCat(id: string): void {
    this.activeCat = id;
    if (id) this.router.navigate(['/products'], { queryParams: { category: id } });
  }
  visibleProducts(): any[] {
    if (!this.activeCat) return this.products;
    return this.products.filter((p: any) => (p.categoryId || p.category) === this.activeCat);
  }
  activeCatName(): string {
    const c = this.categories.find((x: any) => (x.id || x._id) === this.activeCat);
    return c?.name || '';
  }
}
