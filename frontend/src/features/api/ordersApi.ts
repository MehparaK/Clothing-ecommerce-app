import { baseApi } from './baseApi';

export interface CreateOrderItem {
  product: string;
  quantity: number;
}

export interface CreateOrderRequest {
  items: CreateOrderItem[];
  total: number;
}

export interface OrderResponse {
  _id: string;
  user: string;
  items: CreateOrderItem[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered';
  createdAt?: string;
}

export interface AdminOrderItem {
  product: {
    _id: string;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
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
  status: 'pending' | 'shipped' | 'delivered';
  createdAt?: string;
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
    updateOrderStatus: builder.mutation<
      AdminOrderResponse,
      { id: string; status: 'pending' | 'shipped' | 'delivered' }
    >({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
} = ordersApi;
