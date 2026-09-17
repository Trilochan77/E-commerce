import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShopService } from '../core/shop.service';
import { AuthService } from '../core/auth.service';
import { EmptyStateComponent } from '../shared/empty-state.component';

const FLOW = ['REQUESTED', 'APPROVED', 'PRODUCT_RECEIVED', 'UNDER_INSPECTION', 'APPROVED_FOR_REWARD', 'COMPLETED'];

@Component({
  selector: 'app-return-status',
  standalone: true,
  imports: [CommonModule, RouterModule, EmptyStateComponent],
  template: `
    <div class="breadcrumb"><a routerLink="/">Home</a> / Returns</div>
    <div class="page-head"><div><h1 style="font-size:28px">Returns & Rewards</h1><p>Estimated upfront → verified after inspection → wallet credited.</p></div>
      <a routerLink="/orders"><button class="btn-ghost btn-sm">+ New return from orders</button></a></div>
    <div class="stack" *ngIf="returns.length; else none">
      <div class="card" style="margin:0" *ngFor="let r of returns">
        <div class="row" style="justify-content:space-between">
          <div class="row"><strong>{{ r.id || r._id }}</strong>
            <span class="badge" [ngClass]="r.status === 'REJECTED' ? 'bad' : (r.status === 'COMPLETED' || r.status === 'APPROVED_FOR_REWARD' ? 'ok' : 'info')">{{ r.status.replaceAll('_',' ') }}</span>
          </div>
          <span class="muted">{{ r.createdAt }}</span>
        </div>
        <p class="muted">Order {{ r.orderId }} · Product <a [routerLink]="['/products', r.productId]">{{ r.productId }}</a> · Claimed {{ r.claimedCondition }}</p>
        <div class="timeline">
          <span *ngFor="let s of flow" class="t" [ngClass]="stepClass(r.status, s)">{{ s === r.status ? '● ' : s === 'REJECTED' ? '' : '○ ' }}{{ s.replaceAll('_',' ') }}</span>
          <span *ngIf="r.status==='REJECTED'" class="t bad">● REJECTED</span>
        </div>
        <div class="reward-compare">
          <div class="reward-box"><div class="muted">Estimated (claimed {{ r.claimedCondition }})</div><div style="font-size:22px;font-weight:800">{{ r.estimatedReward }} pts</div></div>
          <div class="reward-box final"><div class="muted">Final {{ r.verifiedCondition ? '(verified '+r.verifiedCondition+')' : '· pending inspection' }}</div><div style="font-size:22px;font-weight:800">{{ r.finalReward != null ? r.finalReward + ' pts' : '—' }}</div></div>
        </div>
        <p class="muted" *ngIf="r.adminNote">📝 Inspector: {{ r.adminNote }}</p>
      </div>
    </div>
    <ng-template #none><app-empty-state icon="" title="No returns yet" hint="Delivered items can be returned for wallet points." ctaLink="/orders" ctaLabel="Go to orders"></app-empty-state></ng-template>
  `
})
export class ReturnStatusComponent implements OnInit {
  returns: any[] = [];
  flow = FLOW;

  constructor(private shop: ShopService, private auth: AuthService) {}

  ngOnInit(): void {
    this.shop.myReturns(this.auth.userId()).subscribe((r: any) => (this.returns = Array.isArray(r) ? r : []));
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
