import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Shop } from '../core/shop';
import { Toast } from '../shared/toast';
import { ProductCard } from '../shared/product-card';
import { ProductVisual } from '../shared/product-visual';
import { Subscription } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule, RouterModule, ProductCard, ProductVisual],
  template: `
    <div class="breadcrumb"><a routerLink="/">Home</a> / Shop</div>
    <div class="page-head">
      <div>
        <h1 style="font-size:28px">Catalog</h1>
        <p>
          {{ total }} result{{ total === 1 ? '' : 's' }}
          <span *ngIf="q"> for “<strong>{{ q }}</strong>”</span>
          <span *ngIf="selectedBrand"> · Brand: <strong>{{ selectedBrand }}</strong></span>
          <span *ngIf="minRating"> · <strong>★ {{ minRating }}+</strong></span>
          · {{ source || 'catalog' }}
        </p>
      </div>
      <div class="view-toggle" role="tablist" aria-label="View mode">
        <button [class.on]="view==='grid'" (click)="view='grid'">▦ Grid</button>
        <button [class.on]="view==='list'" (click)="view='list'">☰ List</button>
      </div>
    </div>

    <!-- Active Filter Tags / Chips -->
    <div class="active-filters" *ngIf="hasActiveFilters()">
      <span class="muted" style="font-size:12px;margin-right:4px">Active filters:</span>
      <span class="filter-tag" *ngIf="q">
        Search: “{{ q }}”
        <button (click)="q=''; load()" title="Remove search filter">×</button>
      </span>
      <span class="filter-tag" *ngIf="category">
        Category: {{ getCategoryName(category) }}
        <button (click)="category=''; load()" title="Remove category filter">×</button>
      </span>
      <span class="filter-tag" *ngIf="selectedBrand">
        Brand: {{ selectedBrand }}
        <button (click)="selectedBrand=''; load()" title="Remove brand filter">×</button>
      </span>
      <span class="filter-tag" *ngIf="minPrice || maxPrice">
        Price: ₹{{ minPrice || 0 }} – ₹{{ maxPrice || '∞' }}
        <button (click)="minPrice=''; maxPrice=''; load()" title="Remove price filter">×</button>
      </span>
      <span class="filter-tag" *ngIf="minRating">
        ★ {{ minRating }}+ Rating
        <button (click)="minRating=null; load()" title="Remove rating filter">×</button>
      </span>
      <span class="filter-tag" *ngIf="inStockOnly">
        In-Stock
        <button (click)="inStockOnly=false; load()" title="Remove in-stock filter">×</button>
      </span>
      <span class="filter-tag" *ngIf="returnableOnly">
        Return-Eligible
        <button (click)="returnableOnly=false; load()" title="Remove return-eligible filter">×</button>
      </span>
      <button class="btn-ghost btn-sm" style="margin-left:auto;padding:3px 10px;font-size:11px" (click)="clear()">
        Clear all
      </button>
    </div>

    <div class="shop-layout">
      <!-- Filter Sidebar -->
      <aside class="card filters">
        <h3>Search &amp; Voice</h3>
        <div class="search-wrapper">
          <div class="search-input-group">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:.6">
              <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
            </svg>
            <input
              [(ngModel)]="q"
              name="q"
              placeholder="Search products, brands…"
              (input)="onSearchInput()"
              (keyup.enter)="selectSuggestion(null)"
              (focus)="showSuggestions = suggestions.length > 0"
              aria-label="Search"
              autocomplete="off"
            >
            <button
              *ngIf="q"
              type="button"
              class="icon-action"
              (click)="q=''; suggestions=[]; load()"
              title="Clear text"
            >
              ×
            </button>
            <button
              type="button"
              class="voice-btn"
              [class.listening]="isListening"
              (click)="toggleVoiceSearch()"
              [title]="isListening ? 'Listening… click to stop' : 'Voice search (Speech to text)'"
              aria-label="Voice search"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
              </svg>
            </button>
          </div>

          <!-- Suggestions Dropdown -->
          <div class="search-suggestions" *ngIf="showSuggestions && suggestions.length > 0">
            <div class="suggestion-header">Suggestions</div>
            <div
              class="suggestion-item"
              *ngFor="let s of suggestions"
              (mousedown)="selectSuggestion(s)"
            >
              <img *ngIf="s.image" [src]="s.image" class="suggestion-thumb" alt="" />
              <div class="suggestion-text">
                <strong>{{ s.title }}</strong>
                <span *ngIf="s.brand && s.brand !== 'Other'">{{ s.brand }} · </span>
                <span class="suggestion-badge">{{ s.type }}</span>
              </div>
              <span class="suggestion-price" *ngIf="s.price">₹{{ s.price }}</span>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Category Filter -->
        <h3>Categories</h3>
        <div class="cat-row">
          <button class="chip" [class.on]="!category" (click)="category=''; load()">All</button>
          <button
            class="chip"
            *ngFor="let c of categories"
            [class.on]="category===(c.id||c._id)"
            (click)="category=(c.id||c._id); load()"
          >
            {{ c.name }}
          </button>
        </div>

        <div class="divider"></div>

        <!-- Brand Filter -->
        <div class="row" style="justify-content:space-between;margin:0 0 6px">
          <h3 style="margin:0">Brand</h3>
          <span class="muted" *ngIf="selectedBrand" (click)="selectedBrand=''; load()" style="cursor:pointer;font-size:11px">Reset</span>
        </div>
        <div class="brand-list">
          <button
            type="button"
            class="brand-item"
            [class.on]="!selectedBrand"
            (click)="selectedBrand=''; load()"
          >
            <span>All Brands</span>
          </button>
          <button
            type="button"
            class="brand-item"
            *ngFor="let b of availableBrands"
            [class.on]="selectedBrand.toLowerCase() === b.toLowerCase()"
            (click)="selectedBrand = (selectedBrand.toLowerCase() === b.toLowerCase() ? '' : b); load()"
          >
            <span>{{ b }}</span>
            <span *ngIf="selectedBrand.toLowerCase() === b.toLowerCase()" style="font-size:11px">✓</span>
          </button>
        </div>

        <div class="divider"></div>

        <!-- Quick Trending Gadget Shortcuts -->
        <h3>Trending Gadgets</h3>
        <div class="cat-row" style="gap:6px">
          <button class="chip" [class.on]="q==='mobile'" (click)="quickSearch('mobile')">📱 Mobiles</button>
          <button class="chip" [class.on]="q==='laptop'" (click)="quickSearch('laptop')">💻 Laptops</button>
          <button class="chip" [class.on]="q==='bluetooth'" (click)="quickSearch('bluetooth')">🎧 Bluetooth</button>
          <button class="chip" [class.on]="q==='neckband'" (click)="quickSearch('neckband')">📿 Neckbands</button>
        </div>

        <div class="divider"></div>

        <!-- Price Range Filter -->
        <div class="row" style="justify-content:space-between;margin:0 0 6px">
          <h3 style="margin:0">Price Range</h3>
          <span class="muted">₹{{ minPrice || 0 }} – ₹{{ maxPrice || '∞' }}</span>
        </div>
        <div class="row" style="gap:6px">
          <input [(ngModel)]="minPrice" type="number" placeholder="Min ₹" aria-label="Min price" (change)="load()" style="width:100%">
          <input [(ngModel)]="maxPrice" type="number" placeholder="Max ₹" aria-label="Max price" (change)="load()" style="width:100%">
        </div>
        <div class="price-tiers">
          <button class="tier-chip" [class.on]="isTier(0, 1000)" (click)="setPriceTier(0, 1000)">&lt; ₹1k</button>
          <button class="tier-chip" [class.on]="isTier(1000, 5000)" (click)="setPriceTier(1000, 5000)">₹1k–₹5k</button>
          <button class="tier-chip" [class.on]="isTier(5000, 20000)" (click)="setPriceTier(5000, 20000)">₹5k–₹20k</button>
          <button class="tier-chip" [class.on]="isTier(20000, null)" (click)="setPriceTier(20000, null)">&gt; ₹20k</button>
        </div>

        <div class="divider"></div>

        <!-- Rating Filter -->
        <div class="row" style="justify-content:space-between;margin:0 0 6px">
          <h3 style="margin:0">Customer Rating</h3>
          <span class="muted" *ngIf="minRating" (click)="minRating=null; load()" style="cursor:pointer;font-size:11px">Reset</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:3px">
          <div class="rating-item" [class.on]="!minRating" (click)="minRating=null; load()">
            <span>All Ratings</span>
          </div>
          <div class="rating-item" [class.on]="minRating===4" (click)="minRating=4; load()">
            <span style="color:#fbbf24">★★★★☆</span>
            <span>4★ &amp; above</span>
          </div>
          <div class="rating-item" [class.on]="minRating===3" (click)="minRating=3; load()">
            <span style="color:#fbbf24">★★★☆☆</span>
            <span>3★ &amp; above</span>
          </div>
          <div class="rating-item" [class.on]="minRating===2" (click)="minRating=2; load()">
            <span style="color:#fbbf24">★★☆☆☆</span>
            <span>2★ &amp; above</span>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Toggles -->
        <label style="margin-top:4px"><input type="checkbox" [(ngModel)]="inStockOnly" (change)="load()" style="width:auto"> In-stock only</label>
        <label><input type="checkbox" [(ngModel)]="returnableOnly" (change)="load()" style="width:auto"> Reward-eligible returns</label>

        <div class="divider"></div>

        <!-- Sorting -->
        <label>Sort by
          <select [(ngModel)]="sort" (change)="load()">
            <option value="">Relevance</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="popular">Most Popular</option>
            <option value="newest">Newest Arrivals</option>
            <option value="rating_desc">Highest Rated</option>
          </select>
        </label>

        <div class="row" style="margin-top:14px">
          <button class="primary btn-sm" style="flex:1" (click)="load()">Apply Filters</button>
          <button class="btn-ghost btn-sm" (click)="clear()">Reset</button>
        </div>
      </aside>

      <!-- Main Results Column -->
      <section>
        <div class="toolbar">
          <div class="row" style="gap:8px;margin:0">
            <span class="badge info" *ngIf="q">“{{ q }}”</span>
            <span class="badge ok" *ngIf="selectedBrand">{{ selectedBrand }}</span>
            <span class="badge warn" *ngIf="minRating">★ {{ minRating }}+</span>
            <span class="muted" *ngIf="loading"><span class="spinner"></span> Searching catalog…</span>
            <span class="muted" *ngIf="!loading">{{ items.length }} product{{ items.length === 1 ? '' : 's' }} found</span>
          </div>
          <div class="muted" style="font-size:12px" *ngIf="sort">
            Sorted by:
            <strong>
              {{ sort === 'price_asc' ? 'Price: Low to High' : sort === 'price_desc' ? 'Price: High to Low' : sort === 'popular' ? 'Popularity' : sort === 'newest' ? 'Newest Arrivals' : sort === 'rating_desc' ? 'Highest Rating' : 'Relevance' }}
            </strong>
          </div>
        </div>

        <!-- Grid View -->
        <div class="grid" *ngIf="view==='grid' && items.length">
          <app-product-card *ngFor="let p of items" [product]="p"></app-product-card>
        </div>

        <!-- List View -->
        <div class="stack" *ngIf="view==='list' && items.length">
          <div class="list-row" *ngFor="let p of items">
            <app-product-visual [product]="p" size="sm"></app-product-visual>
            <div>
              <strong><a [routerLink]="['/products', p.id || p.productId || p._id]">{{ p.name }}</a></strong>
              <div class="muted" style="font-size:12px;margin:2px 0 4px">
                <span *ngIf="p.brand" style="color:var(--brand-3);font-weight:600">{{ p.brand }} · </span>
                {{ p.description?.slice(0, 110) }}...
              </div>
              <div class="row" style="margin:0;gap:8px">
                <span class="price">₹{{ p.price | number:'1.0-0' }}</span>
                <span style="color:#fbbf24;font-size:12px" *ngIf="p.averageRating > 0">★ {{ p.averageRating | number:'1.1-1' }} ({{ p.reviewCount }})</span>
                <span class="badge ok" *ngIf="(p.stockQuantity??1)>0">In stock</span>
                <span class="badge bad" *ngIf="(p.stockQuantity??1)<=0">Out of stock</span>
                <span class="badge violet" *ngIf="p.eligibleForReturn">Easy Return</span>
              </div>
            </div>
            <a [routerLink]="['/products', p.id || p.productId || p._id]"><button class="primary btn-sm">View →</button></a>
          </div>
        </div>

        <!-- Loading Skeletons -->
        <div class="grid" *ngIf="loading">
          <div class="skeleton" style="height:260px;border-radius:14px" *ngFor="let s of [1,2,3,4,5,6]"></div>
        </div>

        <!-- Contextual Empty State Message -->
        <div *ngIf="!loading && !items.length" class="card" style="text-align:center;padding:48px 24px">
          <div style="font-size:48px;margin-bottom:12px">🔍</div>
          <h2 style="font-size:22px">No matching products found</h2>
          <p class="muted" style="max-width:480px;margin:8px auto 16px">
            We couldn't find any products
            <span *ngIf="q">matching “<strong>{{ q }}</strong>”</span>
            <span *ngIf="selectedBrand"> from <strong>{{ selectedBrand }}</strong></span>
            <span *ngIf="minPrice || maxPrice"> in the ₹{{ minPrice || 0 }} – ₹{{ maxPrice || '∞' }} price range</span>.
            Try adjusting your filters or search keywords.
          </p>
          <div class="cat-row" style="justify-content:center;margin-bottom:20px;gap:8px">
            <span class="muted" style="font-size:12px;align-self:center">Try searching:</span>
            <button class="chip" (click)="quickSearch('mobile')">📱 Mobiles</button>
            <button class="chip" (click)="quickSearch('laptop')">💻 Laptops</button>
            <button class="chip" (click)="quickSearch('bluetooth')">🎧 Bluetooth</button>
            <button class="chip" (click)="quickSearch('neckband')">📿 Neckbands</button>
            <button class="chip" (click)="quickSearch('watch')">⌚ Watches</button>
          </div>
          <div>
            <button class="primary" (click)="clear()">Reset All Filters</button>
          </div>
        </div>
      </section>
    </div>
  `
})
export class ProductList implements OnInit, OnDestroy {
  q = '';
  category = '';
  selectedBrand = '';
  sort = '';
  minPrice: any = '';
  maxPrice: any = '';
  minRating: number | null = null;
  inStockOnly = false;
  returnableOnly = false;
  view: 'grid' | 'list' = 'grid';

