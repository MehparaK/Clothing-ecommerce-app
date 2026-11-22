import {
  Alert,
  Box,
  Button,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Typography,
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { useAppDispatch } from '../app/hooks';
import { SimilarProducts } from '../components/shop/SimilarProducts';
import { addToCart } from '../features/cart/cartSlice';
import { useGetProductByIdQuery } from '../features/api/productsApi';

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const {
    data: product,
    isLoading,
    isError,
  } = useGetProductByIdQuery(id ?? '', {
    skip: !id,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (isError || !product) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Alert severity="error">Məhsul tapılmadı.</Alert>
        <Button component={Link} to="/products" sx={{ mt: 2 }}>
          Məhsullara qayıt
        </Button>
      </Container>
    );
  }

  const handleAddToCart = () => {
    dispatch(addToCart(product));
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 } }}>
        <Button component={Link} to="/products" sx={{ mb: 3, px: 0 }}>
          ← Məhsullara qayıt
        </Button>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(320px, 0.75fr)' },
            gap: { xs: 4, md: 8 },
            alignItems: 'start',
          }}
        >
          <Box
            sx={{
              overflow: 'hidden',
              borderRadius: 2,
              bgcolor: 'grey.100',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 12px 32px rgba(31, 41, 34, 0.08)',
            }}
          >
            <CardMedia
              component="img"
              image={product.image || 'https://via.placeholder.com/800x1000?text=No+Image'}
              alt={product.name}
              sx={{
                width: '100%',
                aspectRatio: '4 / 5',
                objectFit: 'cover',
              }}
            />
          </Box>

          <Box sx={{ py: { md: 2 } }}>
            <Typography
              variant="overline"
              color="secondary.dark"
              sx={{ letterSpacing: '0.18em', fontWeight: 700 }}
            >
              {product.category}
            </Typography>
            <Typography
              component="h1"
              variant="h2"
              color="primary.main"
              sx={{ mt: 1, mb: 2, fontSize: { xs: '2.25rem', md: '3.25rem' } }}
            >
              {product.name}
            </Typography>

            <Typography
              variant="h4"
              color="primary.main"
              sx={{ mb: 3, fontWeight: 800 }}
            >
              {product.price} AZN
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
              {product.description}
            </Typography>

            <Chip
              label={product.stock > 0 ? `${product.stock} ədəd stokda` : 'Stokda yoxdur'}
              color={product.stock > 0 ? 'success' : 'default'}
              variant="outlined"
              sx={{ mb: 3 }}
            />

            <Button
              variant="contained"
              size="large"
              disabled={product.stock === 0}
              onClick={handleAddToCart}
              fullWidth
              sx={{ py: 1.5, fontSize: '1rem' }}
            >
              Səbətə əlavə et
            </Button>
          </Box>
        </Box>

        <SimilarProducts currentProduct={product} />
      </Container>
    </Box>
  );
};
