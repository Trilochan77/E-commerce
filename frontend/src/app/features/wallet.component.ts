import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShopService } from '../core/shop.service';
import { AuthService } from '../core/auth.service';
import { EmptyStateComponent } from '../shared/empty-state.component';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, RouterModule, EmptyStateComponent],
  template: `
    <div class="breadcrumb"><a routerLink="/">Home</a> / Wallet</div>
    <div class="wallet-hero">
      <div><div class="muted" style="color:#c7d2fe;font-weight:700;letter-spacing:.06em">REWARD WALLET · 1 PT = ₹1</div>
        <div class="bal">{{ balance | number }} <span style="font-size:16px">pts</span></div>
        <div style="color:#e0e7ff">≈ ₹{{ balance | number }} off future orders (up to 20% per order)</div>
      </div>
      <div style="display:grid;gap:8px;align-content:center">
        <a routerLink="/products"><button class="primary" style="background:#fff;color:#4f46e5;box-shadow:none">Shop & redeem →</button></a>
        <a routerLink="/returns" style="color:#fff;text-align:center">Track returns</a>
      </div>
    </div>
    <div class="wallet-stats">
      <div class="stat-card"><div class="k">Total earned</div><div class="v" style="color:#15803d">+{{ earned() }}</div><div class="bar"><div [style.width.%]="earnedPct()"></div></div></div>
      <div class="stat-card"><div class="k">Total spent</div><div class="v">−{{ spent() }}</div><div class="bar"><div [style.width.%]="spentPct()"></div></div></div>
      <div class="stat-card"><div class="k">Transactions</div><div class="v">{{ txs.length }}</div><div class="muted">EARNED on approval · USED at checkout</div></div>
    </div>
    <div class="card">
      <div class="section-title"><h2>Transaction History</h2><span class="badge info">{{ txs.length }} records</span></div>
      <div class="table-wrap" *ngIf="txs.length; else emptyTx"><table>
        <tr><th>Date</th><th>Type</th><th>Points</th><th>Order</th><th>Return</th></tr>
        <tr *ngFor="let t of txs">
          <td class="muted">{{ t.createdAt }}</td>
          <td><span class="badge" [ngClass]="t.type === 'EARNED' ? 'ok' : 'warn'">{{ t.type === 'EARNED' ? '↩ EARNED' : '🛒 USED' }}</span></td>
          <td><strong [style.color]="t.type==='EARNED' ? '#15803d' : '#92400e'">{{ t.type==='EARNED' ? '+' : '−' }}{{ t.points }}</strong></td>
          <td>{{ t.relatedOrderId || '—' }}</td><td>{{ t.relatedReturnId || '—' }}</td>
        </tr>
      </table></div>
      <ng-template #emptyTx><app-empty-state icon="⭐" title="No points yet" hint="Return an eligible item to earn your first points." ctaLink="/orders" ctaLabel="View orders"></app-empty-state></ng-template>
    </div>
  `
})
export class WalletComponent implements OnInit {
  balance = 0;
  txs: any[] = [];

  constructor(private shop: ShopService, private auth: AuthService) {}

  ngOnInit(): void {
    this.shop.wallet(this.auth.userId()).subscribe((w: any) => (this.balance = w.balance ?? w.pointBalance ?? 0));
    this.shop.transactions(this.auth.userId()).subscribe((t: any) => (this.txs = Array.isArray(t) ? t : []));
  }
  earned(): number { return this.txs.filter((t) => t.type === 'EARNED').reduce((s, t) => s + (+t.points || 0), 0); }
  spent(): number { return this.txs.filter((t) => t.type === 'USED').reduce((s, t) => s + (+t.points || 0), 0); }
  earnedPct(): number { const e = this.earned(), s = this.spent() || 1; return Math.min(100, (e / (e + s)) * 100); }
  spentPct(): number { return 100 - this.earnedPct(); }
}
