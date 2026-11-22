import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';

interface Props {
  product: Product;
}

export const ProductCard = ({ product }: Props) => {
  return (
    <Card
      sx={{
        width: '100%',
        height: '100%',
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
          height: '100%',
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
          image={product.image || 'https://via.placeholder.com/400x500?text=No+Image'}
          alt={product.name}
          sx={{
            height: { xs: 300, sm: 340, md: 380 },
            width: '100%',
            objectFit: 'cover',
          }}
        />

        <CardContent sx={{ width: '100%', textAlign: 'center', px: 2.5, py: 2.5 }}>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 0.5,
              fontWeight: 700,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {product.category}
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: 'primary.main', fontWeight: 800 }}
          >
            {product.price} AZN
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
