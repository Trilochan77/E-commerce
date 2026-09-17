import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopService } from '../core/shop.service';
import { ToastService } from '../shared/toast.service';

const FLOW = ['REQUESTED', 'APPROVED', 'PRODUCT_RECEIVED', 'UNDER_INSPECTION', 'APPROVED_FOR_REWARD', 'COMPLETED'];

@Component({
  selector: 'app-admin-returns',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head">
      <div><h1>Returns</h1><p>{{ pending() }} pending · inspect condition, then evaluate & credit.</p></div>
      <div class="row" style="margin:0">
        <select [(ngModel)]="filter" (change)="load()" style="max-width:200px">
          <option value="">All statuses</option><option>REQUESTED</option><option>APPROVED</option><option>PRODUCT_RECEIVED</option>
          <option>UNDER_INSPECTION</option><option>APPROVED_FOR_REWARD</option><option>REJECTED</option><option>COMPLETED</option>
        </select>
        <button class="btn-ghost btn-sm" (click)="load()">Refresh</button>
      </div>
    </div>
    <p class="error" *ngIf="error">{{ error }}</p>
    <div class="card tight" *ngFor="let r of returns">
      <div class="row" style="justify-content:space-between">
        <div class="row" style="margin:0"><strong>{{ r.id || r._id }}</strong><span class="badge info">{{ label(r.status) }}</span></div>
        <span class="badge violet">Est {{ r.estimatedReward ?? '—' }} → Final {{ r.finalReward ?? '—' }}</span>
      </div>
      <p class="muted">User {{ r.userId }} · Order {{ r.orderId }} · Product {{ r.productId }} × {{ r.quantity }} · Claimed <strong>{{ r.claimedCondition }}</strong> · Verified {{ r.verifiedCondition || '—' }}</p>
      <p class="muted" *ngIf="r.reason">Reason: {{ r.reason }}</p>
      <div class="timeline">
        <span class="t" *ngFor="let s of flow" [ngClass]="s === r.status ? 'now' : ''">{{ label(s) }}</span>
        <span class="t bad" *ngIf="r.status === 'REJECTED'">REJECTED</span>
      </div>
      <div class="row">
        <button class="btn-ghost btn-sm" (click)="advance(r, 'APPROVED')">Approve pickup</button>
        <button class="btn-ghost btn-sm" (click)="advance(r, 'PRODUCT_RECEIVED')">Mark received</button>
        <button class="btn-ghost btn-sm" (click)="advance(r, 'UNDER_INSPECTION')">Start inspection</button>
        <button class="btn-ghost btn-sm" (click)="advance(r, 'COMPLETED')">Complete</button>
        <button class="danger btn-sm" (click)="advance(r, 'REJECTED')">Reject</button>
      </div>
      <div class="row eval-box">
        <select [(ngModel)]="r._evalCond" style="max-width:170px">
          <option>LIKE_NEW</option><option>GOOD</option><option>FAIR</option><option>POOR</option><option>NOT_ELIGIBLE</option>
        </select>
        <input [(ngModel)]="r._evalNote" placeholder="Inspection note" style="flex:1;min-width:200px">
        <button class="primary btn-sm" (click)="evaluate(r)">Evaluate & credit</button>
      </div>
      <p class="muted">Multipliers: LIKE_NEW 80% · GOOD 60% · FAIR 40% · POOR 10% · NOT_ELIGIBLE 0%</p>
    </div>
    <p class="muted" *ngIf="!returns.length && !loading">No returns for this filter.</p>
    <p class="muted" *ngIf="loading"><span class="spinner"></span> Loading…</p>
  `
})
export class AdminReturnsComponent implements OnInit {
  returns: any[] = [];
  filter = '';
  error = '';
  loading = true;
  flow = FLOW;

  constructor(private shop: ShopService, private toast: ToastService) {}

  ngOnInit(): void { this.load(); }

  label(s: string): string { return (s || '').replaceAll('_', ' '); }

  pending(): number {
    return this.returns.filter((r: any) => !['COMPLETED', 'REJECTED'].includes(r.status)).length;
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.shop.allReturns(this.filter).subscribe({
      next: (r: any) => {
        this.returns = (Array.isArray(r) ? r : []).map((x: any) => ({ ...x, _evalCond: 'GOOD', _evalNote: '' }));
        this.loading = false;
      },
      error: (e) => { this.error = e.error?.message || 'Failed to load returns'; this.loading = false; }
    });
  }

  advance(r: any, status: string): void {
    this.shop.returnStatus(r.id || r._id, status).subscribe({
      next: (u: any) => { r.status = u.status || status; this.toast.ok('Return → ' + this.label(r.status)); },
      error: (e) => this.toast.err(e.error?.message || 'Transition rejected')
    });
  }

  evaluate(r: any): void {
    this.shop.evaluate(r.id || r._id, r._evalCond, r._evalNote).subscribe({
      next: (u: any) => {
        r.status = u.status || r.status;
        r.finalReward = u.finalReward;
        r.verifiedCondition = u.verifiedCondition;
        this.toast.ok('Credited ' + (u.finalReward || 0) + ' pts');
      },
      error: (e) => this.toast.err(e.error?.message || 'Evaluation failed')
    });
  }
}