  items: any[] = [];
  categories: any[] = [];
  availableBrands: string[] = [
    'Apple', 'Samsung', 'Sony', 'OnePlus', 'boAt', 'Realme', 'Boult', 'Noise',
    'Dell', 'ASUS', 'HP', 'Lenovo', 'Acer', 'JBL', 'Bose', 'Marshall'
  ];
  suggestions: any[] = [];
  showSuggestions = false;
  isListening = false;
  total = 0;
  source = '';
  loading = false;

  private recognition: any = null;
  private searchTimer: any = null;
  private routeSub: Subscription | null = null;

  constructor(
    private shop: Shop,
    private route: ActivatedRoute,
    private router: Router,
    private toast: Toast
  ) {}

  ngOnInit(): void {
    this.shop.categories().subscribe((r: any) => (this.categories = Array.isArray(r) ? r : []));
    this.routeSub = this.route.queryParams.subscribe((p: any) => {
      this.category = p['category'] || '';
      this.q = p['q'] || '';
      this.selectedBrand = p['brand'] || '';
      if (p['minPrice']) this.minPrice = +p['minPrice'];
      if (p['maxPrice']) this.maxPrice = +p['maxPrice'];
      if (p['minRating']) this.minRating = +p['minRating'];
      if (p['sort']) this.sort = p['sort'];
      this.load();
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
    if (this.recognition) {
      try { this.recognition.stop(); } catch (ignored) {}
    }
  }

  hasActiveFilters(): boolean {
    return !!(
      this.q ||
      this.category ||
      this.selectedBrand ||
      this.minPrice ||
      this.maxPrice ||
      this.minRating ||
      this.inStockOnly ||
      this.returnableOnly
    );
  }

  getCategoryName(catId: string): string {
    const c = this.categories.find(x => (x.id || x._id) === catId);
    return c ? c.name : catId;
  }

  setPriceTier(min: number, max: number | null): void {
    if (this.minPrice === min && this.maxPrice === max) {
      this.minPrice = '';
      this.maxPrice = '';
    } else {
      this.minPrice = min;
      this.maxPrice = max ?? '';
    }
    this.load();
  }

  isTier(min: number, max: number | null): boolean {
    return this.minPrice === min && (max === null ? this.maxPrice === '' : this.maxPrice === max);
  }

  clear(): void {
    this.q = '';
    this.category = '';
    this.selectedBrand = '';
    this.sort = '';
    this.minPrice = '';
    this.maxPrice = '';
    this.minRating = null;
    this.inStockOnly = false;
    this.returnableOnly = false;
    this.suggestions = [];
    this.showSuggestions = false;
    this.load();
  }

  quickSearch(tag: string): void {
    this.q = this.q === tag ? '' : tag;
    this.load();
  }

  onSearchInput(): void {
    clearTimeout(this.searchTimer);
    if (!this.q || this.q.trim().length < 2) {
      this.suggestions = [];
      this.showSuggestions = false;
      return;
    }
    this.searchTimer = setTimeout(() => {
      this.shop.searchSuggestions(this.q.trim()).subscribe({
        next: (items: any[]) => {
          this.suggestions = items || [];
          this.showSuggestions = this.suggestions.length > 0;
        },
        error: () => {
          this.suggestions = [];
          this.showSuggestions = false;
        }
      });
    }, 220);
  }

  selectSuggestion(s: any): void {
    this.showSuggestions = false;
    if (!s) {
      this.load();
      return;
    }
    if (s.type === 'category' && s.id) {
      this.category = s.id;
      this.q = '';
    } else if (s.type === 'brand') {
      this.selectedBrand = s.text;
      this.q = '';
    } else if (s.type === 'product' && s.id) {
      this.router.navigate(['/products', s.id]);
      return;
    } else {
      this.q = s.text || s.title;
    }
    this.load();
  }

  toggleVoiceSearch(): void {
    if (this.isListening) {
      if (this.recognition) {
        try { this.recognition.stop(); } catch (ignored) {}
      }
      this.isListening = false;
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.toast.err('Voice search is not supported by your current browser.');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'en-US';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.toast.ok('🎙️ Listening... Speak now (e.g. "iPhone", "Sony headphones")');
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          this.q = transcript.trim();
          this.toast.ok(`Recognized: "${this.q}"`);
          this.load();
        }
        this.isListening = false;
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        if (event.error === 'not-allowed') {
          this.toast.err('Microphone access was denied. Please allow microphone permission.');
        } else {
          this.toast.err(`Voice search issue: ${event.error || 'could not recognize speech'}`);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.start();
    } catch (err: any) {
      this.isListening = false;
      this.toast.err('Failed to start voice recognition: ' + (err.message || 'unknown error'));
    }
  }

  load(): void {
    this.loading = true;
    this.showSuggestions = false;

    this.shop.search({
      q: this.q.trim(),
      category: this.category,
      brand: this.selectedBrand,
      minPrice: this.minPrice !== '' && this.minPrice != null ? +this.minPrice : null,
      maxPrice: this.maxPrice !== '' && this.maxPrice != null ? +this.maxPrice : null,
      minRating: this.minRating,
      sort: this.sort,
      page: 0,
      size: 50
    }).subscribe({
      next: (r: any) => {
        let list: any[] = r.items || (Array.isArray(r) ? r : []);

        // Dynamic brands facet update if provided by backend
        if (Array.isArray(r.availableBrands) && r.availableBrands.length > 0) {
          const union = new Set([...this.availableBrands, ...r.availableBrands]);
          this.availableBrands = Array.from(union).sort();
        }

        // Secondary client-side refinement in case of MongoDB fallback/legacy endpoints
        if (this.selectedBrand) {
          const bLower = this.selectedBrand.toLowerCase();
          list = list.filter((p) => {
            const pb = (p.brand || '').toLowerCase();
            const pn = (p.name || '').toLowerCase();
            return pb.includes(bLower) || pn.includes(bLower);
          });
        }

        if (this.minRating) {
          list = list.filter((p) => (p.averageRating ?? 0) >= this.minRating!);
        }

        if (this.inStockOnly) {
          list = list.filter((p) => (p.stockQuantity ?? 1) > 0 || p.availability);
        }

        if (this.returnableOnly) {
          list = list.filter((p) => p.eligibleForReturn || p.isEligibleForReturn);
        }

        this.items = list;
        this.total = r.total ?? list.length;
        this.source = r.source || 'catalog';
        this.loading = false;
      },
      error: () => {
        // Fallback to direct products endpoint if search gateway failed
        this.shop.products(this.category).subscribe({
          next: (all: any) => {
            let list = Array.isArray(all) ? all : [];
            if (this.q.trim()) {
              const ql = this.q.trim().toLowerCase();
              list = list.filter(p => (p.name + ' ' + (p.description || '')).toLowerCase().includes(ql));
            }
            if (this.selectedBrand) {
              const bl = this.selectedBrand.toLowerCase();
              list = list.filter(p => (p.name + ' ' + (p.brand || '')).toLowerCase().includes(bl));
            }
            if (this.minPrice !== '' && this.minPrice != null) list = list.filter(p => p.price >= +this.minPrice);
            if (this.maxPrice !== '' && this.maxPrice != null) list = list.filter(p => p.price <= +this.maxPrice);
            if (this.minRating) list = list.filter(p => (p.averageRating ?? 0) >= this.minRating!);
            if (this.inStockOnly) list = list.filter(p => (p.stockQuantity ?? 1) > 0 || p.availability);
            if (this.returnableOnly) list = list.filter(p => p.eligibleForReturn || p.isEligibleForReturn);

            if (this.sort === 'price_asc') list.sort((a, b) => a.price - b.price);
            else if (this.sort === 'price_desc') list.sort((a, b) => b.price - a.price);
            else if (this.sort === 'rating_desc') list.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
            else if (this.sort === 'popular') list.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));

            this.items = list;
            this.total = list.length;
            this.source = 'catalog-fallback';
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
      }
    });
  }
}
