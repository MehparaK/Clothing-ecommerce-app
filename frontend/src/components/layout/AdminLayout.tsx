import { Outlet, Link, useLocation } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemText, Typography, AppBar, Toolbar, Button } from '@mui/material';

const drawerWidth = 240;

export const AdminLayout = () => {
  const location = useLocation();

  const menuItems = [
    { label: 'Məhsullar', path: '/admin/products' },
    { label: 'İstifadəçilər', path: '/admin/users' },
    { label: 'Sifarişlər', path: '/admin/orders' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Admin Panel</Typography>
          <Button color="inherit" component={Link} to="/">Sayta qayıt</Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.path}
              component={Link}
              to={item.path}
              sx={{
                bgcolor: location.pathname === item.path ? 'action.selected' : 'inherit',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
};