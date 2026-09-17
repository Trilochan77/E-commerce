import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from './core/auth.service';
import { ShopService } from './core/shop.service';
import { ToastService } from './shared/toast.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <header class="topbar" *ngIf="!isAdminPage">
      <div class="announce">Free delivery over Rs.999 &nbsp;·&nbsp; 14-day easy returns &nbsp;·&nbsp; <strong>Wallet points on every eligible return</strong></div>
      <div class="topbar-inner">
        <a routerLink="/" class="brand" aria-label="NextGen Shop home">
          <span class="brand-mark">N</span>
          <span>NextGen Shop<small>Value shopping, honest returns</small></span>
        </a>
        <form class="nav-search" (ngSubmit)="goSearch()" role="search">
          <div class="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            <input [(ngModel)]="q" name="q" placeholder="Search products, brands, categories" aria-label="Search products">
            <button type="submit">Search</button>
          </div>
        </form>
        <div class="nav-actions">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link hide-m">Home</a>
          <a routerLink="/products" routerLinkActive="active" class="nav-link hide-m">Shop</a>
          <a routerLink="/orders" *ngIf="auth.isLoggedIn()" routerLinkActive="active" class="nav-link hide-m">Orders</a>
          <a routerLink="/returns" *ngIf="auth.isLoggedIn()" routerLinkActive="active" class="nav-link hide-m">Returns</a>
          <a routerLink="/wallet" *ngIf="auth.isLoggedIn()" class="wallet-pill" title="Reward wallet">{{ walletBal ?? 0 }} pts</a>
          <a routerLink="/cart" *ngIf="auth.isLoggedIn()" routerLinkActive="active" class="cart-btn" aria-label="Cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 7h15l-1.5 9h-12z"/><path d="M6 7 5 4H2"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>
            <span class="hide-m">Cart</span>
            <span class="cart-count" *ngIf="cartCount>0">{{ cartCount }}</span>
          </a>
          <ng-container *ngIf="!auth.isLoggedIn()">
            <a routerLink="/login" class="btn-login hide-m">Log in</a>
            <a routerLink="/register" class="btn-signup">Sign up</a>
          </ng-container>
          <div class="acct" *ngIf="auth.isLoggedIn()">
            <button class="avatar-btn" (click)="acctOpen = !acctOpen" [attr.aria-expanded]="acctOpen" aria-label="Account menu">{{ initial() }}</button>
            <div class="dropdown" *ngIf="acctOpen">
              <div class="dd-head"><strong style="font-size:13px">{{ displayEmail() }}</strong><div class="muted">{{ walletBal ?? 0 }} pts balance</div></div>
              <a routerLink="/profile" (click)="acctOpen=false">Profile</a>
              <a routerLink="/wallet" (click)="acctOpen=false">Wallet</a>
              <a routerLink="/admin" *ngIf="auth.isAdmin()" (click)="acctOpen=false">Admin</a>
              <button (click)="logout()">Log out</button>
            </div>
          </div>
          <button class="icon-btn" (click)="menuOpen = !menuOpen" aria-label="Toggle menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>
        </div>
      </div>
      <div class="mobile-panel" [class.open]="menuOpen">
        <form class="m-search" (ngSubmit)="goSearch()">
          <div class="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            <input [(ngModel)]="q" name="m-q" placeholder="Search products" aria-label="Search products">
            <button type="submit">Go</button>
          </div>
        </form>
        <nav>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
          <a routerLink="/products" routerLinkActive="active">Shop all</a>
          <a routerLink="/cart" *ngIf="auth.isLoggedIn()" routerLinkActive="active">Cart ({{ cartCount }})</a>
          <a routerLink="/orders" *ngIf="auth.isLoggedIn()" routerLinkActive="active">Orders</a>
          <a routerLink="/returns" *ngIf="auth.isLoggedIn()" routerLinkActive="active">Returns</a>
          <a routerLink="/wallet" *ngIf="auth.isLoggedIn()" routerLinkActive="active">Wallet ({{ walletBal ?? 0 }} pts)</a>
          <a routerLink="/profile" *ngIf="auth.isLoggedIn()" routerLinkActive="active">Profile</a>
          <a routerLink="/login" *ngIf="!auth.isLoggedIn()">Log in</a>
          <button class="m-link" *ngIf="auth.isLoggedIn()" (click)="logout()">Log out</button>
        </nav>
      </div>
    </header>
    <main [class.admin-page]="isAdminPage" [class.container]="!isAdminPage">
      <router-outlet></router-outlet>
    </main>
    <footer class="footer" *ngIf="!isAdminPage">
      <div class="footer-inner">
        <div>
          <div class="brand" style="margin-bottom:8px"><span class="brand-mark">N</span><span>NextGen Shop</span></div>
          <p class="muted">Simple catalog, clear prices, transparent returns and a reward wallet (1 pt = Rs.1, up to 20% off).</p>
        </div>
        <div>
          <h4>Shop</h4>
          <a routerLink="/products">All products</a>
          <a routerLink="/cart">Cart</a>
          <a routerLink="/orders">Track orders</a>
          <a routerLink="/returns">Returns</a>
        </div>
        <div>
          <h4>Account</h4>
          <a routerLink="/wallet">Reward wallet</a>
          <a routerLink="/profile">Profile</a>
          <a routerLink="/login">Login</a>
          <a routerLink="/admin" *ngIf="auth.isAdmin()">Admin</a>
        </div>
      </div>
    </footer>
    <div class="toast-wrap" aria-live="polite">
      <div class="toast" *ngFor="let t of toasts" [ngClass]="t.kind">
        <span>{{ t.msg }}</span>
      </div>
    </div>
  `
})
export class AppComponent {
  q = '';
  menuOpen = false;
  acctOpen = false;
  cartCount = 0;
  walletBal: number | null = null;
  toasts: any[] = [];
  isAdminPage = false;

  constructor(public auth: AuthService, private shop: ShopService, private router: Router, private toast: ToastService) {
    this.toast.toasts$.subscribe((t) => (this.toasts = t));
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.menuOpen = false;
      this.acctOpen = false;
      this.isAdminPage = (e.url || this.router.url).split('?')[0].startsWith('/admin');
      this.refreshBadges();
    });
    this.isAdminPage = this.router.url.split('?')[0].startsWith('/admin');
  }

  ngOnInit(): void {
    this.refreshBadges();
  }

  refreshBadges(): void {
    if (!this.auth.isLoggedIn()) {
      this.cartCount = 0;
      this.walletBal = null;
      return;
    }
    const uid = this.auth.userId();
    this.shop.cart(uid).subscribe({ next: (c: any) => {
      this.cartCount = (c?.items || []).reduce((s: number, i: any) => s + (i.quantity || 0), 0);
    }, error: () => undefined });
    this.shop.wallet(uid).subscribe({ next: (w: any) => {
      this.walletBal = w.balance ?? w.pointBalance ?? 0;
    }, error: () => (this.walletBal = null) });
  }

  initial(): string {
    const e = localStorage.getItem('ecom_email') || 'U';
    return e.charAt(0).toUpperCase();
  }

  displayEmail(): string {
    return localStorage.getItem('ecom_email') || 'Account';
  }

  goSearch(): void {
    this.menuOpen = false;
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
