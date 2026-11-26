import { baseApi } from './baseApi';
import type { Product } from '../../types';

interface SetFavoriteRequest {
  productId: string;
  isFavorite: boolean;
}

export const favoritesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFavorites: builder.query<Product[], void>({
      query: () => '/auth/favorites',
      providesTags: ['Favorites'],
    }),
    setFavorite: builder.mutation<
      { productId: string; isFavorite: boolean },
      SetFavoriteRequest
    >({
      query: ({ productId, isFavorite }) => ({
        url: `/auth/favorites/${productId}`,
        method: 'PUT',
        body: { isFavorite },
      }),
      invalidatesTags: ['Favorites'],
    }),
  }),
});

export const { useGetFavoritesQuery, useSetFavoriteMutation } = favoritesApi;
