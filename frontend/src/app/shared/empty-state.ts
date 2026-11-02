import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-empty-state',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="empty-state-card">
      <div class="empty-icon-wrap" *ngIf="icon">
        <span class="empty-icon-text">{{ icon }}</span>
      </div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-hint">{{ hint }}</p>
      <div class="empty-actions" *ngIf="ctaLink">
        <a [routerLink]="ctaLink">
          <button class="primary">{{ ctaLabel }}</button>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .empty-state-card {
      background: rgba(13, 19, 39, 0.6);
      backdrop-filter: blur(12px);
      border: 1px dashed rgba(148, 163, 255, 0.2);
      border-radius: 18px;
      padding: 42px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 12px 0;
    }
    .empty-icon-wrap {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(148, 163, 255, 0.15);
      display: grid;
      place-items: center;
      margin-bottom: 14px;
    }
    .empty-icon-text {
      font-size: 28px;
    }
    .empty-title {
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 6px;
    }
    .empty-hint {
      color: #94a3b8;
      font-size: 13.5px;
      max-width: 440px;
      line-height: 1.5;
      margin: 0 0 16px;
    }
    .empty-actions {
      display: flex;
      gap: 10px;
      justify-content: center;
    }
  `]
})
export class EmptyState {
  @Input() icon = '🔍';
  @Input() title = 'Nothing here yet';
  @Input() hint = 'Try a different search or explore trending products.';
  @Input() ctaLink = '';
  @Input() ctaLabel = 'Browse Catalog';
}
