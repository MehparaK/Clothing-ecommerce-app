import { Container, Typography, CircularProgress, Alert, Box } from '@mui/material';
import { useGetProductsQuery } from '../features/api/productsApi';
import { ProductCard } from '../components/shop/ProductCard';

export const ProductsPage = () => {
  const { data: products, isLoading, isError } = useGetProductsQuery();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Məhsulları yükləmək mümkün olmadı.</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Bütün Məhsullar
      </Typography>

      {products && products.length === 0 ? (
        <Typography color="text.secondary">Hələ məhsul yoxdur.</Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 3,
          }}
        >
          {products?.map((product) => (
  <ProductCard key={product._id} product={product} />
))}
        </Box>
      )}
    </Container>
  );
};