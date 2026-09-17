import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="product">
      <img [src]="img()" [alt]="product?.name">
      <h4><a [routerLink]="['/products', id()]">{{ product?.name }}</a></h4>
      <div class="price">₹{{ price() }}</div>
      <div class="muted">{{ product?.category }}</div>
    </div>
  `
})
export class ProductCardComponent {
  @Input() product: any;

  id(): string {
    return this.product?.productId || this.product?.id || '';
  }

  price(): number {
    return this.product?.price || 0;
  }

  img(): string {
    if (this.product?.image) return this.product.image;
    if (this.product?.images && this.product.images.length) return this.product.images[0];
    return 'https://picsum.photos/seed/' + this.id() + '/400/300';
  }
}
