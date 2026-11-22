import {
  Alert,
  Box,
  CircularProgress,
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
import {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
} from '../../features/api/ordersApi';

const statusLabels = {
  pending: 'Pending',
  shipped: 'Shipped',
  delivered: 'Delivered',
};

export const AdminOrdersPage = () => {
  const { data: orders = [], isLoading, isError } = useGetOrdersQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  return (
    <Box>
      <Typography component="h1" variant="h4" color="primary.main" sx={{ mb: 3 }}>
        Sifarişlər
      </Typography>

      {isError && <Alert severity="error" sx={{ mb: 2 }}>Sifarişlər yüklənmədi.</Alert>}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                {['İstifadəçi', 'Məhsullar', 'Cəmi', 'Tarix', 'Status'].map((header) => (
                  <TableCell key={header} sx={{ color: 'primary.contrastText', fontWeight: 700 }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700 }}>
                      {typeof order.user === 'object' ? order.user.name : 'Naməlum'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {typeof order.user === 'object' ? order.user.email : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {order.items.map((item) => (
                      <Typography key={typeof item.product === 'object' ? item.product._id : item.product} variant="body2">
                        {typeof item.product === 'object' ? item.product.name : 'Məhsul'} × {item.quantity}
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell sx={{ color: 'primary.main', fontWeight: 800 }}>
                    {order.total.toFixed(2)} AZN
                  </TableCell>
                  <TableCell>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : '—'}
                  </TableCell>
                  <TableCell sx={{ minWidth: 150 }}>
                    <TextField
                      select
                      size="small"
                      fullWidth
                      value={order.status}
                      disabled={isUpdating}
                      onChange={(event) =>
                        updateStatus({
                          id: order._id,
                          status: event.target.value as 'pending' | 'shipped' | 'delivered',
                        })
                      }
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
