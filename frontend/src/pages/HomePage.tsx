import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/shop/ProductCard';
import { useGetProductsQuery } from '../features/api/productsApi';

export const HomePage = () => {
  const { data: products = [], isLoading, isError } = useGetProductsQuery();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        component="section"
        sx={{
          minHeight: { xs: 440, md: 560 },
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          backgroundImage:
            'linear-gradient(90deg, rgba(16,34,22,0.96) 0%, rgba(26,54,34,0.82) 55%, rgba(26,54,34,0.42) 100%)',
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ maxWidth: 660, py: { xs: 8, md: 12 } }}>
            <Typography
              component="p"
              variant="overline"
              sx={{
                mb: 2,
                color: 'secondary.light',
                letterSpacing: '0.28em',
                fontWeight: 700,
              }}
            >
              2026 Kolleksiyası
            </Typography>
            <Typography
              component="h1"
              variant="h1"
              sx={{
                mb: 3,
                fontSize: { xs: '3rem', sm: '4rem', md: '5.25rem' },
                lineHeight: 1.02,
              }}
            >
              Yeni Kolleksiya
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                maxWidth: 520,
                color: 'rgba(255,255,255,0.78)',
                fontWeight: 400,
              }}
            >
              Müasir üslub və zamansız parçalarla dolğun yaddaşlar yaradın.
            </Typography>
            <Button
              component={Link}
              to="/products"
              variant="contained"
              color="secondary"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.18)',
              }}
            >
              Alış-verişə başla
            </Button>
          </Box>
        </Container>
      </Box>

      <Container component="section" maxWidth="xl" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography
            component="p"
            variant="overline"
            color="secondary.dark"
            sx={{ letterSpacing: '0.22em', fontWeight: 700 }}
          >
            Seçilmiş məhsullar
          </Typography>
          <Typography component="h2" variant="h3" color="primary.main" sx={{ mt: 1 }}>
            Yeni gəliblər
          </Typography>
        </Box>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        )}

        {isError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Məhsullar yüklənərkən xəta baş verdi.
          </Alert>
        )}

        {!isLoading && !isError && products.length === 0 && (
          <Typography align="center" color="text.secondary" sx={{ py: 8 }}>
            Hələ məhsul yoxdur.
          </Typography>
        )}

        {!isLoading && !isError && products.length > 0 && (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid
                key={product._id}
                size={{ xs: 12, sm: 6, md: 3 }}
                sx={{ display: 'flex' }}
              >
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};
