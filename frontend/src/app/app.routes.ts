import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';
import { Login } from './features/login';
import { Register } from './features/register';
import { Home } from './features/home';
import { ProductList } from './features/product-list';
import { ProductDetail } from './features/product-detail';
import { Cart } from './features/cart';
import { Checkout } from './features/checkout';
import { Orders } from './features/orders';
import { ReturnRequest } from './features/return-request';
import { ReturnStatus } from './features/return-status';
import { Wallet } from './features/wallet';
import { Profile } from './features/profile';
import { AdminLayout } from './admin/admin-layout';
import { AdminLogin } from './admin/admin-login';
import { AdminDashboard } from './admin/admin-dashboard';
import { AdminProducts } from './admin/admin-products';
import { AdminCategories } from './admin/admin-categories';
import { AdminOrders } from './admin/admin-orders';
import { AdminReturns } from './admin/admin-returns';
import { AdminUsers } from './admin/admin-users';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'products', component: ProductList },
  { path: 'products/:id', component: ProductDetail },
  { path: 'cart', component: Cart, canActivate: [authGuard] },
  { path: 'checkout', component: Checkout, canActivate: [authGuard] },
  { path: 'orders', component: Orders, canActivate: [authGuard] },
  { path: 'returns/new', component: ReturnRequest, canActivate: [authGuard] },
  { path: 'returns', component: ReturnStatus, canActivate: [authGuard] },
  { path: 'wallet', component: Wallet, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'admin/login', component: AdminLogin },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboard },
      { path: 'products', component: AdminProducts },
      { path: 'categories', component: AdminCategories },
      { path: 'orders', component: AdminOrders },
      { path: 'returns', component: AdminReturns },
      { path: 'users', component: AdminUsers }
    ]
  },
  { path: '**', redirectTo: '' }
];
