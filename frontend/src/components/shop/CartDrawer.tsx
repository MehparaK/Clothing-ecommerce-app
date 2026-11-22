import {
  Box,
  Button,
  CardMedia,
  Divider,
  Drawer,
  IconButton,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveIcon from '@mui/icons-material/Remove';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
} from '../../features/cart/cartSlice';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: { xs: '100vw', sm: 420 },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.5 }}>
          <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700 }}>
            Səbət
          </Typography>
          <IconButton aria-label="Bağla" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />

        <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
          {items.length === 0 ? (
            <Typography align="center" color="text.secondary" sx={{ py: 6 }}>
              Səbətiniz boşdur.
            </Typography>
          ) : (
            items.map((item) => (
              <Box
                key={item.product._id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '82px 1fr auto',
                  gap: 1.5,
                  alignItems: 'center',
                  mb: 2,
                  pb: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <CardMedia
                  component="img"
                  image={item.product.image || 'https://via.placeholder.com/200x260?text=No+Image'}
                  alt={item.product.name}
                  sx={{ width: 82, height: 108, borderRadius: 1, objectFit: 'cover' }}
                />
                <Box>
                  <Typography sx={{ fontWeight: 700 }} noWrap>
                    {item.product.name}
                  </Typography>
                  <Typography variant="body2" color="primary.main" sx={{ mt: 0.5, fontWeight: 700 }}>
                    {item.product.price} AZN
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <IconButton
                      size="small"
                      aria-label="Azalt"
                      disabled={item.quantity <= 1}
                      onClick={() => dispatch(decreaseQuantity(item.product._id))}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography sx={{ minWidth: 28, textAlign: 'center', fontWeight: 700 }}>
                      {item.quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      aria-label="Artır"
                      disabled={item.quantity >= item.product.stock}
                      onClick={() => dispatch(increaseQuantity(item.product._id))}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <IconButton
                  aria-label="Məhsulu sil"
                  color="error"
                  onClick={() => dispatch(removeFromCart(item.product._id))}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))
          )}
        </Box>

        {items.length > 0 && (
          <Box sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'paper' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography color="text.secondary">Cəmi</Typography>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>
                {total.toFixed(2)} AZN
              </Typography>
            </Box>
            <Button
              component={Link}
              to="/cart"
              variant="contained"
              size="large"
              fullWidth
              onClick={onClose}
            >
              Səbətə bax
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};
