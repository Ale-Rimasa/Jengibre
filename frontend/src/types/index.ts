export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  images?: string[];
  stock: number;
  active: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  preorder?: boolean; // true = producto por encargo (~25 días)
}

export interface User {
  id: number;
  email: string;
  role: string;
}

// Category is a string slug (e.g. 'tazas', 'bowls', 'todas')
export type Category = string;

// Category as stored in the database
export interface CategoryOption {
  id: number;
  slug: string;
  label: string;
  active: boolean;
  order: number;
}

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
