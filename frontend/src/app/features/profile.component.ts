import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ShopService } from '../core/shop.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="card">
      <h2>Profile</h2>
      <p class="muted">{{ me?.email }} · {{ me?.role }}</p>
      <div class="form-grid">
        <label>Name <input [(ngModel)]="name" name="name"></label>
        <label>Phone <input [(ngModel)]="phone" name="phone"></label>
        <label>Address <input [(ngModel)]="address" name="address"></label>
        <button class="primary" (click)="save()">Save</button>
      </div>
      <p class="success" *ngIf="saved">Saved.</p>
      <p class="error" *ngIf="error">{{ error }}</p>
    </div>
    <div class="card">
      <h3>Browsing History</h3>
      <table *ngIf="views.length">
        <tr><th>Product</th><th>Viewed</th></tr>
        <tr *ngFor="let v of views">
          <td><a [routerLink]="['/products', v.productId]">{{ v.name || v.productId }}</a></td>
          <td>{{ v.viewedAt }}</td>
        </tr>
      </table>
      <p class="muted" *ngIf="!views.length">No browsing history yet.</p>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  me: any = null;
  name = '';
  phone = '';
  address = '';
  views: any[] = [];
  saved = false;
  error = '';

  constructor(private shop: ShopService, private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.me().subscribe((m: any) => {
      this.me = m;
      this.name = m.name || '';
      this.phone = m.phone === 'null' ? '' : (m.phone || '');
      this.address = m.address === 'null' ? '' : (m.address || '');
    });
    this.shop.history(this.auth.userId()).subscribe((r: any) => this.views = r.items || []);
  }

  save(): void {
    this.saved = false;
    this.error = '';
    this.auth.updateProfile({ name: this.name, phone: this.phone, address: this.address }).subscribe({
      next: () => this.saved = true,
      error: (e) => this.error = e.error?.message || 'Save failed'
    });
  }
}
