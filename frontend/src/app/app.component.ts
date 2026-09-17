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
      <div class="topbar-inner">
        <a routerLink="/" class="brand" aria-label="NextGen Shop home">
          <span class="brand-mark">N</span>
          <span>NextGen Shop<small>E-Commerce Platform</small></span>
        </a>
        <button class="icon-btn" (click)="menuOpen = !menuOpen" aria-label="Toggle menu">☰</button>
        <form class="nav-search" [class.open]="menuOpen" (ngSubmit)="goSearch()">
          <input [(ngModel)]="q" name="q" placeholder="Search headphones, sneakers, groceries…" aria-label="Search products">
        </form>
        <nav class="nav-links" [class.open]="menuOpen" aria-label="Primary">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" (click)="menuOpen=false">Home</a>
          <a routerLink="/products" routerLinkActive="active" (click)="menuOpen=false">Shop</a>
          <a routerLink="/cart" *ngIf="auth.isLoggedIn()" routerLinkActive="active" (click)="menuOpen=false">
            Cart <span class="cart-count" *ngIf="cartCount>0">{{ cartCount }}</span>
          </a>
          <a routerLink="/orders" *ngIf="auth.isLoggedIn()" routerLinkActive="active" (click)="menuOpen=false">Orders</a>
          <a routerLink="/returns" *ngIf="auth.isLoggedIn()" routerLinkActive="active" (click)="menuOpen=false">Returns</a>
          <a routerLink="/admin" *ngIf="auth.isAdmin()" routerLinkActive="active" (click)="menuOpen=false">Admin</a>
          <span class="pill" *ngIf="auth.isLoggedIn() && walletBal!==null" title="Reward wallet balance">{{ walletBal }} pts</span>
          <a routerLink="/wallet" *ngIf="auth.isLoggedIn()" routerLinkActive="active" (click)="menuOpen=false">Wallet</a>
          <a routerLink="/profile" *ngIf="auth.isLoggedIn()" routerLinkActive="active" (click)="menuOpen=false">Profile</a>
          <a routerLink="/login" *ngIf="!auth.isLoggedIn()">Login</a>
          <a routerLink="/register" *ngIf="!auth.isLoggedIn()" routerLinkActive="active">Sign up</a>
          <button class="linklike" *ngIf="auth.isLoggedIn()" (click)="logout()">Logout</button>
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
          <p class="muted">Personalized catalog, transparent condition-based returns, and a reward wallet (1 pt = Rs.1, up to 20% off).</p>
        </div>
        <div>
          <h4>Shop</h4>
          <a routerLink="/products">All products</a>
          <a routerLink="/cart">Cart</a>
          <a routerLink="/orders">Track orders</a>
          <a routerLink="/returns">Returns & rewards</a>
        </div>
        <div>
          <h4>Account</h4>
          <a routerLink="/wallet">Reward wallet</a>
          <a routerLink="/profile">Profile & history</a>
          <a routerLink="/login">Login</a>
          <a routerLink="/admin" *ngIf="auth.isAdmin()">Admin dashboard</a>
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
  cartCount = 0;
  walletBal: number | null = null;
  toasts: any[] = [];
  isAdminPage = false;

  constructor(public auth: AuthService, private shop: ShopService, private router: Router, private toast: ToastService) {
    this.toast.toasts$.subscribe((t) => (this.toasts = t));
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.menuOpen = false;
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

  goSearch(): void {
    this.router.navigate(['/products'], { queryParams: { q: this.q } });
  }

  isAdminRoute(): boolean {
    return this.isAdminPage;
  }

  logout(): void {
    this.auth.logout();
    this.cartCount = 0;
    this.walletBal = null;
    this.router.navigate(['/']);
  }
}
