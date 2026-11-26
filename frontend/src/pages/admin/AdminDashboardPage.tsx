import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import { useGetOrdersQuery } from '../../features/api/ordersApi';
import { useGetProductsQuery } from '../../features/api/productsApi';
import { useGetUsersQuery } from '../../features/api/usersApi';
import { LOW_STOCK_THRESHOLD } from '../../types';

const formatAmount = (amount: number) =>
  `${amount.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AZN`;

const cardSx = {
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  border: '1px solid #E2E8F0',
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
};

export const AdminDashboardPage = () => {
  const {
    data: orders = [],
    isLoading: isLoadingOrders,
    isError: isOrdersError,
  } = useGetOrdersQuery();
  const {
    data: products = [],
    isLoading: isLoadingProducts,
    isError: isProductsError,
  } = useGetProductsQuery();
  const {
    data: users = [],
    isLoading: isLoadingUsers,
    isError: isUsersError,
  } = useGetUsersQuery();

  const orderList = Array.isArray(orders) ? orders : [];
  const today = new Date().toDateString();
  const todayOrders = orderList.filter((order) => {
    if (!order.createdAt) return false;
    const createdAt = new Date(order.createdAt);
    return !Number.isNaN(createdAt.getTime()) && createdAt.toDateString() === today;
  }).length;
  const pendingOrders = orderList.filter((order) => order.status === 'pending').length;
  const totalSales = orderList.reduce(
    (total, order) =>
      order.status !== 'cancelled' && Number.isFinite(order.total) ? total + order.total : total,
    0
  );
  const lowStockProducts = products.filter(
    (product) =>
      Number.isFinite(product.stock) &&
      product.stock >= 0 &&
      product.stock <= LOW_STOCK_THRESHOLD
  );
  const salesByProduct = new Map<string, { id: string; name: string; quantity: number }>();
  orderList.filter((order) => order.status !== 'cancelled').forEach((order) => {
    order.items?.forEach((item) => {
      const product = item.product && typeof item.product === 'object'
        ? item.product
        : null;
      if (!product?._id) return;

      const current = salesByProduct.get(product._id);
      salesByProduct.set(product._id, {
        id: product._id,
        name: product.name || 'Məhsul',
        quantity: (current?.quantity ?? 0) +
          (Number.isFinite(item.quantity) ? item.quantity : 0),
      });
    });
  });
  const bestSellingProducts = Array.from(salesByProduct.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const cards = [
    {
      label: 'Ümumi sifariş sayı',
      value: isLoadingOrders ? '…' : isOrdersError ? '—' : orderList.length.toLocaleString(),
      icon: <ShoppingBagOutlinedIcon />,
      color: '#31556A',
    },
    {
      label: 'Bu gün sifarişlər',
      value: isLoadingOrders ? '…' : isOrdersError ? '—' : todayOrders.toLocaleString(),
      icon: <TodayOutlinedIcon />,
      color: '#4C715A',
    },
    {
      label: 'Gözləyən sifarişlər',
      value: isLoadingOrders ? '…' : isOrdersError ? '—' : pendingOrders.toLocaleString(),
      icon: <PendingActionsOutlinedIcon />,
      color: '#9A743A',
    },
    {
      label: 'Ümumi satış (AZN)',
      value: isLoadingOrders ? '…' : isOrdersError ? '—' : formatAmount(totalSales),
      icon: <AttachMoneyOutlinedIcon />,
      color: '#76609A',
    },
    {
      label: `Az stoklu məhsullar (≤${LOW_STOCK_THRESHOLD})`,
      value: isLoadingProducts ? '…' : isProductsError ? '—' : lowStockProducts.length.toLocaleString(),
      icon: <Inventory2OutlinedIcon />,
      color: '#A95647',
    },
    {
      label: 'Ümumi istifadəçi sayı',
      value: isLoadingUsers ? '…' : isUsersError ? '—' : users.length.toLocaleString(),
      icon: <PeopleOutlineOutlinedIcon />,
      color: '#457C83',
    },
  ];

  return (
    <Box sx={{ fontFamily: 'Arial, sans-serif', color: '#0F172A' }}>
      <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#0F172A' }}>
        İdarə paneli
      </Typography>

      {(isOrdersError || isProductsError || isUsersError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Bəzi idarə paneli göstəricilərini yükləmək mümkün olmadı.
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 2,
        }}
      >
        {cards.map((card) => (
          <Card key={card.label} sx={cardSx}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  color: card.color,
                  bgcolor: `${card.color}1A`,
                  mb: 2,
                }}
              >
                {card.icon}
              </Box>
              <Typography variant="body2" sx={{ color: '#64748B', minHeight: 40, fontWeight: 500 }}>
                {card.label}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                  color: '#0F172A',
                  fontVariantNumeric: 'tabular-nums',
                  overflowWrap: 'anywhere',
                }}
              >
                {card.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 2,
          mt: 3,
        }}
      >
        <Card sx={cardSx}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#0F172A', fontWeight: 700, mb: 1.5 }}>
              Az stok xəbərdarlığı (≤{LOW_STOCK_THRESHOLD})
            </Typography>
            {isLoadingProducts ? (
              <CircularProgress size={24} />
            ) : isProductsError ? (
              <Typography color="error">Məhsullar yüklənmədi.</Typography>
            ) : lowStockProducts.length > 0 ? (
              <Box>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 1 }}>
                  {lowStockProducts.length} məhsulun stoku azdır.
                </Typography>
                {lowStockProducts.slice(0, 5).map((product) => (
                  <Typography key={product._id} variant="body2" sx={{ py: 0.3 }}>
                    {product.name} — stok: {product.stock}
                  </Typography>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Az stoklu məhsul yoxdur.
              </Typography>
            )}
          </CardContent>
        </Card>
        <Card sx={cardSx}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#0F172A', fontWeight: 700, mb: 1.5 }}>
              Ən çox satılan məhsullar
            </Typography>
            {isLoadingOrders ? (
              <CircularProgress size={24} />
            ) : isOrdersError ? (
              <Typography color="error">Sifarişlər yüklənmədi.</Typography>
            ) : bestSellingProducts.length > 0 ? (
              bestSellingProducts.map((product) => (
                <Typography key={product.id} variant="body2" sx={{ py: 0.3 }}>
                  {product.name} — {product.quantity} ədəd
                </Typography>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                Satış məlumatı yoxdur.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
