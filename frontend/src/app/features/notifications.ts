import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Shop } from '../core/shop';
import { Auth } from '../core/auth';
import { Toast } from '../shared/toast';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-notifications',
  imports: [CommonModule, RouterModule],
  styles: [`
    .alerts-hero {
      background: linear-gradient(135deg, rgba(16,185,129,.14), rgba(34,211,238,.08));
      border: 1px solid rgba(52,211,153,.28);
      border-radius: var(--radius);
      padding: 18px 20px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .alert-card {
      display: flex;
      gap: 14px;
      align-items: flex-start;
      background: var(--surface-2);
      border: 1px solid var(--line-soft);
      border-radius: var(--radius);
      padding: 14px 16px;
      margin-bottom: 10px;
      transition: border-color .15s;
    }
    .alert-card.unread { border-color: rgba(139,92,246,.55); background: linear-gradient(135deg, rgba(139,92,246,.12), var(--surface-2)); }
    .alert-card:hover { border-color: var(--brand); }
    .drop-arrow {
      width: 40px; height: 40px; flex-shrink: 0;
      display: grid; place-items: center;
      border-radius: 999px;
      background: var(--ok-bg); color: var(--ok);
      font-size: 19px; font-weight: 800;
      border: 1px solid rgba(52,211,153,.3);
    }
    .alert-body { flex: 1; min-width: 0; }
    .alert-body h4 { margin: 0 0 2px; font-size: 15px; }
    .alert-body h4 a { color: var(--ink); }
    .alert-body h4 a:hover { color: var(--brand-2); }
    .price-old { text-decoration: line-through; color: var(--muted); font-size: 13px; }
    .price-new { color: var(--ok); font-size: 18px; font-weight: 800; }
    .save-chip {
      display: inline-flex; align-items: center; gap: 4px;
      background: var(--ok-bg); color: var(--ok);
      font-size: 11px; font-weight: 700;
      padding: 3px 8px; border-radius: 999px;
      border: 1px solid rgba(52,211,153,.25);
    }
    .unread-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--brand-2); display: inline-block; }
    .alert-actions { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; flex-shrink: 0; }
    .filter-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; align-items: center; }
    .tab-pill {
      padding: 7px 14px; border: 1px solid var(--line); background: var(--surface-2);
      border-radius: 999px; cursor: pointer; font-weight: 600; font-size: 13px; color: var(--ink-2);
    }
    .tab-pill.active { background: var(--brand); color: #fff; border-color: var(--brand); }
    .email-chip { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; border: 1px solid var(--line-soft); color: var(--muted); }
    .email-chip.sent { color: var(--ok); border-color: rgba(52,211,153,.3); }
    .email-chip.failed { color: var(--bad); border-color: rgba(248,113,113,.3); }
    @media (max-width: 620px) {
      .alert-card { flex-wrap: wrap; }
      .alert-actions { flex-direction: row; align-items: center; width: 100%; justify-content: flex-end; }
    }
  `],
  template: `
    <div class="page-head">
      <div>
        <h1>🔔 Price Drop Alerts</h1>
        <p>Every wishlisted product is checked against the live catalog. You only hear about it when the price goes down.</p>
      </div>
      <div class="row" style="margin:0;gap:8px">
        <button class="primary btn-sm" (click)="scanNow()" [disabled]="scanning">
          {{ scanning ? 'Checking…' : '↻ Check prices now' }}
        </button>
        <a routerLink="/wishlist"><button class="btn-ghost btn-sm">View Wishlist</button></a>
      </div>
    </div>

    <div class="alerts-hero">
      <div>
        <div style="font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--ok)">Wishlist price watch</div>
        <div style="font-size:22px;font-weight:800;margin-top:2px">{{ alerts.length }} alert{{ alerts.length === 1 ? '' : 's' }} · {{ unread }} unread</div>
        <div class="muted" style="font-size:13px">Tracked automatically in the background; the navbar badge updates when new drops arrive.</div>
      </div>
      <div class="row" style="margin:0;gap:16px">
        <div class="stat-card" style="padding:8px 14px">
          <div class="k">Total savings</div>
          <div class="v" style="font-size:18px;color:var(--ok)">₹{{ totalSavings() | number }}</div>
        </div>
        <div class="stat-card" style="padding:8px 14px">
          <div class="k">Unread</div>
          <div class="v" style="font-size:18px;color:var(--brand)">{{ unread }}</div>
        </div>
      </div>
    </div>

    <div class="card" style="padding:12px 14px;margin-bottom:14px;font-size:12px;color:var(--muted)">
      Email alerts are <strong>optional</strong>. An email is only sent when SMTP is configured on the server; otherwise
      notifications stay in this page and in the navbar badge.
    </div>

    <div class="filter-tabs" *ngIf="alerts.length">
      <button class="tab-pill" [class.active]="filter==='ALL'" (click)="filter='ALL'">All alerts ({{ alerts.length }})</button>
      <button class="tab-pill" [class.active]="filter==='UNREAD'" (click)="filter='UNREAD'">Unread ({{ unread }})</button>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button class="btn-ghost btn-sm" (click)="markAllRead()" [disabled]="unread === 0 || markingAll">Mark all read</button>
        <button class="btn-ghost btn-sm" (click)="clearAlerts()" [disabled]="clearing">Clear alerts</button>
      </div>
    </div>

    <div *ngIf="loading"><p class="muted"><span class="spinner"></span> Loading price alerts…</p></div>

    <div *ngIf="!loading && alerts.length === 0" class="card">
      <div class="empty">
        <div class="big">🔔</div>
        <p style="margin:8px 0;font-weight:700;font-size:17px">No price drops yet</p>
        <p class="muted">Save products to your wishlist and we'll start tracking their catalog prices. When a price falls, the previous and new price appear here.</p>
        <a routerLink="/wishlist"><button class="primary" style="margin-top:14px">Open Wishlist</button></a>
      </div>
    </div>

    <div *ngIf="!loading && alerts.length > 0 && visibleAlerts().length === 0" class="card">
      <div class="empty">
        <p style="font-weight:600">No unread alerts.</p>
        <button class="btn-ghost btn-sm" (click)="filter='ALL'">Show all alerts</button>
      </div>
    </div>

    <div *ngFor="let n of visibleAlerts()" class="alert-card" [class.unread]="!n.read">
      <div class="drop-arrow">↓</div>
      <div class="alert-body">
        <h4>
          <a [routerLink]="['/products', n.productId]">{{ n.productName || n.productId }}</a>
        </h4>
        <div class="row" style="margin:0;gap:8px;flex-wrap:wrap;align-items:center">
          <span class="price-old">₹{{ n.previousPrice | number }}</span>
          <span class="muted">→</span>
          <span class="price-new">₹{{ n.currentPrice | number }}</span>
          <span class="save-chip">Save ₹{{ n.savings | number }} ({{ n.savingsPercent }}%)</span>
          <span class="unread-dot" *ngIf="!n.read" title="Unread"></span>
        </div>
        <div class="row" style="margin:6px 0 0;gap:8px;flex-wrap:wrap;align-items:center">
          <span class="muted" style="font-size:11px">Detected {{ n.createdAt | date:'medium' }}</span>
          <span class="email-chip" [ngClass]="emailClass(n.emailStatus)">{{ emailLabel(n.emailStatus) }}</span>
        </div>
      </div>
      <div class="alert-actions">
        <button class="btn-ghost btn-sm" *ngIf="!n.read" (click)="markRead(n)" [disabled]="marking===n.id">
          {{ marking===n.id ? '…' : 'Mark read' }}
        </button>
        <a [routerLink]="['/products', n.productId]"><button class="primary btn-sm">View product</button></a>
      </div>
    </div>
  `
})
export class Notifications implements OnInit {
  alerts: any[] = [];
  loading = false;
  scanning = false;
  markingAll = false;
  clearing = false;
  marking = '';
  filter: 'ALL' | 'UNREAD' = 'ALL';
  error = '';

