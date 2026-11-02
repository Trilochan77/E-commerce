import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Shop } from '../core/shop';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-admin-reviews',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head">
      <div>
        <h1 style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:24px;">⭐</span> Review Moderation
        </h1>
        <p class="muted">Moderate customer ratings, verified buyer badges, and uploaded customer photos.</p>
      </div>
      <button class="btn-ghost btn-sm" (click)="load()" [disabled]="loading">
        <span *ngIf="loading" class="spinner"></span> 🔄 Refresh
      </button>
    </div>

    <!-- Filter tabs -->
    <div class="tabs-bar" style="display:flex;gap:8px;margin-bottom:20px;border-bottom:1px solid var(--border);padding-bottom:10px;">
      <button *ngFor="let tab of tabs" 
              class="tab-btn" 
              [class.active]="selectedTab === tab.id"
              (click)="setTab(tab.id)"
              style="padding:6px 14px;border-radius:20px;border:1px solid var(--border);background:var(--bg-glass);color:var(--fg);cursor:pointer;font-weight:600;font-size:12.5px;">
        {{ tab.label }}
        <span class="count-badge" style="background:var(--card-hover);padding:2px 7px;border-radius:10px;margin-left:4px;font-size:11px;">
          {{ countFor(tab.id) }}
        </span>
      </button>
    </div>

    <div *ngIf="msg" class="notice-banner" style="background:rgba(34,197,94,0.1);border:1px solid #22c55e;color:#86efac;padding:10px 14px;border-radius:8px;margin-bottom:16px;">
      {{ msg }}
    </div>
    <div *ngIf="error" class="error-banner" style="background:rgba(239,68,68,0.1);border:1px solid #ef4444;color:#fca5a5;padding:10px 14px;border-radius:8px;margin-bottom:16px;">
      {{ error }}
    </div>

    <div *ngIf="loading" class="muted" style="padding:40px;text-align:center;">
      <span class="spinner"></span> Loading review submissions...
    </div>

    <!-- Reviews table / card stream -->
    <div *ngIf="!loading && filteredReviews.length === 0" class="card" style="text-align:center;padding:48px 20px;">
      <div style="font-size:36px;margin-bottom:12px;">🌟</div>
      <h3>No reviews found in this category</h3>
      <p class="muted">Customer reviews submitted on product pages will appear here for verification.</p>
    </div>

    <div *ngIf="!loading && filteredReviews.length > 0" style="display:flex;flex-direction:column;gap:14px;">
      <div *ngFor="let rev of filteredReviews" class="card" style="border-radius:12px;padding:18px 20px;border:1px solid var(--border);background:var(--bg-card);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
              <span style="color:#f59e0b;letter-spacing:2px;font-size:16px;">
                {{ '★'.repeat(rev.rating) }}{{ '☆'.repeat(5 - rev.rating) }}
              </span>
              <strong style="font-size:15px;">{{ rev.title || 'Untitled Review' }}</strong>
              <span *ngIf="rev.verifiedPurchase" class="badge cyan" style="font-size:11px;">✓ Verified Buyer</span>
            </div>
            <div class="muted" style="font-size:12.5px;display:flex;align-items:center;gap:12px;">
              <span>By <strong>{{ rev.userName || rev.userId || 'Anonymous' }}</strong></span>
              <span>• Product: <code style="color:var(--brand-3)">{{ rev.productId }}</code></span>
              <span>• {{ rev.createdAt | date:'medium' }}</span>
            </div>
          </div>
          
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="badge" [ngClass]="{
              'green': rev.status === 'APPROVED',
              'warn': rev.status === 'PENDING',
              'red': rev.status === 'REJECTED'
            }">{{ rev.status }}</span>
          </div>
        </div>

        <p style="margin:14px 0 12px 0;line-height:1.6;font-size:14px;color:var(--fg-dim);">
          {{ rev.comment || rev.content }}
        </p>

        <!-- Attached Customer Photos -->
        <div *ngIf="rev.photos && rev.photos.length > 0" style="margin:10px 0 16px 0;">
          <div class="muted" style="font-size:12px;font-weight:600;margin-bottom:6px;">ATTACHED BUYER PHOTOS:</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <a *ngFor="let p of rev.photos" [href]="p" target="_blank" rel="noopener">
              <img [src]="p" alt="Buyer review photo" style="width:68px;height:68px;object-fit:cover;border-radius:8px;border:1px solid var(--border);" />
            </a>
          </div>
        </div>

        <!-- Moderation Actions -->
        <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;margin-top:12px;">
          <div class="muted" style="font-size:12px;">
            Review ID: <code>{{ rev.id }}</code>
            <span *ngIf="rev.adminNote" style="margin-left:8px;color:#fca5a5;">(Note: {{ rev.adminNote }})</span>
          </div>
          <div style="display:flex;gap:8px;">
            <button *ngIf="rev.status !== 'APPROVED'" 
                    class="btn-primary btn-sm" 
                    style="background:#22c55e;color:#fff;border-color:#16a34a;"
                    (click)="updateStatus(rev.id, 'APPROVED')" 
                    [disabled]="actionLoading === rev.id">
              ✓ Approve
            </button>
            <button *ngIf="rev.status !== 'REJECTED'" 
                    class="btn-ghost btn-sm" 
                    style="color:#ef4444;border-color:rgba(239,68,68,0.3);"
                    (click)="promptReject(rev.id)" 
                    [disabled]="actionLoading === rev.id">
              ✕ Reject
            </button>
            <button class="btn-ghost btn-sm" 
                    style="color:var(--fg-muted);"
                    (click)="deleteReview(rev.id)" 
                    [disabled]="actionLoading === rev.id">
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tab-btn.active {
      background: var(--brand) !important;
      color: #fff !important;
      border-color: var(--brand) !important;
    }
  `]
})
export class AdminReviews implements OnInit {
  reviews: any[] = [];
  loading = true;
  actionLoading: string | null = null;
  selectedTab = 'ALL';
  msg = '';
  error = '';

  tabs = [
    { id: 'ALL', label: 'All Reviews' },
    { id: 'PENDING', label: '⏳ Pending' },
    { id: 'APPROVED', label: '✓ Approved' },
    { id: 'REJECTED', label: '✕ Rejected' }
  ];

  constructor(private shop: Shop) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.msg = '';
    this.shop.adminReviews().subscribe({
      next: (res: any) => {
        this.reviews = Array.isArray(res) ? res : [];
        this.loading = false;
      },
      error: (e) => {
        this.error = e.error?.message || 'Could not load reviews for moderation';
        this.loading = false;
      }
    });
  }

  get filteredReviews(): any[] {
    if (this.selectedTab === 'ALL') return this.reviews;
    return this.reviews.filter(r => r.status === this.selectedTab);
  }

  setTab(tabId: string): void {
    this.selectedTab = tabId;
  }

  countFor(tabId: string): number {
    if (tabId === 'ALL') return this.reviews.length;
    return this.reviews.filter(r => r.status === tabId).length;
  }

  updateStatus(id: string, status: string, note = ''): void {
    this.actionLoading = id;
    this.error = '';
    this.msg = '';
    this.shop.adminReviewStatus(id, status, note).subscribe({
      next: () => {
        const item = this.reviews.find(r => r.id === id);
        if (item) {
          item.status = status;
          if (note) item.adminNote = note;
        }
        this.msg = `Review marked as ${status}`;
        this.actionLoading = null;
      },
      error: (e) => {
        this.error = e.error?.message || 'Failed to update review status';
        this.actionLoading = null;
      }
    });
  }

  promptReject(id: string): void {
    const note = prompt('Reason for rejection (optional):', 'Violates community guidelines / promotional content');
    if (note !== null) {
      this.updateStatus(id, 'REJECTED', note);
    }
  }

  deleteReview(id: string): void {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;
    this.actionLoading = id;
    this.error = '';
    this.msg = '';
    this.shop.adminReviewDelete(id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== id);
        this.msg = 'Review deleted successfully';
        this.actionLoading = null;
      },
      error: (e) => {
        this.error = e.error?.message || 'Failed to delete review';
        this.actionLoading = null;
      }
    });
  }
}

