import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Shop } from '../core/shop';
import { Auth } from '../core/auth';
import { Toast } from '../shared/toast';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-spin-win',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="breadcrumb">
      <a routerLink="/">Home</a> / <a routerLink="/wallet">Rewards</a> / <span>Spin & Win</span>
    </div>

    <div class="spin-page-container">
      <!-- Hero Header -->
      <div class="spin-header">
        <span class="badge violet" style="font-size:12px;letter-spacing:1px;font-weight:700">✦ DAILY REWARDS ✦</span>
        <h1>🎡 Spin & Win Daily Rewards</h1>
        <p class="lead">
          Spin the wheel every 24 hours to win exclusive discount coupons, flat savings, and bonus reward points!
        </p>
      </div>

      <!-- Main Game Grid -->
      <div class="game-grid">
        <!-- Wheel Section -->
        <div class="card wheel-card">
          <div class="wheel-stage">
            <!-- Top Golden Pointer -->
            <div class="wheel-pointer">
              <svg width="40" height="46" viewBox="0 0 40 46" fill="none">
                <path d="M20 44L4 12C2.5 9 4.8 5 8.2 5H31.8C35.2 5 37.5 9 36 12L20 44Z" fill="url(#pointerGold)" stroke="#fef08a" stroke-width="2"/>
                <circle cx="20" cy="14" r="5" fill="#fef08a" />
                <defs>
                  <linearGradient id="pointerGold" x1="20" y1="5" x2="20" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#facc15"/>
                    <stop offset="1" stop-color="#ca8a04"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <!-- Canvas Wheel -->
            <div class="wheel-outer-rim" [class.spinning]="isSpinning">
              <canvas #wheelCanvas width="420" height="420" class="wheel-canvas" [style.transform]="'rotate(' + currentRotation + 'deg)'"></canvas>
              <!-- Center Hub -->
              <button class="center-hub-btn" (click)="spin()" [disabled]="!canSpin || isSpinning" [attr.aria-label]="'Spin the wheel'">
                <span class="hub-text">{{ isSpinning ? '...' : (canSpin ? 'SPIN' : 'LOCKED') }}</span>
              </button>
            </div>
          </div>

          <!-- Spin Action & Timer Bar -->
          <div class="spin-action-bar">
            <ng-container *ngIf="canSpin; else cooldownTpl">
              <button class="primary btn-lg spin-cta-btn" (click)="spin()" [disabled]="isSpinning">
                <span *ngIf="!isSpinning">🎲 SPIN NOW (FREE)</span>
                <span *ngIf="isSpinning"><span class="spinner"></span> Spinning the Wheel…</span>
              </button>
              <p class="muted" style="margin:8px 0 0;font-size:12px">
                ✓ 1 Free spin available today · 100% fair server-verified outcome
              </p>
            </ng-container>

            <ng-template #cooldownTpl>
              <div class="cooldown-box">
                <div class="cd-title">⏳ Daily Free Spin Used</div>
                <div class="countdown-digits">
                  <div class="cd-unit"><strong>{{ countdown.hours }}</strong><span>Hours</span></div>
                  <span class="cd-colon">:</span>
                  <div class="cd-unit"><strong>{{ countdown.minutes }}</strong><span>Mins</span></div>
                  <span class="cd-colon">:</span>
                  <div class="cd-unit"><strong>{{ countdown.seconds }}</strong><span>Secs</span></div>
                </div>
                <p class="muted" style="font-size:12px;margin:10px 0 0">
                  Next spin opens: <strong>{{ nextSpinLabel || 'Tomorrow at 12:00 AM' }}</strong>
                </p>
              </div>
            </ng-template>
          </div>
        </div>

        <!-- Sidebar: Won Coupons & Prizes Guide -->
        <div class="sidebar-column">
          <!-- User Won Coupons -->
          <div class="card tight won-coupons-card">
            <div class="row" style="justify-content:space-between;margin:0 0 12px 0;align-items:center">
              <h3 style="font-size:16px;margin:0;display:flex;align-items:center;gap:6px">
                <span>🎟️</span> My Won Coupons
              </h3>
              <span class="badge info" style="font-size:11px">{{ activeCoupons().length }} Active</span>
            </div>

            <div class="coupons-stack" *ngIf="myCouponsList.length; else noCoupons">
              <div class="coupon-ticket" *ngFor="let c of myCouponsList" [class.used]="c.status === 'USED'" [class.expired]="c.status === 'EXPIRED'">
                <div class="ticket-left">
                  <div class="ticket-discount">{{ c.discountLabel || (c.value + (c.type==='PERCENT' ? '%' : '₹') + ' OFF') }}</div>
                  <div class="ticket-title">{{ c.title }}</div>
                  <div class="ticket-terms">
                    <span *ngIf="c.minOrderValue">Min order ₹{{ c.minOrderValue | number }} · </span>
                    <span>Valid until {{ c.validUntilLabel }}</span>
                  </div>
                </div>
                <div class="ticket-right">
                  <span class="badge" [ngClass]="statusBadgeClass(c.status)">{{ c.status }}</span>
                  <button class="btn-ghost btn-sm copy-btn" *ngIf="c.status === 'ACTIVE'" (click)="copyCode(c.code)" title="Copy Code">
                    {{ copiedCode === c.code ? '✓ Copied' : c.code }}
                  </button>
                  <a routerLink="/cart" *ngIf="c.status === 'ACTIVE'" style="font-size:11px;color:#a855f7;margin-top:4px;text-decoration:none">
                    Use in cart →
                  </a>
                </div>
              </div>
            </div>

            <ng-template #noCoupons>
              <div style="text-align:center;padding:24px 12px">
                <span style="font-size:32px">🎁</span>
                <p class="muted" style="margin:8px 0 0;font-size:13px">
                  No coupons won yet. Spin the wheel above to win your first discount voucher!
                </p>
              </div>
            </ng-template>
          </div>

          <!-- Wheel Prize Directory -->
          <div class="card tight">
            <h3 style="font-size:15px;margin:0 0 10px 0">🏆 Wheel Prize Table</h3>
            <div class="prize-list">
              <div class="prize-row" *ngFor="let p of prizes">
                <span class="prize-dot" [style.background]="p.color"></span>
                <span class="prize-emoji">{{ p.emoji }}</span>
                <strong style="font-size:13px">{{ p.label }}</strong>
                <span class="muted" style="font-size:12px;margin-left:auto">{{ p.hint }}</span>
              </div>
            </div>
            <div class="divider"></div>
            <div class="privacy-note">
              <span>🔒</span>
              <span><strong>Fair Play Protected:</strong> Daily limits and outcomes are cryptographically signed on the server to prevent repeated exploit spins.</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Celebration Winner Modal -->
    <div class="modal-backdrop" *ngIf="showWinnerModal" (click)="closeWinnerModal()">
      <div class="modal-box winner-modal" (click)="$event.stopPropagation()">
        <div class="confetti-cannon">🎉 🎊 ✨</div>
        <h2 style="font-size:24px;color:#fef08a;margin:8px 0">Congratulations!</h2>
        <p class="winner-message">{{ wonResult?.message || 'You won an exclusive reward!' }}</p>

        <!-- Won Coupon Card -->
        <div class="won-coupon-display" *ngIf="wonResult?.coupon">
          <div class="muted" style="font-size:12px">YOUR UNIQUE COUPON CODE:</div>
          <div class="code-box">
            <span class="code-text">{{ wonResult.coupon.code }}</span>
            <button class="primary btn-sm" (click)="copyCode(wonResult.coupon.code)">
              {{ copiedCode === wonResult.coupon.code ? '✓ Copied' : 'Copy Code' }}
            </button>
          </div>
          <div class="muted" style="font-size:12px;margin-top:6px">
            {{ wonResult.coupon.discountLabel }} · Valid until {{ wonResult.coupon.validUntilLabel }}
          </div>
        </div>

        <!-- Won Points Banner -->
        <div class="won-points-display" *ngIf="wonResult?.points > 0">
          <span style="font-size:36px">⭐</span>
          <div>
            <strong style="font-size:18px;color:#38bdf8">+{{ wonResult.points }} Points Added!</strong>
            <p class="muted" style="margin:2px 0 0;font-size:12px">Instant credit to your reward wallet (₹1 = 1 pt)</p>
          </div>
        </div>

        <div class="row" style="margin-top:20px;justify-content:center;gap:12px">
          <button class="btn-ghost" (click)="closeWinnerModal()">Close</button>
          <a routerLink="/products">
            <button class="primary" (click)="closeWinnerModal()">Shop Now & Use Coupon →</button>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .spin-page-container {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .spin-header {
      text-align: center;
      padding: 10px 0 0;
    }
    .spin-header h1 {
      font-size: 32px;
      margin: 10px 0 6px;
      background: linear-gradient(135deg, #f8fafc, #c084fc, #f472b6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .lead {
      color: #94a3b8;
      font-size: 15px;
      max-width: 650px;
      margin: 0 auto;
    }
    .game-grid {
      display: grid;
      grid-template-columns: 1fr 420px;
      gap: 20px;
      align-items: start;
    }
    @media (max-width: 900px) {
      .game-grid {
        grid-template-columns: 1fr;
      }
    }
    .wheel-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30px 20px;
      background: linear-gradient(145deg, #111827, #0f172a);
      border: 1px solid rgba(168, 85, 247, 0.3);
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    .wheel-stage {
      position: relative;
      width: 420px;
      height: 420px;
      display: flex;
      align-items: center;
      justify-content: center;
      max-width: 100%;
    }
    @media (max-width: 480px) {
      .wheel-stage {
        width: 330px;
        height: 330px;
      }
      .wheel-canvas {
        width: 330px !important;
        height: 330px !important;
      }
    }
    .wheel-pointer {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6));
    }
    .wheel-outer-rim {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      padding: 10px;
      box-sizing: border-box;
      background: radial-gradient(circle, #2d124d 0%, #1e1b4b 60%, #090d16 100%);
      box-shadow: 0 0 35px rgba(124, 58, 237, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.8);
      border: 4px solid #facc15;
    }
    .wheel-canvas {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      transition: transform 4.8s cubic-bezier(0.15, 0.9, 0.2, 1);
      display: block;
    }
    .center-hub-btn {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #facc15, #ca8a04);
      border: 4px solid #fef08a;
      box-shadow: 0 0 20px rgba(250, 204, 21, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.5);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5;
      outline: none;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .center-hub-btn:hover:not(:disabled) {
      transform: translate(-50%, -50%) scale(1.08);
      box-shadow: 0 0 28px rgba(250, 204, 21, 0.9);
    }
    .center-hub-btn:disabled {
      background: #475569;
      border-color: #64748b;
      box-shadow: none;
      cursor: not-allowed;
    }
    .hub-text {
      font-size: 15px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: 1px;
    }
    .center-hub-btn:disabled .hub-text {
      color: #94a3b8;
      font-size: 12px;
    }
    .spin-action-bar {
      margin-top: 24px;
      text-align: center;
      width: 100%;
      max-width: 380px;
    }
    .spin-cta-btn {
      width: 100%;
      font-size: 16px;
      font-weight: 700;
      padding: 14px 24px;
      border-radius: 12px;
      background: linear-gradient(135deg, #7c3aed, #ec4899);
      box-shadow: 0 4px 18px rgba(236, 72, 153, 0.4);
      border: none;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .spin-cta-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(236, 72, 153, 0.6);
    }
    .cooldown-box {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 16px;
    }
    .cd-title {
      font-weight: 700;
      font-size: 14px;
      color: #cbd5e1;
      margin-bottom: 8px;
    }
    .countdown-digits {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
    }
    .cd-unit {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 6px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 48px;
    }
    .cd-unit strong {
      font-size: 20px;
      font-family: monospace;
      color: #c084fc;
    }
    .cd-unit span {
      font-size: 9px;
      color: #94a3b8;
      text-transform: uppercase;
    }
    .cd-colon {
      font-size: 20px;
      font-weight: 700;
      color: #64748b;
    }
    .sidebar-column {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .coupons-stack {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: 380px;
      overflow-y: auto;
    }
    .coupon-ticket {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 14px;
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(236, 72, 153, 0.08));
      border: 1px dashed rgba(168, 85, 247, 0.4);
      border-radius: 10px;
      gap: 10px;
    }
    .coupon-ticket.used, .coupon-ticket.expired {
      opacity: 0.55;
      filter: grayscale(0.5);
      border-style: solid;
      border-color: rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.02);
    }
    .ticket-discount {
      font-size: 15px;
      font-weight: 800;
      color: #f472b6;
    }
    .ticket-title {
      font-size: 12px;
      font-weight: 600;
      color: #f8fafc;
      margin: 2px 0;
    }
    .ticket-terms {
      font-size: 10px;
      color: #94a3b8;
    }
    .ticket-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }
    .copy-btn {
      font-family: monospace;
      font-size: 12px;
      color: #c084fc;
      border-color: rgba(168, 85, 247, 0.4);
      padding: 4px 8px;
    }
    .prize-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .prize-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
    }
    .prize-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .prize-emoji {
      font-size: 16px;
    }
    .privacy-note {
      display: flex;
      gap: 8px;
      font-size: 11px;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.03);
      padding: 8px;
      border-radius: 6px;
    }
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    .modal-box.winner-modal {
      background: linear-gradient(135deg, #1e1b4b, #0f172a);
      border: 2px solid #facc15;
      border-radius: 16px;
      padding: 30px;
      text-align: center;
      width: 90%;
      max-width: 440px;
      box-shadow: 0 0 50px rgba(250, 204, 21, 0.4);
      animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes popIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .confetti-cannon {
      font-size: 40px;
    }
    .winner-message {
      font-size: 14px;
      color: #e2e8f0;
      margin: 8px 0 16px;
    }
    .won-coupon-display {
      background: rgba(15, 23, 42, 0.8);
      border: 1px dashed #facc15;
      border-radius: 12px;
      padding: 16px;
      margin-top: 10px;
    }
    .code-box {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      margin-top: 8px;
    }
    .code-text {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 2px;
      font-family: monospace;
      color: #facc15;
    }
    .won-points-display {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      background: rgba(14, 165, 233, 0.15);
      border: 1px solid rgba(14, 165, 233, 0.4);
      border-radius: 12px;
      padding: 16px;
      margin-top: 10px;
    }
  `]
})
export class SpinWin implements OnInit, OnDestroy {
  @ViewChild('wheelCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  prizes: any[] = [];
  myCouponsList: any[] = [];
  canSpin = false;
  nextSpinAt: string | null = null;
  nextSpinLabel = '';
  isSpinning = false;
  currentRotation = 0;

  wonResult: any = null;
  showWinnerModal = false;
  copiedCode = '';

  countdown = { hours: '00', minutes: '00', seconds: '00' };
  timerRef: any = null;

  constructor(
    private shop: Shop,
    public auth: Auth,
    private toast: Toast,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.toast.show('Please log in to spin the reward wheel');
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/spin' } });
      return;
    }
    this.loadStatus();
    this.loadCoupons();
    this.startCountdownTimer();
  }

  ngOnDestroy(): void {
    if (this.timerRef) clearInterval(this.timerRef);
  }

  loadStatus(): void {
    const uid = this.auth.userId();
    if (!uid) return;
    this.shop.spinStatus(uid).subscribe({
      next: (res: any) => {
        this.prizes = res.prizes || [];
        this.canSpin = res.canSpin === true;
        this.nextSpinAt = res.nextSpinAt;
        this.nextSpinLabel = res.nextSpinLabel;
        this.drawWheel();
      },
      error: () => {
        this.toast.err('Failed to load wheel status');
      }
    });
  }

  loadCoupons(): void {
    const uid = this.auth.userId();
    if (!uid) return;
    this.shop.myCoupons(uid).subscribe({
      next: (list: any) => {
        this.myCouponsList = Array.isArray(list) ? list : [];
      }
    });
  }

  activeCoupons(): any[] {
    return this.myCouponsList.filter(c => c.status === 'ACTIVE');
  }

  /* ---- Draw Canvas Wheel ---- */
  drawWheel(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.prizes.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const numSlices = this.prizes.length;
    const arc = (2 * Math.PI) / numSlices;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = centerX - 12;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < numSlices; i++) {
      const p = this.prizes[i];
      const angle = i * arc;

      // Slice background
      ctx.beginPath();
      ctx.fillStyle = p.color || '#7c3aed';
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arc);
      ctx.lineTo(centerX, centerY);
      ctx.fill();

      // Slice border line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Outer rim bulb / peg
      const pegAngle = angle + arc / 2;
      const pegX = centerX + Math.cos(pegAngle) * (radius - 8);
      const pegY = centerY + Math.sin(pegAngle) * (radius - 8);
      ctx.beginPath();
      ctx.arc(pegX, pegY, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#fef08a';
      ctx.fill();

      // Text label + emoji
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;

      // Draw short label + emoji
      ctx.fillText((p.emoji || '') + ' ' + (p.shortLabel || p.label), radius - 24, 5);
      ctx.restore();
    }
  }

  /* ---- Spin Trigger & Deceleration ---- */
  spin(): void {
    if (!this.canSpin || this.isSpinning) return;
    const uid = this.auth.userId();
    if (!uid) return;

    this.isSpinning = true;

    this.shop.spinWheel(uid).subscribe({
      next: (res: any) => {
        const winningIndex = res.wheelIndex ?? 0;
        const numSlices = this.prizes.length || 8;
        const sliceAngle = 360 / numSlices;

        // Pointer is at TOP (270 degrees / -90 degrees).
        // Segment i spans [i * sliceAngle, (i + 1) * sliceAngle].
        // To place center of segment i at 270 deg:
        const sliceCenter = (winningIndex * sliceAngle) + (sliceAngle / 2);
        const stopAngle = (270 - sliceCenter + 360) % 360;

        // 6 full spins + stop angle
        const extraRotations = 6 * 360;
        const targetRotation = this.currentRotation + (360 - (this.currentRotation % 360)) + extraRotations + stopAngle;

        this.currentRotation = targetRotation;

        // Wait for 4.8s CSS transition
        setTimeout(() => {
          this.isSpinning = false;
          this.canSpin = false;
          this.nextSpinAt = res.nextSpinAt;
          this.nextSpinLabel = res.nextSpinLabel;
          this.wonResult = res;
          this.showWinnerModal = true;
          this.loadCoupons();
          if (res.points > 0) {
            this.toast.ok(`⭐ Won ${res.points} points! Added to wallet.`);
          }
        }, 5000);
      },
      error: (err) => {
        this.isSpinning = false;
        this.toast.err(err.error?.message || 'Spin failed or already spun today');
        this.loadStatus();
      }
    });
  }

  closeWinnerModal(): void {
    this.showWinnerModal = false;
  }

  copyCode(code: string): void {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      this.copiedCode = code;
      this.toast.ok(`Coupon ${code} copied to clipboard!`);
      setTimeout(() => (this.copiedCode = ''), 3000);
    });
  }

  statusBadgeClass(status: string): string {
    if (status === 'ACTIVE') return 'ok';
    if (status === 'USED') return 'info';
    return 'warn';
  }

  /* ---- 24-Hour Real-Time Countdown Timer ---- */
  startCountdownTimer(): void {
    this.updateCountdown();
    this.timerRef = setInterval(() => this.updateCountdown(), 1000);
  }

  updateCountdown(): void {
    if (!this.nextSpinAt) {
      // Default to next midnight
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diffMs = midnight.getTime() - now.getTime();
      this.formatDiff(Math.max(0, diffMs));
      return;
    }

    const target = new Date(this.nextSpinAt).getTime();
    const diff = target - Date.now();
    if (diff <= 0) {
      this.countdown = { hours: '00', minutes: '00', seconds: '00' };
      if (!this.canSpin && !this.isSpinning) {
        this.loadStatus();
      }
    } else {
      this.formatDiff(diff);
    }
  }

  formatDiff(ms: number): void {
    const totalSecs = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    this.countdown = {
      hours: String(hrs).padStart(2, '0'),
      minutes: String(mins).padStart(2, '0'),
      seconds: String(secs).padStart(2, '0')
    };
  }
}

