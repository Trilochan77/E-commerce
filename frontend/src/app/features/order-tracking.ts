import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Shop } from '../core/shop';
import { Auth } from '../core/auth';
import { Toast } from '../shared/toast';

const ORDER_STAGES = [
  { key: 'PLACED', label: 'Order Placed', icon: '📝', desc: 'Order received & verified' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: '✓', desc: 'Inventory allocated' },
  { key: 'PACKED', label: 'Packed', icon: '📦', desc: 'Tamper-sealed at hub' },
  { key: 'SHIPPED', label: 'Shipped', icon: '🚚', desc: 'Handed to express logistics' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🚴', desc: 'Courier on the road' },
  { key: 'DELIVERED', label: 'Delivered', icon: '🎉', desc: 'Package safely handed over' }
];

declare const google: any;

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-order-tracking',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="breadcrumb">
      <a routerLink="/">Home</a> / <a routerLink="/orders">Orders</a> / <span>Live Tracking</span>
    </div>

    <div class="tracking-container" *ngIf="tracking; else loadingTpl">
      <!-- Header -->
      <div class="page-head" style="align-items:flex-start">
        <div>
          <div class="row" style="margin:0 0 6px 0;align-items:center;gap:8px">
            <h1 style="font-size:26px;margin:0">Live Delivery Tracking</h1>
            <span class="badge info" style="font-size:13px">{{ tracking.trackingNumber }}</span>
            <span class="badge" [ngClass]="statusBadgeClass(orderStatus)">{{ statusLabel(orderStatus) }}</span>
          </div>
          <p class="muted" style="margin:0">
            Order #<strong>{{ orderId }}</strong> · Carrier: <strong>{{ tracking.carrier }}</strong>
          </p>
        </div>

        <div class="row" style="margin:0;gap:8px;flex-wrap:wrap">
          <button class="btn-ghost btn-sm" (click)="toggleViewMode()">
            {{ viewMode === 'google' ? '🗺 Switch to Radar Map' : '🛰 Switch to Google Maps' }}
          </button>
          <button class="btn-ghost btn-sm" (click)="openApiKeyModal = true">
            🔑 Google Maps API Key
          </button>
          <button class="btn-ghost btn-sm" (click)="loadTracking()">
            ↻ Refresh
          </button>
        </div>
      </div>

      <!-- ETA & Privacy Notification Ribbon -->
      <div class="eta-banner">
        <div class="eta-left">
          <span class="eta-icon">{{ orderStatus === 'DELIVERED' ? '🎉' : '⏱' }}</span>
          <div>
            <div class="eta-title">{{ tracking.estimatedArrival || 'Calculating arrival time…' }}</div>
            <div class="eta-subtitle">
              <span *ngIf="orderStatus !== 'DELIVERED' && tracking.distanceKm > 0">
                {{ tracking.distanceKm }} km away ·
              </span>
              Next stop: {{ tracking.destination?.name || 'Customer Address' }}
            </div>
          </div>
        </div>
        <div class="privacy-pill" title="Customer address is fuzzed within safe street zone to safeguard privacy">
          <span class="lock-icon">🔒</span>
          <span>Customer Privacy Shield Active · Exact Unit Encrypted</span>
        </div>
      </div>

      <!-- Map & Live Courier Grid -->
      <div class="map-section-grid">
        <!-- Interactive Map Container -->
        <div class="map-card card" style="padding:0;overflow:hidden;position:relative">
          <!-- Google Maps Mode -->
          <div #gmapContainer class="google-map-canvas" [style.display]="viewMode === 'google' ? 'block' : 'none'"></div>

          <!-- Radar / Vector Map Mode (Default & Instant fallback) -->
          <div class="vector-radar-canvas" *ngIf="viewMode === 'radar'">
            <svg class="radar-svg" viewBox="0 0 700 420" preserveAspectRatio="xMidYMid meet">
              <defs>
                <radialGradient id="radarPulse" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#a855f7" stop-opacity="0.4"/>
                  <stop offset="100%" stop-color="#7c3aed" stop-opacity="0"/>
                </radialGradient>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#8b5cf6"/>
                  <stop offset="100%" stop-color="#ec4899"/>
                </linearGradient>
              </defs>

              <!-- Map grid background -->
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
              </pattern>
              <rect width="100%" height="100%" fill="#090d16" />
              <rect width="100%" height="100%" fill="url(#grid)" />

              <!-- Street Arteries -->
              <path d="M 60 380 Q 200 350 320 280 T 620 90" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="14" stroke-linecap="round"/>
              <path d="M 120 40 Q 240 180 320 280 T 480 380" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="10" stroke-linecap="round"/>
              <path d="M 280 400 L 400 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="6"/>
              <path d="M 50 160 L 660 180" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="6"/>

              <!-- Active Delivery Route Polyline -->
              <path [attr.d]="svgRoutePath()" fill="none" stroke="url(#routeGradient)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
              <path [attr.d]="svgRoutePath()" fill="none" stroke="#f472b6" stroke-width="2" stroke-dasharray="6 6" class="flowing-line"/>

              <!-- Waypoint Stations -->
              <g *ngFor="let wp of tracking.routeWaypoints; let i = index">
                <circle [attr.cx]="svgCoord(wp).x" [attr.cy]="svgCoord(wp).y" r="5" fill="#334155" stroke="#94a3b8" stroke-width="2"/>
              </g>

              <!-- Privacy Zone Circle around Destination -->
              <circle [attr.cx]="destSvgCoord().x" [attr.cy]="destSvgCoord().y" r="38" fill="url(#radarPulse)" class="pulsing-circle"/>
              <circle [attr.cx]="destSvgCoord().x" [attr.cy]="destSvgCoord().y" r="38" fill="none" stroke="#a855f7" stroke-dasharray="4 4" stroke-width="1.5" opacity="0.6"/>

              <!-- Warehouse Marker -->
              <g [attr.transform]="'translate(' + (whSvgCoord().x - 16) + ',' + (whSvgCoord().y - 16) + ')'">
                <rect width="32" height="32" rx="8" fill="#1e293b" stroke="#7c3aed" stroke-width="2"/>
                <text x="16" y="21" font-size="16" text-anchor="middle">🏢</text>
              </g>

              <!-- Destination Marker (Customer Home) -->
              <g [attr.transform]="'translate(' + (destSvgCoord().x - 16) + ',' + (destSvgCoord().y - 16) + ')'">
                <circle cx="16" cy="16" r="16" fill="#7c3aed" stroke="#fff" stroke-width="2"/>
                <text x="16" y="21" font-size="16" text-anchor="middle">📍</text>
              </g>

              <!-- Moving Courier Marker -->
              <g [attr.transform]="'translate(' + (courierSvgCoord().x) + ',' + (courierSvgCoord().y) + ')'" class="courier-vehicle">
                <circle cx="0" cy="0" r="20" fill="url(#radarPulse)" class="courier-pulse"/>
                <circle cx="0" cy="0" r="15" fill="#0f172a" stroke="#ec4899" stroke-width="3"/>
                <text x="0" y="5" font-size="14" text-anchor="middle">🚴</text>
              </g>
            </svg>

            <!-- Map Floating Badges -->
            <div class="map-floating-panel">
              <div class="live-indicator">
                <span class="blinking-dot"></span>
                <span>{{ simRunning ? 'LIVE COURIER GPS ACTIVE' : 'GPS TRACKING CONNECTED' }}</span>
              </div>
              <div class="map-mode-tag">
                Vector Radar Simulation Engine
              </div>
            </div>
          </div>

          <!-- Bottom Map Status Bar -->
          <div class="map-footer-bar">
            <div>
              <span class="muted" style="font-size:12px">Current Location:</span>
              <strong style="font-size:13px;margin-left:4px">
                {{ tracking.courierLocation?.name || 'On route to destination' }}
              </strong>
            </div>
            <div class="coord-pill">
              GPS: {{ formatCoord(tracking.courierLocation?.lat) }}° N, {{ formatCoord(tracking.courierLocation?.lng) }}° E
            </div>
          </div>
        </div>

        <!-- Right Side: Delivery Partner & Secure Handover -->
        <div class="delivery-details-sidebar">
          <!-- Delivery Partner Card -->
          <div class="card tight">
            <h3 style="font-size:16px;margin:0 0 12px 0;display:flex;align-items:center;gap:6px">
              <span>🚴</span> Delivery Partner
            </h3>
            <div class="partner-card">
              <div class="partner-avatar">
                {{ (tracking.deliveryPersonName || 'R')[0] }}
              </div>
              <div style="flex:1">
                <div class="partner-name">
                  {{ tracking.deliveryPersonName }}
                  <span class="badge ok" style="padding:1px 6px;font-size:11px">★ {{ tracking.courierRating }}</span>
                </div>
                <div class="muted" style="font-size:12px;margin-top:2px">
                  Vehicle: <strong>{{ tracking.vehicleNumber }}</strong>
                </div>
                <div class="muted" style="font-size:12px">
                  Masked contact: <strong>{{ tracking.deliveryPersonPhoneMasked }}</strong>
                </div>
              </div>
            </div>
            <div class="row" style="margin-top:12px;gap:8px">
              <a [href]="'tel:' + tracking.deliveryPersonPhone" class="btn-ghost btn-sm" style="flex:1;text-align:center;text-decoration:none">
                📞 Call Courier (Relay)
              </a>
            </div>
          </div>

          <!-- Secure Handover PIN / OTP -->
          <div class="card tight otp-card">
            <div class="otp-header">
              <span class="shield-icon">🛡️</span>
              <div>
                <strong>Delivery Handover OTP</strong>
                <p class="muted" style="font-size:11px;margin:0">Share with {{ tracking.deliveryPersonName }} upon arrival</p>
              </div>
            </div>
            <div class="otp-display">
              <span class="otp-digit" *ngFor="let d of (tracking.deliveryOtp || '2333').split('')">{{ d }}</span>
            </div>
            <p class="muted" style="font-size:11px;margin:8px 0 0 0;text-align:center">
              ✓ Prevents wrong delivery · Only verified recipient can receive parcel
            </p>
          </div>

          <!-- Delivery Address (Privacy-Protected View) -->
          <div class="card tight">
            <h3 style="font-size:15px;margin:0 0 8px 0">📍 Delivery Destination</h3>
            <p style="margin:0 0 4px 0;font-weight:600;font-size:13px">
              {{ tracking.destination?.formattedAddress }}
            </p>
            <div class="privacy-note">
              <span>🔒</span>
              <span><strong>Privacy Protected:</strong> Pin snapped to neighborhood gate checkpoint to protect your exact home location.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 6-Stage Order Progress Bar -->
      <div class="card progress-card">
        <h3 style="font-size:18px;margin:0 0 16px 0">Order Progress</h3>
        <div class="stepper-horizontal">
          <div class="step-item" *ngFor="let stage of stages; let i = index" [ngClass]="stepClass(stage.key)">
            <div class="step-circle">
              <span class="step-icon">{{ isStepDone(stage.key) ? '✓' : stage.icon }}</span>
            </div>
            <div class="step-label">{{ stage.label }}</div>
            <div class="step-desc">{{ stage.desc }}</div>
            <div class="step-line" *ngIf="i < stages.length - 1"></div>
          </div>
        </div>
      </div>

      <!-- Demo Tracking Simulator Deck -->
      <div class="card tight demo-card">
        <div class="demo-header">
          <div>
            <strong style="color:#c084fc">🎮 Demo Tracking Mode & Simulation Deck</strong>
            <p class="muted" style="font-size:12px;margin:2px 0 0 0">
              Test real-time GPS courier motion, waypoint navigation, and stage transitions when live hardware GPS is simulated.
            </p>
          </div>
          <div class="row" style="margin:0;gap:8px">
            <button class="primary btn-sm" (click)="toggleSimulation()">
              {{ simRunning ? '⏸ Pause Simulation' : '▶ Start Live Run' }}
            </button>
            <button class="btn-ghost btn-sm" (click)="resetDemo()">
              ↺ Reset
            </button>
          </div>
        </div>

        <div class="demo-controls-row">
          <div class="demo-btn-group">
            <span class="muted" style="font-size:12px">Fast-Forward Stage:</span>
            <button class="btn-ghost btn-sm" *ngFor="let s of stages" (click)="setStage(s.key)" [class.active-stage]="orderStatus === s.key">
              {{ s.label }}
            </button>
          </div>
          <div class="demo-speed-group">
            <span class="muted" style="font-size:12px">Speed:</span>
            <button class="btn-ghost btn-sm" [class.active-speed]="simSpeed === 1" (click)="simSpeed = 1">1x</button>
            <button class="btn-ghost btn-sm" [class.active-speed]="simSpeed === 2" (click)="simSpeed = 2">2x</button>
            <button class="btn-ghost btn-sm" [class.active-speed]="simSpeed === 5" (click)="simSpeed = 5">5x</button>
          </div>
        </div>
      </div>

      <!-- Delivery Activity Timeline -->
      <div class="card tight">
        <h3 style="font-size:18px;margin:0 0 16px 0">Delivery Status Timeline</h3>
        <div class="timeline-v2">
          <div class="timeline-row" *ngFor="let u of tracking.updates">
            <div class="tl-dot" [ngClass]="u.status === orderStatus ? 'active' : ''"></div>
            <div class="tl-content">
              <div class="row" style="justify-content:space-between;margin:0">
                <strong>{{ u.title }}</strong>
                <span class="muted" style="font-size:12px">{{ u.timestamp | date:'shortTime' }} · {{ u.timestamp | date:'mediumDate' }}</span>
              </div>
              <p style="margin:4px 0 2px 0;font-size:13px">{{ u.description }}</p>
              <div class="muted" style="font-size:11px" *ngIf="u.location">Location: {{ u.location }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- API Key Modal -->
    <div class="modal-backdrop" *ngIf="openApiKeyModal" (click)="openApiKeyModal = false">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <h3>Configure Google Maps API Key</h3>
        <p class="muted" style="font-size:13px">
          Enter your Google Maps JavaScript API key below to render the official satellite/road map layer. If left empty, the interactive Vector Radar map engine is used seamlessly.
        </p>
        <input [(ngModel)]="apiKeyInput" placeholder="AIzaSy..." style="width:100%;margin:12px 0;box-sizing:border-box" />
        <div class="row" style="justify-content:flex-end;gap:8px">
          <button class="btn-ghost btn-sm" (click)="openApiKeyModal = false">Cancel</button>
          <button class="primary btn-sm" (click)="saveApiKey()">Save & Switch to Google Maps</button>
        </div>
      </div>
    </div>

    <ng-template #loadingTpl>
      <div class="card" style="text-align:center;padding:48px">
        <span class="spinner"></span>
        <p class="muted" style="margin-top:12px">Connecting to NextGen Logistics Satellite System…</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .tracking-container {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .eta-banner {
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.25), rgba(236, 72, 153, 0.15));
      border: 1px solid rgba(168, 85, 247, 0.4);
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .eta-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .eta-icon {
      font-size: 32px;
    }
    .eta-title {
      font-size: 20px;
      font-weight: 700;
      color: #f8fafc;
    }
    .eta-subtitle {
      font-size: 13px;
      color: #cbd5e1;
      margin-top: 2px;
    }
    .privacy-pill {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(168, 85, 247, 0.3);
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 12px;
      color: #e2e8f0;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .map-section-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 16px;
    }
    @media (max-width: 860px) {
      .map-section-grid {
        grid-template-columns: 1fr;
      }
    }
    .google-map-canvas {
      width: 100%;
      height: 420px;
      background: #0f172a;
    }
    .vector-radar-canvas {
      position: relative;
      width: 100%;
      height: 420px;
      background: #090d16;
      overflow: hidden;
    }
    .radar-svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    .pulsing-circle {
      animation: pulse 2.5s infinite ease-out;
      transform-origin: center;
    }
    .courier-pulse {
      animation: courierPulse 1.8s infinite ease-out;
    }
    @keyframes pulse {
      0% { r: 16; opacity: 0.9; }
      100% { r: 55; opacity: 0; }
    }
    @keyframes courierPulse {
      0% { r: 10; opacity: 0.8; }
      100% { r: 28; opacity: 0; }
    }
    .flowing-line {
      animation: flowDash 1s linear infinite;
    }
    @keyframes flowDash {
      to { stroke-dashoffset: -12; }
    }
    .map-floating-panel {
      position: absolute;
      top: 14px;
      left: 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      pointer-events: none;
    }
    .live-indicator {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(168, 85, 247, 0.4);
      padding: 5px 12px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 6px;
      letter-spacing: 0.5px;
    }
    .blinking-dot {
      width: 8px;
      height: 8px;
      background: #38bdf8;
      border-radius: 50%;
      animation: blink 1.2s infinite ease-in-out;
    }
    @keyframes blink {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.3; transform: scale(0.7); }
    }
    .map-mode-tag {
      background: rgba(15, 23, 42, 0.7);
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 10px;
      color: #94a3b8;
    }
    .map-footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      background: #111827;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      flex-wrap: wrap;
      gap: 8px;
    }
    .coord-pill {
      font-family: monospace;
      font-size: 11px;
      color: #a855f7;
      background: rgba(168, 85, 247, 0.1);
      padding: 3px 8px;
      border-radius: 4px;
    }
    .delivery-details-sidebar {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .partner-card {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .partner-avatar {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 700;
      color: #fff;
    }
    .partner-name {
      font-weight: 700;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .otp-card {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9));
      border: 1px dashed rgba(168, 85, 247, 0.5);
    }
    .otp-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .shield-icon {
      font-size: 22px;
    }
    .otp-display {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 10px;
    }
    .otp-digit {
      width: 40px;
      height: 46px;
      background: #0f172a;
      border: 2px solid #7c3aed;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 800;
      color: #c084fc;
      font-family: monospace;
      box-shadow: 0 0 10px rgba(124, 58, 237, 0.3);
    }
    .privacy-note {
      display: flex;
      gap: 6px;
      font-size: 11px;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.03);
      padding: 8px;
      border-radius: 6px;
      margin-top: 6px;
    }
    .progress-card {
      padding: 20px;
    }
    .stepper-horizontal {
      display: flex;
      justify-content: space-between;
      position: relative;
    }
    @media (max-width: 768px) {
      .stepper-horizontal {
        flex-direction: column;
        gap: 16px;
      }
    }
    .step-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      text-align: center;
    }
    .step-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #1e293b;
      border: 2px solid #475569;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      z-index: 2;
      transition: all 0.3s;
    }
    .step-label {
      font-size: 12px;
      font-weight: 600;
      margin-top: 8px;
      color: #94a3b8;
    }
    .step-desc {
      font-size: 10px;
      color: #64748b;
      max-width: 100px;
      margin-top: 2px;
    }
    .step-line {
      position: absolute;
      top: 18px;
      left: 50%;
      width: 100%;
      height: 3px;
      background: #334155;
      z-index: 1;
    }
    .step-item.done .step-circle {
      background: #7c3aed;
      border-color: #a855f7;
      color: #fff;
    }
    .step-item.done .step-label {
      color: #f1f5f9;
    }
    .step-item.done .step-line {
      background: #7c3aed;
    }
    .step-item.active .step-circle {
      background: #ec4899;
      border-color: #f472b6;
      box-shadow: 0 0 12px rgba(236, 72, 153, 0.6);
      color: #fff;
      transform: scale(1.15);
    }
    .step-item.active .step-label {
      color: #ec4899;
      font-weight: 700;
    }
    .demo-card {
      background: linear-gradient(135deg, rgba(88, 28, 135, 0.2), rgba(15, 23, 42, 0.6));
      border: 1px solid rgba(168, 85, 247, 0.3);
    }
    .demo-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    .demo-controls-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .demo-btn-group, .demo-speed-group {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .active-stage {
      background: #7c3aed !important;
      color: #fff !important;
    }
    .active-speed {
      background: #a855f7 !important;
      color: #fff !important;
    }
    .timeline-v2 {
      display: flex;
      flex-direction: column;
      gap: 16px;
      position: relative;
      padding-left: 20px;
    }
    .timeline-v2::before {
      content: '';
      position: absolute;
      top: 8px;
      bottom: 8px;
      left: 6px;
      width: 2px;
      background: #334155;
    }
    .timeline-row {
      position: relative;
      display: flex;
      gap: 14px;
    }
    .tl-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #1e293b;
      border: 2px solid #64748b;
      position: absolute;
      left: -20px;
      top: 3px;
    }
    .tl-dot.active {
      background: #ec4899;
      border-color: #f472b6;
      box-shadow: 0 0 8px #ec4899;
    }
    .tl-content {
      flex: 1;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 10px 14px;
    }
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    .modal-box {
      background: #1e293b;
      border: 1px solid rgba(168, 85, 247, 0.3);
      border-radius: 12px;
      padding: 24px;
      width: 90%;
      max-width: 480px;
    }
  `]
})
export class OrderTracking implements OnInit, OnDestroy {
  @ViewChild('gmapContainer') gmapElement!: ElementRef;

  orderId = '';
  tracking: any = null;
  orderStatus = 'PLACED';
  stages = ORDER_STAGES;

  viewMode: 'radar' | 'google' = 'radar';
  openApiKeyModal = false;
  apiKeyInput = '';

  simRunning = false;
  simSpeed = 1;
  simTimer: any = null;
  simWaypointIndex = 0;

  // Google Maps objects
  map: any = null;
  courierMarker: any = null;
  whMarker: any = null;
  destMarker: any = null;
  privacyCircle: any = null;
  routePolyline: any = null;

  constructor(
    private route: ActivatedRoute,
    private shop: Shop,
    private auth: Auth,
    private toast: Toast
  ) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.paramMap.get('orderId') || '';
    const savedKey = localStorage.getItem('GOOGLE_MAPS_API_KEY');
    if (savedKey) {
      this.apiKeyInput = savedKey;
      this.viewMode = 'google';
    }
    this.loadTracking();
  }

  ngOnDestroy(): void {
    this.stopSimulation();
  }

  loadTracking(): void {
    if (!this.orderId) return;
    this.shop.orderTracking(this.orderId).subscribe({
      next: (t: any) => {
        this.tracking = t;
        // Determine orderStatus from last update or updates list
        if (t.updates && t.updates.length) {
          this.orderStatus = t.updates[t.updates.length - 1].status;
        } else {
          this.orderStatus = 'OUT_FOR_DELIVERY';
        }
        if (this.viewMode === 'google') {
          setTimeout(() => this.initGoogleMap(), 200);
        }
      },
      error: (e) => {
        this.toast.err(e.error?.message || 'Failed to load tracking details');
      }
    });
  }

  toggleViewMode(): void {
    if (this.viewMode === 'radar') {
      this.viewMode = 'google';
      setTimeout(() => this.initGoogleMap(), 100);
    } else {
      this.viewMode = 'radar';
    }
  }

  saveApiKey(): void {
    if (this.apiKeyInput.trim()) {
      localStorage.setItem('GOOGLE_MAPS_API_KEY', this.apiKeyInput.trim());
      this.toast.ok('Google Maps API Key saved');
      this.openApiKeyModal = false;
      this.viewMode = 'google';
      this.initGoogleMap(true);
    } else {
      localStorage.removeItem('GOOGLE_MAPS_API_KEY');
      this.toast.ok('Cleared API Key · Switched to Vector Radar');
      this.openApiKeyModal = false;
      this.viewMode = 'radar';
    }
  }

  initGoogleMap(reloadScript = false): void {
    const key = localStorage.getItem('GOOGLE_MAPS_API_KEY') || this.apiKeyInput;
    if (!key) {
      this.toast.show('No Google Maps API Key provided · Showing interactive Vector Radar');
      this.viewMode = 'radar';
      return;
    }

    if (typeof google === 'undefined' || !google.maps || reloadScript) {
      const scriptId = 'google-maps-sdk';
      const old = document.getElementById(scriptId);
      if (old) old.remove();

      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => this.renderGoogleMap();
      script.onerror = () => {
        this.toast.err('Google Maps failed to load. Falling back to Vector Radar mode.');
        this.viewMode = 'radar';
      };
      document.head.appendChild(script);
    } else {
      this.renderGoogleMap();
    }
  }

  renderGoogleMap(): void {
    if (!this.gmapElement || !this.tracking) return;
    try {
      const dest = this.tracking.destination || { lat: 20.2961, lng: 85.8245 };
      const wh = this.tracking.warehouse || { lat: 20.2641, lng: 85.7985 };
      const courier = this.tracking.courierLocation || wh;

      const center = {
        lat: (dest.lat + wh.lat) / 2,
        lng: (dest.lng + wh.lng) / 2
      };

      // Dark style theme for Google Maps
      const darkStyle = [
        { elementType: 'geometry', stylers: [{ color: '#181f2c' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#181f2c' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#273549' }] },
        { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
        { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#334155' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#090d16' }] }
      ];

      this.map = new google.maps.Map(this.gmapElement.nativeElement, {
        center,
        zoom: 13,
        styles: darkStyle,
        disableDefaultUI: false,
        zoomControl: true
      });

      // Warehouse marker
      this.whMarker = new google.maps.Marker({
        position: { lat: wh.lat, lng: wh.lng },
        map: this.map,
        title: wh.name || 'Fulfillment Hub',
        label: { text: '🏢', fontSize: '18px' }
      });

      // Destination marker with Privacy Shield
      this.destMarker = new google.maps.Marker({
        position: { lat: dest.lat, lng: dest.lng },
        map: this.map,
        title: 'Delivery Address (Privacy Masked)',
        label: { text: '📍', fontSize: '20px' }
      });

      // Privacy safety radius circle (100 meters)
      this.privacyCircle = new google.maps.Circle({
        strokeColor: '#a855f7',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#7c3aed',
        fillOpacity: 0.25,
        map: this.map,
        center: { lat: dest.lat, lng: dest.lng },
        radius: 120
      });

      // Courier Moving Marker
      this.courierMarker = new google.maps.Marker({
        position: { lat: courier.lat, lng: courier.lng },
        map: this.map,
        title: `Courier: ${this.tracking.deliveryPersonName}`,
        label: { text: '🚴', fontSize: '22px' }
      });

      // Polyline route
      const pathCoords = (this.tracking.routeWaypoints || []).map((w: any) => ({
        lat: w.lat,
        lng: w.lng
      }));

      this.routePolyline = new google.maps.Polyline({
        path: pathCoords,
        geodesic: true,
        strokeColor: '#ec4899',
        strokeOpacity: 0.9,
        strokeWeight: 4,
        map: this.map
      });

      // Auto-fit bounds
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: wh.lat, lng: wh.lng });
      bounds.extend({ lat: dest.lat, lng: dest.lng });
      bounds.extend({ lat: courier.lat, lng: courier.lng });
      this.map.fitBounds(bounds);
    } catch (err) {
      console.error('Google Maps render error:', err);
      this.viewMode = 'radar';
    }
  }

  updateGoogleMapCourier(): void {
    if (!this.map || !this.courierMarker || !this.tracking?.courierLocation) return;
    const cl = this.tracking.courierLocation;
    const latLng = new google.maps.LatLng(cl.lat, cl.lng);
    this.courierMarker.setPosition(latLng);
  }

  /* ---- SVG Radar Calculations ---- */
  whSvgCoord(): { x: number; y: number } {
    return { x: 90, y: 350 };
  }

  destSvgCoord(): { x: number; y: number } {
    return { x: 610, y: 70 };
  }

  svgCoord(wp: any): { x: number; y: number } {
    if (!this.tracking?.warehouse || !this.tracking?.destination) return { x: 350, y: 210 };
    const wh = this.tracking.warehouse;
    const dest = this.tracking.destination;

    const latNorm = (wp.lat - wh.lat) / ((dest.lat - wh.lat) || 0.0001);
    const lngNorm = (wp.lng - wh.lng) / ((dest.lng - wh.lng) || 0.0001);

    const x = 90 + Math.max(0, Math.min(1, lngNorm)) * 520;
    const y = 350 - Math.max(0, Math.min(1, latNorm)) * 280;
    return { x: Math.round(x), y: Math.round(y) };
  }

  courierSvgCoord(): { x: number; y: number } {
    if (!this.tracking?.courierLocation) return this.whSvgCoord();
    return this.svgCoord(this.tracking.courierLocation);
  }

  svgRoutePath(): string {
    const wps = this.tracking?.routeWaypoints || [];
    if (!wps.length) return 'M 90 350 L 610 70';
    return wps.map((wp: any, i: number) => {
      const c = this.svgCoord(wp);
      return (i === 0 ? 'M ' : 'L ') + c.x + ' ' + c.y;
    }).join(' ');
  }

  /* ---- Demo Simulation Engine ---- */
  toggleSimulation(): void {
    if (this.simRunning) {
      this.stopSimulation();
    } else {
      this.startSimulation();
    }
  }

  startSimulation(): void {
    this.simRunning = true;
    const wps = this.tracking?.routeWaypoints || [];
    if (!wps.length) return;

    if (this.simWaypointIndex >= wps.length - 1) {
      this.simWaypointIndex = 0;
    }

    const interval = Math.max(400, Math.round(2000 / this.simSpeed));
    this.simTimer = setInterval(() => {
      this.stepSimulation();
    }, interval);
    this.toast.ok('Live GPS simulation running');
  }

  stopSimulation(): void {
    this.simRunning = false;
    if (this.simTimer) {
      clearInterval(this.simTimer);
      this.simTimer = null;
    }
  }

  stepSimulation(): void {
    const wps = this.tracking?.routeWaypoints || [];
    if (!wps.length) return;

    this.simWaypointIndex++;
    if (this.simWaypointIndex >= wps.length) {
      this.simWaypointIndex = wps.length - 1;
      this.stopSimulation();
      this.setStage('DELIVERED');
      this.toast.ok('🎉 Courier has arrived! Order DELIVERED.');
      return;
    }

    const curWp = wps[this.simWaypointIndex];
    const totalWps = wps.length;
    const remainingKm = Math.max(0, Math.round(((totalWps - 1 - this.simWaypointIndex) * 0.8) * 10) / 10);
    const estMins = Math.max(0, (totalWps - 1 - this.simWaypointIndex) * 3);

    let stage = this.orderStatus;
    if (this.simWaypointIndex === totalWps - 1) {
      stage = 'DELIVERED';
    } else if (this.simWaypointIndex >= 3) {
      stage = 'OUT_FOR_DELIVERY';
    } else if (this.simWaypointIndex >= 1) {
      stage = 'SHIPPED';
    }

    this.orderStatus = stage;
    this.tracking.courierLocation = {
      lat: curWp.lat,
      lng: curWp.lng,
      name: curWp.name,
      heading: 40
    };
    this.tracking.distanceKm = remainingKm;
    this.tracking.estimatedMinutes = estMins;
    this.tracking.estimatedArrival = estMins === 0 ? 'Arrived' : `Arriving in ~${estMins} mins`;

    this.updateGoogleMapCourier();

    // Sync to backend periodically
    this.shop.updateTrackingLocation(this.orderId, {
      lat: curWp.lat,
      lng: curWp.lng,
      heading: 40,
      distanceKm: remainingKm,
      estimatedMinutes: estMins,
      status: stage
    }).subscribe();
  }

  setStage(stageKey: string): void {
    this.orderStatus = stageKey;
    this.shop.orderStatus(this.orderId, stageKey).subscribe({
      next: () => {
        this.loadTracking();
        this.toast.ok(`Stage updated → ${this.statusLabel(stageKey)}`);
      },
      error: (e) => this.toast.err(e.error?.message || 'Failed to update stage')
    });
  }

  resetDemo(): void {
    this.stopSimulation();
    this.simWaypointIndex = 0;
    this.shop.resetTracking(this.orderId).subscribe({
      next: () => {
        this.loadTracking();
        this.toast.ok('Tracking reset to initial order state');
      }
    });
  }

  /* ---- Stepper & Formatting Helpers ---- */
  isStepDone(key: string): boolean {
    const stageOrder = ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const curIdx = stageOrder.indexOf(this.orderStatus);
    const stepIdx = stageOrder.indexOf(key);
    return stepIdx < curIdx;
  }

  stepClass(key: string): string {
    const stageOrder = ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const curIdx = stageOrder.indexOf(this.orderStatus);
    const stepIdx = stageOrder.indexOf(key);
    if (stepIdx < curIdx) return 'done';
    if (stepIdx === curIdx) return 'active';
    return '';
  }

  statusBadgeClass(s: string): string {
    if (s === 'DELIVERED') return 'ok';
    if (s === 'OUT_FOR_DELIVERY') return 'badge-pulse';
    if (s === 'CANCELLED') return 'bad';
    return 'info';
  }

  statusLabel(s: string): string {
    const found = ORDER_STAGES.find(x => x.key === s);
    return found ? found.label : (s || '').replace(/_/g, ' ');
  }

  formatCoord(n: any): string {
    return Number(n || 0).toFixed(4);
  }
}
