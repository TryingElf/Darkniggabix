import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { OrderResult } from '../../models/order-result.model';

@Component({
  selector: 'app-cart',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {
  cartService = inject(CartService);
  private notif = inject(NotificationService);

  showConfirm = signal(false);
  ordering = signal(false);
  orderResult = signal<OrderResult | null>(null);
  orderDate = signal<Date>(new Date());

  ngOnInit(): void {
    this.cartService.load();
  }

  removeItem(id: number, name: string): void {
    this.cartService.removeItem(id).subscribe({
      next: () => this.notif.show(`${name} tret del carrito`, 'success'),
      error: () => this.notif.show('Error eliminant del carrito', 'error'),
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => this.notif.show('Carrito buidat', 'success'),
      error: () => this.notif.show('Error buidant el carrito', 'error'),
    });
  }

  confirmOrder(): void {
    this.showConfirm.set(false);
    this.ordering.set(true);
    this.orderDate.set(new Date());
    this.cartService.placeOrder().subscribe({
      next: result => {
        this.orderResult.set(result);
        this.ordering.set(false);
      },
      error: err => {
        this.ordering.set(false);
        const errors: string[] = err.error?.errors ?? [];
        const msg = errors.length ? errors.join(' | ') : 'Error en processar la comanda';
        this.notif.show(msg, 'error');
      },
    });
  }

  newOrder(): void {
    this.orderResult.set(null);
    this.cartService.load();
  }
}
