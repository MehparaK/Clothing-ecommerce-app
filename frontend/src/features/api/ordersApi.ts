import { baseApi } from './baseApi';
import type { ProductSize } from '../../types';

export type OrderStatus = 'pending' | 'confirmed' | 'in_delivery' | 'completed' | 'cancelled';

export interface CreateOrderItem {
  product: string;
  quantity: number;
  selectedSize: ProductSize;
}

export interface CreateOrderRequest {
  items: CreateOrderItem[];
  total: number;
  deliveryAddress: string;
}

export interface OrderResponse {
  _id: string;
  user: string;
  items: CreateOrderItem[];
  total: number;
  deliveryAddress: string;
  status: OrderStatus;
  createdAt?: string;
  closedAt?: string;
}

export interface AdminOrderItem {
  product: {
    _id: string;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
  selectedSize?: ProductSize;
}

export interface AdminOrderResponse {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: AdminOrderItem[];
  total: number;
  deliveryAddress?: string;
  status: OrderStatus;
  createdAt?: string;
  closedAt?: string;
}

export interface MyOrderResponse {
  _id: string;
  items: Array<{
    product: AdminOrderItem['product'] | null;
    quantity: number;
    selectedSize?: ProductSize;
  }>;
  total: number;
  deliveryAddress?: string;
  status: OrderStatus;
  createdAt?: string;
  closedAt?: string;
}

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<OrderResponse, CreateOrderRequest>({
      query: (body) => ({
        url: '/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Orders', 'Products'],
    }),
    getOrders: builder.query<AdminOrderResponse[], void>({
      query: () => '/orders',
      providesTags: ['Orders'],
    }),
    getMyOrders: builder.query<MyOrderResponse[], void>({
      query: () => '/orders/mine',
      providesTags: ['Orders'],
    }),
    updateOrderStatus: builder.mutation<
      AdminOrderResponse,
      { id: string; status: OrderStatus }
    >({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Orders'],
    }),
    confirmDelivery: builder.mutation<MyOrderResponse, string>({
      query: (id) => ({
        url: `/orders/${id}/confirm-delivery`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  useConfirmDeliveryMutation,
} = ordersApi;
