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

export interface OrderItem {
  id: number;
  orderId: number;
  productId?: number;
  productName: string;
  productImg: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  notes?: string;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
