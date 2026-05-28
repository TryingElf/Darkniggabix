import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { OrderResult } from '../models/order-result.model';

const API = 'http://localhost:3000/api/products';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);

  items = signal<CartItem[]>([]);
  total = computed(() => this.items().reduce((sum, i) => sum + i.total_price, 0));
  count = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0));

  load(): void {
    this.http.get<CartItem[]>(`${API}/cart`).subscribe({
      next: data => this.items.set(data),
    });
  }

  addItem(item: Omit<CartItem, 'id' | 'total_price'>): Observable<CartItem> {
    return this.http.post<CartItem>(`${API}/cart`, item).pipe(
      tap(newItem => {
        const existing = this.items().find(
          i => i.product_id === newItem.product_id && i.category === newItem.category && newItem.category !== 'organs'
        );
        if (existing) {
          this.items.update(list => list.map(i => i.id === existing.id ? newItem : i));
        } else {
          this.items.update(list => [...list, newItem]);
        }
      })
    );
  }

  removeItem(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/cart/${id}`).pipe(
      tap(() => this.items.update(list => list.filter(i => i.id !== id)))
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(`${API}/cart`).pipe(
      tap(() => this.items.set([]))
    );
  }

  placeOrder(): Observable<OrderResult> {
    return this.http.post<OrderResult>(`${API}/order`, {}).pipe(
      tap(() => this.items.set([]))
    );
  }
}
