import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const drawerWidth = 240;

const menuItems = [
  { label: 'İcmal', path: '/admin' },
  { label: 'Məhsullar', path: '/admin/products' },
  { label: 'İstifadəçilər', path: '/admin/users' },
  { label: 'Sifarişlər', path: '/admin/orders' },
];

export const AdminLayout = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileDrawer = () => setMobileOpen(false);

  const isActive = (path: string) =>
    location.pathname === path ||
    (path === '/admin' && location.pathname === '/admin/');

  const drawerContent = (
    <>
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={Link}
            to={item.path}
            selected={isActive(item.path)}
            onClick={closeMobileDrawer}
            sx={{
              color: 'inherit',
              textDecoration: 'none',
              bgcolor: isActive(item.path) ? '#2563EB' : 'transparent',
              '&:hover': { bgcolor: '#334155' },
              '&.Mui-selected': { bgcolor: '#2563EB' },
              '&.Mui-selected:hover': { bgcolor: '#2563EB' },
            }}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: '#0F172A',
          color: '#FFFFFF',
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            aria-label="İdarəçi menyusunu aç"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { xs: 'inline-flex', md: 'none' }, ml: -1 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            sx={{
              flexGrow: 1,
              minWidth: 0,
              fontSize: { xs: '1.05rem', sm: '1.25rem' },
            }}
          >
            İdarəçi paneli
          </Typography>
          <Button
            color="inherit"
            component={Link}
            to="/"
            sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            Sayta qayıt
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        aria-label="İdarəçi menyusu"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={closeMobileDrawer}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: '#1E293B',
              color: '#FFFFFF',
              borderRight: '1px solid #334155',
            },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            width: drawerWidth,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: '#1E293B',
              color: '#FFFFFF',
              borderRight: '1px solid #334155',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          p: { xs: 2, sm: 3 },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
