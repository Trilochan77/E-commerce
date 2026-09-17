import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopService } from '../core/shop.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h2>Reward Wallet</h2>
      <p>Balance: <strong>{{ balance }}</strong> pts</p>
    </div>
    <div class="card">
      <h3>Transaction History</h3>
      <table *ngIf="txs.length">
        <tr><th>Date</th><th>Type</th><th>Points</th><th>Order</th><th>Return</th></tr>
        <tr *ngFor="let t of txs">
          <td>{{ t.createdAt }}</td>
          <td><span class="badge" [ngClass]="t.type === 'EARNED' ? 'ok' : 'warn'">{{ t.type }}</span></td>
          <td>{{ t.points }}</td>
          <td>{{ t.relatedOrderId || '-' }}</td>
          <td>{{ t.relatedReturnId || '-' }}</td>
        </tr>
      </table>
      <p class="muted" *ngIf="!txs.length">No transactions yet.</p>
    </div>
  `
})
export class WalletComponent implements OnInit {
  balance = 0;
  txs: any[] = [];

  constructor(private shop: ShopService, private auth: AuthService) {}

  ngOnInit(): void {
    this.shop.wallet(this.auth.userId()).subscribe((w: any) => this.balance = w.balance || 0);
    this.shop.transactions(this.auth.userId()).subscribe((t: any) => this.txs = Array.isArray(t) ? t : []);
  }
}