  constructor(private shop: Shop, private auth: Auth, private router: Router, private toast: Toast) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/login']); return; }
    this.load();
    this.shop.notificationsChanged.subscribe(() => this.load());
  }

  load(): void {
    this.loading = true;
    this.shop.notifications(this.auth.userId()).subscribe({
      next: (list: any) => {
        this.alerts = Array.isArray(list) ? list : [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Could not load price alerts';
        this.toast.err(this.error);
      }
    });
  }

  get unread(): number {
    return this.alerts.filter((n) => !n.read).length;
  }

  visibleAlerts(): any[] {
    return this.filter === 'UNREAD' ? this.alerts.filter((n) => !n.read) : this.alerts;
  }

  totalSavings(): number {
    return this.alerts.reduce((sum, n) => sum + (+n.savings || 0), 0);
  }

  scanNow(): void {
    this.scanning = true;
    this.shop.notificationsScan(this.auth.userId()).subscribe({
      next: (r: any) => {
        this.scanning = false;
        const created = r?.notificationsCreated ?? 0;
        if (created > 0) {
          this.toast.ok(`🔥 ${created} new price drop${created === 1 ? '' : 's'} found in your wishlist`);
        } else {
          this.toast.show('No new price drops — wishlist prices are unchanged');
        }
        this.load();
      },
      error: () => {
        this.scanning = false;
        this.toast.err('Could not check prices right now');
      }
    });
  }

  markRead(n: any): void {
    this.marking = n.id;
    this.shop.notificationRead(this.auth.userId(), n.id).subscribe({
      next: () => {
        this.marking = '';
        n.read = true;
      },
      error: () => {
        this.marking = '';
        this.toast.err('Could not mark this alert as read');
      }
    });
  }

  markAllRead(): void {
    if (this.unread === 0) return;
    this.markingAll = true;
    this.shop.notificationsReadAll(this.auth.userId()).subscribe({
      next: () => {
        this.markingAll = false;
        this.alerts.forEach((n) => (n.read = true));
        this.toast.show('All price alerts marked as read');
      },
      error: () => {
        this.markingAll = false;
        this.toast.err('Could not mark alerts as read');
      }
    });
  }

  clearAlerts(): void {
    if (!confirm('Clear all price-drop alerts? New drops will still be detected.')) return;
    this.clearing = true;
    this.shop.notificationsClear(this.auth.userId()).subscribe({
      next: () => {
        this.clearing = false;
        this.alerts = [];
        this.toast.show('Price alerts cleared');
      },
      error: () => {
        this.clearing = false;
        this.toast.err('Could not clear alerts');
      }
    });
  }

  emailLabel(status: string): string {
    switch (status) {
      case 'SENT': return 'Email sent';
      case 'FAILED': return 'Email failed';
      case 'NOT_CONFIGURED': return 'Email not configured';
      case 'DISABLED': return 'Email alerts off';
      default: return 'Email pending';
    }
  }

  emailClass(status: string): string {
    if (status === 'SENT') return 'sent';
    if (status === 'FAILED') return 'failed';
    return '';
  }
}
