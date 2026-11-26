export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  termsAccepted: boolean;
  role: 'user' | 'admin';
}

export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export const PRODUCT_SIZES: ProductSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
export const DEFAULT_PRODUCT_SIZES: ProductSize[] = ['S', 'M', 'L', 'XL'];
export const LOW_STOCK_THRESHOLD = 5;

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  sizes: ProductSize[];
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationProduct {
  _id: string;
  name: string;
  image: string;
  price: number;
  stock: number;
}

export interface ProductNotification {
  _id: string;
  product: NotificationProduct | null;
  type: 'back_in_stock' | 'price_drop';
  price?: number;
  previousPrice?: number;
  read: boolean;
  notifiedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: ProductSize;
}

export interface Order {
  _id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}