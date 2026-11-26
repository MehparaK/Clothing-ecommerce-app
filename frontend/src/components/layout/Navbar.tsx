import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { baseApi } from '../../features/api/baseApi';
import { logout } from '../../features/auth/authSlice';
import { NotificationBell } from '../notifications/NotificationBell';

export const Navbar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const user = useAppSelector((state) => state.auth.user);
  const cartCount = useAppSelector((state) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0)
  );

  const handleLogout = () => {
    setMenuAnchor(null);
    dispatch(logout());
    dispatch(baseApi.util.resetApiState());
    navigate('/', { replace: true });
  };

  const closeMenu = () => setMenuAnchor(null);

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
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 76 }, gap: 2 }}>
          <Button component={Link} to="/products" color="primary">
            Mağaza
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Button
                    component={Link}
                    to="/admin"
                    color="secondary"
                    variant="outlined"
                  >
                    İdarəçi paneli
                  </Button>
                )}
                <Typography
                  component={Link}
                  to="/profile"
                  variant="body2"
                  sx={{
                    color: 'text.primary',
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': { color: 'primary.main', textDecoration: 'underline' },
                  }}
                >
                  {user.name}
                </Typography>
                <Button variant="outlined" color="primary" onClick={handleLogout}>
                  Çıxış
                </Button>
              </>
            ) : (
              <>
                <Button component={Link} to="/login" color="primary">
                  Daxil ol
                </Button>
                <Button component={Link} to="/register" variant="contained">
                  Qeydiyyat
                </Button>
              </>
            )}
          </Box>
          <NotificationBell />
          <IconButton
            component={Link}
            to="/cart"
            aria-label={`Səbət: ${cartCount} məhsul`}
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
          <Box sx={{ display: { xs: 'inline-flex', md: 'none' } }}>
            <IconButton
              aria-label="Naviqasiyanı aç"
              aria-controls={menuAnchor ? 'mobile-navigation-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(menuAnchor)}
              onClick={(event) => setMenuAnchor(event.currentTarget)}
              sx={{ color: 'primary.main' }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="mobile-navigation-menu"
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={closeMenu}
            >
              <MenuItem component={Link} to="/" onClick={closeMenu}>Ana səhifə</MenuItem>
              <MenuItem component={Link} to="/products" onClick={closeMenu}>Mağaza</MenuItem>
              {user ? (
                <>
                  <Divider />
                  {user.role === 'admin' && (
                    <MenuItem component={Link} to="/admin" onClick={closeMenu}>
                      İdarəçi paneli
                    </MenuItem>
                  )}
                  <MenuItem component={Link} to="/profile" onClick={closeMenu}>Profilim</MenuItem>
                  <MenuItem component={Link} to="/favorites" onClick={closeMenu}>Sevimlilərim</MenuItem>
                  <MenuItem component={Link} to="/my-orders" onClick={closeMenu}>Sifarişlərim</MenuItem>
                  <MenuItem component={Link} to="/cart" onClick={closeMenu}>Səbət</MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>Çıxış</MenuItem>
                </>
              ) : (
                <>
                  <Divider />
                  <MenuItem component={Link} to="/login" onClick={closeMenu}>Daxil ol</MenuItem>
                  <MenuItem component={Link} to="/register" onClick={closeMenu}>Qeydiyyat</MenuItem>
                </>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};