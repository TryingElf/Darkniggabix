import { Component, signal } from '@angular/core';
import { Nav, Tab } from './components/nav/nav';
import { Notification } from './components/notification/notification';
import { ProductsSection, Category } from './components/products-section/products-section';
import { Cart } from './components/cart/cart';

@Component({
  selector: 'app-root',
  imports: [Nav, Notification, ProductsSection, Cart],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  activeTab = signal<Tab>('weapons');

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  get currentCategory(): Category | null {
    const t = this.activeTab();
    return t !== 'cart' ? t : null;
  }
}
