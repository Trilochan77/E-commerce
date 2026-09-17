import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ShopService } from '../core/shop.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-return-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h2>Return Request</h2>
      <p class="muted">Order {{ orderId }} · Product {{ productId }}</p>
      <div class="form-grid">
        <label>Reason
          <input [(ngModel)]="reason" name="reason" placeholder="Why are you returning?">
        </label>
        <label>Claimed condition
          <select [(ngModel)]="condition" name="condition" (change)="preview()">
            <option value="LIKE_NEW">Like new</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
            <option value="POOR">Poor</option>
          </select>
        </label>
        <button class="primary" (click)="preview()">Preview Estimated Reward</button>
      </div>
      <p *ngIf="est != null" class="success">Estimated reward: <strong>{{ est }}</strong> pts</p>
      <p class="muted" *ngIf="est != null">Estimated only — final reward depends on verified condition after inspection.</p>
      <button class="primary" (click)="submit()">Confirm Return</button>
      <p class="error" *ngIf="error">{{ error }}</p>
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

  constructor(private shop: ShopService, private auth: AuthService,
    private route: ActivatedRoute, private router: Router) {}

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
      next: (r: any) => this.est = r.estimatedReward,
      error: () => this.est = null
    });
  }

  submit(): void {
    this.error = '';
    this.shop.submitReturn({
      userId: this.auth.userId(), orderId: this.orderId, productId: this.productId,
      quantity: 1, reason: this.reason, claimedCondition: this.condition
    }).subscribe({
      next: () => this.router.navigate(['/returns']),
      error: (e) => this.error = e.error?.message || 'Return request failed'
    });
  }
}
