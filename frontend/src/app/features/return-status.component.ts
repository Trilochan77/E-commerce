import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopService } from '../core/shop.service';
import { AuthService } from '../core/auth.service';

const FLOW = ['REQUESTED', 'APPROVED', 'PRODUCT_RECEIVED', 'UNDER_INSPECTION', 'APPROVED_FOR_REWARD', 'COMPLETED'];

@Component({
  selector: 'app-return-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h2>Return Status</h2>
      <div class="card" *ngFor="let r of returns">
        <div class="row">
          <strong>{{ r.id || r._id }}</strong>
          <span class="badge" [ngClass]="r.status === 'REJECTED' ? 'bad' : (r.status === 'COMPLETED' || r.status === 'APPROVED_FOR_REWARD' ? 'ok' : 'info')">{{ r.status }}</span>
        </div>
        <p class="muted">Order {{ r.orderId }} · Product {{ r.productId }} · Claimed {{ r.claimedCondition }}</p>
        <div class="steps">
          <span *ngFor="let s of flow" class="step" [ngClass]="stepClass(r.status, s)">{{ s }}</span>
        </div>
        <p>Estimated: <strong>{{ r.estimatedReward }}</strong> pts
          <span *ngIf="r.finalReward != null"> · Final: <strong>{{ r.finalReward }}</strong> pts (verified {{ r.verifiedCondition }})</span>
        </p>
      </div>
      <p class="muted" *ngIf="!returns.length">No return requests.</p>
    </div>
  `
})
export class ReturnStatusComponent implements OnInit {
  returns: any[] = [];
  flow = FLOW;

  constructor(private shop: ShopService, private auth: AuthService) {}

  ngOnInit(): void {
    this.shop.myReturns(this.auth.userId()).subscribe((r: any) => this.returns = Array.isArray(r) ? r : []);
  }

  stepClass(current: string, step: string): string {
    if (current === 'REJECTED') return step === 'REQUESTED' ? 'done' : '';
    const ci = FLOW.indexOf(current);
    const si = FLOW.indexOf(step);
    if (si < ci) return 'done';
    if (si === ci) return 'now';
    return '';
  }
}
