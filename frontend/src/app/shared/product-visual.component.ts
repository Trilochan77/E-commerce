import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

const CATEGORY_STYLE: Record<string, { label: string; short: string; hue: number }> = {
  'C-01': { label: 'Electronics', short: 'E', hue: 220 },
  'C-02': { label: 'Fashion', short: 'F', hue: 300 },
  'C-03': { label: 'Home & Kitchen', short: 'H', hue: 150 },
  'C-04': { label: 'Books', short: 'B', hue: 35 },
  'C-05': { label: 'Sports', short: 'S', hue: 130 }
};

/**
 * Product visual: shows the product photo when the admin attached one
 * (images[0] as URL or uploaded data-URL), otherwise falls back to a
 * category initial + type label on a tinted tile. No stock photos.
 */
@Component({
  selector: 'app-product-visual',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pvisual pvisual-photo" [ngClass]="size" *ngIf="photo(); else tile">
      <img [src]="photo()" [alt]="alt()">
    </div>
    <ng-template #tile>
      <div class="pvisual" [ngClass]="size" [style.background]="bg()" [style.border-color]="border()" [attr.aria-label]="label()">
        <span class="pv-letter" [style.color]="ink()">{{ short() }}</span>
        <span class="pv-type">{{ label() }}</span>
      </div>
    </ng-template>
  `
})
export class ProductVisualComponent {
  @Input() product: any = null;
  @Input() categoryId = '';
  @Input() categoryName = '';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' = 'md';

  /** First admin-attached photo (URL or uploaded data-URL), else null. */
  photo(): string | null {
    const cands = [
      this.product?.images?.[0],
      this.product?.image,
      this.product?.imageUrl
    ];
    for (const c of cands) {
      if (typeof c === 'string' && c.trim() &&
        (/^https?:\/\//i.test(c.trim()) || /^data:image\//i.test(c.trim()))) {
        return c.trim();
      }
    }
    return null;
  }

  alt(): string {
    return this.product?.name || this.label();
  }

  private catId(): string {
    return (this.product?.categoryId || this.product?.category || this.categoryId || '').toString().toUpperCase();
  }

  private known(): { label: string; short: string; hue: number } | null {
    const id = this.catId();
    if (CATEGORY_STYLE[id]) return CATEGORY_STYLE[id];
    const name = (this.product?.categoryName || this.product?.category || this.categoryName || '').toString().toLowerCase();
    for (const v of Object.values(CATEGORY_STYLE)) {
      if (name && v.label.toLowerCase() === name) return v;
    }
    return null;
  }

  short(): string {
    const k = this.known();
    if (k) return k.short;
    const n = (this.product?.name || this.categoryName || 'P').trim();
    return (n.charAt(0) || 'P').toUpperCase();
  }

  label(): string {
    const k = this.known();
    if (k) return k.label;
    return (this.product?.categoryName || this.product?.categoryId || this.categoryName || 'General').toString();
  }

  private hue(): number {
    const k = this.known();
    if (k) return k.hue;
    const s = this.catId() || this.label();
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return h;
  }

  bg(): string {
    return `linear-gradient(135deg, hsl(${this.hue()} 60% 92%), hsl(${this.hue()} 55% 82%))`;
  }

  border(): string {
    return `hsl(${this.hue()} 40% 70%)`;
  }

  ink(): string {
    return `hsl(${this.hue()} 60% 28%)`;
  }
}
