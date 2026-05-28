export interface Organ {
  id: number;
  name: string;
  quantity: number | null;
  weight: number | null;
  health_status: string;
  image: string | null;
  price: number;
  stock: number;
}
