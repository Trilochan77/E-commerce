import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Shop } from '../core/shop';
import { Auth } from '../core/auth';
import { Toast } from '../shared/toast';
import QRCode from 'qrcode';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule, RouterModule],
  styles: [`
    .gateway-wrap { max-width: 620px; margin: 16px auto; }
    .gateway-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); padding-bottom: 12px; margin-bottom: 16px; }
    .amount-banner { background: rgba(16, 185, 129, .12); border: 1px solid rgba(52, 211, 153, .4); border-radius: var(--radius); padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
    .amount-val { font-size: 26px; font-weight: 800; color: var(--ok); }
    .tab-pills { display: flex; gap: 8px; margin-bottom: 16px; }
    .tab-pill { padding: 8px 14px; border: 1px solid var(--line); background: var(--surface-2); border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; color: var(--ink-2); }
    .tab-pill.active { background: var(--brand); color: #fff; border-color: var(--brand); }
    .app-icons { display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 10px; margin-bottom: 16px; }
    .app-btn { border: 1px solid var(--line); background: var(--surface-2); border-radius: 8px; padding: 10px; text-align: center; cursor: pointer; transition: all .15s; color: var(--ink-2); }
    .app-btn:hover, .app-btn.selected { border-color: var(--brand); background: var(--brand-soft); color: var(--ink); }
    .app-btn .icon { font-size: 22px; display: block; margin-bottom: 4px; }
    .chip-row { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
    .chip { font-size: 11px; font-weight: 600; background: var(--surface-2); border: 1px solid var(--line); border-radius: 999px; padding: 3px 8px; cursor: pointer; color: var(--ink-2); }
    .chip:hover { background: var(--surface-3); color: var(--brand); }
    .qr-card { text-align: center; padding: 24px 16px; background: var(--surface-2); border: 1px dashed rgba(148, 163, 255, .35); border-radius: var(--radius); margin-bottom: 16px; }
    .qr-box { width: 100%; max-width: 300px; margin: 0 auto 12px; background: #fff; border: 2px solid #0a0f1e; outline: 2px solid rgba(139,92,246,.4); border-radius: 12px; display: grid; place-items: center; position: relative; padding: 10px; }
    .qr-box img { max-width: 100%; height: auto; border-radius: 8px; }
    .qr-info { text-align: center; }
    .qr-info strong { display: block; font-size: 18px; margin-bottom: 4px; color: var(--ink); }
    .card-preview { background: linear-gradient(135deg, #2b1a5e, #141033 55%, #3b0f4a); border: 1px solid rgba(167, 139, 250, .35); color: #fff; border-radius: 14px; padding: 20px 22px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(2,5,12,.6); position: relative; }
    .card-chip { width: 38px; height: 26px; background: linear-gradient(135deg, #fbbf24, #d97706); border-radius: 5px; margin-bottom: 18px; }
    .card-num { font-size: 20px; letter-spacing: 2px; font-family: monospace; margin-bottom: 18px; }
    .card-meta { display: flex; justify-content: space-between; font-size: 11px; text-transform: uppercase; color: #94a3b8; }
    .card-val { font-size: 13px; font-weight: 600; color: #fff; margin-top: 2px; }
    .status-box { text-align: center; padding: 36px 16px; }
    .status-icon { width: 64px; height: 64px; border-radius: 50%; display: grid; place-items: center; font-size: 32px; font-weight: 800; margin: 0 auto 14px; }
    .status-icon.success { background: var(--ok-bg); border: 1px solid rgba(52,211,153,.45); color: var(--ok); }
    .status-icon.failed { background: var(--bad-bg); border: 1px solid rgba(248,113,113,.45); color: var(--bad); }
    .action-row { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
    .action-row button { flex: 1; }
  `],
  template: `
    <!-- VIEW 1: Standard Checkout Overview -->
    <div *ngIf="view === 'CHECKOUT'">
      <div class="breadcrumb"><a routerLink="/">Home</a> / <a routerLink="/cart">Cart</a> / Checkout</div>
      <div class="steps-checkout">
        <span class="step done">✓ Cart</span><span>→</span>
        <span class="step now">2 · Checkout</span><span>→</span>
        <span class="step">3 · Payment</span>
      </div>

      <div class="cart-layout">
        <div class="stack">
          <!-- Delivery Address -->
          <div class="card" style="margin:0">
            <div class="section-title">
              <h2>Delivery Address</h2>
              <span class="muted" *ngIf="addresses.length">{{ addresses.length }} saved</span>
            </div>
            <div *ngIf="addrLoading"><p class="muted"><span class="spinner"></span> Loading addresses…</p></div>
            <div class="stack" *ngIf="!addrLoading && addresses.length">
              <label class="pay-card" *ngFor="let a of addresses" [class.on]="selectedId===addrId(a)" (click)="select(a)" style="cursor:pointer;display:block">
                <div class="row" style="justify-content:space-between">
                  <strong>{{ a.fullName }} <span class="badge info">{{ a.addressType || 'HOME' }}</span></strong>
                  <span class="badge ok" *ngIf="a.default || a.isDefault">DEFAULT</span>
                </div>
                <span class="muted">{{ a.addressLine }}, {{ a.city }}, {{ a.state }} — {{ a.pincode }}</span>
                <span class="muted">Phone: {{ a.phone }}<span *ngIf="a.landmark"> · {{ a.landmark }}</span></span>
              </label>
            </div>
            <p class="muted" *ngIf="!addrLoading && !addresses.length">No saved address yet — add one below.</p>
            <div class="row" style="margin-top:8px">
              <button class="btn-ghost btn-sm" (click)="showForm=!showForm">{{ showForm ? 'Cancel' : '+ Add / New address' }}</button>
              <button class="btn-ghost btn-sm" *ngIf="selected && showForm" (click)="fillSelected()">Use selected</button>
            </div>

            <!-- Address Form -->
            <div *ngIf="showForm" class="form-grid" style="margin-top:10px;max-width:none">
              <div class="profile-2col">
                <label>Full name (or receiver)<input [(ngModel)]="form.fullName" name="f-fullName" placeholder="e.g. Trilochan Sahoo"></label>
                <label>Phone<input [(ngModel)]="form.phone" name="f-phone" placeholder="10-digit mobile"></label>
              </div>
              <div class="profile-2col">
                <label>Pincode<input [(ngModel)]="form.pincode" name="f-pincode" maxlength="6" placeholder="6-digit PIN"></label>
                <label>Type<select [(ngModel)]="form.addressType" name="f-type"><option>HOME</option><option>WORK</option><option>OTHER</option></select></label>
              </div>
              <label>Address<input [(ngModel)]="form.addressLine" name="f-line" placeholder="House no, street, area"></label>
              <div class="profile-2col">
                <label>City<input [(ngModel)]="form.city" name="f-city"></label>
                <label>State<input [(ngModel)]="form.state" name="f-state"></label>
              </div>
              <label>Landmark (optional)<input [(ngModel)]="form.landmark" name="f-land" placeholder="Near…"></label>
              <label class="row" style="gap:6px"><input type="checkbox" [(ngModel)]="form.isDefault" name="f-def" style="width:auto"> Save & set as default</label>
              <div class="row">
                <button class="primary btn-sm" (click)="saveAddress()" [disabled]="savingAddr || !formValid()">{{ savingAddr ? 'Saving…' : 'Save address' }}</button>
                <span class="muted" *ngIf="!formValid()">Fill name, phone, 6-digit PIN, address, city, state.</span>
              </div>
            </div>
            <p class="error" *ngIf="addrError">{{ addrError }}</p>
          </div>

          <!-- Reward Wallet -->
          <div class="card" style="margin:0">
            <h2> Reward Wallet</h2>
            <p class="muted" *ngIf="wallet">Balance <strong>{{ wallet.balance ?? wallet.pointBalance ?? 0 }} pts</strong> · 1 pt = ₹1 · max 20% of subtotal (₹{{ maxUsable() | number }})</p>
            <div class="row">
              <input [(ngModel)]="points" name="points" type="number" min="0" [max]="wallet?.balance || 0" style="max-width:160px" placeholder="0" aria-label="Points to use">
              <button class="btn-ghost btn-sm" (click)="points=maxUsable()">Apply max</button>
              <button class="btn-ghost btn-sm" (click)="points=0">Clear</button>
              <span class="badge ok" *ngIf="points>0">− ₹{{ points }} saved</span>
            </div>
            <div class="progress"><div [style.width.%]="walletPct()"></div></div>
          </div>

          <!-- Payment Method Selection -->
          <div class="card" style="margin:0">
            <h2>Select Payment Method</h2>
            <div class="pay-grid">
              <!-- UPI Button -->
              <div class="pay-card" [class.on]="method==='UPI'" (click)="openPayment('UPI')">
                <div class="row" style="justify-content:space-between">
                  <strong>⚡ UPI Payment</strong>
                  <span class="badge info">Click to open UPI page</span>
                </div>
                <span class="muted">Google Pay, PhonePe, Paytm, BHIM or QR Code</span>
              </div>

              <!-- Card Button -->
              <div class="pay-card" [class.on]="method==='CARD'" (click)="openPayment('CARD')">
                <div class="row" style="justify-content:space-between">
                  <strong>💳 Debit / Credit Card</strong>
                  <span class="badge info">Click to open Card page</span>
                </div>
                <span class="muted">Visa, MasterCard, RuPay with CVV security</span>
              </div>

              <!-- COD Button -->
              <div class="pay-card" [class.on]="method==='COD'" (click)="method='COD'">
                <div class="row" style="justify-content:space-between">
                  <strong>💵 Cash on Delivery (COD)</strong>
                  <span class="badge ok" *ngIf="method==='COD'">Selected</span>
                </div>
                <span class="muted">Pay cash when package arrives</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary Aside -->
        <aside class="card summary">
          <h3>Order Summary</h3>
          <p class="muted">{{ itemCount() }} items · Subtotal ₹{{ cart?.totalAmount || 0 }}</p>
          <div class="row" style="justify-content:space-between"><span>Subtotal</span><span>₹{{ cart?.totalAmount || 0 }}</span></div>
          <div class="row" style="justify-content:space-between"><span>Wallet (−)</span><span style="color:#15803d">− ₹{{ points || 0 }}</span></div>
          <div class="divider"></div>
          <p class="muted" *ngIf="selected">Deliver to: <strong>{{ selected.fullName }}</strong>, {{ selected.city }} ({{ selected.pincode }})</p>
          <div class="row" style="justify-content:space-between"><span>To pay</span><span class="total">₹{{ payable() | number }}</span></div>

          <!-- Action depending on payment method -->
          <button *ngIf="method==='COD'" class="primary" style="width:100%;margin-top:10px" (click)="payCOD()" [disabled]="!cart?.items?.length || paying || !selected">
            {{ paying ? 'Placing Order…' : (selected ? 'Place Order (Pay on Delivery)' : 'Select address first') }}
          </button>

          <button *ngIf="method==='UPI'" class="primary" style="width:100%;margin-top:10px;background:#059669" (click)="openPayment('UPI')">
            Open UPI Payment Page →
          </button>

          <button *ngIf="method==='CARD'" class="primary" style="width:100%;margin-top:10px;background:#7c3aed" (click)="openPayment('CARD')">
            Open Card Payment Page →
          </button>

          <p class="error" *ngIf="error">{{ error }}</p>
          <p class="muted" style="text-align:center">100% safe & secure payment · Instant confirmation</p>
        </aside>
      </div>
    </div>

    <!-- VIEW 2: Dedicated UPI Payment Page -->
    <div *ngIf="view === 'UPI'" class="gateway-wrap">
      <div class="breadcrumb">
        <a style="cursor:pointer" (click)="view='CHECKOUT'; paymentStatus='IDLE'">← Back to Checkout</a> / UPI Payment Page
      </div>

      <div class="card" style="margin:0">
        <div class="gateway-header">
          <div>
            <h2>⚡ NextGen UPI Gateway</h2>
            <p class="muted">Fast, secure UPI transfer</p>
          </div>
          <span class="badge ok">🔒 256-Bit Encrypted</span>
        </div>

        <div class="amount-banner">
          <div>
            <div class="muted">Amount Payable</div>
            <div class="amount-val">₹{{ payable() | number }}</div>
          </div>
          <div style="text-align:right" *ngIf="selected">
            <span class="muted">Delivering to</span>
            <div><strong>{{ selected.fullName }}</strong> ({{ selected.pincode }})</div>
          </div>
        </div>

        <!-- IDLE STATE: Form & Options -->
        <div *ngIf="paymentStatus === 'IDLE'">
          <div class="tab-pills">
            <button class="tab-pill" [class.active]="upiTab==='APP'" (click)="upiTab='APP'">Pay via UPI ID / App</button>
            <button class="tab-pill" [class.active]="upiTab==='QR'" (click)="upiTab='QR'">Scan QR Code</button>
          </div>

          <!-- Tab 1: UPI ID & Apps -->
          <div *ngIf="upiTab === 'APP'">
            <label style="font-weight:600;display:block;margin-bottom:8px">Select UPI App</label>
            <div class="app-icons">
              <div class="app-btn" [class.selected]="upiApp==='gpay'" (click)="selectUpiApp('gpay', 'user@okhdfcbank')">
                <span class="icon">🟢</span>
                <strong>GPay</strong>
              </div>
              <div class="app-btn" [class.selected]="upiApp==='phonepe'" (click)="selectUpiApp('phonepe', 'user@ybl')">
                <span class="icon">🟣</span>
                <strong>PhonePe</strong>
              </div>
              <div class="app-btn" [class.selected]="upiApp==='paytm'" (click)="selectUpiApp('paytm', 'user@paytm')">
                <span class="icon">🔵</span>
                <strong>Paytm</strong>
              </div>
              <div class="app-btn" [class.selected]="upiApp==='bhim'" (click)="selectUpiApp('bhim', 'user@upi')">
                <span class="icon">🟠</span>
                <strong>BHIM</strong>
              </div>
            </div>

            <label style="display:block;margin-top:12px">Enter UPI ID / VPA
              <input [(ngModel)]="upiId" placeholder="e.g. mobile@upi or yourname@okhdfcbank" style="margin-top:4px">
            </label>
            <div class="chip-row">
              <span class="chip" (click)="appendUpiSuffix('@okhdfcbank')">+ @okhdfcbank</span>
              <span class="chip" (click)="appendUpiSuffix('@oksbi')">+ @oksbi</span>
              <span class="chip" (click)="appendUpiSuffix('@ybl')">+ @ybl</span>
              <span class="chip" (click)="appendUpiSuffix('@paytm')">+ @paytm</span>
            </div>
          </div>

          <!-- Tab 2: Scan QR Code -->
          <div *ngIf="upiTab === 'QR'">
            <div class="qr-card">
              <div class="qr-box" *ngIf="qrCodeData; else noQr">
                <img [src]="qrCodeData" alt="UPI QR" width="260" height="260" />
              </div>
              <ng-template #noQr>
                <div class="qr-box">
                  <div class="muted">Generating your order QR…</div>
                </div>
              </ng-template>
              <div class="qr-info">
                <strong>Pay ₹{{ payable() | number }}</strong>
                <div class="muted" *ngIf="orderId">Order ID: {{ orderId }}</div>
                <div class="muted" *ngIf="upiVpa">Merchant VPA: {{ upiVpa }}</div>
                <p class="muted">Compatible with any UPI App: GPay, PhonePe, Paytm, BHIM</p>
                <p class="muted" style="font-size:11px">Scan this QR with any UPI app to pay</p>
              </div>
            </div>
          </div>

          <!-- Test / Action Buttons -->
          <div class="action-row">
            <button class="primary" style="background:#059669" (click)="executePayment('UPI', true)">
              Pay ₹{{ payable() | number }} (Test Success)
            </button>
            <button class="btn-ghost" style="color:#b91c1c;border-color:#fca5a5" (click)="executePayment('UPI', false)">
              Simulate Failure ✕
            </button>
          </div>
          <p class="muted" style="text-align:center;margin-top:10px">Click <strong>Pay</strong> to simulate successful approval or <strong>Simulate Failure</strong> to test decline.</p>
        </div>

        <!-- PROCESSING STATE -->
        <div *ngIf="paymentStatus === 'PROCESSING'" class="status-box">
          <div class="spinner" style="width:40px;height:40px;margin:0 auto 16px;border-width:3px"></div>
          <h2>Contacting UPI Gateway…</h2>
          <p class="muted">Authorizing payment of <strong>₹{{ payable() | number }}</strong> via UPI ({{ upiId || 'QR' }})</p>
          <p class="muted">Please wait while the transaction is being confirmed by your bank…</p>
        </div>

        <!-- SUCCESS STATE -->
        <div *ngIf="paymentStatus === 'SUCCESS'" class="status-box">
          <div class="status-icon success">✓</div>
          <h2 style="color:#15803d">Payment Successful!</h2>
          <p style="font-size:16px;font-weight:600;margin:6px 0">₹{{ payable() | number }} Paid via UPI</p>
          <p class="muted">Transaction Reference: <strong>UPI-{{ txnRef }}</strong></p>
          <span class="badge ok" style="font-size:13px;padding:6px 12px">Order Placed & Confirmed</span>
          <div class="action-row" style="max-width:320px;margin:20px auto 0">
            <button class="primary" style="width:100%" (click)="goToOrders()">View My Orders →</button>
          </div>
        </div>

        <!-- FAILED STATE -->
        <div *ngIf="paymentStatus === 'FAILED'" class="status-box">
          <div class="status-icon failed">✕</div>
          <h2 style="color:#b91c1c">Payment Failed</h2>
          <p class="muted">{{ paymentError || 'Transaction was declined by bank or request timed out.' }}</p>
          <div class="action-row" style="max-width:340px;margin:20px auto 0">
            <button class="primary" (click)="paymentStatus='IDLE'">Try Again</button>
            <button class="btn-ghost" (click)="view='CHECKOUT'; paymentStatus='IDLE'">Change Method</button>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW 3: Dedicated Card Payment Page -->
    <div *ngIf="view === 'CARD'" class="gateway-wrap">
      <div class="breadcrumb">
        <a style="cursor:pointer" (click)="view='CHECKOUT'; paymentStatus='IDLE'">← Back to Checkout</a> / Card Payment Page
      </div>

      <div class="card" style="margin:0">
        <div class="gateway-header">
          <div>
            <h2>💳 NextGen Card Gateway</h2>
            <p class="muted">Debit & Credit Cards accepted</p>
          </div>
          <span class="badge info">🔒 PCI-DSS Certified</span>
        </div>

        <div class="amount-banner">
          <div>
            <div class="muted">Amount Payable</div>
            <div class="amount-val">₹{{ payable() | number }}</div>
          </div>
          <div style="text-align:right" *ngIf="selected">
            <span class="muted">Delivering to</span>
            <div><strong>{{ selected.fullName }}</strong> ({{ selected.pincode }})</div>
          </div>
        </div>

        <!-- IDLE STATE: Card Interactive Visual & Form -->
        <div *ngIf="paymentStatus === 'IDLE'">
          <!-- Visual Card Element -->
          <div class="card-preview">
            <div class="row" style="justify-content:space-between">
              <div class="card-chip"></div>
              <strong style="letter-spacing:1px;font-size:14px">{{ cardBrand() }}</strong>
            </div>
            <div class="card-num">{{ cardForm.number || '•••• •••• •••• ••••' }}</div>
            <div class="card-meta">
              <div>
                <span>Cardholder</span>
                <div class="card-val">{{ cardForm.name || 'YOUR NAME' }}</div>
              </div>
              <div style="text-align:right">
                <span>Expires</span>
                <div class="card-val">{{ cardForm.expiry || 'MM/YY' }}</div>
              </div>
            </div>
          </div>

          <!-- Card Form Inputs -->
          <div class="stack" style="gap:10px">
            <label>Card Number
              <input [(ngModel)]="cardForm.number" name="c-num" placeholder="4532 8920 1234 5678" maxlength="19" (input)="formatCardNumber()">
            </label>
            <label>Cardholder Name
              <input [(ngModel)]="cardForm.name" name="c-name" placeholder="Name as printed on card">
            </label>
            <div class="profile-2col">
              <label>Expiry Date (MM/YY)
                <input [(ngModel)]="cardForm.expiry" name="c-exp" placeholder="MM/YY" maxlength="5" (input)="formatExpiry()">
              </label>
              <label>CVV / CVC
                <input [(ngModel)]="cardForm.cvv" name="c-cvv" type="password" placeholder="3 digits" maxlength="3">
              </label>
            </div>
          </div>

          <!-- Test / Action Buttons -->
          <div class="action-row">
            <button class="primary" style="background:#7c3aed" (click)="executePayment('CARD', true)" [disabled]="!cardFormValid()">
              Pay ₹{{ payable() | number }} (Test Success)
            </button>
            <button class="btn-ghost" style="color:#b91c1c;border-color:#fca5a5" (click)="executePayment('CARD', false)">
              Simulate Failure ✕
            </button>
          </div>
          <p class="muted" style="text-align:center;margin-top:10px">Click <strong>Pay</strong> to simulate card approval or <strong>Simulate Failure</strong> to test card decline.</p>
        </div>

        <!-- PROCESSING STATE -->
        <div *ngIf="paymentStatus === 'PROCESSING'" class="status-box">
          <div class="spinner" style="width:40px;height:40px;margin:0 auto 16px;border-width:3px"></div>
          <h2>Processing Card Payment…</h2>
          <p class="muted">Authorizing transaction of <strong>₹{{ payable() | number }}</strong> with your bank</p>
          <p class="muted">Checking 3D Secure / OTP authorization…</p>
        </div>

        <!-- SUCCESS STATE -->
        <div *ngIf="paymentStatus === 'SUCCESS'" class="status-box">
          <div class="status-icon success">✓</div>
          <h2 style="color:#15803d">Payment Successful!</h2>
          <p style="font-size:16px;font-weight:600;margin:6px 0">₹{{ payable() | number }} Charged to Card</p>
          <p class="muted">Authorization Code: <strong>AUTH-{{ txnRef }}</strong></p>
          <span class="badge ok" style="font-size:13px;padding:6px 12px">Order Placed & Confirmed</span>
          <div class="action-row" style="max-width:320px;margin:20px auto 0">
            <button class="primary" style="width:100%" (click)="goToOrders()">View My Orders →</button>
          </div>
        </div>

        <!-- FAILED STATE -->
        <div *ngIf="paymentStatus === 'FAILED'" class="status-box">
          <div class="status-icon failed">✕</div>
          <h2 style="color:#b91c1c">Payment Failed</h2>
          <p class="muted">{{ paymentError || 'Card transaction declined by issuing bank or invalid credentials.' }}</p>
          <div class="action-row" style="max-width:340px;margin:20px auto 0">
            <button class="primary" (click)="paymentStatus='IDLE'">Try Again</button>
            <button class="btn-ghost" (click)="view='CHECKOUT'; paymentStatus='IDLE'">Change Method</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class Checkout implements OnInit {
  view: 'CHECKOUT' | 'UPI' | 'CARD' = 'CHECKOUT';
  paymentStatus: 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILED' = 'IDLE';
  paymentError = '';
  txnRef = '';
  orderId: string | null = null;
  qrCodeData: string | null = null;
  upiVpa = 'demo@upi';   // demo VPA for project demo — replace with your real UPI ID in production

  // UPI page state
  upiTab: 'APP' | 'QR' = 'APP';
  upiApp = 'gpay';
  upiId = 'demo.user@okhdfcbank';

  // Card page state
  cardForm = {
    number: '4532 8920 1234 5678',
    name: 'Sudhismita Nayak',
    expiry: '12/28',
    cvv: '891'
  };

  cart: any = null;
  wallet: any = null;
  points = 0;
  method = 'COD';
  error = '';
  paying = false;

  addresses: any[] = [];
  selected: any = null;
  selectedId = '';
  showForm = false;
  addrLoading = true;
  addrError = '';
  savingAddr = false;
  form: any = { fullName: '', phone: '', pincode: '', addressLine: '', city: '', state: '', landmark: '', addressType: 'HOME', isDefault: false };

  constructor(private shop: Shop, private auth: Auth, private router: Router, private toast: Toast) { }

  ngOnInit(): void {
    this.shop.cart(this.auth.userId()).subscribe((c: any) => (this.cart = c));
    this.shop.wallet(this.auth.userId()).subscribe({ next: (w: any) => (this.wallet = w), error: () => undefined });
    this.loadAddresses();
  }

  addrId(a: any): string { return a.id || a._id || ''; }

  loadAddresses(): void {
    this.addrLoading = true;
    this.shop.addresses(this.auth.userId()).subscribe({
      next: (r: any) => {
        this.addresses = Array.isArray(r) ? r : [];
        this.addrLoading = false;
        const def = this.addresses.find((a) => a.default || a.isDefault) || this.addresses[0];
        if (def && !this.selected) this.select(def);
        if (!this.addresses.length) this.showForm = true;
      },
      error: () => { this.addrLoading = false; this.showForm = true; }
    });
  }

  select(a: any): void {
    this.selected = { ...a };
    this.selectedId = this.addrId(a);
    this.error = '';
  }

  fillSelected(): void {
    if (!this.selected) return;
    this.form = { ...this.selected, isDefault: false };
  }

  formValid(): boolean {
    return !!(this.form.fullName?.trim() && this.form.phone?.trim()
      && /^\d{6}$/.test((this.form.pincode || '').trim())
      && this.form.addressLine?.trim() && this.form.city?.trim() && this.form.state?.trim());
  }

  saveAddress(): void {
    if (!this.formValid() || this.savingAddr) return;
    this.savingAddr = true; this.addrError = '';
    const body = { userId: this.auth.userId(), ...this.form };
    this.shop.addressCreate(body).subscribe({
      next: (a: any) => {
        this.savingAddr = false; this.showForm = false;
        this.toast.ok('Address saved');
        this.loadAddresses();
        this.selected = { ...a }; this.selectedId = this.addrId(a);
      },
      error: (e) => { this.savingAddr = false; this.addrError = e.error?.message || 'Save failed'; }
    });
  }

  itemCount(): number { return (this.cart?.items || []).reduce((s: number, i: any) => s + i.quantity, 0); }
  maxUsable(): number {
    const sub = this.cart?.totalAmount || 0;
    const bal = this.wallet?.balance ?? this.wallet?.pointBalance ?? 0;
    return Math.min(bal, Math.floor(sub * 0.2));
  }
  walletPct(): number {
    const bal = this.wallet?.balance || 1;
    return Math.min(100, ((+this.points || 0) / bal) * 100);
  }
  payable(): number {
    const sub = this.cart?.totalAmount || 0;
    return Math.max(0, sub - (+this.points || 0));
  }

  // Opens either the UPI page or the Card page
  openPayment(targetMethod: 'UPI' | 'CARD'): void {
    this.error = '';
    if (!this.selected) {
      this.error = 'Please select or add a delivery address first';
      this.toast.err(this.error);
      return;
    }
    this.method = targetMethod;
    this.paymentStatus = 'IDLE';
    this.paymentError = '';
    this.view = targetMethod;

    // Generate a temporary QR immediately when opening UPI page
    if (targetMethod === 'UPI') {
      this.orderId = 'ORD-TEMP-' + Math.floor(100000 + Math.random() * 900000);
      this.generateQR();
    }
  }

  selectUpiApp(app: string, defaultId: string): void {
    this.upiApp = app;
    this.upiId = defaultId;
  }

  appendUpiSuffix(suffix: string): void {
    const base = (this.upiId || '').split('@')[0] || 'user';
    this.upiId = base + suffix;
  }

  cardBrand(): string {
    const num = (this.cardForm.number || '').replace(/\s/g, '');
    if (num.startsWith('4')) return 'VISA';
    if (num.startsWith('5')) return 'MASTERCARD';
    if (num.startsWith('6')) return 'RUPAY';
    return 'CARD';
  }

  formatCardNumber(): void {
    let raw = (this.cardForm.number || '').replace(/\D/g, '').substring(0, 16);
    this.cardForm.number = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  formatExpiry(): void {
    let raw = (this.cardForm.expiry || '').replace(/\D/g, '').substring(0, 4);
    if (raw.length >= 2) {
      this.cardForm.expiry = raw.substring(0, 2) + '/' + raw.substring(2);
    } else {
      this.cardForm.expiry = raw;
    }
  }

  cardFormValid(): boolean {
    const num = (this.cardForm.number || '').replace(/\s/g, '');
    return num.length >= 12 && !!this.cardForm.name?.trim() && (this.cardForm.cvv || '').length >= 3;
  }

  /** Generate a real, scannable UPI QR code for this order (no external API needed). */
  async generateQR(): Promise<void> {
    if (!this.orderId) return;
    const amount = this.payable();
    const upiString = `upi://pay?pa=${encodeURIComponent(this.upiVpa)}&pn=${encodeURIComponent('NextGen Shop')}&am=${amount}&tn=${encodeURIComponent(this.orderId)}&cu=INR`;
    try {
      this.qrCodeData = await QRCode.toDataURL(upiString, { width: 300, margin: 2 });
      this.qrCodeData = this.qrCodeData || null;
    } catch (e) {
      console.error('QR generation failed', e);
      this.qrCodeData = null;
    }
  }

  // Executes online payment via mock gateway (tests both Success & Failure)
  executePayment(targetMethod: 'UPI' | 'CARD', shouldSucceed: boolean): void {
    this.paymentStatus = 'PROCESSING';
    this.paymentError = '';
    this.orderId = null;
    this.qrCodeData = null;
    this.txnRef = Math.floor(10000000 + Math.random() * 90000000).toString();

    // 1.5s simulated network delay
    setTimeout(() => {
      if (!shouldSucceed) {
        // Test Failure: Call with 'FAIL' method so backend also registers payment failure
        this.shop.checkout(this.auth.userId(), 'FAIL', +this.points || 0, this.selectedId, this.addressSnapshot()).subscribe({
          next: () => {
            this.paymentStatus = 'FAILED';
            this.paymentError = targetMethod === 'UPI' ? 'Transaction declined by UPI bank server.' : 'Card declined: Insufficient funds or invalid CVV.';
          },
          error: (e) => {
            this.paymentStatus = 'FAILED';
            this.paymentError = e.error?.message || (targetMethod === 'UPI' ? 'UPI PIN incorrect or bank server unavailable.' : 'Card declined by issuing bank.');
          }
        });
        return;
      }

      // Test Success: Call real checkout with targetMethod ('UPI' or 'CARD')
      this.shop.checkout(this.auth.userId(), targetMethod, +this.points || 0, this.selectedId, this.addressSnapshot()).subscribe({
        next: (r: any) => {
          this.orderId = r?.id || r?.orderId || this.orderId;
          this.generateQR();
          this.paymentStatus = 'SUCCESS';
          this.toast.ok('Payment successful! Order placed.');
        },
        error: (e) => {
          this.paymentStatus = 'FAILED';
          this.paymentError = e.error?.message || 'Payment authorization failed.';
          this.toast.err(this.paymentError);
        }
      });
    }, 1500);
  }

  addressSnapshot(): any {
    return {
      fullName: this.selected.fullName, phone: this.selected.phone, pincode: this.selected.pincode,
      addressLine: this.selected.addressLine, city: this.selected.city, state: this.selected.state,
      landmark: this.selected.landmark || '', addressType: this.selected.addressType || 'HOME'
    };
  }

  // Cash on Delivery
  payCOD(): void {
    this.error = ''; this.paying = true;
    if (!this.selected) { this.error = 'Please select a delivery address'; this.paying = false; return; }
    if (+this.points > this.maxUsable()) {
      this.error = 'Points exceed 20% cap (max ' + this.maxUsable() + ')';
      this.paying = false;
      return;
    }

    this.shop.checkout(this.auth.userId(), 'COD', +this.points || 0, this.selectedId, this.addressSnapshot()).subscribe({
      next: () => {
        this.toast.ok('Order placed! Pay cash on delivery.');
        this.router.navigate(['/orders']);
      },
      error: (e) => { this.error = e.error?.message || 'Order failed'; this.paying = false; this.toast.err(this.error); }
    });
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }
}
