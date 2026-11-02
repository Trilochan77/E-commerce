import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from './core/auth';
import { Shop } from './core/shop';
import { CompareStore } from './core/compare';
import { Toast } from './shared/toast';
import { AppLogo } from './shared/app-logo';
import { filter } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-root',
  imports: [CommonModule, RouterModule, FormsModule, AppLogo],
  template: `
    <header class="topbar" *ngIf="!isAdminPage">
      <!-- Announcement Banner -->
      <div class="announce-bar">
        <div class="announce-ticker">
          <span class="ticker-item"><span class="dot-live"></span> ⚡ Free Express Delivery on orders over ₹999</span>
          <span class="ticker-sep">·</span>
          <span class="ticker-item">🛡️ 7-Day Hassle-Free Returns &amp; Instant Wallet Cashback</span>
          <span class="ticker-sep">·</span>
          <span class="ticker-item"><a routerLink="/spin" style="color:#f472b6;font-weight:700">🎡 Spin &amp; Win up to 30% Off Today</a></span>
        </div>
      </div>

      <div class="topbar-inner">
        <!-- Professional Brand Logo -->
        <app-logo size="md" link="/"></app-logo>

        <!-- Search Bar with Live Suggestions & Voice Search -->
        <form class="nav-search" (ngSubmit)="goSearch()" role="search" style="position:relative">
          <div class="search-box" style="width:100%">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:.6">
              <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
            </svg>
            <input
              [(ngModel)]="q"
              name="q"
              placeholder="Search flagship tech, brands, audio…"
              aria-label="Search products"
              (input)="onNavSearchInput()"
              (focus)="showSuggestions = navSuggestions.length > 0"
              autocomplete="off"
            >
            <button
              type="button"
              class="voice-btn"
              [class.listening]="isListening"
              (click)="toggleNavVoiceSearch()"
              [title]="isListening ? 'Listening… click to stop' : 'Voice search'"
              aria-label="Voice search"
              style="margin-right:2px"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
              </svg>
            </button>
            <button type="submit">Search</button>
          </div>

          <!-- Autocomplete Suggestions Dropdown -->
          <div class="search-suggestions" *ngIf="showSuggestions && navSuggestions.length > 0" (mouseleave)="showSuggestions=false">
            <div class="suggestion-header">Suggestions</div>
            <div
              class="suggestion-item"
              *ngFor="let s of navSuggestions"
              (mousedown)="selectNavSuggestion(s)"
            >
              <img *ngIf="s.image" [src]="s.image" class="suggestion-thumb" alt="" />
              <div class="suggestion-text">
                <strong>{{ s.title }}</strong>
                <span *ngIf="s.brand && s.brand !== 'Other'">{{ s.brand }} · </span>
                <span class="suggestion-badge">{{ s.type }}</span>
              </div>
              <span class="suggestion-price" *ngIf="s.price">₹{{ s.price }}</span>
            </div>
          </div>
        </form>

        <!-- Navigation Links & Interactive Action Pills -->
        <div class="nav-actions">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link hide-m">Home</a>
          <a routerLink="/products" routerLinkActive="active" class="nav-link hide-m">Shop</a>
          <a routerLink="/compare" routerLinkActive="active" class="nav-link hide-m" title="Side-by-side comparison">
            ⇄ Compare<span class="nav-count" *ngIf="compareCount>0">{{ compareCount }}</span>
          </a>
          <a routerLink="/assistant" routerLinkActive="active" class="nav-link ai-nav-pill hide-m">
            <span class="ai-sparkle">✦</span> Ask AI
          </a>
          <a routerLink="/spin" routerLinkActive="active" class="nav-link spin-nav-pill hide-m">
            🎡 Spin &amp; Win
          </a>

          <!-- Wallet Points -->
          <a routerLink="/wallet" *ngIf="auth.isLoggedIn()" class="wallet-pill" title="Reward wallet balance">
            <span class="coin-icon">🪙</span> {{ walletBal ?? 0 }} pts
          </a>

          <!-- Notifications Center Pill -->
          <a routerLink="/notifications" *ngIf="auth.isLoggedIn()" routerLinkActive="active" class="cart-btn" aria-label="Notifications" title="Notifications">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
            <span class="hide-m">Alerts</span>
            <span class="cart-count bell-pulse" *ngIf="notificationCount>0">{{ notificationCount }}</span>
          </a>

          <!-- Wishlist -->
          <a routerLink="/wishlist" *ngIf="auth.isLoggedIn()" routerLinkActive="active" class="cart-btn" aria-label="Wishlist" title="View Wishlist">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            <span class="hide-m">Wishlist</span>
            <span class="cart-count" *ngIf="wishlistCount>0">{{ wishlistCount }}</span>
          </a>

          <!-- Cart -->
          <a routerLink="/cart" *ngIf="auth.isLoggedIn()" routerLinkActive="active" class="cart-btn primary-cart" aria-label="Cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 7h15l-1.5 9h-12z"/><path d="M6 7 5 4H2"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>
            <span class="hide-m">Cart</span>
            <span class="cart-count" *ngIf="cartCount>0">{{ cartCount }}</span>
          </a>

          <!-- Guest Auth CTA -->
          <ng-container *ngIf="!auth.isLoggedIn()">
            <a routerLink="/login" class="btn-login hide-m">Log in</a>
            <a routerLink="/register" class="btn-signup">Join NEXGEN</a>
          </ng-container>

          <!-- User Account Dropdown -->
          <div class="acct" *ngIf="auth.isLoggedIn()">
            <button class="avatar-btn" (click)="acctOpen = !acctOpen" [attr.aria-expanded]="acctOpen" aria-label="Account menu">
              {{ initial() }}
            </button>
            <div class="dropdown" *ngIf="acctOpen">
              <div class="dd-head">
                <strong style="font-size:13px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ displayEmail() }}</strong>
                <div class="muted" style="font-size:11px">🪙 {{ walletBal ?? 0 }} pts available</div>
              </div>
              <a routerLink="/profile" (click)="acctOpen=false">👤 Profile &amp; Settings</a>
              <a routerLink="/orders" (click)="acctOpen=false">📦 Order History &amp; Tracking</a>
              <a routerLink="/returns" (click)="acctOpen=false">🔄 Return Center</a>
              <a routerLink="/wallet" (click)="acctOpen=false">🪙 Reward Wallet</a>
              <a routerLink="/spin" (click)="acctOpen=false">🎡 Spin &amp; Win Rewards</a>
              <a routerLink="/wishlist" (click)="acctOpen=false">❤️ My Saved Wishlist</a>
              <a routerLink="/notifications" (click)="acctOpen=false">🔔 Notification Center</a>
              <a routerLink="/admin" *ngIf="auth.isAdmin()" (click)="acctOpen=false" style="color:var(--brand-3)">⚡ Admin Cockpit</a>
              <div class="divider" style="margin:4px 0"></div>
              <button (click)="logout()" style="color:var(--bad)">Sign out</button>
            </div>
          </div>

          <!-- Mobile Hamburger Toggle -->
          <button class="icon-btn" (click)="menuOpen = !menuOpen" aria-label="Toggle menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Drawer -->
      <div class="mobile-panel" [class.open]="menuOpen">
        <form class="m-search" (ngSubmit)="goSearch()">
          <div class="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            <input [(ngModel)]="q" name="m-q" placeholder="Search NEXGEN catalog" aria-label="Search products">
            <button
              type="button"
              class="voice-btn"
              [class.listening]="isListening"
              (click)="toggleNavVoiceSearch()"
              aria-label="Voice search"
              style="padding:4px"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
              </svg>
            </button>
            <button type="submit">Go</button>
          </div>
        </form>
        <nav>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">🏠 Home</a>
          <a routerLink="/products" routerLinkActive="active">🛍️ Shop All Products</a>
          <a routerLink="/compare" routerLinkActive="active">⇄ Compare ({{ compareCount }})</a>
          <a routerLink="/assistant" routerLinkActive="active" style="color:var(--brand-3)">✦ Ask AI Assistant</a>
          <a routerLink="/spin" routerLinkActive="active" style="color:#f472b6">🎡 Spin &amp; Win Rewards</a>
          <a routerLink="/cart" *ngIf="auth.isLoggedIn()" routerLinkActive="active">🛒 Cart ({{ cartCount }})</a>
          <a routerLink="/wishlist" *ngIf="auth.isLoggedIn()" routerLinkActive="active">❤️ Wishlist ({{ wishlistCount }})</a>
          <a routerLink="/notifications" *ngIf="auth.isLoggedIn()" routerLinkActive="active">🔔 Notifications ({{ notificationCount }})</a>
          <a routerLink="/orders" *ngIf="auth.isLoggedIn()" routerLinkActive="active">📦 Track Orders</a>
          <a routerLink="/returns" *ngIf="auth.isLoggedIn()" routerLinkActive="active">🔄 Returns &amp; Refunds</a>
          <a routerLink="/wallet" *ngIf="auth.isLoggedIn()" routerLinkActive="active">🪙 Wallet ({{ walletBal ?? 0 }} pts)</a>
          <a routerLink="/profile" *ngIf="auth.isLoggedIn()" routerLinkActive="active">👤 Profile &amp; Settings</a>
          <a routerLink="/admin" *ngIf="auth.isAdmin()" routerLinkActive="active">⚡ Admin Dashboard</a>
          <a routerLink="/login" *ngIf="!auth.isLoggedIn()">Log in</a>
          <a routerLink="/register" *ngIf="!auth.isLoggedIn()" style="color:var(--brand)">Create Account</a>
          <button class="m-link" *ngIf="auth.isLoggedIn()" (click)="logout()">Sign out</button>
        </nav>
      </div>
    </header>

    <main [class.admin-page]="isAdminPage" [class.container]="!isAdminPage">
      <router-outlet></router-outlet>
    </main>

    <!-- Professional Footer -->
    <footer class="footer" *ngIf="!isAdminPage">
      <div class="footer-inner">
        <div>
          <app-logo size="md" link="/"></app-logo>
          <p class="muted" style="max-width:320px;margin-top:10px;font-size:13px;line-height:1.6">
            The next-generation marketplace for premium consumer electronics, lifestyle tech, transparent condition-based returns, and instant reward wallet credits.
          </p>
          <div class="trust-pill-row" style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
            <span class="badge ok">✓ 100% Verified</span>
            <span class="badge info">⚡ Express Delivery</span>
            <span class="badge violet">🪙 1 Pt = ₹1</span>
          </div>
        </div>

        <div>
          <h4>Ecosystem</h4>
          <a routerLink="/products">All Products</a>
          <a routerLink="/compare">Product Comparison</a>
          <a routerLink="/assistant">✦ AI Shopping Assistant</a>
          <a routerLink="/spin">🎡 Spin &amp; Win Rewards</a>
          <a routerLink="/cart">Shopping Cart</a>
        </div>

        <div>
          <h4>Orders &amp; Policy</h4>
          <a routerLink="/orders">Track Live Orders</a>
          <a routerLink="/returns">Condition-Based Returns</a>
          <a routerLink="/wallet">Reward Wallet Credits</a>
          <a routerLink="/notifications">Price Drop Alerts</a>
          <a routerLink="/profile">Account Settings</a>
        </div>

        <div>
          <h4>Company</h4>
          <span class="muted" style="display:block;margin-bottom:6px">NEXGEN Global Commerce</span>
          <span class="muted" style="display:block;margin-bottom:6px">24/7 Priority Support</span>
          <a routerLink="/admin" *ngIf="auth.isAdmin()" style="color:var(--brand-3)">Admin Portal</a>
          <div style="margin-top:16px;color:#64748b;font-size:12px">
            © 2026 NEXGEN Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>

    <!-- Toast Notification Wrapper -->
    <div class="toast-wrap" aria-live="polite">
      <div class="toast" *ngFor="let t of toasts" [ngClass]="t.kind">
        <span>{{ t.msg }}</span>
      </div>
    </div>
  `
})
export class App implements OnInit {
  q = '';
  menuOpen = false;
  acctOpen = false;
  cartCount = 0;
  wishlistCount = 0;
  notificationCount = 0;
  private notificationBaselineLoaded = false;
  compareCount = 0;
  walletBal: number | null = null;
  toasts: any[] = [];
  isAdminPage = false;

