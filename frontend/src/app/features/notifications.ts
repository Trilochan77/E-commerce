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
    .notif-container {
      max-width: 1000px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .notif-hero {
      background: linear-gradient(135deg, rgba(124,58,237,.14), rgba(14,165,233,.1));
      border: 1px solid rgba(168,85,247,.3);
      border-radius: var(--radius);
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .hero-title {
      font-size: 24px;
      font-weight: 800;
      margin: 0 0 4px;
      background: linear-gradient(135deg, #f8fafc, #c084fc, #38bdf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-stats {
      display: flex;
      gap: 14px;
      align-items: center;
    }
    .hero-stat-card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 8px 16px;
      border-radius: 10px;
      text-align: center;
    }
    .hero-stat-card .num {
      font-size: 20px;
      font-weight: 800;
      color: #c084fc;
      font-family: monospace;
    }
    .hero-stat-card .lbl {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
    }

    /* Category Filter Navigation */
    .filter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 4px;
    }
    .category-pills {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }
    .cat-btn {
      padding: 7px 14px;
      border: 1px solid var(--line);
      background: var(--surface-2);
      border-radius: 999px;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      color: var(--ink-2);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all .15s ease;
    }
    .cat-btn:hover {
      border-color: var(--brand);
      color: #fff;
    }
    .cat-btn.active {
      background: var(--brand);
      color: #fff;
      border-color: var(--brand);
      box-shadow: 0 2px 10px rgba(124, 58, 237, 0.35);
    }
    .cat-count {
      font-size: 11px;
      padding: 1px 6px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.15);
    }

    .tools-bar {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .unread-toggle-btn {
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 700;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.04);
      color: #cbd5e1;
      cursor: pointer;
    }
    .unread-toggle-btn.active {
      background: rgba(14, 165, 233, 0.2);
      border-color: #38bdf8;
      color: #38bdf8;
    }

    /* Notification Cards Stack */
    .notif-stack {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .notif-card {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      background: var(--surface-2);
      border: 1px solid var(--line-soft);
      border-radius: var(--radius);
      padding: 16px 18px;
      position: relative;
      transition: all .2s;
    }
    .notif-card:hover {
      border-color: rgba(168, 85, 247, 0.4);
      transform: translateY(-1px);
    }
    .notif-card.unread {
      border-color: rgba(139, 92, 246, 0.6);
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.12), var(--surface-2));
      box-shadow: 0 4px 16px rgba(124, 58, 237, 0.15);
    }
    .notif-icon-bubble {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      display: grid;
      place-items: center;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
      font-size: 22px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .notif-icon-bubble.orders { background: rgba(59, 130, 246, 0.15); border-color: rgba(59, 130, 246, 0.35); }
    .notif-icon-bubble.delivery { background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.35); }
    .notif-icon-bubble.security { background: rgba(245, 158, 11, 0.15); border-color: rgba(245, 158, 11, 0.35); }
    .notif-icon-bubble.price-drops { background: rgba(6, 182, 212, 0.15); border-color: rgba(6, 182, 212, 0.35); }
    .notif-icon-bubble.offers { background: rgba(236, 72, 153, 0.15); border-color: rgba(236, 72, 153, 0.35); }

    .notif-content {
      flex: 1;
      min-width: 0;
    }
    .notif-top {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 4px;
      flex-wrap: wrap;
    }
    .notif-badge {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .05em;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }
    .notif-badge.ORDERS { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border-color: rgba(59, 130, 246, 0.3); }
    .notif-badge.DELIVERY { background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: rgba(16, 185, 129, 0.3); }
    .notif-badge.SECURITY { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border-color: rgba(245, 158, 11, 0.3); }
    .notif-badge.PRICE_DROPS { background: rgba(6, 182, 212, 0.15); color: #22d3ee; border-color: rgba(6, 182, 212, 0.3); }
    .notif-badge.OFFERS { background: rgba(236, 72, 153, 0.15); color: #f472b6; border-color: rgba(236, 72, 153, 0.3); }

    .notif-title {
      font-size: 15px;
      font-weight: 700;
      color: #f8fafc;
      margin: 0;
    }
    .notif-message {
      font-size: 13.5px;
      color: #cbd5e1;
      line-height: 1.5;
      margin: 4px 0 6px;
    }
    .notif-time {
      font-size: 11px;
      color: #94a3b8;
    }

    /* Price drop specifics */
    .price-box {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 4px 10px;
      border-radius: 6px;
      margin: 6px 0;
      flex-wrap: wrap;
    }
    .price-old { text-decoration: line-through; color: #94a3b8; font-size: 12px; }
    .price-new { color: #34d399; font-size: 15px; font-weight: 800; }
    .save-chip {
      background: rgba(52, 211, 153, 0.18);
      color: #34d399;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 999px;
      border: 1px solid rgba(52, 211, 153, 0.3);
    }

    /* Actions */
    .notif-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
      flex-shrink: 0;
    }
    .unread-glow-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #c084fc;
      box-shadow: 0 0 10px #c084fc;
      display: inline-block;
    }
    .action-link-btn {
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 700;
      border-radius: 8px;
      background: var(--brand);
      color: #fff;
      border: none;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: background .15s;
    }
    .action-link-btn:hover {
      background: var(--brand-2);
    }
    .btn-icon-subtle {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 4px;
      font-size: 13px;
      border-radius: 6px;
      transition: color .15s, background .15s;
    }
    .btn-icon-subtle:hover {
      color: #f87171;
      background: rgba(248, 113, 113, 0.1);
    }

    @media (max-width: 640px) {
      .notif-card { flex-wrap: wrap; }
      .notif-actions {
        flex-direction: row;
        width: 100%;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        padding-top: 8px;
        margin-top: 4px;
      }
    }
  `],
  template: `
    <div class="notif-container">
      <div class="breadcrumb">
        <a routerLink="/">Home</a> / <span>Notification Center</span>
      </div>

      <!-- Hero Header -->
      <div class="notif-hero">
        <div>
          <span class="badge violet" style="font-size:11px;letter-spacing:1px;font-weight:700">LIVE NOTIFICATION CENTER</span>
          <h1 class="hero-title">🔔 Smart Notifications</h1>
          <p class="muted" style="margin:4px 0 0;font-size:13.5px">
            Instant updates on orders, live delivery tracking, account security, wishlist price drops, and promotional rewards.
          </p>
        </div>

        <div class="hero-stats">
          <div class="hero-stat-card">
            <div class="num">{{ notificationsList.length }}</div>
            <div class="lbl">Total</div>
          </div>
          <div class="hero-stat-card" style="border-color:rgba(192,132,252,0.4)">
            <div class="num" style="color:#c084fc">{{ unreadCount }}</div>
            <div class="lbl">Unread</div>
          </div>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="category-pills">
          <button class="cat-btn" [class.active]="selectedCategory === 'ALL'" (click)="setCategory('ALL')">
            <span>All Updates</span>
            <span class="cat-count">{{ notificationsList.length }}</span>
          </button>
          <button class="cat-btn" [class.active]="selectedCategory === 'ORDERS'" (click)="setCategory('ORDERS')">
            <span>📦 Orders</span>
            <span class="cat-count" *ngIf="countCategory('ORDERS') > 0">{{ countCategory('ORDERS') }}</span>
          </button>
          <button class="cat-btn" [class.active]="selectedCategory === 'DELIVERY'" (click)="setCategory('DELIVERY')">
            <span>🚚 Delivery</span>
            <span class="cat-count" *ngIf="countCategory('DELIVERY') > 0">{{ countCategory('DELIVERY') }}</span>
          </button>
          <button class="cat-btn" [class.active]="selectedCategory === 'SECURITY'" (click)="setCategory('SECURITY')">
            <span>🔐 Security</span>
            <span class="cat-count" *ngIf="countCategory('SECURITY') > 0">{{ countCategory('SECURITY') }}</span>
          </button>
          <button class="cat-btn" [class.active]="selectedCategory === 'PRICE_DROPS'" (click)="setCategory('PRICE_DROPS')">
            <span>📉 Price Drops</span>
            <span class="cat-count" *ngIf="countCategory('PRICE_DROPS') > 0">{{ countCategory('PRICE_DROPS') }}</span>
          </button>
          <button class="cat-btn" [class.active]="selectedCategory === 'OFFERS'" (click)="setCategory('OFFERS')">
            <span>🎟️ Offers</span>
            <span class="cat-count" *ngIf="countCategory('OFFERS') > 0">{{ countCategory('OFFERS') }}</span>
          </button>
        </div>

        <div class="tools-bar">
          <button class="unread-toggle-btn" [class.active]="unreadOnly" (click)="toggleUnreadOnly()">
            {{ unreadOnly ? '● Unread Only' : '○ Show All' }}
          </button>
          <button class="btn-ghost btn-sm" (click)="markAllRead()" [disabled]="unreadCount === 0 || isMarkingAll">
            {{ isMarkingAll ? '...' : '✓ Mark all read' }}
          </button>
          <button class="btn-ghost btn-sm" (click)="scanPriceDrops()" [disabled]="isScanning" title="Check catalog prices against wishlist">
            {{ isScanning ? 'Checking...' : '↻ Scan drops' }}
          </button>
          <button class="btn-ghost btn-sm" (click)="clearAll()" [disabled]="notificationsList.length === 0" title="Clear all notifications">
            Clear all
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" style="text-align:center;padding:40px 0">
        <span class="spinner"></span>
        <p class="muted" style="margin-top:10px">Loading smart notifications...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && displayedNotifications().length === 0" class="card" style="text-align:center;padding:48px 20px">
        <div style="font-size:42px;margin-bottom:12px">🔔</div>
        <h3 style="font-size:18px;margin:0 0 6px">No notifications in {{ selectedCategoryLabel() }}</h3>
        <p class="muted" style="max-width:440px;margin:0 auto 16px;font-size:13.5px">
          {{ emptyStateMessage() }}
        </p>
        <div class="row" style="justify-content:center;gap:10px">
          <button class="primary btn-sm" *ngIf="unreadOnly" (click)="unreadOnly = false; load()">Show All</button>
          <a routerLink="/products"><button class="btn-ghost btn-sm">Explore Shop</button></a>
          <a routerLink="/orders"><button class="btn-ghost btn-sm">My Orders</button></a>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="notif-stack" *ngIf="!loading && displayedNotifications().length > 0">
        <div *ngFor="let n of displayedNotifications()" class="notif-card" [class.unread]="!n.read">
          <!-- Icon Bubble -->
          <div class="notif-icon-bubble" [ngClass]="bubbleClass(n.category)">
            <span>{{ n.icon || defaultIcon(n.type) }}</span>
          </div>

          <!-- Notification Main Content -->
          <div class="notif-content">
            <div class="notif-top">
              <span class="notif-badge" [ngClass]="n.category || 'GENERAL'">{{ n.category || 'UPDATE' }}</span>
              <h4 class="notif-title">{{ n.title }}</h4>
              <span class="unread-glow-dot" *ngIf="!n.read" title="Unread notification"></span>
            </div>

            <p class="notif-message">{{ n.message }}</p>

            <!-- Price Drop Details (if applicable) -->
            <div class="price-box" *ngIf="n.previousPrice && n.currentPrice">
              <span class="price-old">₹{{ n.previousPrice | number }}</span>
              <span class="muted">→</span>
              <span class="price-new">₹{{ n.currentPrice | number }}</span>
              <span class="save-chip">Save ₹{{ n.savings | number }} ({{ n.savingsPercent }}% OFF)</span>
            </div>

            <div class="row" style="margin:4px 0 0;gap:10px;align-items:center">
              <span class="notif-time">{{ formatTime(n.createdAt) }}</span>
              <span *ngIf="n.emailStatus && n.emailStatus !== 'NOT_CONFIGURED'" class="badge" [ngClass]="n.emailStatus === 'SENT' ? 'ok' : 'muted'" style="font-size:10px">
                {{ n.emailStatus === 'SENT' ? 'Email sent' : 'Email ' + n.emailStatus.toLowerCase() }}
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="notif-actions">
            <button class="btn-ghost btn-sm" *ngIf="!n.read" (click)="markRead(n)" title="Mark as read" style="font-size:11px;padding:4px 8px">
              ✓ Read
            </button>
            <a *ngIf="n.link" [routerLink]="n.link" class="action-link-btn" (click)="onActionClick(n)">
              <span>{{ actionLabel(n) }}</span>
              <span>→</span>
            </a>
            <button class="btn-icon-subtle" (click)="deleteNotif(n)" title="Delete notification">
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class Notifications implements OnInit {
  notificationsList: any[] = [];
  loading = false;
  isScanning = false;
  isMarkingAll = false;
  unreadOnly = false;
  selectedCategory = 'ALL';

  constructor(
    private shop: Shop,
    public auth: Auth,
    private router: Router,
    private toast: Toast
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.toast.show('Please log in to view your notifications');
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/notifications' } });
      return;
    }
    this.load();
    this.shop.notificationsChanged.subscribe(() => this.load());
  }

  load(): void {
    const uid = this.auth.userId();
    if (!uid) return;
    this.loading = true;
    this.shop.notifications(uid, this.unreadOnly, this.selectedCategory).subscribe({
      next: (list: any) => {
        this.notificationsList = Array.isArray(list) ? list : [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.err('Could not load notifications');
      }
    });
  }

  get unreadCount(): number {
    return this.notificationsList.filter(n => !n.read).length;
  }

  setCategory(cat: string): void {
    this.selectedCategory = cat;
    this.load();
  }

  toggleUnreadOnly(): void {
    this.unreadOnly = !this.unreadOnly;
    this.load();
  }

  countCategory(cat: string): number {
    return this.notificationsList.filter(n => (n.category || '').toUpperCase() === cat).length;
  }

  displayedNotifications(): any[] {
    return this.notificationsList;
  }

  markRead(n: any): void {
    const uid = this.auth.userId();
    if (!uid || !n.id) return;
    this.shop.notificationRead(uid, n.id).subscribe({
      next: () => {
        n.read = true;
      },
      error: () => {
        this.toast.err('Failed to mark notification as read');
      }
    });
  }

  markAllRead(): void {
    const uid = this.auth.userId();
    if (!uid || this.unreadCount === 0) return;
    this.isMarkingAll = true;
    this.shop.notificationsReadAll(uid).subscribe({
      next: () => {
        this.isMarkingAll = false;
        this.notificationsList.forEach(n => (n.read = true));
        this.toast.ok('All notifications marked as read');
      },
      error: () => {
        this.isMarkingAll = false;
        this.toast.err('Failed to mark all as read');
      }
    });
  }

  deleteNotif(n: any): void {
    const uid = this.auth.userId();
    if (!uid || !n.id) return;
    this.shop.notificationDelete(uid, n.id).subscribe({
      next: () => {
        this.notificationsList = this.notificationsList.filter(it => it.id !== n.id);
        this.toast.show('Notification removed');
      },
      error: () => {
        this.toast.err('Could not delete notification');
      }
    });
  }

  clearAll(): void {
    if (!confirm('Clear all notifications? This cannot be undone.')) return;
    const uid = this.auth.userId();
    if (!uid) return;
    this.shop.notificationsClear(uid).subscribe({
      next: () => {
        this.notificationsList = [];
        this.toast.show('All notifications cleared');
      },
      error: () => {
        this.toast.err('Could not clear notifications');
      }
    });
  }

  scanPriceDrops(): void {
    const uid = this.auth.userId();
    if (!uid) return;
    this.isScanning = true;
    this.shop.notificationsScan(uid).subscribe({
      next: (r: any) => {
        this.isScanning = false;
        const created = r?.notificationsCreated ?? 0;
        if (created > 0) {
          this.toast.ok(`🔥 ${created} new price drop${created === 1 ? '' : 's'} detected in your wishlist!`);
        } else {
          this.toast.show('Catalog checked: No new price drops on your saved products.');
        }
        this.load();
      },
      error: () => {
        this.isScanning = false;
        this.toast.err('Price drop scan failed');
      }
    });
  }

  onActionClick(n: any): void {
    if (!n.read) {
      this.markRead(n);
    }
  }

  actionLabel(n: any): string {
    const type = (n.type || '').toUpperCase();
    if (type.includes('ORDER') || type.includes('DELIVERY') || type.includes('PAYMENT')) return 'View Order';
    if (type.includes('PRICE_DROP')) return 'View Product';
    if (type.includes('COUPON') || type.includes('OFFER')) return 'Use Coupon';
    if (type.includes('SECURITY') || type.includes('LOGIN') || type.includes('OTP')) return 'Account';
    return 'Details';
  }

  bubbleClass(category: string): string {
    switch ((category || '').toUpperCase()) {
      case 'ORDERS': return 'orders';
      case 'DELIVERY': return 'delivery';
      case 'SECURITY': return 'security';
      case 'PRICE_DROPS': return 'price-drops';
      case 'OFFERS': return 'offers';
      default: return '';
    }
  }

  defaultIcon(type: string): string {
    switch ((type || '').toUpperCase()) {
      case 'ORDER_CONFIRMED': return '📦';
      case 'PAYMENT_SUCCESS': return '💳';
      case 'PAYMENT_FAILED': return '❌';
      case 'ORDER_SHIPPED': return '📦';
      case 'OUT_FOR_DELIVERY': return '🚚';
      case 'ORDER_DELIVERED': return '🎉';
      case 'OTP_VERIFIED': return '🔐';
      case 'LOGIN_SUCCESS': return '🛡️';
      case 'PRICE_DROP': return '📉';
      case 'OFFER_COUPON': return '🎟️';
      default: return '🔔';
    }
  }

  selectedCategoryLabel(): string {
    switch (this.selectedCategory) {
      case 'ORDERS': return 'Orders';
      case 'DELIVERY': return 'Delivery Updates';
      case 'SECURITY': return 'Account & Security';
      case 'PRICE_DROPS': return 'Price Drops';
      case 'OFFERS': return 'Offers & Rewards';
      default: return 'All Updates';
    }
  }

  emptyStateMessage(): string {
    if (this.unreadOnly) return 'You have no unread notifications in this section. Switch to "Show All" to see past updates.';
    switch (this.selectedCategory) {
      case 'ORDERS': return 'You have no order notifications yet. When you place an order, confirmations and receipts appear here.';
      case 'DELIVERY': return 'Live tracking milestones (Shipped, Out for Delivery, Delivered) will be notified here.';
      case 'SECURITY': return 'Security events such as OTP verifications and successful logins will be logged here.';
      case 'PRICE_DROPS': return 'Save items to your Wishlist. We check catalog prices continuously and notify you when prices drop!';
      case 'OFFERS': return 'Spin the Daily Wheel or redeem vouchers to unlock discount coupons and promotional rewards!';
      default: return 'Your notification feed is clear. When you place orders, track shipments, or when prices drop, alerts will appear here!';
    }
  }

  formatTime(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hr${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}
