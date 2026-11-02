import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-logo',
  imports: [CommonModule, RouterModule],
  template: `
    <a [routerLink]="link" class="brand-link" [ngClass]="size" aria-label="NEXGEN Home">
      <div class="brand-icon-wrap">
        <svg class="brand-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="nexgen-prism-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#38bdf8" />
              <stop offset="50%" stop-color="#818cf8" />
              <stop offset="100%" stop-color="#c084fc" />
            </linearGradient>
            <linearGradient id="nexgen-prism-2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ec4899" />
              <stop offset="60%" stop-color="#8b5cf6" />
              <stop offset="100%" stop-color="#3b82f6" />
            </linearGradient>
            <linearGradient id="nexgen-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.8" />
              <stop offset="100%" stop-color="#d946ef" stop-opacity="0.8" />
            </linearGradient>
            <filter id="prism-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <!-- Outer Hexagonal Prism Facets -->
          <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" stroke="url(#nexgen-glow)" stroke-width="1.5" fill="rgba(15, 23, 42, 0.65)" />
          
          <!-- Inner Dynamic Facet Waves -->
          <path d="M20 2 L20 20 L36 29" fill="url(#nexgen-prism-1)" fill-opacity="0.9" />
          <path d="M20 20 L4 29 L4 11 Z" fill="url(#nexgen-prism-2)" fill-opacity="0.85" />
          <path d="M20 20 L36 11 L20 2 Z" fill="url(#nexgen-prism-1)" fill-opacity="0.6" />
          <path d="M20 20 L20 38 L4 29 Z" fill="url(#nexgen-prism-2)" fill-opacity="0.75" />
          
          <!-- Center Core Shimmer -->
          <circle cx="20" cy="20" r="3.5" fill="#ffffff" filter="url(#prism-glow)" />
        </svg>
      </div>

      <div class="brand-text-wrap" *ngIf="showText">
        <span class="brand-name">
          NEX<span class="brand-accent">GEN</span>
        </span>
        <span class="brand-sub" *ngIf="size !== 'sm'">ELEVATED TECH &amp; LIVING</span>
      </div>
    </a>
  `,
  styles: [`
    :host { display: inline-flex; }
    .brand-link {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--ink, #f8fafc);
      cursor: pointer;
      user-select: none;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .brand-link:hover {
      transform: translateY(-1px);
    }
    .brand-link:hover .brand-icon-wrap {
      box-shadow: 0 0 24px rgba(139, 92, 246, 0.6), inset 0 0 12px rgba(34, 211, 238, 0.35);
      border-color: rgba(167, 139, 250, 0.8);
    }
    .brand-icon-wrap {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.25), rgba(15, 23, 42, 0.85));
      border: 1px solid rgba(148, 163, 255, 0.3);
      display: grid;
      place-items: center;
      padding: 5px;
      box-shadow: 0 4px 16px rgba(2, 5, 12, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15);
      transition: all 0.25s ease;
      flex-shrink: 0;
    }
    .brand-icon {
      width: 100%;
      height: 100%;
      display: block;
    }
    .brand-text-wrap {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }
    .brand-name {
      font-size: 19px;
      font-weight: 900;
      letter-spacing: -0.03em;
      color: #ffffff;
      display: flex;
      align-items: center;
    }
    .brand-accent {
      background: linear-gradient(135deg, #38bdf8 0%, #a855f7 50%, #ec4899 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-left: 1px;
    }
    .brand-sub {
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.14em;
      color: #94a3b8;
      margin-top: 2px;
      text-transform: uppercase;
    }

    /* Size variants */
    .brand-link.sm .brand-icon-wrap { width: 30px; height: 30px; padding: 3px; border-radius: 9px; }
    .brand-link.sm .brand-name { font-size: 15px; }

    .brand-link.lg .brand-icon-wrap { width: 52px; height: 52px; padding: 7px; border-radius: 16px; }
    .brand-link.lg .brand-name { font-size: 26px; }
    .brand-link.lg .brand-sub { font-size: 11px; letter-spacing: 0.16em; margin-top: 3px; }
  `]
})
export class AppLogo {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showText = true;
  @Input() link = '/';
}

