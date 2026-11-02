import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Shop } from '../core/shop';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-admin-notifications',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head">
      <div>
        <h1 style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:24px;">📢</span> Notification Center &amp; Broadcasts
        </h1>
        <p class="muted">Send storewide promotional alerts, system announcements, and monitor all notifications.</p>
      </div>
      <button class="btn-ghost btn-sm" (click)="load()" [disabled]="loading">
        <span *ngIf="loading" class="spinner"></span> 🔄 Refresh
      </button>
    </div>

    <div *ngIf="msg" class="notice-banner" style="background:rgba(34,197,94,0.1);border:1px solid #22c55e;color:#86efac;padding:10px 14px;border-radius:8px;margin-bottom:16px;">
      {{ msg }}
    </div>
    <div *ngIf="error" class="error-banner" style="background:rgba(239,68,68,0.1);border:1px solid #ef4444;color:#fca5a5;padding:10px 14px;border-radius:8px;margin-bottom:16px;">
      {{ error }}
    </div>

    <!-- Broadcast Composer Form -->
    <div class="card" style="border:1px solid var(--border);border-left:4px solid var(--brand);margin-bottom:28px;padding:22px;border-radius:12px;background:var(--bg-card);">
      <h3 style="margin-top:0;display:flex;align-items:center;gap:8px;">
        <span>📣</span> Broadcast Notification to All Users
      </h3>
      <p class="muted" style="margin-bottom:18px;">
        This alert will appear in every shopper's in-app notification center bell icon immediately.
      </p>

      <form (ngSubmit)="sendBroadcast()" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(250px, 1fr));gap:16px;">
        <div style="grid-column: 1 / -1;">
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;color:var(--fg-dim);">NOTIFICATION TITLE *</label>
          <input type="text" [(ngModel)]="broadcast.title" name="title" placeholder="e.g. Mega Weekend Tech Fest — Up to 50% Off!" required
                 style="width:100%;padding:10px 12px;border-radius:8px;background:var(--bg-glass);border:1px solid var(--border);color:var(--fg);font-weight:600;" />
        </div>

        <div style="grid-column: 1 / -1;">
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;color:var(--fg-dim);">MESSAGE BODY *</label>
          <textarea [(ngModel)]="broadcast.message" name="message" rows="3" placeholder="Write message details or instructions..." required
                    style="width:100%;padding:10px 12px;border-radius:8px;background:var(--bg-glass);border:1px solid var(--border);color:var(--fg);resize:vertical;font-family:inherit;line-height:1.5;"></textarea>
        </div>

        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;color:var(--fg-dim);">CATEGORY &amp; TYPE</label>
          <select [(ngModel)]="broadcast.type" name="type"
                  style="width:100%;padding:9px 12px;border-radius:8px;background:var(--bg-glass);border:1px solid var(--border);color:var(--fg);">
            <option value="OFFER_COUPON">🎟️ Promotional Offer / Coupon</option>
            <option value="GENERAL">📢 General Announcement</option>
            <option value="SECURITY">🛡️ Security &amp; Policy Notice</option>
            <option value="DELIVERY">🚚 Logistics / Delivery Notice</option>
          </select>
        </div>

        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;color:var(--fg-dim);">DESTINATION LINK</label>
          <input type="text" [(ngModel)]="broadcast.actionUrl" name="actionUrl" placeholder="e.g. /products or /spin"
                 style="width:100%;padding:9px 12px;border-radius:8px;background:var(--bg-glass);border:1px solid var(--border);color:var(--fg);" />
        </div>

        <div style="grid-column: 1 / -1; display:flex; justify-content:flex-end; gap:10px;">
          <button type="submit" class="btn-primary btn-sm" [disabled]="sendLoading">
            <span *ngIf="sendLoading" class="spinner"></span> 🚀 Send Broadcast Alert
          </button>
        </div>
      </form>
    </div>

    <!-- Recent Notifications Feed -->
    <div class="card" style="padding:22px;border-radius:12px;border:1px solid var(--border);background:var(--bg-card);">
      <h3 style="margin-top:0;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
        <span>🔔</span> Recent Notification Logs
      </h3>

      <div *ngIf="loading" class="muted" style="padding:24px;text-align:center;">
        <span class="spinner"></span> Loading notification feed...
      </div>

      <div *ngIf="!loading && notificationsList.length === 0" class="muted" style="text-align:center;padding:24px;">
        No notifications have been sent yet.
      </div>

      <div *ngIf="!loading && notificationsList.length > 0" style="display:flex;flex-direction:column;gap:10px;">
        <div *ngFor="let n of notificationsList" 
             style="display:flex;justify-content:space-between;align-items:flex-start;padding:12px 16px;border-radius:10px;background:var(--bg-glass);border:1px solid var(--border);gap:14px;flex-wrap:wrap;">
          <div style="display:flex;gap:12px;align-items:flex-start;">
            <span style="font-size:22px;line-height:1;">{{ n.icon || '🔔' }}</span>
            <div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <strong style="font-size:14.5px;">{{ n.title }}</strong>
                <span class="badge" [ngClass]="n.userId === 'ALL' ? 'violet' : 'cyan'" style="font-size:11px;">
                  {{ n.userId === 'ALL' ? 'BROADCAST ALL' : ('User: ' + n.userId) }}
                </span>
                <span class="badge" style="background:rgba(255,255,255,0.06);font-size:10.5px;">{{ n.category }}</span>
              </div>
              <p style="margin:6px 0 0 0;font-size:13.5px;color:var(--fg-dim);line-height:1.5;">
                {{ n.message }}
              </p>
            </div>
          </div>
          <div class="muted" style="font-size:11.5px;white-space:nowrap;">
            {{ n.createdAt | date:'short' }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminNotifications implements OnInit {
  notificationsList: any[] = [];
  loading = true;
  sendLoading = false;
  msg = '';
  error = '';

  broadcast = {
    title: '',
    message: '',
    type: 'OFFER_COUPON',
    actionUrl: '/products'
  };

  constructor(private shop: Shop) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.shop.adminAllNotifications().subscribe({
      next: (res: any) => {
        this.notificationsList = Array.isArray(res) ? res : [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  sendBroadcast(): void {
    if (!this.broadcast.title.trim() || !this.broadcast.message.trim()) {
      this.error = 'Title and message are required';
      return;
    }
    this.sendLoading = true;
    this.error = '';
    this.msg = '';

    this.shop.adminBroadcastNotification(this.broadcast).subscribe({
      next: (res: any) => {
        this.notificationsList.unshift(res);
        this.msg = 'Broadcast notification delivered to all active users!';
        this.sendLoading = false;
        this.broadcast.title = '';
        this.broadcast.message = '';
      },
      error: (e) => {
        this.error = e.error?.message || 'Failed to send broadcast notification';
        this.sendLoading = false;
      }
    });
  }
}

