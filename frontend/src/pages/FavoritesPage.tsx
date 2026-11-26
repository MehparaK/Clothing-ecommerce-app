import { Alert, Box, Button, CircularProgress, Container, Typography } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/shop/ProductCard';
import { useGetFavoritesQuery } from '../features/api/favoritesApi';

export const FavoritesPage = () => {
  const { data: favorites, isLoading, isError } = useGetFavoritesQuery();

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
        <Alert severity="error">Sevimli məhsulları yükləmək mümkün olmadı.</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Sevimlilərim
      </Typography>

      {favorites?.length ? (
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
          {favorites.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </Box>
      ) : (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <FavoriteBorderIcon color="action" sx={{ fontSize: 48, mb: 1 }} />
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Hələ sevimlilərə məhsul əlavə etməmisiniz.
          </Typography>
          <Button component={Link} to="/products" variant="contained">
            Məhsullara bax
          </Button>
        </Box>
      )}
    </Container>
  );
};
