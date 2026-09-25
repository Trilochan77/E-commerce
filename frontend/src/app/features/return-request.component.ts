import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ShopService } from '../core/shop.service';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../shared/toast.service';

const INFO: Record<string, { pct: number; tip: string }> = {
  LIKE_NEW: { pct: 80, tip: 'Unused · tags & box intact' },
  GOOD: { pct: 60, tip: 'Light use · fully functional' },
  FAIR: { pct: 40, tip: 'Visible wear · functional' },
  POOR: { pct: 10, tip: 'Heavy wear · partial function' }
};

@Component({
  selector: 'app-return-request',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="breadcrumb"><a routerLink="/orders">Orders</a> / Return request</div>
    <div class="cart-layout">
      <div class="card" style="margin:0">
        <h2> Request a Return</h2>
        <p class="muted">Order <strong>{{ orderId }}</strong> · Product <strong>{{ productId }}</strong> · platform purchase only</p>
        <p class="muted" *ngIf="track==='FULL_REFUND'">Within <strong>14-day full-refund window</strong> — money back to source after inspection (condition gates pass/fail).</p>
        <p class="muted" *ngIf="track==='REWARD_POINTS'">Past 14 days — <strong>reward points only</strong> (no money back), up to 90 days.</p>
        <label>Reason for return
          <textarea [(ngModel)]="reason" name="reason" rows="3" placeholder="e.g. Size didn’t fit, changed mind, minor defect…"></textarea>
        </label>
        <div class="field-err" *ngIf="submitted && !reason.trim()">Please tell us why (helps inspection).</div>
        <h3 style="margin-top:12px">How would you rate its condition?</h3>
        <div class="pay-grid">
          <div class="pay-card" *ngFor="let c of conds" [class.on]="condition===c" (click)="condition=c; preview()">
            <strong>{{ c.replace('_',' ') }}</strong><span class="muted">{{ INFO[c].tip }}</span>
            <span class="badge violet" style="margin-top:6px" *ngIf="track==='REWARD_POINTS'">{{ INFO[c].pct }}% pts</span>
            <span class="badge ok" style="margin-top:6px" *ngIf="track==='FULL_REFUND'">Full refund</span>
          </div>
        </div>
      </div>
      <aside class="card summary" *ngIf="track==='FULL_REFUND'">
        <h3>Full Refund</h3>
        <div style="font-size:36px;font-weight:800;color:#15803d">₹{{ refund != null ? (refund | number) : '—' }}</div>
        <p class="muted">100% money back after warehouse inspection · NOT_ELIGIBLE = rejected, ₹0</p>
        <button class="primary" style="width:100%" (click)="submit()" [disabled]="busy">{{ busy ? 'Submitting…' : 'Confirm Return →' }}</button>
        <p class="error" *ngIf="error">{{ error }}</p>
        <p class="muted" style="text-align:center">No pickup needed in demo · admin evaluates next</p>
      </aside>
      <aside class="card summary" *ngIf="track!=='FULL_REFUND'">
        <h3>Estimated Reward</h3>
        <div style="font-size:36px;font-weight:800;color:#15803d">{{ est != null ? est : '—' }} <span style="font-size:14px">pts</span></div>
        <p class="muted">≈ ₹{{ est || 0 }} off a future order · final depends on warehouse inspection</p>
        <div class="progress"><div [style.width.%]="INFO[condition].pct"></div></div>
        <p class="muted">{{ INFO[condition].tip }} · {{ INFO[condition].pct }}% of price</p>
        <button class="primary" style="width:100%" (click)="submit()" [disabled]="busy">{{ busy ? 'Submitting…' : 'Confirm Return →' }}</button>
        <p class="error" *ngIf="error">{{ error }}</p>
        <p class="muted" style="text-align:center">No pickup needed in demo · admin evaluates next</p>
      </aside>
    </div>
  `
})
export class ReturnRequestComponent implements OnInit {
  orderId = '';
  productId = '';
  reason = '';
  condition = 'LIKE_NEW';
  est: number | null = null;
  refund: number | null = null;
  track: 'FULL_REFUND' | 'REWARD_POINTS' = 'FULL_REFUND';
  error = '';
  busy = false;
  submitted = false;
  conds = ['LIKE_NEW', 'GOOD', 'FAIR', 'POOR'];
  INFO = INFO;

  constructor(private shop: ShopService, private auth: AuthService,
    private route: ActivatedRoute, private router: Router, private toast: ToastService) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((p: any) => {
      this.orderId = p['orderId'] || '';
      this.productId = p['productId'] || '';
    });
    this.resolveTrack();
    this.preview();
  }

  private orderAgeDays(orderDate: any): number {
    if (!orderDate) return 0;
    const t = new Date(orderDate).getTime();
    if (isNaN(t)) return 0;
    return Math.floor((Date.now() - t) / 86400000);
  }

  resolveTrack(): void {
    this.shop.orderHistory(this.auth.userId()).subscribe({
      next: (orders: any) => {
        const o = (Array.isArray(orders) ? orders : []).find((x: any) => (x.id || x._id) === this.orderId);
        this.track = this.orderAgeDays(o?.orderDate) <= 14 ? 'FULL_REFUND' : 'REWARD_POINTS';
        this.preview();
      },
      error: () => { this.track = 'FULL_REFUND'; }
    });
  }

  preview(): void {
    if (!this.productId) return;
    this.shop.estimate(this.productId, this.condition, this.orderId).subscribe({
      next: (r: any) => {
        this.track = r.returnType === 'REWARD_POINTS' ? 'REWARD_POINTS' : (r.returnType === 'FULL_REFUND' ? 'FULL_REFUND' : this.track);
        this.est = r.estimatedReward ?? null;
        this.refund = r.estimatedRefund ?? null;
      },
      error: () => { this.est = null; this.refund = null; }
    });
  }

  submit(): void {
    this.submitted = true;
    this.error = '';
    if (!this.reason.trim()) { this.error = 'Add a short reason to continue.'; return; }
    this.busy = true;
    this.shop.submitReturn({
      userId: this.auth.userId(), orderId: this.orderId, productId: this.productId,
      quantity: 1, reason: this.reason, claimedCondition: this.condition
    }).subscribe({
      next: (r: any) => {
        const t = r?.returnType === 'REWARD_POINTS' ? 'REWARD_POINTS' : 'FULL_REFUND';
        this.toast.ok(t === 'FULL_REFUND' ? 'Return requested — full refund ₹' + (r?.estimatedRefund ?? this.refund ?? 0) : 'Return requested — est. ' + (r?.estimatedReward ?? this.est ?? 0) + ' pts');
        this.router.navigate(['/returns']);
      },
      error: (e) => { this.error = e.error?.message || 'Return request failed'; this.busy = false; }
    });
  }
}
