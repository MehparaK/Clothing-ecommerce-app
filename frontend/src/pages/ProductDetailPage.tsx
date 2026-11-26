import {
  Alert,
  Box,
  Button,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { SimilarProducts } from '../components/shop/SimilarProducts';
import { SizeSelector } from '../components/shop/SizeSelector';
import { addToCart } from '../features/cart/cartSlice';
import { useGetProductByIdQuery } from '../features/api/productsApi';
import { DEFAULT_PRODUCT_SIZES, type ProductSize } from '../types';

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [sizeSelection, setSizeSelection] = useState<{
    productId: string | undefined;
    size: ProductSize | null;
  }>({ productId: id, size: null });
  const [quantitySelection, setQuantitySelection] = useState<{
    productId: string | undefined;
    quantity: number;
  }>({ productId: id, quantity: 1 });
  const selectedSize = sizeSelection.productId === id ? sizeSelection.size : null;
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

  const quantity =
    quantitySelection.productId === id
      ? Math.min(quantitySelection.quantity, Math.max(1, product.stock))
      : 1;

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedSize) return;

    dispatch(addToCart({ product, selectedSize, quantity }));
  };
  const sizes = product.sizes?.length ? product.sizes : DEFAULT_PRODUCT_SIZES;
  const handleSizeChange = (size: ProductSize | null) => {
    setSizeSelection({ productId: id, size });
  };
  const handleQuantityChange = (nextQuantity: number) => {
    setQuantitySelection({
      productId: id,
      quantity: Math.min(Math.max(1, nextQuantity), Math.max(1, product.stock)),
    });
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
              width: '100%',
              maxWidth: { xs: 420, md: 520 },
              justifySelf: 'center',
              bgcolor: 'grey.100',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 12px 32px rgba(31, 41, 34, 0.08)',
            }}
          >
            <CardMedia
              component="img"
              image={product.image || 'https://via.placeholder.com/800x1000?text=%C5%9E%C9%99kil+yoxdur'}
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

            <Typography variant="body2" sx={{ mb: 1, fontWeight: 700 }}>
              Ölçü seçin
            </Typography>
            <Box sx={{ mb: 3 }}>
              <SizeSelector
                sizes={sizes}
                selectedSize={selectedSize}
                onChange={handleSizeChange}
              />
            </Box>

            <Chip
              label={product.stock > 0 ? `${product.stock} ədəd stokda` : 'Stokda yoxdur'}
              color={product.stock > 0 ? 'success' : 'default'}
              variant="outlined"
              sx={{ mb: 3 }}
            />

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 700 }}>
                Miqdar
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <IconButton
                  aria-label="Miqdarı azalt"
                  disabled={quantity <= 1}
                  onClick={() => handleQuantityChange(quantity - 1)}
                >
                  <RemoveIcon />
                </IconButton>
                <Typography sx={{ minWidth: 36, textAlign: 'center', fontWeight: 700 }}>
                  {quantity}
                </Typography>
                <IconButton
                  aria-label="Miqdarı artır"
                  disabled={quantity >= product.stock}
                  onClick={() => handleQuantityChange(quantity + 1)}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>

            <Button
              variant="contained"
              size="large"
              disabled={product.stock === 0 || !selectedSize}
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
