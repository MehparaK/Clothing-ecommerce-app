import { Box, Typography, Grid, CircularProgress } from '@mui/material';
import { useGetProductsQuery } from '../../features/api/productsApi';
import { findSimilarProducts } from '../../utils/similarProducts';
import { ProductCard } from './ProductCard';
import type { Product } from '../../types';

interface SimilarProductsProps {
  currentProduct: Product;
}

export const SimilarProducts = ({ currentProduct }: SimilarProductsProps) => {
  const { data: products, isLoading } = useGetProductsQuery();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (!products || products.length === 0) return null;

  const similar = findSimilarProducts(currentProduct, products, 4);

  if (similar.length === 0) return null;

  return (
    <Box sx={{ mt: 8 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Buna bənzər paltarlar
      </Typography>
      <Grid container spacing={3}>
        {similar.map((product) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={product._id}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};