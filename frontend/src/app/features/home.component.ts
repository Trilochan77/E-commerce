import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShopService } from '../core/shop.service';
import { AuthService } from '../core/auth.service';
import { ProductCardComponent } from '../shared/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  template: `
    <div class="card" *ngIf="auth.isLoggedIn() && recommendations.length">
      <h2>Recommended for You</h2>
      <p class="muted" *ngIf="strategy">Strategy: {{ strategy }}</p>
      <div class="grid">
        <app-product-card *ngFor="let p of recommendations" [product]="p"></app-product-card>
      </div>
    </div>
    <div class="card">
      <h2>Shop by Category</h2>
      <div class="row">
        <button *ngFor="let c of categories" [routerLink]="['/products']" [queryParams]="{category: c.id || c._id}">{{ c.name }}</button>
      </div>
    </div>
    <div class="card">
      <h2>All Products</h2>
      <div class="grid">
        <app-product-card *ngFor="let p of products" [product]="p"></app-product-card>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  recommendations: any[] = [];
  strategy = '';

  constructor(private shop: ShopService, public auth: AuthService) {}

  ngOnInit(): void {
    this.shop.products().subscribe((r: any) => this.products = Array.isArray(r) ? r : []);
    this.shop.categories().subscribe((r: any) => this.categories = Array.isArray(r) ? r : []);
    if (this.auth.isLoggedIn()) {
      this.shop.recommendations(this.auth.userId(), 8).subscribe({
        next: (r: any) => {
          this.recommendations = r.items || [];
          this.strategy = r.strategy || '';
        },
        error: () => this.recommendations = []
      });
    }
  }
}
