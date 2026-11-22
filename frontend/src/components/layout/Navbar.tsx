import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';

export const Navbar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const user = useAppSelector((state) => state.auth.user);
  const cartCount = useAppSelector((state) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0)
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate('/', { replace: true });
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'rgba(244, 241, 234, 0.96)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 76 } }}>
          {isMobile && (
            <IconButton
              aria-label="Open navigation menu"
              component={Link}
              to="/products"
              edge="start"
              sx={{ mr: 1, color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            component={Link}
            to="/"
            variant="h5"
            sx={{
              flexGrow: 1,
              color: 'primary.main',
              textDecoration: 'none',
              letterSpacing: '0.08em',
            }}
          >
            CLOTHING
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
              <Button component={Link} to="/products" color="inherit">
                Shop
              </Button>

              {user?.role === 'admin' && (
                <Button component={Link} to="/admin" color="inherit">
                  Admin Panel
                </Button>
              )}

              {user ? (
                <>
                  <Typography
                    variant="body2"
                    sx={{ ml: 1, color: 'text.primary', fontWeight: 600 }}
                  >
                    {user.name}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleLogout}
                    sx={{ ml: 1 }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button component={Link} to="/login" color="primary">
                    Login
                  </Button>
                  <Button component={Link} to="/register" variant="contained">
                    Register
                  </Button>
                </>
              )}
            </Box>
          )}

          {isMobile && user?.role === 'admin' && (
            <IconButton
              component={Link}
              to="/admin"
              aria-label="Admin panel"
              sx={{ color: 'text.primary', mr: 0.5 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {isMobile && user && (
            <>
              <Typography
                variant="caption"
                sx={{ mr: 1, maxWidth: 56, overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 700 }}
              >
                {user.name}
              </Typography>
              <IconButton
                aria-label="Logout"
                onClick={handleLogout}
                sx={{ color: 'text.primary', mr: 0.5 }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Out
                </Typography>
              </IconButton>
            </>
          )}

          {!user && isMobile && (
            <>
              <Button
                component={Link}
                to="/login"
                size="small"
                sx={{ mr: 0.5, px: 1 }}
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/register"
                size="small"
                sx={{ mr: 0.5, px: 1 }}
              >
                Register
              </Button>
            </>
          )}

          <IconButton
            component={Link}
            to="/cart"
            aria-label={`Cart with ${cartCount} items`}
            sx={{ color: 'primary.main' }}
          >
            <Badge
              badgeContent={cartCount}
              color="secondary"
              sx={{
                '& .MuiBadge-badge': {
                  color: '#FFFFFF',
                  fontWeight: 700,
                },
              }}
            >
              <ShoppingBagOutlinedIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
