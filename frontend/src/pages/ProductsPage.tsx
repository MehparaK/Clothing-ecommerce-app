import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Container,
  MenuItem,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetProductsQuery } from '../features/api/productsApi';
import { ProductCard } from '../components/shop/ProductCard';
import { PRODUCT_SIZES } from '../types';

const FILTER_PARAMS = ['q', 'category', 'size', 'minPrice', 'maxPrice', 'sort'];

const normalizeText = (value: string) =>
  value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();

const parsePrice = (value: string | null) => {
  if (!value?.trim()) return null;
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : null;
};

export const ProductsPage = () => {
  const { data: products, isLoading, isFetching, isError } = useGetProductsQuery();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(searchTerm);

  useEffect(() => {
    setQuery(searchTerm);
  }, [searchTerm]);

  const setFilter = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      nextParams.set(key, value.trim());
    } else {
      nextParams.delete(key);
    }
    setSearchParams(nextParams);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFilter('q', query);
  };

  const resetFilters = () => {
    setQuery('');
    const nextParams = new URLSearchParams(searchParams);
    FILTER_PARAMS.forEach((key) => nextParams.delete(key));
    setSearchParams(nextParams);
  };

  const normalizedSearchTerm = normalizeText(searchTerm);
  const selectedCategory = searchParams.get('category') ?? '';
  const rawSelectedSize = searchParams.get('size') ?? '';
  const selectedSize =
    PRODUCT_SIZES.find(
      (size) => size.toLocaleLowerCase() === rawSelectedSize.toLocaleLowerCase()
    ) ?? '';
  const minPrice = parsePrice(searchParams.get('minPrice'));
  const maxPrice = parsePrice(searchParams.get('maxPrice'));
  const sortOrder = searchParams.get('sort') ?? '';
  const hasActiveFilters = FILTER_PARAMS.some((key) => searchParams.has(key));

  const categories = (products ?? []).reduce<string[]>((result, product) => {
    const category = typeof product.category === 'string' ? product.category.trim() : '';
    if (category && !result.some((item) => normalizeText(item) === normalizeText(category))) {
      result.push(category);
    }
    return result;
  }, []);

  const suggestions = (products ?? []).reduce<string[]>((result, product) => {
    [product.name, product.category].forEach((value) => {
      const suggestion = typeof value === 'string' ? value.trim() : '';
      if (suggestion && !result.some((item) => normalizeText(item) === normalizeText(suggestion))) {
        result.push(suggestion);
      }
    });
    return result;
  }, []);

  if (
    selectedCategory &&
    !categories.some((category) => normalizeText(category) === normalizeText(selectedCategory))
  ) {
    categories.push(selectedCategory);
  }

  const filteredProducts = (products ?? []).filter((product) => {
    const matchesSearch =
      !normalizedSearchTerm ||
      normalizeText(
        `${product.name ?? ''} ${product.category ?? ''} ${product.description ?? ''}`
      ).includes(normalizedSearchTerm);
    const matchesCategory =
      !selectedCategory ||
      normalizeText(product.category ?? '') === normalizeText(selectedCategory);
    const matchesSize =
      !selectedSize ||
      (Array.isArray(product.sizes) &&
        product.sizes.some(
          (size) => typeof size === 'string' && size.toUpperCase() === selectedSize
        ));
    const matchesMinPrice = minPrice === null || product.price >= minPrice;
    const matchesMaxPrice = maxPrice === null || product.price <= maxPrice;

    return matchesSearch && matchesCategory && matchesSize && matchesMinPrice && matchesMaxPrice;
  });

  const sortedProducts = [...filteredProducts];
  if (sortOrder === 'priceAsc') {
    sortedProducts.sort((a, b) => a.price - b.price);
  } else if (sortOrder === 'priceDesc') {
    sortedProducts.sort((a, b) => b.price - a.price);
  } else if (sortOrder === 'nameAsc') {
    sortedProducts.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
  } else if (sortOrder === 'nameDesc') {
    sortedProducts.sort((a, b) =>
      b.name.localeCompare(a.name, undefined, { sensitivity: 'base' })
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Məhsulları yükləmək mümkün olmadı.</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexDirection: 'column',
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Bütün Məhsullar
        </Typography>
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 420 } }}
        >
          <Autocomplete
            sx={{ flex: 1, minWidth: 0 }}
            freeSolo
            options={suggestions}
            inputValue={query}
            loading={isFetching}
            noOptionsText="Uyğun təklif tapılmadı"
            loadingText="Təkliflər yüklənir..."
            filterOptions={(options, state) => {
              const normalizedInput = normalizeText(state.inputValue);
              return options
                .filter((option) => normalizeText(option).includes(normalizedInput))
                .slice(0, 6);
            }}
            onInputChange={(_, value) => setQuery(value)}
            onChange={(_, value) => {
              if (typeof value === 'string') {
                setQuery(value);
                setFilter('q', value);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Məhsul axtar..."
                aria-label="Məhsul axtar"
                size="small"
                fullWidth
                slotProps={{
                  ...params.slotProps,
                  input: {
                    ...params.slotProps.input,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <SearchOutlinedIcon fontSize="small" />
                        </InputAdornment>
                        {params.slotProps.input.startAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
          />
          <Button type="submit" variant="contained">
            Axtar
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          mb: 3,
        }}
      >
        <TextField
          select
          label="Kateqoriya"
          size="small"
          value={selectedCategory}
          onChange={(event) => setFilter('category', event.target.value)}
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="">Bütün kateqoriyalar</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Ölçü"
          size="small"
          value={selectedSize}
          onChange={(event) => setFilter('size', event.target.value)}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="">Bütün ölçülər</MenuItem>
          {PRODUCT_SIZES.map((size) => (
            <MenuItem key={size} value={size}>
              {size}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Min. ~"
          type="number"
          size="small"
          value={searchParams.get('minPrice') ?? ''}
          onChange={(event) => setFilter('minPrice', event.target.value)}
          sx={{ width: 140 }}
        />
        <TextField
          label="Maks. qiymət"
          type="number"
          size="small"
          value={searchParams.get('maxPrice') ?? ''}
          onChange={(event) => setFilter('maxPrice', event.target.value)}
          sx={{ width: 150 }}
        />
        <TextField
          select
          label="Sıralama"
          size="small"
          value={sortOrder}
          onChange={(event) => setFilter('sort', event.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Standart</MenuItem>
          <MenuItem value="priceAsc">Qiymət: artan</MenuItem>
          <MenuItem value="priceDesc">Qiymət: azalan</MenuItem>
          <MenuItem value="nameAsc">Ad: A-dan Z-yə</MenuItem>
          <MenuItem value="nameDesc">Ad: Z-dən A-ya</MenuItem>
        </TextField>
        <Button
          variant="outlined"
          onClick={resetFilters}
          disabled={!hasActiveFilters && !query.trim()}
        >
          Filtrləri sıfırla
        </Button>
      </Box>

      {sortedProducts.length === 0 ? (
        <Typography color="text.secondary">
          {products?.length
            ? 'Axtarış və filtrlərə uyğun məhsul tapılmadı.'
            : 'Hələ məhsul yoxdur.'}
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 3,
          }}
        >
          {sortedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </Box>
      )}
    </Container>
  );
};