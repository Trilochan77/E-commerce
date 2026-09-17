import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ShopService } from '../core/shop.service';
import { AuthService } from '../core/auth.service';
import { ProductCardComponent } from '../shared/product-card.component';
import { EmptyStateComponent } from '../shared/empty-state.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent, EmptyStateComponent],
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
export class HomeComponent implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  recommendations: any[] = [];
  strategy = '';
  q = '';
  loading = true;
  loadingRec = false;
  activeCat = '';

  constructor(private shop: ShopService, public auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.shop.products().subscribe((r: any) => {
      this.products = Array.isArray(r) ? r : [];
      this.loading = false;
    });
    this.shop.categories().subscribe((r: any) => (this.categories = Array.isArray(r) ? r : []));
    if (this.auth.isLoggedIn()) {
      this.loadingRec = true;
      this.shop.recommendations(this.auth.userId(), 8).subscribe({
        next: (r: any) => {
          this.recommendations = r.items || [];
          this.strategy = r.strategy || '';
          this.loadingRec = false;
        },
        error: () => (this.loadingRec = false)
      });
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
