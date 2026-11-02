import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';

const GATEWAY = 'http://localhost:8080';

@Injectable({ providedIn: 'root' })
export class Shop {
  /** Emits after every successful cart mutation so badges/cart sections refresh instantly. */
  readonly cartChanged = new Subject<void>();
  /** Emits after every wishlist mutation so navbar badges and product cards update instantly. */
  readonly wishlistChanged = new Subject<void>();
  /** Emits after notification reads/scans so the navbar unread badge refreshes. */
  readonly notificationsChanged = new Subject<void>();
  constructor(private http: HttpClient) {}

  private adminHeaders(): HttpHeaders {
    return new HttpHeaders({ 'X-Role': localStorage.getItem('ecom_role') || '' });
  }

  private userHeader(): HttpHeaders {
    return new HttpHeaders({ 'X-User-Id': localStorage.getItem('ecom_userId') || '' });
  }

  products(category = ''): Observable<any> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    return this.http.get(`${GATEWAY}/api/products`, { params });
  }

  product(id: string): Observable<any> {
    return this.http.get(`${GATEWAY}/api/products/${id}`);
  }

  categories(): Observable<any> {
    return this.http.get(`${GATEWAY}/api/categories`);
  }

  /** Side-by-side comparison payload (stored fields + parsed specifications/features). */
  compareProducts(ids: string[]): Observable<any> {
    return this.http.get(`${GATEWAY}/api/products/compare?ids=${encodeURIComponent(ids.join(','))}`);
  }

  search(q: string, category = '', sort = ''): Observable<any> {
    let params = new HttpParams().set('q', q);
    if (category) params = params.set('category', category);
    if (sort) params = params.set('sort', sort);
    return this.http.get(`${GATEWAY}/api/search`, { params, headers: this.userHeader() });
  }

  recommendations(userId: string, limit = 8): Observable<any> {
    return this.http.get(`${GATEWAY}/api/recommendations/${userId}?limit=${limit}`);
  }

  /** Content-based "similar products" for a product page. */
  similarProducts(productId: string, limit = 6): Observable<any> {
    return this.http.get(`${GATEWAY}/api/recommendations/similar/${productId}?limit=${limit}`);
  }

  /** Time-decayed popularity rail (recent orders + views). */
  trending(limit = 8): Observable<any> {
    return this.http.get(`${GATEWAY}/api/recommendations/trending?limit=${limit}`);
  }

  /** All-time best sellers by order volume. */
  popularProducts(limit = 8): Observable<any> {
    return this.http.get(`${GATEWAY}/api/recommendations/popular?limit=${limit}`);
  }

  /** Category-based rail, optionally personalized with the user's own views. */
  categoryRecommendations(categoryId: string, userId = '', limit = 8): Observable<any> {
    let params = new HttpParams().set('limit', limit);
    if (userId) params = params.set('userId', userId);
    return this.http.get(`${GATEWAY}/api/recommendations/category/${categoryId}`, { params });
  }

  /** Recommendations derived from the products the user most recently viewed. */
  recentlyViewedRecommendations(userId: string, limit = 6): Observable<any> {
    return this.http.get(`${GATEWAY}/api/recommendations/recently-viewed/${userId}?limit=${limit}`);
  }

  logView(userId: string, productId: string): Observable<any> {
    return this.http.post(`${GATEWAY}/api/activity`, { userId, type: 'VIEW', productId });
  }

  history(userId: string): Observable<any> {
    return this.http.get(`${GATEWAY}/api/activity/history/${userId}?limit=20`);
  }

  /** Grounded shopping assistant: deterministic rules + live catalog retrieval. */
  assistant(userId: string | null, message: string, contextIds: string[] = []): Observable<any> {
    return this.http.post(`${GATEWAY}/api/assistant/chat`, { userId, message, contextIds });
  }

  cart(userId: string): Observable<any> {
    return this.http.get(`${GATEWAY}/api/cart/${userId}`);
  }

  cartAdd(userId: string, productId: string, quantity: number): Observable<any> {
    return this.http.post(`${GATEWAY}/api/cart/${userId}/items`, { productId, quantity })
      .pipe(tap(() => this.cartChanged.next()));
  }

  cartQty(userId: string, productId: string, quantity: number): Observable<any> {
    return this.http.put(`${GATEWAY}/api/cart/${userId}/items/${productId}`, { quantity })
      .pipe(tap(() => this.cartChanged.next()));
  }

  cartRemove(userId: string, productId: string): Observable<any> {
    return this.http.delete(`${GATEWAY}/api/cart/${userId}/items/${productId}`)
      .pipe(tap(() => this.cartChanged.next()));
  }

  /* ---- wishlist ---- */
  wishlist(userId: string): Observable<any> {
    return this.http.get(`${GATEWAY}/api/wishlist/${userId}`);
  }

  wishlistAdd(userId: string, productId: string, priceAtAdd: number): Observable<any> {
    return this.http.post(`${GATEWAY}/api/wishlist/${userId}/items`, { productId, priceAtAdd })
      .pipe(tap(() => this.wishlistChanged.next()));
  }

  wishlistRemove(userId: string, productId: string): Observable<any> {
    return this.http.delete(`${GATEWAY}/api/wishlist/${userId}/items/${productId}`)
      .pipe(tap(() => this.wishlistChanged.next()));
  }

  wishlistClear(userId: string): Observable<any> {
    return this.http.delete(`${GATEWAY}/api/wishlist/${userId}/clear`)
      .pipe(tap(() => this.wishlistChanged.next()));
  }

  wishlistUpdatePrice(userId: string, productId: string, priceAtAdd: number): Observable<any> {
    return this.http.put(`${GATEWAY}/api/wishlist/${userId}/items/${productId}/price`, { priceAtAdd })
      .pipe(tap(() => this.wishlistChanged.next()));
  }

  wishlistContains(userId: string, productId: string): Observable<any> {
    return this.http.get(`${GATEWAY}/api/wishlist/${userId}/contains/${productId}`);
  }

  /* ---- smart notifications ---- */
  notifications(userId: string, unreadOnly = false, category = 'ALL'): Observable<any> {
    const params = new URLSearchParams();
    if (unreadOnly) params.append('unreadOnly', 'true');
    if (category && category !== 'ALL') params.append('category', category);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.http.get(`${GATEWAY}/api/notifications/${userId}${qs}`);
  }

  notificationUnreadCount(userId: string): Observable<any> {
    return this.http.get(`${GATEWAY}/api/notifications/${userId}/unread-count`);
  }

  notificationRead(userId: string, notificationId: string): Observable<any> {
    return this.http.put(`${GATEWAY}/api/notifications/${userId}/${notificationId}/read`, {})
      .pipe(tap(() => this.notificationsChanged.next()));
  }

  notificationsReadAll(userId: string): Observable<any> {
    return this.http.put(`${GATEWAY}/api/notifications/${userId}/read-all`, {})
      .pipe(tap(() => this.notificationsChanged.next()));
  }

  notificationDelete(userId: string, notificationId: string): Observable<any> {
    return this.http.delete(`${GATEWAY}/api/notifications/${userId}/${notificationId}`)
      .pipe(tap(() => this.notificationsChanged.next()));
  }

  notificationsClear(userId: string): Observable<any> {
    return this.http.delete(`${GATEWAY}/api/notifications/${userId}`)
      .pipe(tap(() => this.notificationsChanged.next()));
  }

  createNotification(notif: any): Observable<any> {
    return this.http.post(`${GATEWAY}/api/notifications`, notif)
      .pipe(tap(() => this.notificationsChanged.next()));
  }

  /** Compare wishlist prices against the catalog now (also runs automatically every minute). */
  notificationsScan(userId: string): Observable<any> {
    return this.http.post(`${GATEWAY}/api/notifications/${userId}/scan`, {})
      .pipe(tap(() => this.notificationsChanged.next()));
  }

  checkout(userId: string, paymentMethod: string, pointsToUse: number, addressId = '', shippingAddress: any = null, couponCode: string | null = null): Observable<any> {
    return this.http.post(`${GATEWAY}/api/orders/checkout`, { userId, paymentMethod, pointsToUse, couponCode, addressId, shippingAddress })
      .pipe(tap(() => this.cartChanged.next()));
  }

  addresses(userId: string): Observable<any> {
    return this.http.get(`${GATEWAY}/api/addresses/user/${userId}`);
  }

  addressCreate(body: any): Observable<any> {
    return this.http.post(`${GATEWAY}/api/addresses`, body);
  }

  addressUpdate(id: string, body: any): Observable<any> {
    return this.http.put(`${GATEWAY}/api/addresses/${id}`, body);
  }

  addressDelete(id: string, userId: string): Observable<any> {
    return this.http.delete(`${GATEWAY}/api/addresses/${id}?userId=${userId}`);
  }

  addressDefault(id: string, userId: string): Observable<any> {
    return this.http.put(`${GATEWAY}/api/addresses/${id}/default`, { userId });
  }

  orderHistory(userId: string): Observable<any> {
    return this.http.get(`${GATEWAY}/api/orders/user/${userId}`);
  }

  estimate(productId: string, condition: string, orderId = ''): Observable<any> {
    let params = new HttpParams().set('productId', productId).set('quantity', 1).set('condition', condition);
    if (orderId) params = params.set('orderId', orderId);
    return this.http.get(`${GATEWAY}/api/rewards/estimate`, { params });
  }

  submitReturn(body: any): Observable<any> {
    return this.http.post(`${GATEWAY}/api/returns`, body);
  }

  myReturns(userId: string): Observable<any> {
    return this.http.get(`${GATEWAY}/api/returns/user/${userId}`);
  }

  wallet(userId: string): Observable<any> {
    return this.http.get(`${GATEWAY}/api/wallet/${userId}`);
  }

  transactions(userId: string): Observable<any> {
    return this.http.get(`${GATEWAY}/api/rewards/transactions/${userId}`);
  }

  users(): Observable<any> {
    return this.http.get(`${GATEWAY}/api/users`, { headers: this.adminHeaders() });
  }

  userBlock(id: string, blocked: boolean): Observable<any> {
    return this.http.put(`${GATEWAY}/api/users/${id}/block`, { blocked }, { headers: this.adminHeaders() });
  }

  userDelete(id: string): Observable<any> {
    return this.http.delete(`${GATEWAY}/api/users/${id}`, { headers: this.adminHeaders() });
  }

  productCreate(body: any): Observable<any> {
    return this.http.post(`${GATEWAY}/api/products`, body, { headers: this.adminHeaders() });
  }

  productUpdate(id: string, body: any): Observable<any> {
    return this.http.put(`${GATEWAY}/api/products/${id}`, body, { headers: this.adminHeaders() });
  }

  productDelete(id: string): Observable<any> {
    return this.http.delete(`${GATEWAY}/api/products/${id}`, { headers: this.adminHeaders() });
  }

  categoryCreate(body: any): Observable<any> {
    return this.http.post(`${GATEWAY}/api/categories`, body, { headers: this.adminHeaders() });
  }

  categoryUpdate(id: string, body: any): Observable<any> {
    return this.http.put(`${GATEWAY}/api/categories/${id}`, body, { headers: this.adminHeaders() });
  }

  categoryDelete(id: string): Observable<any> {
    return this.http.delete(`${GATEWAY}/api/categories/${id}`, { headers: this.adminHeaders() });
  }

  allOrders(): Observable<any> {
    return this.http.get(`${GATEWAY}/api/orders`, { headers: this.adminHeaders() });
  }

  orderStatus(id: string, status: string): Observable<any> {
    return this.http.put(`${GATEWAY}/api/orders/${id}/status`, { status }, { headers: this.adminHeaders() });
  }

  orderPayment(id: string, paymentStatus: string): Observable<any> {
    return this.http.put(`${GATEWAY}/api/orders/${id}/payment`, { paymentStatus }, { headers: this.adminHeaders() });
  }

  allReturns(status = ''): Observable<any> {
    const url = status ? `${GATEWAY}/api/returns?status=${status}` : `${GATEWAY}/api/returns`;
    return this.http.get(url, { headers: this.adminHeaders() });
  }

  returnStatus(id: string, status: string): Observable<any> {
    return this.http.put(`${GATEWAY}/api/returns/${id}/status`, { status }, { headers: this.adminHeaders() });
  }

  evaluate(id: string, verifiedCondition: string, adminNote: string): Observable<any> {
    return this.http.put(`${GATEWAY}/api/returns/${id}/evaluate`,
      { verifiedCondition, adminNote }, { headers: this.adminHeaders() });
  }

  /* ---- reviews & feedback ---- */
  reviews(productId: string): Observable<any> {
    return this.http.get(`${GATEWAY}/api/products/${productId}/reviews`);
  }

  reviewEligibility(productId: string, userId: string): Observable<any> {
    return this.http.get(`${GATEWAY}/api/products/${productId}/reviews/eligibility?userId=${userId}`, { headers: this.userHeader() });
  }

  reviewSubmit(productId: string, body: any): Observable<any> {
    return this.http.post(`${GATEWAY}/api/products/${productId}/reviews`, body, { headers: this.userHeader() });
  }

  reviewUpdate(productId: string, reviewId: string, body: any): Observable<any> {
    return this.http.put(`${GATEWAY}/api/products/${productId}/reviews/${reviewId}`, body, { headers: this.userHeader() });
  }

  reviewDelete(productId: string, reviewId: string, userId: string): Observable<any> {
    return this.http.delete(`${GATEWAY}/api/products/${productId}/reviews/${reviewId}?userId=${userId}`, { headers: this.userHeader() });
  }

  adminReviews(status = ''): Observable<any> {
    const url = status && status !== 'ALL' ? `${GATEWAY}/api/products/reviews/admin/all?status=${status}` : `${GATEWAY}/api/products/reviews/admin/all`;
    return this.http.get(url, { headers: this.adminHeaders() });
  }

  adminReviewStatus(reviewId: string, status: string, adminNote = ''): Observable<any> {
    return this.http.put(`${GATEWAY}/api/products/reviews/admin/${reviewId}/status`, { status, adminNote }, { headers: this.adminHeaders() });
  }

  adminReviewDelete(reviewId: string): Observable<any> {
    return this.http.delete(`${GATEWAY}/api/products/reviews/admin/${reviewId}`, { headers: this.adminHeaders() });
  }

  /* ---- delivery tracking ---- */
  orderTracking(orderId: string): Observable<any> {
    return this.http.get(`${GATEWAY}/api/orders/${orderId}/tracking`, { headers: this.userHeader() });
  }

  updateTrackingLocation(orderId: string, payload: any): Observable<any> {
    return this.http.put(`${GATEWAY}/api/orders/${orderId}/tracking/location`, payload, { headers: this.userHeader() });
  }

  resetTracking(orderId: string): Observable<any> {
    return this.http.post(`${GATEWAY}/api/orders/${orderId}/tracking/reset`, {}, { headers: this.userHeader() });
  }

  /* ---- spin and win & coupons ---- */
  spinStatus(userId: string): Observable<any> {
    return this.http.get(`${GATEWAY}/api/rewards/spin/status?userId=${userId}`, { headers: this.userHeader() });
  }

  spinWheel(userId: string): Observable<any> {
    return this.http.post(`${GATEWAY}/api/rewards/spin`, { userId }, { headers: this.userHeader() });
  }

  validateCoupon(userId: string, code: string, subTotal: number): Observable<any> {
    return this.http.post(`${GATEWAY}/api/rewards/coupons/validate`, { userId, code, subTotal }, { headers: this.userHeader() });
  }

  myCoupons(userId: string): Observable<any> {
    return this.http.get(`${GATEWAY}/api/rewards/coupons/user/${userId}`, { headers: this.userHeader() });
  }
}
