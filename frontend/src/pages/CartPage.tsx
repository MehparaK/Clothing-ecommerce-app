import {
  Alert,
  Box,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useCreateOrderMutation } from '../features/api/ordersApi';
import {
  clearCart,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
} from '../features/cart/cartSlice';

export const CartPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const items = useAppSelector((state) => state.cart.items);
  const user = useAppSelector((state) => state.auth.user);
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address ?? '');
  const [addressError, setAddressError] = useState('');

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleCompleteOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: '/cart' }, replace: true });
      return;
    }

    if (items.length === 0) return;
    if (!deliveryAddress.trim()) {
      setAddressError('Çatdırılma ünvanı tələb olunur.');
      return;
    }

    setOrderError('');
    setOrderSuccess('');

    try {
      await createOrder({
        items: items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
        })),
        total,
        deliveryAddress: deliveryAddress.trim(),
      }).unwrap();

      dispatch(clearCart());
      setOrderSuccess('Sifarişiniz uğurla tamamlandı.');
    } catch (error) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'data' in error &&
        typeof (error as { data?: { message?: unknown } }).data?.message === 'string'
          ? (error as { data: { message: string } }).data.message
          : 'Sifariş tamamlanmadı. Yenidən cəhd edin.';
      setOrderError(message);
    }
  };

  if (items.length === 0) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '70vh', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          {orderSuccess && <Alert severity="success" sx={{ mb: 3 }}>{orderSuccess}</Alert>}
          <Typography component="h1" variant="h3" color="primary.main" sx={{ mb: 2 }}>
            Səbətiniz boşdur
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            Yeni kolleksiyanı kəşf etməyə hazırsınız?
          </Typography>
          <Button component={Link} to="/products" variant="contained" size="large">
            Mağazaya qayıt
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Typography component="h1" variant="h3" color="primary.main" sx={{ mb: 4 }}>
          Səbət
        </Typography>

        {orderError && <Alert severity="error" sx={{ mb: 3 }}>{orderError}</Alert>}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 320px' },
            gap: 4,
            alignItems: 'start',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {items.map((item) => (
              <Card
                key={`${item.product._id}-${item.selectedSize}`}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '88px 1fr', sm: '120px 1fr auto' },
                  alignItems: 'center',
                  p: { xs: 1.5, sm: 2 },
                }}
              >
                <CardMedia
                  component="img"
                  image={item.product.image || 'https://via.placeholder.com/300x400?text=%C5%9E%C9%99kil+yoxdur'}
                  alt={item.product.name}
                  sx={{
                    width: { xs: 72, sm: 96 },
                    height: { xs: 96, sm: 120 },
                    borderRadius: 1,
                    objectFit: 'cover',
                  }}
                />

                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700 }} noWrap>
                    {item.product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {item.product.price} AZN
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ölçü: {item.selectedSize}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    gridColumn: { xs: '1 / -1', sm: 'auto' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'space-between', sm: 'flex-end' },
                    gap: 1,
                    mt: { xs: 1.5, sm: 0 },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <IconButton
                      aria-label="Azalt"
                      onClick={() => dispatch(decreaseQuantity({
                        productId: item.product._id,
                        selectedSize: item.selectedSize,
                      }))}
                      disabled={item.quantity <= 1}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography sx={{ minWidth: 32, textAlign: 'center', fontWeight: 700 }}>
                      {item.quantity}
                    </Typography>
                    <IconButton
                      aria-label="Artır"
                      onClick={() => dispatch(increaseQuantity({
                        productId: item.product._id,
                        selectedSize: item.selectedSize,
                      }))}
                      disabled={item.quantity >= item.product.stock}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Typography sx={{ minWidth: 90, textAlign: 'right', fontWeight: 800, color: 'primary.main' }}>
                    {(item.product.price * item.quantity).toFixed(2)} AZN
                  </Typography>

                  <IconButton
                    aria-label="Məhsulu sil"
                    color="error"
                    onClick={() => dispatch(removeFromCart({
                      productId: item.product._id,
                      selectedSize: item.selectedSize,
                    }))}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Box>
              </Card>
            ))}
          </Box>

          <Card
            component="form"
            noValidate
            onSubmit={handleCompleteOrder}
            sx={{ p: 3, position: { md: 'sticky' }, top: { md: 100 } }}
          >
            <Typography variant="h5" sx={{ mb: 2 }}>Sifariş xülasəsi</Typography>
            <TextField
              label="Çatdırılma ünvanı"
              value={deliveryAddress}
              onChange={(event) => {
                setDeliveryAddress(event.target.value);
                if (event.target.value.trim()) setAddressError('');
              }}
              error={Boolean(addressError)}
              helperText={addressError}
              required
              fullWidth
              multiline
              minRows={2}
              autoComplete="street-address"
              sx={{ mb: 2 }}
            />
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography color="text.secondary">Cəmi</Typography>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>
                {total.toFixed(2)} AZN
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              fullWidth
              type="submit"
              disabled={isLoading}
              sx={{ py: 1.5 }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sifarişi tamamla'}
            </Button>
            <Button
              color="error"
              fullWidth
              sx={{ mt: 1 }}
              type="button"
              onClick={() => dispatch(clearCart())}
            >
              Səbəti təmizlə
            </Button>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};
