import { Component, ChangeDetectionStrategy, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

const CATEGORY_STYLE: Record<string, { label: string; short: string; hue: number }> = {
  'C-01': { label: 'Electronics', short: '⚡', hue: 220 },
  'C-02': { label: 'Fashion', short: '✨', hue: 300 },
  'C-03': { label: 'Home & Kitchen', short: '🏠', hue: 150 },
  'C-04': { label: 'Books', short: '📖', hue: 35 },
  'C-05': { label: 'Sports', short: '🏆', hue: 130 }
};

/**
 * Product visual: shows the product photo when available.
 * If image fails or is missing, gracefully falls back to a sleek dark-mode
 * neon-tinted tile with category monogram so there are never any broken images.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-product-visual',
  imports: [CommonModule],
  template: `
    <div class="pvisual pvisual-photo" [ngClass]="size" *ngIf="photo() && !imgFailed; else tile">
      <img [src]="photo()" [alt]="alt()" (error)="onImgError()" loading="lazy">
    </div>
    <ng-template #tile>
      <div class="pvisual tile-fallback" [ngClass]="size" [style.background]="bg()" [style.border-color]="border()" [attr.aria-label]="label()">
        <span class="pv-letter" [style.color]="ink()">{{ short() }}</span>
        <span class="pv-type" [style.color]="ink()">{{ label() }}</span>
      </div>
    </ng-template>
  `,
  styles: [`
    .tile-fallback {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      backdrop-filter: blur(10px);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    .tile-fallback .pv-letter {
      font-weight: 800;
      line-height: 1;
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4));
    }
    .tile-fallback .pv-type {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0.9;
    }
  `]
})
export class ProductVisual implements OnChanges {
  @Input() product: any = null;
  @Input() categoryId = '';
  @Input() categoryName = '';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' = 'md';

  imgFailed = false;

  ngOnChanges(): void {
    this.imgFailed = false;
  }

  onImgError(): void {
    this.imgFailed = true;
  }

  /** First photo (URL or data-URL), else null. */
  photo(): string | null {
    if (this.imgFailed) return null;
    const cands = [
      this.product?.image,
      this.product?.images?.[0],
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
    return (this.product?.categoryName || this.product?.categoryId || this.categoryName || 'Flagship').toString();
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
    return `radial-gradient(circle at 35% 30%, hsl(${this.hue()} 45% 18%), hsl(${this.hue()} 40% 8%))`;
  }

  border(): string {
    return `hsl(${this.hue()} 45% 26%)`;
  }

  ink(): string {
    return `hsl(${this.hue()} 80% 75%)`;
  }
}
