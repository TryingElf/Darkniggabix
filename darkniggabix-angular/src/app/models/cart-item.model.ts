export interface CartItem {
  id: number;
  category: 'weapons' | 'drugs' | 'organs';
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}
