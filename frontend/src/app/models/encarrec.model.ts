export interface Encarrec {
  id: number;
  producte: string;
  categoria: 'weapons' | 'drugs' | 'organs';
  quantitat: number;
  email: string;
  pressupost: number | null;
  notes: string | null;
  estat: string;
}
