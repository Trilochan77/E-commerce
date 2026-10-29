import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-empty-state',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="empty">
      <h3 style="margin:0 0 4px">{{ title }}</h3>
      <p class="muted" style="margin:0 0 12px">{{ hint }}</p>
      <a *ngIf="ctaLink" [routerLink]="ctaLink"><button class="primary">{{ ctaLabel }}</button></a>
    </div>
  `
})
export class EmptyState {
  @Input() icon = '';
  @Input() title = 'Nothing here yet';
  @Input() hint = 'Try a different search or explore trending products.';
  @Input() ctaLink = '';
  @Input() ctaLabel = 'Browse products';
}
