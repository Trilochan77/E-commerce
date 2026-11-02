import { Component, ChangeDetectionStrategy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Shop } from '../core/shop';
import { Auth } from '../core/auth';
import { Toast } from '../shared/toast';
import { ProductVisual } from '../shared/product-visual';

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  products?: any[];
  compare?: any[];
  followUps?: string[];
  intent?: string;
  strategy?: string;
  failed?: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-assistant',
  imports: [CommonModule, FormsModule, RouterModule, ProductVisual],
  styles: [`
    .assist-shell {
      display: grid;
      grid-template-rows: auto 1fr auto;
      height: clamp(520px, calc(100vh - 230px), 880px);
      border: 1px solid var(--line-soft);
      border-radius: 18px;
      background: linear-gradient(180deg, rgba(15, 22, 42, .82), rgba(7, 11, 22, .92));
      overflow: hidden;
      box-shadow: 0 24px 70px rgba(0, 0, 0, .45);
    }
    .assist-head {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      padding: 16px 20px; border-bottom: 1px solid var(--line-soft);
      background: linear-gradient(120deg, rgba(139, 92, 246, .16), rgba(34, 211, 238, .07));
    }
    .assist-id { display: flex; align-items: center; gap: 12px; }
    .assist-orb {
      width: 42px; height: 42px; border-radius: 14px; display: grid; place-items: center;
      background: linear-gradient(135deg, var(--brand), var(--brand-3));
      color: #fff; font-size: 20px;
      box-shadow: 0 0 24px rgba(139, 92, 246, .55);
    }
    .assist-head h1 { font-size: 17px; margin: 0; }
    .assist-head p { margin: 2px 0 0; font-size: 12px; color: var(--ink-2); }
    .grounded-pill {
      font-size: 11px; font-weight: 700; letter-spacing: .03em; white-space: nowrap;
      border: 1px solid rgba(34, 211, 238, .35); color: #67e8f9;
      background: rgba(34, 211, 238, .09); padding: 5px 10px; border-radius: 999px;
    }
    .assist-body {
      padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px;
      min-height: 0;
    }
    .msg { display: flex; gap: 10px; max-width: 100%; }
    .msg.user { justify-content: flex-end; }
    .msg .who {
      flex: 0 0 30px; width: 30px; height: 30px; border-radius: 9px; display: grid; place-items: center;
      font-size: 13px; font-weight: 800;
      background: var(--surface-3); border: 1px solid var(--line); color: var(--ink-2);
    }
    .msg.bot .who { background: linear-gradient(135deg, var(--brand), var(--brand-3)); color: #fff; border: 0; }
    .bubble {
      max-width: min(760px, 88%); padding: 12px 15px; border-radius: 14px;
      background: var(--surface-2); border: 1px solid var(--line-soft);
      color: var(--ink); font-size: 14px; line-height: 1.55;
    }
    .msg.user .bubble {
      background: linear-gradient(135deg, rgba(139, 92, 246, .32), rgba(236, 72, 153, .24));
      border-color: rgba(139, 92, 246, .5);
    }
    .bubble .txt { white-space: pre-line; }
    .bubble.failed { border-color: rgba(248, 113, 113, .5); color: #fecaca; }
    .meta { margin-top: 8px; font-size: 10px; color: var(--muted, #8b93b0); letter-spacing: .04em; text-transform: uppercase; }
    .result-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 10px; margin-top: 12px; }
    .mini-card {
      border: 1px solid var(--line); border-radius: 12px; overflow: hidden;
      background: rgba(9, 14, 28, .8); display: flex; flex-direction: column;
      transition: border-color .15s ease, transform .15s ease;
    }
    .mini-card:hover { border-color: var(--brand); transform: translateY(-2px); }
    .mini-media { position: relative; }
    .mini-media .flag { position: absolute; top: 6px; left: 6px; }
    .mini-body { padding: 10px; display: flex; flex-direction: column; gap: 5px; }
    .mini-body h4 { margin: 0; font-size: 13px; line-height: 1.3; }
    .mini-body h4 a { color: var(--ink); }
    .mini-price { font-weight: 800; font-size: 14px; }
    .mini-meta { font-size: 11px; color: var(--ink-2); display: flex; flex-wrap: wrap; gap: 6px; }
    .mini-actions { display: flex; gap: 6px; margin-top: 4px; }
    .mini-actions button { flex: 1; }
    .reasons { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 2px; }
    .reason {
      font-size: 9px; font-weight: 700; letter-spacing: .03em; text-transform: uppercase;
      padding: 2px 6px; border-radius: 4px; color: #c4b5fd;
      background: rgba(139, 92, 246, .12); border: 1px solid rgba(139, 92, 246, .25);
    }
    .compare-wrap { margin-top: 12px; overflow-x: auto; }
    .compare-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .compare-table th, .compare-table td {
      text-align: left; padding: 9px 10px; border-bottom: 1px solid var(--line-soft); vertical-align: top;
    }
    .compare-table th { color: var(--ink-2); font-size: 11px; text-transform: uppercase; letter-spacing: .05em; }
    .compare-table td:first-child { color: var(--ink-2); font-weight: 600; white-space: nowrap; }
    .followups { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
    .followup {
      border: 1px solid var(--line); background: rgba(139, 92, 246, .08);
      color: var(--ink-2); border-radius: 999px; padding: 5px 10px; font-size: 12px;
      cursor: pointer; transition: all .15s ease;
    }
    .followup:hover { border-color: var(--brand); color: var(--ink); background: var(--brand-soft); }
    .composer { border-top: 1px solid var(--line-soft); padding: 12px 16px 14px; background: rgba(6, 9, 20, .65); }
    .composer-row { display: flex; gap: 8px; }
    .composer input { flex: 1; }
    .composer button { min-width: 92px; }
    .hint { margin-top: 6px; font-size: 11px; color: var(--ink-2); display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
    .quick { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
    .typing { display: inline-flex; gap: 4px; align-items: center; color: var(--ink-2); font-size: 13px; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--brand); animation: blink 1s infinite ease-in-out; }
    .dot:nth-child(2) { animation-delay: .15s; }
    .dot:nth-child(3) { animation-delay: .3s; }
    @keyframes blink { 0%, 100% { opacity: .25; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-2px); } }
    @media (max-width: 640px) {
      .assist-body { padding: 14px; }
      .bubble { max-width: 92%; }
      .grounded-pill { display: none; }
    }
  `],
  template: `
    <div class="breadcrumb"><a routerLink="/">Home</a> / Shopping Assistant</div>
    <div class="assist-shell">
      <div class="assist-head">
        <div class="assist-id">
          <div class="assist-orb">✦</div>
          <div>
            <h1>NextGen Shopping Assistant</h1>
            <p>Answers from the live catalog — no invented products, prices or ratings.</p>
          </div>
        </div>
        <span class="grounded-pill">● GROUNDED · RULES + RETRIEVAL</span>
      </div>

      <div class="assist-body" #scroller>
        <div class="quick" *ngIf="messages.length <= 1">
          <button class="followup" *ngFor="let q of quickPrompts" (click)="send(q)">{{ q }}</button>
        </div>

        <div class="msg" *ngFor="let m of messages" [ngClass]="m.role">
          <div class="who">{{ m.role === 'user' ? (initial() || 'You') : '✦' }}</div>
          <div class="bubble" [class.failed]="m.failed">
            <div class="txt">{{ m.text }}</div>

            <div class="result-grid" *ngIf="m.products?.length">
              <div class="mini-card" *ngFor="let p of m.products">
                <div class="mini-media">
                  <app-product-visual [product]="p" [categoryId]="p.category" size="sm"></app-product-visual>
                  <span class="flag" [ngClass]="p.availability ? 'green' : 'amber'">
                    {{ p.availability ? 'In stock' : 'Out of stock' }}
                  </span>
                </div>
                <div class="mini-body">
                  <h4><a [routerLink]="['/products', p.productId]">{{ p.name }}</a></h4>
                  <div class="mini-price">₹{{ p.price | number }}</div>
                  <div class="mini-meta">
                    <span>{{ p.categoryName }}</span>
                    <span>·</span>
                    <span>{{ p.reviewCount > 0 ? (p.rating + '/5 (' + p.reviewCount + ')') : 'No ratings yet' }}</span>
                  </div>
                  <div class="reasons" *ngIf="p.reasons?.length">
                    <span class="reason" *ngFor="let r of p.reasons">{{ prettyReason(r) }}</span>
                  </div>
                  <div class="mini-actions">
                    <a [routerLink]="['/products', p.productId]" style="flex:1"><button class="btn-ghost btn-sm" style="width:100%">View</button></a>
                    <button class="primary btn-sm" [disabled]="!p.availability || adding === p.productId" (click)="addToCart(p)">
                      {{ adding === p.productId ? '…' : 'Add' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="compare-wrap" *ngIf="m.compare?.length === 2">
              <table class="compare-table">
                <tr><th>Field</th><th>{{ m.compare[0].name }}</th><th>{{ m.compare[1].name }}</th></tr>
                <tr><td>Price</td><td><strong>₹{{ m.compare[0].price | number }}</strong></td><td><strong>₹{{ m.compare[1].price | number }}</strong></td></tr>
                <tr><td>Category</td><td>{{ m.compare[0].categoryName }}</td><td>{{ m.compare[1].categoryName }}</td></tr>
                <tr><td>Availability</td><td>{{ stockText(m.compare[0]) }}</td><td>{{ stockText(m.compare[1]) }}</td></tr>
                <tr><td>Rating</td><td>{{ ratingText(m.compare[0]) }}</td><td>{{ ratingText(m.compare[1]) }}</td></tr>
                <tr><td>Return</td><td>{{ m.compare[0].returnEligible ? 'Eligible (7 days)' : 'Not eligible' }}</td><td>{{ m.compare[1].returnEligible ? 'Eligible (7 days)' : 'Not eligible' }}</td></tr>
                <tr><td>Listing features</td>
                  <td><span *ngFor="let f of m.compare[0].features">• {{ f }}<br></span><span *ngIf="!m.compare[0].features?.length">Not specified</span></td>
                  <td><span *ngFor="let f of m.compare[1].features">• {{ f }}<br></span><span *ngIf="!m.compare[1].features?.length">Not specified</span></td>
                </tr>
              </table>
            </div>

            <div class="followups" *ngIf="m.followUps?.length">
              <button class="followup" *ngFor="let f of m.followUps" (click)="send(f)">{{ f }}</button>
            </div>

            <div class="meta" *ngIf="m.role === 'bot' && m.strategy">{{ m.intent }} · {{ m.strategy }}</div>
          </div>
        </div>

        <div class="msg bot" *ngIf="pending">
          <div class="who">✦</div>
          <div class="bubble"><span class="typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span> Checking the live catalog…</span></div>
        </div>
      </div>

      <div class="composer">
        <div class="composer-row">
          <input [(ngModel)]="draft" name="assistantInput" (keyup.enter)="send()"
                 placeholder="Ask about products, budget, features, comparisons…" aria-label="Ask the shopping assistant"
                 [disabled]="pending" autocomplete="off">
          <button class="primary" (click)="send()" [disabled]="pending || !draft.trim()">
            {{ pending ? 'Thinking…' : 'Ask' }}
          </button>
        </div>
        <div class="hint">
          <span>Examples: “Suggest a laptop under ₹50,000 for MCA students” · “Compare Laptop Ultra 14 vs Tablet Tab A11 64GB”</span>
          <span>Grounded in the product database</span>
        </div>
      </div>
    </div>
  `
})
export class Assistant implements OnInit {
  @ViewChild('scroller') scroller?: ElementRef<HTMLElement>;

