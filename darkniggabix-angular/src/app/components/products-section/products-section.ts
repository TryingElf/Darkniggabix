import { Component, OnInit, inject, input, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { ProductsService } from '../../services/products.service';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { Weapon } from '../../models/weapon.model';
import { Drug } from '../../models/drug.model';
import { Organ } from '../../models/organ.model';

export type Category = 'weapons' | 'drugs' | 'organs';

@Component({
  selector: 'app-products-section',
  imports: [CurrencyPipe],
  templateUrl: './products-section.html',
  styleUrl: './products-section.css'
})
export class ProductsSection implements OnInit {
  category = input.required<Category>();

  private productsService = inject(ProductsService);
  private cartService = inject(CartService);
  private notif = inject(NotificationService);

  items = signal<(Weapon | Drug | Organ)[]>([]);
  loading = signal(false);

  get categoryTitle(): string {
    return { weapons: 'Armes', drugs: 'Drogues', organs: 'Organs' }[this.category()];
  }

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading.set(true);
    const req: Observable<any[]> = this.category() === 'weapons'
      ? this.productsService.getWeapons()
      : this.category() === 'drugs'
        ? this.productsService.getDrugs()
        : this.productsService.getOrgans();

    req.subscribe({
      next: (data: any[]) => { this.items.set(data); this.loading.set(false); },
      error: () => { this.notif.show('Error carregant els productes', 'error'); this.loading.set(false); }
    });
  }

  addToCart(item: any): void {
    const stock = item.stock as number;
    if (stock <= 0) {
      this.notif.show(`${item.name}: sense estoc`, 'error');
      return;
    }
    if (this.category() !== 'organs') {
      const inCart = this.cartService.items()
        .filter(i => i.product_id === item.id && i.category === this.category())
        .reduce((sum, i) => sum + i.quantity, 0);
      if (inCart >= stock) {
        this.notif.show(`Estoc màxim assolit (${stock} unitats)`, 'error');
        return;
      }
    }
    const unitPrice = this.category() === 'drugs'
      ? (item as Drug).price_per_gram
      : (item as Weapon | Organ).price;
    this.cartService.addItem({
      category: this.category(),
      product_id: item.id,
      product_name: item.name,
      quantity: 1,
      unit_price: unitPrice,
    }).subscribe({
      next: () => this.notif.show(`${item.name} afegit al carrito`, 'success'),
      error: () => this.notif.show('Error afegint al carrito', 'error'),
    });
  }
}
