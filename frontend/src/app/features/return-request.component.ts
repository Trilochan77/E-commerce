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
        <h2>↩️ Request a Return</h2>
        <p class="muted">Order <strong>{{ orderId }}</strong> · Product <strong>{{ productId }}</strong> · within 14-day window · platform purchase only</p>
        <label>Reason for return
          <textarea [(ngModel)]="reason" name="reason" rows="3" placeholder="e.g. Size didn’t fit, changed mind, minor defect…"></textarea>
        </label>
        <div class="field-err" *ngIf="submitted && !reason.trim()">Please tell us why (helps inspection).</div>
        <h3 style="margin-top:12px">How would you rate its condition?</h3>
        <div class="pay-grid">
          <div class="pay-card" *ngFor="let c of conds" [class.on]="condition===c" (click)="condition=c; preview()">
            <strong>{{ c.replace('_',' ') }}</strong><span class="muted">{{ INFO[c].tip }}</span>
            <span class="badge violet" style="margin-top:6px">{{ INFO[c].pct }}% back</span>
          </div>
        </div>
      </div>
      <aside class="card summary">
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
    this.preview();
  }

  preview(): void {
    if (!this.productId) return;
    this.shop.estimate(this.productId, this.condition).subscribe({
      next: (r: any) => (this.est = r.estimatedReward),
      error: () => (this.est = null)
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
      next: () => { this.toast.ok('Return requested — est. ' + (this.est || 0) + ' pts'); this.router.navigate(['/returns']); },
      error: (e) => { this.error = e.error?.message || 'Return request failed'; this.busy = false; }
    });
  }
}
