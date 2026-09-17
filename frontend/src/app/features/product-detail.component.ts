import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ShopService } from '../core/shop.service';
import { AuthService } from '../core/auth.service';
import { ProductCardComponent } from '../shared/product-card.component';
import { ProductVisualComponent } from '../shared/product-visual.component';
import { ToastService } from '../shared/toast.service';

const MULT: Record<string, number> = { LIKE_NEW: 0.8, GOOD: 0.6, FAIR: 0.4, POOR: 0.1 };

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProductCardComponent, ProductVisualComponent],
  template: `
    <div class="breadcrumb"><a routerLink="/">Home</a> / <a routerLink="/products">Shop</a> / {{ product?.name || '…' }}</div>
    <div class="detail-layout" *ngIf="product">
      <div class="gallery">
        <app-product-visual [product]="product" size="lg"></app-product-visual>
        <div class="row" style="padding:10px 14px">
          <span class="badge ok" *ngIf="inStock()">● In stock ({{ product.stockQuantity }})</span>
          <span class="badge bad" *ngIf="!inStock()">● Out of stock</span>
          <span class="badge violet" *ngIf="product.eligibleForReturn"> Eligible for reward returns</span>
          <span class="badge">{{ product.category || product.categoryId }}</span>
        </div>
      </div>
      <div class="card" style="margin:0">
        <h1 style="font-size:26px">{{ product.name }}</h1>
        <div class="row"><span class="stars">★★★★☆</span><span class="muted">4.2 · 380 ratings · AI-matched to your taste</span></div>
        <div class="price-row" style="margin:8px 0"><span class="price" style="font-size:28px">₹{{ product.price | number }}</span><span class="price-note">inclusive of taxes</span></div>
        <p class="muted">{{ product.description }}</p>
        <div class="reward-box" *ngIf="product.eligibleForReturn">
          <strong> Return & earn back</strong>
          <div class="muted">LIKE_NEW 80% · GOOD 60% · FAIR 40% · POOR 10% → wallet points (1 pt = ₹1)</div>
          <div class="muted">Est. on LIKE_NEW: <strong style="color:#15803d">₹{{ estLikeNew() | number }} pts</strong></div>
        </div>
        <div class="buy-box" style="margin-top:12px" *ngIf="auth.isLoggedIn(); else loginCta">
          <div class="row">
            <div class="qty-stepper"><button (click)="qty=max(1,qty-1)" aria-label="Decrease">−</button><span>{{ qty }}</span><button (click)="qty=min(stock(),qty+1)" aria-label="Increase">+</button></div>
            <button class="primary" (click)="add()" [disabled]="!inStock() || adding">{{ adding ? 'Adding…' : 'Add to Cart · ₹' + (product.price*qty | number) }}</button>
            <a routerLink="/cart"><button class="btn-ghost">Go to cart</button></a>
          </div>
          <p class="error" *ngIf="error">{{ error }}</p>
          <p class="success" *ngIf="added"> Added — continue shopping or checkout.</p>
        </div>
        <ng-template #loginCta><p><a routerLink="/login"><button class="primary">Login to buy</button></a></p></ng-template>
        <div class="trust">
          <div>🚚 <strong>Fast delivery</strong><br>2–4 days · free over ₹999</div>
          <div> <strong>14-day returns</strong><br>eligible items earn wallet pts</div>
          <div>🔒 <strong>Secure pay</strong><br>COD · UPI · Card (mock)</div>
        </div>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="tabs">
        <button [class.active]="tab==='desc'" (click)="tab='desc'">Description</button>
        <button [class.active]="tab==='returns'" (click)="tab='returns'">Return policy</button>
        <button [class.active]="tab==='reco'" (click)="tab='reco'">Why recommended?</button>
      </div>
      <p *ngIf="tab==='desc'" class="muted">{{ product?.description || 'Quality-assured product synced to search index. Stock validated at cart, checkout and order time.' }}</p>
      <div *ngIf="tab==='returns'">
        <div class="reward-compare">
          <div class="reward-box" *ngFor="let c of ['LIKE_NEW','GOOD','FAIR','POOR']"><strong>{{ c }}</strong><div class="muted">{{ (MULT[c]*100) }}% of price</div><div class="price">₹{{ floor(product.price * MULT[c]) | number }} pts</div></div>
        </div>
        <p class="muted">Estimated at claim time, final after warehouse inspection. NOT_ELIGIBLE = 0 pts.</p>
      </div>
      <p *ngIf="tab==='reco'" class="muted">Scored as 3× purchase-category + 2× views + 2× search-match + 1× popularity. Viewing this item logged a VIEW event to improve your rail.</p>
    </div>
    <div class="card" *ngIf="related.length">
      <div class="section-title"><h2>Based on Your Activity</h2><a routerLink="/products">More →</a></div>
      <div class="rail"><app-product-card *ngFor="let p of related" [product]="p"></app-product-card></div>
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  product: any = null;
  qty = 1;
  error = '';
  added = false;
  adding = false;
  related: any[] = [];
  tab: 'desc' | 'returns' | 'reco' = 'desc';
  MULT = MULT;

  constructor(private shop: ShopService, public auth: AuthService,
    private route: ActivatedRoute, private router: Router, private toast: ToastService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.shop.product(id).subscribe({
      next: (p: any) => {
        this.product = p;
        if (this.auth.isLoggedIn()) {
          this.shop.logView(this.auth.userId(), id).subscribe({ error: () => undefined });
          this.shop.recommendations(this.auth.userId(), 6).subscribe({
            next: (r: any) => (this.related = (r.items || []).filter((x: any) => (x.productId || x.id) !== id).slice(0, 6)),
            error: () => undefined
          });
        }
      },
      error: () => this.router.navigate(['/products'])
    });
  }

  inStock(): boolean {
    return this.product ? (this.product.stockQuantity ?? 1) > 0 : false;
  }
  stock(): number { return this.product?.stockQuantity || 99; }
  max(a: number, b: number): number { return Math.max(a, b); }
  min(a: number, b: number): number { return Math.min(a, b); }
  floor(n: number): number { return Math.floor(n || 0); }
  estLikeNew(): number { return Math.floor((this.product?.price || 0) * 0.8); }

  add(): void {
    this.error = ''; this.added = false; this.adding = true;
    const id = this.product.id || this.product._id;
    this.shop.cartAdd(this.auth.userId(), id, +this.qty || 1).subscribe({
      next: () => { this.added = true; this.adding = false; this.toast.ok('Added to cart'); },
      error: (e) => { this.error = e.error?.message || 'Could not add to cart'; this.adding = false; this.toast.err(this.error); }
    });
  }
}
