import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ShopService } from '../core/shop.service';
import { ProductCardComponent } from '../shared/product-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  template: `
    <div class="card">
      <h2>Products</h2>
      <div class="row">
        <input [(ngModel)]="q" name="q" placeholder="Search products..." (keyup.enter)="load()">
        <select [(ngModel)]="category" name="category" (change)="load()">
          <option value="">All categories</option>
          <option *ngFor="let c of categories" [value]="c.id || c._id">{{ c.name }}</option>
        </select>
        <select [(ngModel)]="sort" name="sort" (change)="load()">
          <option value="">Relevance</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
        <button class="primary" (click)="load()">Search</button>
      </div>
      <p class="muted" *ngIf="source">Source: {{ source }} · {{ total }} results</p>
    </div>
    <div class="grid">
      <app-product-card *ngFor="let p of items" [product]="p"></app-product-card>
    </div>
    <p class="muted" *ngIf="!items.length">No products found.</p>
  `
})
export class ProductListComponent implements OnInit {
  q = '';
  category = '';
  sort = '';
  items: any[] = [];
  categories: any[] = [];
  total = 0;
  source = '';

  constructor(private shop: ShopService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.shop.categories().subscribe((r: any) => this.categories = Array.isArray(r) ? r : []);
    this.route.queryParams.subscribe((p: any) => {
      this.category = p['category'] || '';
      this.load();
    });
  }

  load(): void {
    if (this.q.trim()) {
      this.shop.search(this.q, this.category, this.sort).subscribe((r: any) => {
        this.items = r.items || [];
        this.total = r.total || 0;
        this.source = r.source || '';
      });
    } else {
      this.shop.products(this.category).subscribe((r: any) => {
        let list: any[] = Array.isArray(r) ? r : [];
        if (this.sort === 'price_asc') list = [...list].sort((a, b) => a.price - b.price);
        if (this.sort === 'price_desc') list = [...list].sort((a, b) => b.price - a.price);
        this.items = list;
        this.total = list.length;
        this.source = 'catalog';
      });
    }
  }
}
