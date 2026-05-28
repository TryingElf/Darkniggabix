import { CartItem } from './cart-item.model';

export interface OrderResult {
  ref: string;
  items: CartItem[];
  total: number;
}