  messages: ChatMessage[] = [];
  draft = '';
  pending = false;
  adding = '';

  quickPrompts = [
    'Suggest a laptop under ₹50,000 for MCA students',
    'Show me in-stock headphones under ₹3,000',
    'Compare Wireless Headphones X1 vs Bluetooth Speaker Boom',
    'Is the Laptop Ultra 14 in stock?',
    'What is your return policy?'
  ];

  constructor(private shop: Shop, public auth: Auth, private toast: Toast, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.messages.push({
      role: 'bot',
      text: "Hi! I'm the NextGen shopping assistant. I can find products by budget and requirement, compare listings, explain features and stock, suggest alternatives, and recommend from your history.\n\nEvery price, stock count and rating I quote comes from the live catalog — I won't invent a product.",
      intent: 'GREETING',
      strategy: 'rules+retrieval'
    });
    // Deep link from a product page: /assistant?q=Is%20the%20Laptop...%20in%20stock%3F
    const prefill = this.route.snapshot.queryParamMap.get('q');
    if (prefill) {
      this.draft = prefill;
      this.send(prefill);
    }
  }

  initial(): string {
    const name = localStorage.getItem('ecom_name') || '';
    return name.trim().charAt(0).toUpperCase();
  }

  send(text?: string): void {
    const message = (text ?? this.draft).trim();
    if (!message || this.pending) return;
    const lastBot = [...this.messages].reverse().find((m) => m.role === 'bot' && m.products?.length);
    const contextIds = (lastBot?.products || []).map((p) => p.productId).slice(0, 4);

    this.messages.push({ role: 'user', text: message });
    this.draft = '';
    this.pending = true;
    this.scroll();

    const userId = this.auth.isLoggedIn() ? this.auth.userId() : null;
    this.shop.assistant(userId, message, contextIds).subscribe({
      next: (r: any) => {
        this.pending = false;
        this.messages.push({
          role: 'bot',
          text: r.reply || 'I could not build an answer from the catalog.',
          products: r.products || [],
          compare: r.compare || [],
          followUps: r.followUps || [],
          intent: r.intent,
          strategy: r.strategy
        });
        this.scroll();
      },
      error: (e) => {
        this.pending = false;
        this.messages.push({
          role: 'bot',
          text: e?.status === 0
            ? 'I cannot reach the assistant service right now. Make sure the backend is running, then try again.'
            : (e?.error?.message || 'The assistant could not answer that. Please try rephrasing.'),
          failed: true
        });
        this.scroll();
      }
    });
  }

  addToCart(p: any): void {
    if (!p?.availability) { this.toast.err('That item is out of stock'); return; }
    if (!this.auth.isLoggedIn()) { this.toast.err('Please log in to add items to your cart'); return; }
    this.adding = p.productId;
    this.shop.cartAdd(this.auth.userId(), p.productId, 1).subscribe({
      next: () => { this.adding = ''; this.toast.ok(`Added "${p.name}" to cart`); },
      error: (e) => { this.adding = ''; this.toast.err(e.error?.message || 'Could not add to cart'); }
    });
  }

  prettyReason(r: string): string {
    return (r || '').replace(/-/g, ' ');
  }

  stockText(p: any): string {
    if (!p) return '';
    return p.availability ? `In stock (${p.stockQuantity} units)` : 'Out of stock';
  }

  ratingText(p: any): string {
    if (!p) return '';
    return p.reviewCount > 0 ? `${p.rating}/5 from ${p.reviewCount} review${p.reviewCount === 1 ? '' : 's'}` : 'No ratings yet';
  }

  private scroll(): void {
    setTimeout(() => {
      const el = this.scroller?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 30);
  }
}
