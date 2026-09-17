import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ShopService } from '../core/shop.service';
import { AuthService } from '../core/auth.service';
import { ProductCardComponent } from '../shared/product-card.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProductCardComponent],
  template: `
    <div class="card" *ngIf="product">
      <h2>{{ product.name }}</h2>
      <img [src]="img()" [alt]="product.name" style="max-width:320px;border-radius:8px;">
      <p>{{ product.description }}</p>
      <p class="price">₹{{ product.price }}</p>
      <p>Stock: {{ product.stockQuantity }} <span class="badge" [ngClass]="product.availability ? 'ok' : 'bad'">{{ product.availability ? 'In stock' : 'Out of stock' }}</span></p>
      <p class="muted" *ngIf="product.eligibleForReturn">Eligible for return rewards</p>
      <div class="row" *ngIf="auth.isLoggedIn()">
        <input [(ngModel)]="qty" name="qty" type="number" min="1" style="width:70px">
        <button class="primary" (click)="add()">Add to Cart</button>
      </div>
      <p *ngIf="!auth.isLoggedIn()"><a routerLink="/login">Login</a> to buy.</p>
      <p class="error" *ngIf="error">{{ error }}</p>
      <p class="success" *ngIf="added">Added to cart.</p>
    </div>
    <div class="card" *ngIf="related.length">
      <h3>Based on Your Activity</h3>
      <div class="grid">
        <app-product-card *ngFor="let p of related" [product]="p"></app-product-card>
      </div>
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  product: any = null;
  qty = 1;
  error = '';
  added = false;
  related: any[] = [];

  constructor(private shop: ShopService, public auth: AuthService,
    private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.shop.product(id).subscribe({
      next: (p: any) => {
        this.product = p;
        if (this.auth.isLoggedIn()) {
          this.shop.logView(this.auth.userId(), id).subscribe({ error: () => undefined });
          this.shop.recommendations(this.auth.userId(), 4).subscribe({
            next: (r: any) => this.related = (r.items || []).filter((x: any) =>
              (x.productId || x.id) !== id).slice(0, 4),
            error: () => this.related = []
          });
        }
      },
      error: () => this.router.navigate(['/products'])
    });
  }

  img(): string {
    if (this.product?.images?.length) return this.product.images[0];
    return 'https://picsum.photos/seed/' + (this.product?.id || 'x') + '/600/400';
  }

  add(): void {
    this.error = '';
    this.added = false;
    const id = this.product.id || this.product._id;
    this.shop.cartAdd(this.auth.userId(), id, +this.qty || 1).subscribe({
      next: () => this.added = true,
      error: (e) => this.error = e.error?.message || 'Could not add to cart'
    });
  }
}
