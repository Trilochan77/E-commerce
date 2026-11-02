import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Shop } from '../core/shop';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-admin-coupons',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head">
      <div>
        <h1 style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:24px;">🎟️</span> Coupon &amp; Rewards Management
        </h1>
        <p class="muted">Manage discount vouchers, promotional campaigns, and Spin &amp; Win customer rewards.</p>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn-primary btn-sm" (click)="toggleCreate()">
          {{ showCreate ? '✕ Cancel' : '+ Create Promo Code' }}
        </button>
        <button class="btn-ghost btn-sm" (click)="load()" [disabled]="loading">
          <span *ngIf="loading" class="spinner"></span> 🔄 Refresh
        </button>
      </div>
    </div>

    <div *ngIf="msg" class="notice-banner" style="background:rgba(34,197,94,0.1);border:1px solid #22c55e;color:#86efac;padding:10px 14px;border-radius:8px;margin-bottom:16px;">
      {{ msg }}
    </div>
    <div *ngIf="error" class="error-banner" style="background:rgba(239,68,68,0.1);border:1px solid #ef4444;color:#fca5a5;padding:10px 14px;border-radius:8px;margin-bottom:16px;">
      {{ error }}
    </div>

    <!-- Create Promo Coupon Form -->
    <div *ngIf="showCreate" class="card" style="border:1px solid var(--brand);margin-bottom:24px;padding:22px;border-radius:12px;background:var(--bg-card);">
      <h3 style="margin-top:0;display:flex;align-items:center;gap:8px;">
        <span>✨</span> Create New Promotional Coupon
      </h3>
      <p class="muted" style="margin-bottom:18px;">
        Create universal or targeted promo codes that shoppers can apply in their cart or at checkout.
      </p>

      <form (ngSubmit)="createCoupon()" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:16px;">
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;color:var(--fg-dim);">COUPON CODE *</label>
          <input type="text" [(ngModel)]="newCoupon.code" name="code" placeholder="e.g. FESTIVE50 or DIWALI2026" required
                 style="width:100%;padding:9px 12px;border-radius:8px;background:var(--bg-glass);border:1px solid var(--border);color:var(--fg);text-transform:uppercase;font-weight:700;letter-spacing:1px;" />
        </div>

        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;color:var(--fg-dim);">CAMPAIGN TITLE *</label>
          <input type="text" [(ngModel)]="newCoupon.title" name="title" placeholder="e.g. 50% Off Flash Sale" required
                 style="width:100%;padding:9px 12px;border-radius:8px;background:var(--bg-glass);border:1px solid var(--border);color:var(--fg);" />
        </div>

        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;color:var(--fg-dim);">DISCOUNT TYPE *</label>
          <select [(ngModel)]="newCoupon.type" name="type"
                  style="width:100%;padding:9px 12px;border-radius:8px;background:var(--bg-glass);border:1px solid var(--border);color:var(--fg);">
            <option value="PERCENT">Percentage Discount (%)</option>
            <option value="FLAT">Flat Rupee Amount (₹)</option>
          </select>
        </div>

        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;color:var(--fg-dim);">
            VALUE * ({{ newCoupon.type === 'PERCENT' ? '%' : '₹' }})
          </label>
          <input type="number" [(ngModel)]="newCoupon.value" name="value" min="1" max="100000" required
                 style="width:100%;padding:9px 12px;border-radius:8px;background:var(--bg-glass);border:1px solid var(--border);color:var(--fg);" />
        </div>

        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;color:var(--fg-dim);">MINIMUM ORDER VALUE (₹)</label>
          <input type="number" [(ngModel)]="newCoupon.minOrderValue" name="minOrderValue" min="0" placeholder="0 = no minimum"
                 style="width:100%;padding:9px 12px;border-radius:8px;background:var(--bg-glass);border:1px solid var(--border);color:var(--fg);" />
        </div>

        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;color:var(--fg-dim);">MAX DISCOUNT CAP (₹)</label>
          <input type="number" [(ngModel)]="newCoupon.maxDiscount" name="maxDiscount" min="0" placeholder="0 = no cap"
                 style="width:100%;padding:9px 12px;border-radius:8px;background:var(--bg-glass);border:1px solid var(--border);color:var(--fg);" />
        </div>

        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;color:var(--fg-dim);">VALIDITY (DAYS)</label>
          <input type="number" [(ngModel)]="validityDays" name="validityDays" min="1" max="365"
                 style="width:100%;padding:9px 12px;border-radius:8px;background:var(--bg-glass);border:1px solid var(--border);color:var(--fg);" />
        </div>

        <div style="grid-column: 1 / -1; display:flex; justify-content:flex-end; gap:10px; margin-top:8px;">
          <button type="button" class="btn-ghost btn-sm" (click)="toggleCreate()">Cancel</button>
          <button type="submit" class="btn-primary btn-sm" [disabled]="createLoading">
            <span *ngIf="createLoading" class="spinner"></span> Publish Coupon
          </button>
        </div>
      </form>
    </div>

    <!-- Filter chips -->
    <div style="display:flex;gap:8px;margin-bottom:18px;">
      <button class="btn-ghost btn-sm" [style.background]="sourceFilter === 'ALL' ? 'var(--brand)' : ''" (click)="sourceFilter = 'ALL'">
        All ({{ coupons.length }})
      </button>
      <button class="btn-ghost btn-sm" [style.background]="sourceFilter === 'PROMO' ? 'var(--brand)' : ''" (click)="sourceFilter = 'PROMO'">
        Promo Codes ({{ countSource('PROMO') }})
      </button>
      <button class="btn-ghost btn-sm" [style.background]="sourceFilter === 'SPIN' ? 'var(--brand)' : ''" (click)="sourceFilter = 'SPIN'">
        Spin &amp; Win Rewards ({{ countSource('SPIN') }})
      </button>
    </div>

    <div *ngIf="loading" class="muted" style="padding:40px;text-align:center;">
      <span class="spinner"></span> Loading coupon inventory...
    </div>

    <div *ngIf="!loading && filteredCoupons.length === 0" class="card" style="text-align:center;padding:48px 20px;">
      <div style="font-size:36px;margin-bottom:12px;">🎟️</div>
      <h3>No coupons in this category</h3>
      <p class="muted">Create a new promo code above to offer promotional discounts to your shoppers.</p>
    </div>

    <!-- Coupon cards grid -->
    <div *ngIf="!loading && filteredCoupons.length > 0" 
         style="display:grid;grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));gap:16px;">
      <div *ngFor="let c of filteredCoupons" class="card" 
           style="border-radius:12px;padding:20px;border:1px solid var(--border);background:var(--bg-card);display:flex;flex-direction:column;justify-content:space-between;gap:14px;position:relative;overflow:hidden;">
        
        <!-- Source badge indicator -->
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span class="badge" [ngClass]="c.source === 'SPIN' ? 'cyan' : 'violet'">
            {{ c.source === 'SPIN' ? '🎡 Spin & Win' : '🏷️ Promo' }}
          </span>
          <span class="badge" [ngClass]="c.status === 'ACTIVE' ? 'green' : 'warn'">
            {{ c.status || 'ACTIVE' }}
          </span>
        </div>

        <div>
          <!-- Coupon Code pill -->
          <div style="display:inline-flex;align-items:center;background:rgba(217,70,239,0.12);border:1px dashed var(--brand-3);color:#f472b6;padding:6px 12px;border-radius:8px;font-family:monospace;font-weight:800;font-size:16px;letter-spacing:1.5px;margin-bottom:10px;">
            {{ c.code }}
          </div>
          <h4 style="margin:0 0 6px 0;font-size:16px;">{{ c.title }}</h4>
          <p class="muted" style="font-size:13px;line-height:1.5;margin:0 0 10px 0;">
            {{ c.description || (c.type === 'PERCENT' ? (c.value + '% off storewide') : ('₹' + c.value + ' flat discount')) }}
          </p>

          <div style="display:flex;flex-wrap:wrap;gap:8px;font-size:12px;" class="muted">
            <span *ngIf="c.minOrderValue > 0">Min order: ₹{{ c.minOrderValue }}</span>
            <span *ngIf="c.maxDiscount > 0">Max cap: ₹{{ c.maxDiscount }}</span>
            <span *ngIf="c.usedCount !== undefined">Redemptions: {{ c.usedCount }}</span>
          </div>
        </div>

        <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;display:flex;justify-content:space-between;align-items:center;">
          <div class="muted" style="font-size:11.5px;">
            Expires: {{ c.validUntil ? (c.validUntil | date:'mediumDate') : 'Never' }}
          </div>
          <button class="btn-ghost btn-sm" style="color:#ef4444;font-size:12px;" 
                  (click)="deleteCoupon(c.id, c.code)">
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  `
})
export class AdminCoupons implements OnInit {
  coupons: any[] = [];
  loading = true;
  createLoading = false;
  showCreate = false;
  sourceFilter = 'ALL';
  validityDays = 30;
  msg = '';
  error = '';

  newCoupon: any = {
    code: '',
    title: '',
    type: 'PERCENT',
    value: 15,
    minOrderValue: 499,
    maxDiscount: 500
  };

  constructor(private shop: Shop) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.msg = '';
    this.shop.adminCoupons().subscribe({
      next: (res: any) => {
        this.coupons = Array.isArray(res) ? res : [];
        this.loading = false;
      },
      error: (e) => {
        this.error = e.error?.message || 'Could not load coupons';
        this.loading = false;
      }
    });
  }

  get filteredCoupons(): any[] {
    if (this.sourceFilter === 'ALL') return this.coupons;
    return this.coupons.filter(c => c.source === this.sourceFilter);
  }

  countSource(src: string): number {
    return this.coupons.filter(c => c.source === src).length;
  }

  toggleCreate(): void {
    this.showCreate = !this.showCreate;
  }

  createCoupon(): void {
    if (!this.newCoupon.code.trim() || !this.newCoupon.title.trim()) {
      this.error = 'Please provide both coupon code and campaign title';
      return;
    }
    this.createLoading = true;
    this.error = '';
    this.msg = '';

    const payload = {
      ...this.newCoupon,
      code: this.newCoupon.code.trim().toUpperCase(),
      validUntil: new Date(Date.now() + this.validityDays * 86400000).toISOString()
    };

    this.shop.adminCouponCreate(payload).subscribe({
      next: (res: any) => {
        this.coupons.unshift(res);
        this.msg = `Coupon ${res.code} created and live!`;
        this.showCreate = false;
        this.createLoading = false;
        this.newCoupon = {
          code: '',
          title: '',
          type: 'PERCENT',
          value: 15,
          minOrderValue: 499,
          maxDiscount: 500
        };
      },
      error: (e) => {
        this.error = e.error?.message || 'Failed to create coupon';
        this.createLoading = false;
      }
    });
  }

  deleteCoupon(id: string, code: string): void {
    if (!confirm(`Are you sure you want to delete coupon ${code}?`)) return;
    this.shop.adminCouponDelete(id).subscribe({
      next: () => {
        this.coupons = this.coupons.filter(c => c.id !== id);
        this.msg = `Coupon ${code} removed`;
      },
      error: (e) => {
        this.error = e.error?.message || 'Failed to delete coupon';
      }
    });
  }
}

