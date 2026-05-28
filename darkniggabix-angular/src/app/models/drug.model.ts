export interface Drug {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  price_per_gram: number;
  max_grams: number;
  stock: number;
}
