import { Component, input, output } from '@angular/core';

export type Tab = 'weapons' | 'drugs' | 'organs' | 'cart' | 'encarrecs';

@Component({
  selector: 'app-nav',
  imports: [],
  templateUrl: './nav.html',
  styleUrl: './nav.css'
})
export class Nav {
  activeTab = input.required<Tab>();
  tabChange = output<Tab>();

  readonly tabs: { id: Tab; label: string }[] = [
    { id: 'weapons', label: 'ARMES' },
    { id: 'drugs',   label: 'DROGUES' },
    { id: 'organs',  label: 'ORGANS' },
    { id: 'cart',    label: 'CARRITO' },
    { id: 'encarrecs', label: 'ENCÀRRECS' },
  ];

  select(tab: Tab): void {
    this.tabChange.emit(tab);
  }

  onKey(event: KeyboardEvent, tab: Tab): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.select(tab);
    }
  }
}
