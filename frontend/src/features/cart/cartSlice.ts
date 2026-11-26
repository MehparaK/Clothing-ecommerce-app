import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, Product, ProductSize } from '../../types';

interface CartState {
  items: CartItem[];
}

const storedCart = localStorage.getItem('cart');
const storedItems = storedCart
  ? (JSON.parse(storedCart) as Array<Omit<CartItem, 'selectedSize'> & { selectedSize?: ProductSize }>)
  : [];

const initialState: CartState = {
  items: storedItems.map((item) => ({
    ...item,
    selectedSize: item.selectedSize ?? item.product.sizes?.[0] ?? 'S',
  })),
};

interface CartItemKey {
  productId: string;
  selectedSize: ProductSize;
}

interface AddToCartPayload {
  product: Product;
  selectedSize: ProductSize;
  quantity?: number;
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<AddToCartPayload>) => {
      const { product, selectedSize, quantity = 1 } = action.payload;

      // Block adding without a selected size
      if (!selectedSize) return;

      // Cap quantity at available stock; do not add if stock is zero
      const validQuantity = Math.min(quantity, product.stock);
      if (validQuantity < 1) return;

      const existing = state.items.find(
        (item) => item.product._id === product._id && item.selectedSize === selectedSize
      );
      if (existing) {
        existing.quantity = Math.min(existing.quantity + validQuantity, product.stock);
      } else {
        state.items.push({ product, quantity: validQuantity, selectedSize });
      }
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    removeFromCart: (state, action: PayloadAction<CartItemKey>) => {
      const { productId, selectedSize } = action.payload;
      state.items = state.items.filter(
        (item) => item.product._id !== productId || item.selectedSize !== selectedSize
      );
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    increaseQuantity: (state, action: PayloadAction<CartItemKey>) => {
      const item = state.items.find(
        (cartItem) =>
          cartItem.product._id === action.payload.productId &&
          cartItem.selectedSize === action.payload.selectedSize
      );
      if (item && item.quantity < item.product.stock) item.quantity += 1;
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    decreaseQuantity: (state, action: PayloadAction<CartItemKey>) => {
      const item = state.items.find(
        (cartItem) =>
          cartItem.product._id === action.payload.productId &&
          cartItem.selectedSize === action.payload.selectedSize
      );
      if (item && item.quantity > 1) item.quantity -= 1;
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cart');
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
} = cartSlice.actions;

export const cartSliceReducer = cartSlice.reducer;

export default cartSlice;