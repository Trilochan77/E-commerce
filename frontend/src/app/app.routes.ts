import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';
import { LoginComponent } from './features/login.component';
import { RegisterComponent } from './features/register.component';
import { HomeComponent } from './features/home.component';
import { ProductListComponent } from './features/product-list.component';
import { ProductDetailComponent } from './features/product-detail.component';
import { CartComponent } from './features/cart.component';
import { CheckoutComponent } from './features/checkout.component';
import { OrdersComponent } from './features/orders.component';
import { ReturnRequestComponent } from './features/return-request.component';
import { ReturnStatusComponent } from './features/return-status.component';
import { WalletComponent } from './features/wallet.component';
import { ProfileComponent } from './features/profile.component';
import { AdminComponent } from './features/admin.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrdersComponent, canActivate: [authGuard] },
  { path: 'returns/new', component: ReturnRequestComponent, canActivate: [authGuard] },
  { path: 'returns', component: ReturnStatusComponent, canActivate: [authGuard] },
  { path: 'wallet', component: WalletComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' }
];
