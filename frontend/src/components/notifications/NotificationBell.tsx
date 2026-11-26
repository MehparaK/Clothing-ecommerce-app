import { useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { useAppSelector } from '../../app/hooks';
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '../../features/api/notificationsApi';
import type { ProductNotification } from '../../types';

const formatNotificationDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('az-AZ', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getNotificationText = (notification: ProductNotification) => {
  const productName = notification.product?.name ?? 'Məhsul';

  if (notification.type === 'price_drop') {
    const previousPrice = notification.previousPrice;
    const price = notification.price ?? notification.product?.price;
    const hasPrices =
      typeof previousPrice === 'number' &&
      previousPrice > 0 &&
      typeof price === 'number' &&
      Number.isFinite(price);
    const percent = hasPrices ? Math.round((1 - price / previousPrice) * 100) : 0;

    return {
      title: `«${productName}» endirimlə satılır`,
      detail: hasPrices
        ? `${price} AZN (əvvəl ${previousPrice} AZN${
            percent > 0 ? ` · ${percent}% endirim` : ''
          })`
        : 'Sevimlilərinizdəki məhsula endirim tətbiq olundu',
    };
  }

  return {
    title: `«${productName}» yenidən stokdadır`,
    detail: 'Sevimlilərinizdəki məhsul yenidən mövcuddur',
  };
};

export const NotificationBell = () => {
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { data, isLoading } = useGetNotificationsQuery(undefined, {
    skip: !user,
    pollingInterval: 60_000,
    refetchOnFocus: true,
  });
  const [markNotificationRead] = useMarkNotificationReadMutation();
  const [markAllNotificationsRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation();

  if (!user) {
    return null;
  }

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const closeMenu = () => setAnchorEl(null);

  const handleOpenNotification = (notification: ProductNotification) => {
    if (!notification.read) {
      void markNotificationRead(notification._id);
    }
    closeMenu();
    if (notification.product?._id) {
      navigate(`/products/${notification.product._id}`);
    }
  };

  return (
    <>
      <IconButton
        color="primary"
        aria-label={
          unreadCount > 0
            ? `Bildirişlər: ${unreadCount} oxunmamış bildiriş`
            : 'Bildirişlər'
        }
        onClick={(event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsNoneOutlinedIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: { xs: 'calc(100vw - 32px)', sm: 380 },
              maxWidth: '100%',
              maxHeight: 440,
              mt: 1,
            },
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography sx={{ fontWeight: 700 }}>Bildirişlər</Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              disabled={isMarkingAll}
              onClick={() => markAllNotificationsRead()}
            >
              Hamısını oxu
            </Button>
          )}
        </Box>
        <Divider />
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
            <NotificationsNoneOutlinedIcon
              color="disabled"
              sx={{ fontSize: 32, mb: 0.5 }}
            />
            <Typography variant="body2" color="text.secondary">
              Hələ bildirişiniz yoxdur.
            </Typography>
          </Box>
        ) : (
          notifications.map((notification) => {
            const { title, detail } = getNotificationText(notification);

            return (
              <MenuItem
                key={notification._id}
                onClick={() => handleOpenNotification(notification)}
                sx={{
                  alignItems: 'flex-start',
                  gap: 1.25,
                  py: 1.25,
                  whiteSpace: 'normal',
                }}
              >
                <Box
                  sx={{
                    mt: 0.75,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    flexShrink: 0,
                    bgcolor: notification.read ? 'transparent' : 'error.main',
                  }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: notification.read ? 500 : 700,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {detail}
                    {notification.notifiedAt
                      ? ` · ${formatNotificationDate(notification.notifiedAt)}`
                      : ''}
                  </Typography>
                </Box>
              </MenuItem>
            );
          })
        )}
      </Menu>
    </>
  );
};
