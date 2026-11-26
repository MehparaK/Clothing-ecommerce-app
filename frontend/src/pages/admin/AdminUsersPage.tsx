import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppSelector } from '../../app/hooks';
import {
  useDeleteUserMutation,
  useGetUsersQuery,
} from '../../features/api/usersApi';
import { useGetOrdersQuery } from '../../features/api/ordersApi';

export const AdminUsersPage = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const { data: users = [], isLoading, isError } = useGetUsersQuery();
  const { data: orders = [], isLoading: isLoadingOrders, isError: isOrdersError } =
    useGetOrdersQuery();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const orderStats = new Map<string, { count: number; total: number }>();
  orders.forEach((order) => {
    const userId =
      order.user && typeof order.user === 'object' ? order.user._id : order.user;
    if (!userId) return;

    const current = orderStats.get(userId) ?? { count: 0, total: 0 };
    orderStats.set(userId, {
      count: current.count + 1,
      total: current.total + (Number.isFinite(order.total) ? order.total : 0),
    });
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu istifadəçini silmək istəyirsiniz?')) return;
    await deleteUser(id).unwrap().catch(() => undefined);
  };

  return (
    <Box>
      <Typography component="h1" variant="h4" color="primary.main" sx={{ mb: 3 }}>
        İstifadəçilər
      </Typography>

      {isError && <Alert severity="error" sx={{ mb: 2 }}>İstifadəçilər yüklənmədi.</Alert>}
      {isOrdersError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          İstifadəçilərin sifariş statistikası yüklənmədi.
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                {['Ad', 'E-poçt', 'Sifariş sayı', 'Ümumi xərc', 'Rol', 'Əməliyyat'].map((header) => (
                  <TableCell key={header} sx={{ color: 'primary.contrastText', fontWeight: 700 }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {isLoadingOrders ? '…' : orderStats.get(user._id)?.count ?? 0}
                  </TableCell>
                  <TableCell>
                    {isLoadingOrders
                      ? '…'
                      : `${(orderStats.get(user._id)?.total ?? 0).toFixed(2)} AZN`}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role === 'admin' ? 'İdarəçi' : 'İstifadəçi'}
                      size="small"
                      color={user.role === 'admin' ? 'primary' : 'default'}
                      variant={user.role === 'admin' ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      aria-label="İstifadəçini sil"
                      color="error"
                      disabled={isDeleting || user._id === currentUser?.id}
                      onClick={() => handleDelete(user._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
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
