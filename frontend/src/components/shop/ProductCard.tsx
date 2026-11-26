import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Button,
  IconButton,
  Alert,
  Typography,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { useGetFavoritesQuery, useSetFavoriteMutation } from '../../features/api/favoritesApi';
import type { Product } from '../../types';

interface Props {
  product: Product;
}

export const ProductCard = ({ product }: Props) => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const { data: favorites } = useGetFavoritesQuery(undefined, { skip: !user });
  const [setFavorite, { isLoading: isUpdatingFavorite, isError: favoriteError }] =
    useSetFavoriteMutation();
  const isFavorite = favorites?.some((favorite) => favorite._id === product._id) ?? false;

  const handleFavoriteClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setFavorite({ productId: product._id, isFavorite: !isFavorite });
  };

  return (
    <Card
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'box-shadow 220ms ease, transform 220ms ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 14px 32px rgba(31, 41, 34, 0.12)',
        },
      }}
    >
      <CardActionArea
        component={Link}
        to={`/products/${product._id}`}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          '& .product-card-image': {
            transition: 'transform 220ms ease',
          },
          '&:hover .product-card-image': {
            transform: 'scale(1.05)',
          },
        }}
      >
        <CardMedia
          className="product-card-image"
          component="img"
          image={product.image || 'https://via.placeholder.com/400x500?text=%C5%9E%C9%99kil+yoxdur'}
          alt={product.name}
          sx={{
            height: { xs: 300, sm: 340, md: 380 },
            width: '100%',
            objectFit: 'cover',
          }}
        />

        <CardContent
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            flexGrow: 1,
            textAlign: 'left',
            px: 2.5,
            py: 2.5,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 0.75,
              fontWeight: 700,
            }}
          >
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
            {product.category}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3,
              lineHeight: 1.6,
              minHeight: '4.8em',
            }}
          >
            {product.description}
          </Typography>
          <Box
            sx={{
              mt: 'auto',
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography
              variant="h5"
              sx={{ color: 'primary.main', fontWeight: 800 }}
            >
              {product.price} AZN
            </Typography>
            <Chip
              size="small"
              color={product.stock > 0 ? 'success' : 'default'}
              label={product.stock > 0 ? `Stokda: ${product.stock}` : 'Stokda yoxdur'}
            />
          </Box>
        </CardContent>
      </CardActionArea>
      <IconButton
        aria-label={isFavorite ? 'Sevimlilərdən çıxar' : 'Sevimlilərə əlavə et'}
        aria-pressed={isFavorite}
        disabled={isUpdatingFavorite}
        onClick={handleFavoriteClick}
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1,
          bgcolor: 'background.paper',
          color: isFavorite ? 'error.main' : 'text.primary',
          boxShadow: 1,
          '&:hover': { bgcolor: 'background.paper', color: 'error.main' },
        }}
      >
        {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      </IconButton>
      <Box sx={{ width: '100%', px: 2.5, pb: 2.5 }}>
        {favoriteError && (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            Sevimli məhsulu yeniləmək mümkün olmadı.
          </Alert>
        )}
        <Button
          component={Link}
          to={`/products/${product._id}`}
          variant="contained"
          fullWidth
        >
          Məhsula bax
        </Button>
      </Box>
    </Card>
  );
};
