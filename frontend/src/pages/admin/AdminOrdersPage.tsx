import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useState } from 'react';
import {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  type AdminOrderResponse,
  type OrderStatus,
} from '../../features/api/ordersApi';

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'in_delivery',
  'completed',
  'cancelled',
];

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Gözləmədə',
  confirmed: 'Təsdiqlənib',
  in_delivery: 'Çatdırılmada',
  completed: 'Tamamlanıb',
  cancelled: 'Ləğv edilib',
};

const isOrderStatus = (value: string): value is OrderStatus =>
  ORDER_STATUSES.some((status) => status === value);

const formatOrderDate = (date: string | undefined) => {
  if (!date) return '—';
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime()) ? '—' : parsedDate.toLocaleString();
};

const getOrderTimestamp = (date: string | undefined) => {
  if (!date) return null;
  const timestamp = new Date(date).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
};

export const AdminOrdersPage = () => {
  const { data: orders = [], isLoading, isError } = useGetOrdersQuery();
  const [
    updateOrderStatus,
    { isLoading: isUpdatingStatus, error: updateStatusError },
  ] = useUpdateOrderStatusMutation();
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderResponse | null>(null);

  const orderList = Array.isArray(orders) ? orders : [];
  const sortedOrders = [...orderList].sort((a, b) => {
    const aDate = getOrderTimestamp(a.createdAt);
    const bDate = getOrderTimestamp(b.createdAt);
    if (aDate === null) return bDate === null ? 0 : 1;
    if (bDate === null) return -1;
    return bDate - aDate;
  });
  const filteredOrders = sortedOrders.filter(
    (order) => statusFilter === 'all' || order.status === statusFilter
  );

  return (
    <Box>
      <Typography component="h1" variant="h4" color="primary.main" sx={{ mb: 3 }}>
        Sifarişlər
      </Typography>

      {isError && <Alert severity="error" sx={{ mb: 2 }}>Sifarişlər yüklənmədi.</Alert>}
      {updateStatusError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Sifariş statusunu yeniləmək mümkün olmadı.
        </Alert>
      )}

      <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>
        Sifariş statusları
      </Typography>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={28} />
        </Box>
      ) : isError ? (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Status statistikası yüklənmədi.
        </Typography>
      ) : orderList.length === 0 ? (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Sifariş məlumatı yoxdur.
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 1.5,
            mb: 3,
          }}
        >
          {ORDER_STATUSES.map((status) => {
            const count = orderList.filter((order) => order.status === status).length;
            const isSelected = statusFilter === status;
            return (
              <Card
                key={status}
                variant="outlined"
                sx={{
                  borderRadius: '12px',
                  borderColor: isSelected ? '#2563EB' : '#E2E8F0',
                  bgcolor: isSelected ? '#EFF6FF' : '#FFFFFF',
                  '&:hover': { borderColor: '#2563EB', bgcolor: '#EFF6FF' },
                }}
              >
                <CardActionArea
                  aria-pressed={isSelected}
                  onClick={() => setStatusFilter(isSelected ? 'all' : status)}
                >
                  <CardContent>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>
                      {statusLabels[status]}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        mt: 0.75,
                        fontWeight: 700,
                        color: '#0F172A',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {count}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#F1F5F9' }}>
              <TableRow>
                {[
                  'Sifariş ID',
                  'Müştəri',
                  'Məhsullar / say',
                  'Çatdırılma ünvanı',
                  'Cəmi (AZN)',
                  'Status',
                  'Tarix',
                  'Əməliyyatlar',
                ].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      color: '#334155',
                      backgroundColor: '#F1F5F9',
                      borderBottom: '1px solid #E2E8F0',
                      fontWeight: 700,
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => {
                const userObj =
                  order.user && typeof order.user === 'object' ? order.user : null;

                return (
                  <TableRow key={order._id} hover>
                    <TableCell sx={{ maxWidth: 135, overflowWrap: 'anywhere', fontFamily: 'monospace' }}>
                      {order._id}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>
                        {userObj?.name || 'Naməlum'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {userObj?.email || ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {(order.items ?? []).map((item, index) => {
                        const product =
                          item.product && typeof item.product === 'object'
                            ? item.product
                            : null;
                        const itemKey = `${product?._id ?? index}-${item.selectedSize ?? ''}`;

                        return (
                          <Typography key={itemKey} variant="body2">
                            {product?.name || 'Məhsul'} × {item.quantity ?? 1}
                            <br />
                            Ölçü: {item.selectedSize || '—'}
                          </Typography>
                        );
                      })}
                    </TableCell>
                    <TableCell sx={{ minWidth: 180, maxWidth: 280, whiteSpace: 'normal' }}>
                      {order.deliveryAddress || '—'}
                    </TableCell>
                    <TableCell sx={{ color: 'primary.main', fontWeight: 800, whiteSpace: 'nowrap' }}>
                      {Number(order.total ?? 0).toFixed(2)} AZN
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        size="small"
                        value={order.status}
                        disabled={isUpdatingStatus || Boolean(order.closedAt)}
                        aria-label="Sifariş statusunu yenilə"
                        onChange={(event) => {
                          const value = event.target.value;
                          if (isOrderStatus(value)) {
                            void updateOrderStatus({ id: order._id, status: value });
                          }
                        }}
                      >
                        {ORDER_STATUSES.map((status) => (
                          <MenuItem key={status} value={status}>
                            {statusLabels[status]}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {formatOrderDate(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        aria-label="Sifariş detallarına bax"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <VisibilityOutlinedIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary">
                      {orderList.length === 0
                        ? 'Hələ sifariş yoxdur.'
                        : statusFilter === 'all'
                          ? 'Göstəriləcək sifariş yoxdur.'
                          : `${statusLabels[statusFilter]} statusu üzrə sifariş yoxdur.`}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Sifariş detalları</DialogTitle>
        {selectedOrder && (
          <DialogContent dividers>
            <Typography>
              <strong>İstifadəçi:</strong>{' '}
              {typeof selectedOrder.user === 'object' && selectedOrder.user
                ? `${selectedOrder.user.name} (${selectedOrder.user.email})`
                : 'Naməlum'}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              <strong>Tarix:</strong> {formatOrderDate(selectedOrder.createdAt)}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              <strong>Status:</strong> {statusLabels[selectedOrder.status]}
            </Typography>
            {selectedOrder.closedAt && (
              <Typography sx={{ mt: 1 }}>
                <strong>Bağlanma tarixi:</strong> {formatOrderDate(selectedOrder.closedAt)}
              </Typography>
            )}
            <Typography sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
              <strong>Çatdırılma ünvanı:</strong> {selectedOrder.deliveryAddress || '—'}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              <strong>Cəmi:</strong> {Number(selectedOrder.total ?? 0).toFixed(2)} AZN
            </Typography>
            <Typography sx={{ mt: 2, fontWeight: 700 }}>Məhsullar</Typography>
            {(selectedOrder.items ?? []).map((item, index) => {
              const product =
                item.product && typeof item.product === 'object' ? item.product : null;
              return (
                <Typography key={`${product?._id ?? index}-${item.selectedSize ?? ''}`}>
                  {product?.name || 'Məhsul'} × {item.quantity ?? 1}
                  {item.selectedSize ? ` · Ölçü: ${item.selectedSize}` : ''}
                </Typography>
              );
            })}
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => setSelectedOrder(null)}>Bağla</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