  navSuggestions: any[] = [];
  showSuggestions = false;
  isListening = false;
  private navSearchTimer: any = null;
  private navRecognition: any = null;

  constructor(
    public auth: Auth,
    private shop: Shop,
    private router: Router,
    private toast: Toast,
    private compare: CompareStore
  ) {
    this.toast.toasts$.subscribe((t) => (this.toasts = t));
    this.compareCount = this.compare.count();
    this.compare.changed.subscribe((ids) => (this.compareCount = ids.length));
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.menuOpen = false;
      this.acctOpen = false;
      this.showSuggestions = false;
      this.isAdminPage = (e.url || this.router.url).split('?')[0].startsWith('/admin');
      this.refreshBadges();
    });
    this.isAdminPage = this.router.url.split('?')[0].startsWith('/admin');
    this.shop.cartChanged.subscribe(() => this.refreshBadges());
    this.shop.wishlistChanged.subscribe(() => this.refreshBadges());
    this.shop.notificationsChanged.subscribe(() => this.refreshNotificationCount());
  }

  ngOnInit(): void {
    this.refreshBadges();
    this.ensureNameStored();
    setInterval(() => { if (this.auth.isLoggedIn()) this.refreshNotificationCount(); }, 30000);
  }

  ensureNameStored(): void {
    if (!this.auth.isLoggedIn()) return;
    if (localStorage.getItem('ecom_name')) return;
    this.auth.me().subscribe({
      next: (u: any) => {
        if (u?.name) localStorage.setItem('ecom_name', u.name);
      },
      error: () => undefined
    });
  }

  refreshBadges(): void {
    if (!this.auth.isLoggedIn()) {
      this.cartCount = 0;
      this.wishlistCount = 0;
      this.notificationCount = 0;
      this.notificationBaselineLoaded = false;
      this.walletBal = null;
      return;
    }
    const uid = this.auth.userId();
    this.shop.cart(uid).subscribe({
      next: (c: any) => {
        this.cartCount = (c?.items || []).reduce((s: number, i: any) => s + (i.quantity || 0), 0);
      }, error: () => undefined
    });
    this.shop.wishlist(uid).subscribe({ next: (w: any) => { this.wishlistCount = (w?.items || []).length; }, error: () => { this.wishlistCount = 0; } });
    this.refreshNotificationCount();
    this.shop.wallet(uid).subscribe({
      next: (w: any) => {
        this.walletBal = w.balance ?? w.pointBalance ?? 0;
      }, error: () => (this.walletBal = null)
    });
  }

  refreshNotificationCount(): void {
    if (!this.auth.isLoggedIn()) {
      this.notificationCount = 0;
      this.notificationBaselineLoaded = false;
      return;
    }
    this.shop.notificationUnreadCount(this.auth.userId()).subscribe({
      next: (r: any) => {
        const nextCount = +r?.unread || 0;
        if (this.notificationBaselineLoaded && nextCount > this.notificationCount) {
          this.toast.ok(`🔔 ${nextCount - this.notificationCount} new notification${nextCount - this.notificationCount === 1 ? '' : 's'}`);
        }
        this.notificationCount = nextCount;
        this.notificationBaselineLoaded = true;
      },
      error: () => undefined
    });
  }

  onNavSearchInput(): void {
    clearTimeout(this.navSearchTimer);
    if (!this.q || this.q.trim().length < 2) {
      this.navSuggestions = [];
      this.showSuggestions = false;
      return;
    }
    this.navSearchTimer = setTimeout(() => {
      this.shop.searchSuggestions(this.q.trim()).subscribe({
        next: (items: any[]) => {
          this.navSuggestions = items || [];
          this.showSuggestions = this.navSuggestions.length > 0;
        },
        error: () => {
          this.navSuggestions = [];
          this.showSuggestions = false;
        }
      });
    }, 220);
  }

  selectNavSuggestion(s: any): void {
    this.showSuggestions = false;
    if (s.type === 'category' && s.id) {
      this.router.navigate(['/products'], { queryParams: { category: s.id } });
    } else if (s.type === 'brand') {
      this.router.navigate(['/products'], { queryParams: { brand: s.text } });
    } else if (s.type === 'product' && s.id) {
      this.router.navigate(['/products', s.id]);
    } else {
      this.q = s.text || s.title;
      this.goSearch();
    }
  }

  toggleNavVoiceSearch(): void {
    if (this.isListening) {
      if (this.navRecognition) {
        try { this.navRecognition.stop(); } catch (ignored) {}
      }
      this.isListening = false;
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.toast.err('Voice search is not supported by your browser.');
      return;
    }

    try {
      this.navRecognition = new SpeechRecognition();
      this.navRecognition.lang = 'en-US';
      this.navRecognition.continuous = false;
      this.navRecognition.interimResults = false;

      this.navRecognition.onstart = () => {
        this.isListening = true;
        this.toast.ok('🎙️ Listening... Speak now');
      };

      this.navRecognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          this.q = transcript.trim();
          this.toast.ok(`Recognized: "${this.q}"`);
          this.goSearch();
        }
        this.isListening = false;
      };

      this.navRecognition.onerror = (event: any) => {
        this.isListening = false;
        if (event.error === 'not-allowed') {
          this.toast.err('Microphone access denied.');
        } else {
          this.toast.err(`Voice search: ${event.error || 'could not recognize speech'}`);
        }
      };

      this.navRecognition.onend = () => {
        this.isListening = false;
      };

      this.navRecognition.start();
    } catch (err: any) {
      this.isListening = false;
      this.toast.err('Voice recognition failed to start: ' + (err.message || 'unknown error'));
    }
  }

  initial(): string {
    const name = localStorage.getItem('ecom_name');
    if (name && name.trim().length > 0) {
      return name.trim().charAt(0).toUpperCase();
    }
    const e = localStorage.getItem('ecom_email') || 'U';
    return e.charAt(0).toUpperCase();
  }

  displayEmail(): string {
    return localStorage.getItem('ecom_email') || 'Account';
  }

  goSearch(): void {
    this.menuOpen = false;
    this.showSuggestions = false;
    this.router.navigate(['/products'], { queryParams: { q: this.q } });
  }

  isAdminRoute(): boolean {
    return this.isAdminPage;
  }

  logout(): void {
    this.auth.logout();
    this.cartCount = 0;
    this.walletBal = null;
    this.acctOpen = false;
    this.menuOpen = false;
    this.router.navigate(['/']);
  }
}
