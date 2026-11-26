import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  useConfirmDeliveryMutation,
  useGetMyOrdersQuery,
  type OrderStatus,
} from '../features/api/ordersApi';

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Gözləmədə',
  confirmed: 'Təsdiqlənib',
  in_delivery: 'Çatdırılmada',
  completed: 'Tamamlanıb',
  cancelled: 'Ləğv edilib',
};

const statusColors: Record<OrderStatus, 'warning' | 'info' | 'primary' | 'success' | 'error'> = {
  pending: 'warning',
  confirmed: 'info',
  in_delivery: 'primary',
  completed: 'success',
  cancelled: 'error',
};

const formatOrderDate = (date: string | undefined) => {
  if (!date) return 'Tarix mövcud deyil';
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime()) ? 'Tarix mövcud deyil' : parsedDate.toLocaleString();
};

export const MyOrdersPage = () => {
  const { data: orders = [], isLoading, isError } = useGetMyOrdersQuery();
  const [
    confirmDelivery,
    { isLoading: isConfirmingDelivery, error: confirmDeliveryError },
  ] = useConfirmDeliveryMutation();

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
        <Alert severity="error">Sifarişləri yükləmək mümkün olmadı.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Sifarişlərim
      </Typography>

      {orders.length ? (
        <Stack spacing={2}>
          {confirmDeliveryError && (
            <Alert severity="error">
              Çatdırılmanı təsdiqləmək mümkün olmadı. Yenidən cəhd edin.
            </Alert>
          )}
          {orders.map((order) => (
            <Card key={order._id} sx={{ p: { xs: 2, sm: 3 } }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>
                    Sifariş #{order._id.slice(-8).toUpperCase()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatOrderDate(order.createdAt)}
                  </Typography>
                </Box>
                <Chip
                  label={statusLabels[order.status]}
                  color={statusColors[order.status]}
                  size="small"
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              {order.deliveryAddress && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Çatdırılma ünvanı:</strong> {order.deliveryAddress}
                </Typography>
              )}

              <Stack spacing={1.5}>
                {order.items.map((item, index) => (
                  <Box
                    key={`${item.product?._id ?? index}-${item.selectedSize ?? ''}`}
                    sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>
                        {item.product?.name || 'Məhsul artıq mövcud deyil'} × {item.quantity}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ölçü: {item.selectedSize || '—'}
                      </Typography>
                    </Box>
                    {item.product && (
                      <Typography sx={{ whiteSpace: 'nowrap' }}>
                        {(item.product.price * item.quantity).toFixed(2)} AZN
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Typography color="text.secondary">Cəmi</Typography>
                <Typography sx={{ color: 'primary.main', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  {Number(order.total).toFixed(2)} AZN
                </Typography>
              </Box>
              {order.status === 'in_delivery' && (
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  disabled={isConfirmingDelivery}
                  onClick={() => void confirmDelivery(order._id)}
                >
                  {isConfirmingDelivery ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : 'Çatdırılmanı təsdiqlə'}
                </Button>
              )}
            </Card>
          ))}
        </Stack>
      ) : (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Hələ sifarişiniz yoxdur.
          </Typography>
          <Button component={Link} to="/products" variant="contained">
            Məhsullara bax
          </Button>
        </Box>
      )}
    </Container>
  );
};
