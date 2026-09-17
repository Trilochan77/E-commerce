import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast { id: number; msg: string; kind: 'ok' | 'err' | 'info'; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 1;
  toasts$ = new BehaviorSubject<Toast[]>([]);

  show(msg: string, kind: Toast['kind'] = 'info'): void {
    const t = { id: this.seq++, msg, kind };
    this.toasts$.next([...this.toasts$.value, t]);
    setTimeout(() => this.dismiss(t.id), 3600);
  }
  ok(msg: string): void { this.show(msg, 'ok'); }
  err(msg: string): void { this.show(msg, 'err'); }
  dismiss(id: number): void {
    this.toasts$.next(this.toasts$.value.filter((t) => t.id !== id));
  }
}
