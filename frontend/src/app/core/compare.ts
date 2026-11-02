import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

const STORAGE_KEY = 'ecom_compare';
export const COMPARE_MAX = 4;
export const COMPARE_MIN = 2;

/**
 * Selection state for the product comparison page.
 *
 * Kept in localStorage so the choice survives navigation and a refresh, and
 * broadcast through {@link changed} so the navbar badge reacts immediately.
 * This is UI state only — no product data is cached here.
 */
@Injectable({ providedIn: 'root' })
export class CompareStore {
  readonly changed = new Subject<string[]>();

  ids(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string').slice(0, COMPARE_MAX) : [];
    } catch {
      return [];
    }
  }

  count(): number {
    return this.ids().length;
  }

  has(id: string): boolean {
    return !!id && this.ids().includes(id);
  }

  /** Adds a product, or reports why it could not be added. */
  add(id: string): { ok: boolean; message?: string } {
    if (!id) return { ok: false, message: 'Unknown product' };
    const current = this.ids();
    if (current.includes(id)) return { ok: true };
    if (current.length >= COMPARE_MAX) {
      return { ok: false, message: `You can compare up to ${COMPARE_MAX} products` };
    }
    this.write([...current, id]);
    return { ok: true };
  }

  remove(id: string): void {
    this.write(this.ids().filter((x) => x !== id));
  }

  toggle(id: string): { ok: boolean; added: boolean; message?: string } {
    if (this.has(id)) {
      this.remove(id);
      return { ok: true, added: false };
    }
    const result = this.add(id);
    return { ...result, added: result.ok };
  }

  clear(): void {
    this.write([]);
  }

  private write(ids: string[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, COMPARE_MAX)));
    this.changed.next(this.ids());
  }
}
