export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  stock: number;
  active: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: number;
  email: string;
  role: string;
}

export type Category =
  | 'todas'
  | 'tazas'
  | 'platos'
  | 'decoracion'
  | 'bowls'
  | 'jarrones'
  | 'set_vajilla';
