import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const GATEWAY = 'http://localhost:8080';

@Injectable({ providedIn: 'root' })
export class ShopService {
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

  search(q: string, category = '', sort = ''): Observable<any> {
    let params = new HttpParams().set('q', q);
    if (category) params = params.set('category', category);
    if (sort) params = params.set('sort', sort);
    return this.http.get(`${GATEWAY}/api/search`, { params, headers: this.userHeader() });
  }

  recommendations(userId: string, limit = 8): Observable<any> {
    return this.http.get(`${GATEWAY}/api/recommendations/${userId}?limit=${limit}`);
  }

  logView(userId: string, productId: string): Observable<any> {
    return this.http.post(`${GATEWAY}/api/activity`, { userId, type: 'VIEW', productId });
  }

  history(userId: string): Observable<any> {
    return this.http.get(`${GATEWAY}/api/activity/history/${userId}?limit=20`);
  }

  cart(userId: string): Observable<any> {
    return this.http.get(`${GATEWAY}/api/cart/${userId}`);
  }

  cartAdd(userId: string, productId: string, quantity: number): Observable<any> {
    return this.http.post(`${GATEWAY}/api/cart/${userId}/items`, { productId, quantity });
  }

  cartQty(userId: string, productId: string, quantity: number): Observable<any> {
    return this.http.put(`${GATEWAY}/api/cart/${userId}/items/${productId}`, { quantity });
  }

  cartRemove(userId: string, productId: string): Observable<any> {
    return this.http.delete(`${GATEWAY}/api/cart/${userId}/items/${productId}`);
  }

  checkout(userId: string, paymentMethod: string, pointsToUse: number): Observable<any> {
    return this.http.post(`${GATEWAY}/api/orders/checkout`, { userId, paymentMethod, pointsToUse });
  }

  orderHistory(userId: string): Observable<any> {
    return this.http.get(`${GATEWAY}/api/orders/user/${userId}`);
  }

  estimate(productId: string, condition: string): Observable<any> {
    const params = new HttpParams().set('productId', productId).set('quantity', 1).set('condition', condition);
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

  allOrders(): Observable<any> {
    return this.http.get(`${GATEWAY}/api/orders`, { headers: this.adminHeaders() });
  }

  orderStatus(id: string, status: string): Observable<any> {
    return this.http.put(`${GATEWAY}/api/orders/${id}/status`, { status });
  }

  allReturns(status = ''): Observable<any> {
    const url = status ? `${GATEWAY}/api/returns?status=${status}` : `${GATEWAY}/api/returns`;
    return this.http.get(url);
  }

  returnStatus(id: string, status: string): Observable<any> {
    return this.http.put(`${GATEWAY}/api/returns/${id}/status`, { status });
  }

  evaluate(id: string, verifiedCondition: string, adminNote: string): Observable<any> {
    return this.http.put(`${GATEWAY}/api/returns/${id}/evaluate`,
      { verifiedCondition, adminNote }, { headers: this.adminHeaders() });
  }
}
