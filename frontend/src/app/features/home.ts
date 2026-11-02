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
    <!-- Hero Section -->
    <section class="hero-premium">
      <div class="hero-content">
        <span class="hero-eyebrow">
          <span class="dot-live"></span> NEXT-GENERATION LIVING &amp; TECH
        </span>
        <h1 class="hero-title">
          Extraordinary Gadgets.<br>
          <span class="gradient-text">Honest Returns. Real Rewards.</span>
        </h1>
        <p class="hero-subtitle">
          Curated flagship smartphones, ultrabooks, audiophile acoustics, and lifestyle tech.
          Enjoy condition-based returns earning up to 80% back in instant wallet credits.
        </p>

        <!-- Hero Quick Search -->
        <form class="hero-search-box" (ngSubmit)="search()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:.6">
            <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
          </svg>
          <input [(ngModel)]="q" name="q" placeholder="Search iPhone, OnePlus, Sony, Bose, laptops…" aria-label="Search products">
          <button type="submit" class="hero-search-btn">Explore Now →</button>
        </form>

        <!-- Trust Stats Counter -->
        <div class="hero-stats">
          <div class="hero-stat-card">
            <strong>{{ products.length > 0 ? products.length + '+' : '50+' }}</strong>
            <span>Verified Flagships</span>
          </div>
          <div class="hero-stat-card">
            <strong>80%</strong>
            <span>Max Return Cash</span>
          </div>
          <div class="hero-stat-card">
            <strong>₹1 = 1 Pt</strong>
            <span>Direct Wallet Value</span>
          </div>
          <div class="hero-stat-card">
            <strong>100%</strong>
            <span>Authentic Guarantee</span>
          </div>
        </div>
      </div>

      <!-- Hero Interactive Visual Cards -->
      <div class="hero-art-col">
        <div class="hero-feature-card spin-card">
          <div class="feature-icon">🎡</div>
          <div class="feature-info">
            <strong>Daily Spin &amp; Win</strong>
            <p>Win instant coupons up to 30% off every day</p>
          </div>
          <a routerLink="/spin" class="feature-link">Spin →</a>
        </div>

        <div class="hero-feature-card ai-card">
          <div class="feature-icon">✦</div>
          <div class="feature-info">
            <strong>AI Shopping Concierge</strong>
            <p>Tell us your budget &amp; requirements, get instant live recommendations</p>
          </div>
          <a routerLink="/assistant" class="feature-link">Ask AI →</a>
        </div>

        <div class="hero-feature-card return-card">
          <div class="feature-icon">🛡️</div>
          <div class="feature-info">
            <strong>Condition-Based Returns</strong>
            <p>Fair inspections: Like-New gets 80%, Good gets 60%</p>
          </div>
          <a routerLink="/returns" class="feature-link">Policy →</a>
        </div>
      </div>
    </section>

    <!-- Quick Category Cards -->
    <div class="quick-category-grid">
      <a [routerLink]="['/products']" [queryParams]="{ q: 'mobile' }" class="quick-cat-card">
        <div class="cat-icon-wrap" style="background:rgba(56,189,248,.12);border-color:rgba(56,189,248,.35);color:#38bdf8">📱</div>
        <div class="cat-text">
          <strong>Smartphones &amp; 5G</strong>
          <span>iPhone, Galaxy, OnePlus</span>
        </div>
      </a>

      <a [routerLink]="['/products']" [queryParams]="{ q: 'laptop' }" class="quick-cat-card">
        <div class="cat-icon-wrap" style="background:rgba(168,85,247,.12);border-color:rgba(168,85,247,.35);color:#c084fc">💻</div>
        <div class="cat-text">
          <strong>Laptops &amp; PCs</strong>
          <span>MacBook, Dell XPS, ASUS ROG</span>
        </div>
      </a>

      <a [routerLink]="['/products']" [queryParams]="{ q: 'bluetooth' }" class="quick-cat-card">
        <div class="cat-icon-wrap" style="background:rgba(34,211,238,.12);border-color:rgba(34,211,238,.35);color:#22d3ee">🎧</div>
        <div class="cat-text">
          <strong>Audio &amp; ANC</strong>
          <span>Sony XM5, AirPods Pro, Bose</span>
        </div>
      </a>

      <a [routerLink]="['/products']" [queryParams]="{ q: 'neckband' }" class="quick-cat-card">
        <div class="cat-icon-wrap" style="background:rgba(236,72,153,.12);border-color:rgba(236,72,153,.35);color:#f472b6">📿</div>
        <div class="cat-text">
          <strong>Wireless Neckbands</strong>
          <span>OnePlus, Realme, boAt</span>
        </div>
      </a>
    </div>

    <!-- AI Shopping Assistant Teaser Banner -->
    <div class="card ai-banner">
      <div class="ai-banner-left">
        <div class="ai-chip">✦ NEXGEN CO-PILOT</div>
        <h2>Looking for the perfect gadget within your budget?</h2>
        <p class="muted">
          Our AI assistant queries real-time specifications, verified stocks, return conditions, and side-by-side comparisons to find your ideal match in seconds.
        </p>
        <div class="ai-prompt-pills">
          <button (click)="askAI('Best noise cancelling earbuds under 5000')">🎧 Best earbuds under ₹5k</button>
          <button (click)="askAI('Compare OnePlus 12 vs S24 Ultra')">⇄ OnePlus 12 vs S24 Ultra</button>
          <button (click)="askAI('Which laptops are currently in stock?')">💻 High-performance laptops</button>
        </div>
      </div>
      <div class="ai-banner-right">
        <a routerLink="/assistant"><button class="primary" style="padding:12px 22px;font-size:15px">Launch AI Assistant →</button></a>
      </div>
    </div>

    <!-- Spin & Win Promo Banner -->
    <div class="card spin-promo-banner">
      <div class="spin-banner-inner">
        <div class="spin-banner-left">
          <span class="badge" style="background:rgba(236,72,153,0.2);color:#f472b6;border-color:rgba(236,72,153,0.4)">🎡 DAILY REWARD DROP</span>
          <h2 style="margin:8px 0 4px">Spin the Lucky Wheel for up to 30% OFF</h2>
          <p class="muted" style="margin:0">Test your luck daily! Generate instant unique coupon codes and redeem wallet coins directly at checkout.</p>
        </div>
        <a routerLink="/spin">
          <button class="primary" style="background:linear-gradient(135deg, #ec4899, #8b5cf6);padding:10px 20px">Spin Wheel Now 🎡</button>
        </a>
      </div>
    </div>

    <!-- Personalized Recommendations Rail (Logged in) -->
    <div class="card" *ngIf="auth.isLoggedIn()">
      <div class="section-title">
        <div style="display:flex;align-items:center;gap:10px">
          <h2>🎯 Recommended For You</h2>
          <span class="badge violet" *ngIf="strategy">{{ strategy }}</span>
        </div>
        <a routerLink="/products" class="muted" style="font-size:13px">View catalog →</a>
      </div>
      <div class="rail" *ngIf="recommendations.length">
        <app-product-card *ngFor="let p of recommendations" [product]="p"></app-product-card>
      </div>
      <div *ngIf="loadingRec"><div class="skeleton" style="height:240px;border-radius:14px"></div></div>
      <p class="muted" *ngIf="!loadingRec && !recommendations.length">Browse products to personalize this section. New accounts see top trending gadgets.</p>
    </div>

    <!-- Recently Viewed Products Rail -->
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

    <!-- "Because You Viewed" Rail -->
    <div class="card" *ngIf="becauseItems.length">
      <div class="section-title">
        <h2>Because You Viewed {{ becauseSource }}</h2>
        <span class="badge violet">Content-based similarity</span>
      </div>
      <div class="rail">
        <app-product-card *ngFor="let p of becauseItems" [product]="p"></app-product-card>
      </div>
    </div>

    <!-- Trending Now Rail -->
    <div class="card">
      <div class="section-title">
        <div style="display:flex;align-items:center;gap:10px">
          <h2>🔥 Trending Now</h2>
          <span class="badge ok">Hot Deals</span>
        </div>
        <a routerLink="/products" [queryParams]="{ sort: 'popular' }" class="muted" style="font-size:13px">View all →</a>
      </div>
      <div class="rail" *ngIf="trendingItems.length">
        <app-product-card *ngFor="let p of trendingItems" [product]="p"></app-product-card>
      </div>
      <div class="rail" *ngIf="loadingTrending">
        <div class="skeleton" style="height:240px;min-width:220px;border-radius:14px" *ngFor="let s of [1,2,3,4]"></div>
      </div>
    </div>

    <!-- Best Sellers Rail -->
    <div class="card">
      <div class="section-title">
        <div style="display:flex;align-items:center;gap:10px">
          <h2>⭐ Best Sellers</h2>
          <span class="badge violet">Top Rated</span>
        </div>
        <a routerLink="/products" [queryParams]="{ sort: 'rating_desc' }" class="muted" style="font-size:13px">View all →</a>
      </div>
      <div class="rail" *ngIf="popularItems.length">
        <app-product-card *ngFor="let p of popularItems" [product]="p"></app-product-card>
      </div>
      <div class="rail" *ngIf="loadingPopular">
        <div class="skeleton" style="height:240px;min-width:220px;border-radius:14px" *ngFor="let s of [1,2,3,4]"></div>
      </div>
    </div>

    <!-- Category Filter Bar -->
    <div class="card">
      <div class="section-title">
        <h2>Shop by Category</h2>
        <a routerLink="/products" class="muted" style="font-size:13px">Open Full Catalog →</a>
      </div>
      <div class="cat-row">
        <button class="chip" [class.on]="activeCat===''" (click)="filterCat('')">All Products</button>
        <button class="chip" *ngFor="let c of categories" [class.on]="activeCat===(c.id||c._id)" (click)="filterCat(c.id || c._id)">{{ c.name }}</button>
      </div>
    </div>

    <!-- Product Grid -->
    <div class="card">
      <div class="section-title">
        <h2>{{ activeCatName() ? activeCatName() : 'Featured Collection' }}</h2>
        <span class="muted" style="font-size:13px">{{ visibleProducts().length }} items available</span>
      </div>
      <div class="grid" *ngIf="visibleProducts().length">
        <app-product-card *ngFor="let p of visibleProducts().slice(0, 12)" [product]="p"></app-product-card>
      </div>
      <app-empty-state *ngIf="!loading && !visibleProducts().length" title="No products in this category" hint="Try another category or browse everything." ctaLink="/products"></app-empty-state>
      <div class="grid" *ngIf="loading"><div class="skeleton" style="height:260px;border-radius:14px" *ngFor="let s of [1,2,3,4,5,6]"></div></div>
    </div>

    <!-- Value Propositions Trust Grid -->
    <div class="value-grid-premium">
      <div class="value-card">
        <div class="value-icon">🛡️</div>
        <h3>Condition-Based Returns</h3>
        <p>Fair, transparent inspection tiers. Like-New items earn 80% back in instant wallet credits.</p>
      </div>
      <div class="value-card">
        <div class="value-icon">⚡</div>
        <h3>Express Direct Shipping</h3>
        <p>Swift dispatch with real-time Google Maps package tracking and delivery driver coordinates.</p>
      </div>
      <div class="value-card">
        <div class="value-icon">🪙</div>
        <h3>NEXGEN Reward Wallet</h3>
        <p>1 Point = ₹1. Earn rewards on eligible purchases and redeem up to 20% off your entire order.</p>
      </div>
      <div class="value-card">
        <div class="value-icon">✦</div>
        <h3>AI-Powered Shopping</h3>
        <p>Deterministic, live-catalog answers with side-by-side specs comparison and verified buyer ratings.</p>
      </div>
    </div>
  `,
  styles: [`
    .hero-premium {
      position: relative;
      overflow: hidden;
      border-radius: 20px;
      padding: 36px 32px;
      display: grid;
      grid-template-columns: 1.25fr 0.75fr;
      gap: 28px;
      margin-bottom: 20px;
      background:
        radial-gradient(ellipse 800px 450px at 15% 20%, rgba(99, 102, 241, 0.28), transparent 70%),
        radial-gradient(ellipse 600px 400px at 85% 75%, rgba(236, 72, 153, 0.22), transparent 65%),
        linear-gradient(135deg, rgba(8, 12, 25, 0.96) 0%, rgba(22, 16, 44, 0.9) 55%, rgba(6, 9, 20, 0.98) 100%);
      border: 1px solid rgba(167, 139, 250, 0.35);
      box-shadow: 0 24px 60px rgba(10, 5, 25, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12);
    }
    .hero-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 2;
    }
    .hero-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      background: rgba(139, 92, 246, 0.2);
      border: 1px solid rgba(167, 139, 250, 0.4);
      color: #e9d5ff;
      width: fit-content;
    }
    .hero-title {
      font-size: clamp(26px, 3.2vw, 38px);
      line-height: 1.18;
      font-weight: 900;
      letter-spacing: -0.02em;
      margin: 4px 0 0;
      color: #ffffff;
    }
    .gradient-text {
      background: linear-gradient(135deg, #38bdf8 0%, #c084fc 50%, #f472b6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-subtitle {
      color: #cbd5e1;
      font-size: 14.5px;
      line-height: 1.6;
      max-width: 58ch;
      margin: 0;
    }

    .hero-search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(4, 7, 16, 0.75);
      border: 1px solid rgba(167, 139, 250, 0.35);
      border-radius: 12px;
      padding: 4px 6px 4px 14px;
      margin: 6px 0;
      max-width: 540px;
      box-shadow: 0 8px 24px rgba(2, 5, 12, 0.45);
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .hero-search-box:focus-within {
      border-color: #a855f7;
      box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.25);
    }
    .hero-search-box input {
      flex: 1;
      border: 0;
      background: transparent;
      padding: 8px 4px;
      color: #ffffff;
      font-size: 14px;
    }
    .hero-search-box input:focus { outline: none; border: 0; }
    .hero-search-btn {
      border: 0;
      background: linear-gradient(135deg, #8b5cf6, #d946ef);
      color: #ffffff;
      font-weight: 700;
      font-size: 13px;
      padding: 9px 16px;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);
      white-space: nowrap;
      transition: all 0.15s ease;
    }
    .hero-search-btn:hover {
      filter: brightness(1.12);
      transform: translateY(-1px);
    }

    .hero-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-top: 12px;
    }
    .hero-stat-card {
      background: rgba(6, 9, 20, 0.55);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(148, 163, 255, 0.18);
      border-radius: 12px;
      padding: 9px 12px;
    }
    .hero-stat-card strong {
      display: block;
      font-size: 17px;
      font-weight: 800;
      color: #ffffff;
    }
    .hero-stat-card span {
      font-size: 11px;
      color: #94a3b8;
    }

    .hero-art-col {
      display: flex;
      flex-direction: column;
      gap: 10px;
      justify-content: center;
      z-index: 2;
    }
    .hero-feature-card {
      background: rgba(6, 9, 20, 0.65);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(148, 163, 255, 0.2);
      border-radius: 14px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.2s ease;
    }
    .hero-feature-card:hover {
      transform: translateX(4px);
      border-color: rgba(168, 85, 247, 0.5);
      background: rgba(15, 23, 42, 0.75);
    }
    .feature-icon {
      font-size: 24px;
      width: 42px;
      height: 42px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.05);
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }
    .feature-info { flex: 1; }
    .feature-info strong { display: block; font-size: 13.5px; color: #ffffff; }
    .feature-info p { font-size: 11px; color: #94a3b8; margin: 2px 0 0; }
    .feature-link {
      font-size: 12px;
      font-weight: 700;
      color: #c084fc;
      text-decoration: none;
      padding: 4px 8px;
      border-radius: 6px;
      background: rgba(168, 85, 247, 0.15);
      white-space: nowrap;
    }

    .quick-category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
      margin: 16px 0;
    }
    .quick-cat-card {
      background: rgba(13, 19, 39, 0.7);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(148, 163, 255, 0.14);
      border-radius: 14px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 14px;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .quick-cat-card:hover {
      transform: translateY(-3px);
      border-color: rgba(139, 92, 246, 0.45);
      background: rgba(19, 27, 51, 0.85);
    }
    .cat-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      border: 1px solid transparent;
      display: grid;
      place-items: center;
      font-size: 22px;
      flex-shrink: 0;
    }
    .cat-text strong { display: block; font-size: 13.5px; color: #f8fafc; }
    .cat-text span { font-size: 11.5px; color: #94a3b8; }

    .ai-banner {
      background: linear-gradient(125deg, rgba(30, 27, 75, 0.85) 0%, rgba(15, 23, 42, 0.95) 50%, rgba(6, 78, 59, 0.3) 100%);
      border: 1px solid rgba(139, 92, 246, 0.35);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
    }
    .ai-banner-left { flex: 1; min-width: 280px; }
    .ai-chip {
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.35);
      padding: 3px 9px;
      border-radius: 999px;
      width: fit-content;
      margin-bottom: 8px;
    }
    .ai-prompt-pills {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 12px;
    }
    .ai-prompt-pills button {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(148, 163, 255, 0.2);
      border-radius: 999px;
      padding: 5px 12px;
      color: #cbd5e1;
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .ai-prompt-pills button:hover {
      background: rgba(56, 189, 248, 0.15);
      border-color: #38bdf8;
      color: #ffffff;
    }

    .spin-promo-banner {
      background: linear-gradient(125deg, rgba(88, 28, 135, 0.5) 0%, rgba(131, 24, 67, 0.4) 60%, rgba(15, 23, 42, 0.9) 100%);
      border: 1px solid rgba(236, 72, 153, 0.35);
    }
    .spin-banner-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .value-grid-premium {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 14px;
      margin: 16px 0 24px;
    }
    .value-card {
      background: rgba(13, 19, 39, 0.65);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(148, 163, 255, 0.12);
      border-radius: 16px;
      padding: 18px;
    }
    .value-icon { font-size: 24px; margin-bottom: 8px; }
    .value-card h3 { font-size: 15px; font-weight: 700; color: #ffffff; margin-bottom: 4px; }
    .value-card p { font-size: 12.5px; color: #94a3b8; line-height: 1.5; margin: 0; }

    @media (max-width: 900px) {
      .hero-premium { grid-template-columns: 1fr; padding: 24px 18px; }
      .hero-stats { grid-template-columns: repeat(2, 1fr); }
    }
  `]
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

      this.shop.recentlyViewedRecommendations(userId, 6).subscribe({
        next: (r: any) => {
          this.browsingRecommendations = r.items || [];
          this.browsingSources = r.sourceKeywords || [];
        },
        error: () => undefined
      });

      this.shop.history(userId).subscribe({
        next: (h: any) => {
          const list = h.history || [];
          if (list.length > 0) {
            const first = list[0];
            const pid = first.productId;
            if (pid) {
              this.shop.similarProducts(pid, 6).subscribe({
                next: (r: any) => {
                  this.becauseItems = r.items || [];
                  this.becauseSource = r.sourceProduct?.name || 'Recent item';
                },
                error: () => undefined
              });
            }
          }
        },
        error: () => undefined
      });
    }
  }

  search(): void {
    if (this.q.trim()) {
      this.router.navigate(['/products'], { queryParams: { q: this.q.trim() } });
    } else {
      this.router.navigate(['/products']);
    }
  }

  askAI(prompt: string): void {
    this.router.navigate(['/assistant'], { queryParams: { q: prompt } });
  }

  filterCat(id: string): void {
    this.activeCat = id;
  }

  activeCatName(): string {
    const c = this.categories.find(x => (x.id || x._id) === this.activeCat);
    return c ? c.name : '';
  }

  visibleProducts(): any[] {
    if (!this.activeCat) return this.products;
    return this.products.filter(p => (p.categoryId || p.category) === this.activeCat);
  }

  clearRecentlyViewed(): void {
    this.recentlyViewedProducts = [];
    this.shop.clearLocalRecentlyViewed();
    if (this.auth.isLoggedIn()) {
      this.shop.clearHistory(this.auth.userId()).subscribe({ error: () => undefined });
    }
  }
}
