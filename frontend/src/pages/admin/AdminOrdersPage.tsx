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

  const orderList = Array.isArray(orders) ? orders : [];

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
              {orderList.map((order) => {
                const userObj =
                  order.user && typeof order.user === 'object' ? order.user : null;

                return (
                  <TableRow key={order._id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>
                        {userObj?.name || 'Naməlum'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {userObj?.email || ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {(order.items ?? []).map((item, idx) => {
                        const prodObj =
                          item.product && typeof item.product === 'object'
                            ? item.product
                            : null;
                        const itemKey = prodObj?._id || String(item.product || idx);

                        return (
                          <Typography key={itemKey} variant="body2">
                            {prodObj?.name || 'Məhsul'} × {item.quantity ?? 1}
                          </Typography>
                        );
                      })}
                    </TableCell>
                    <TableCell sx={{ color: 'primary.main', fontWeight: 800 }}>
                      {Number(order.total ?? 0).toFixed(2)} AZN
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
                        value={order.status ?? 'pending'}
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
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};