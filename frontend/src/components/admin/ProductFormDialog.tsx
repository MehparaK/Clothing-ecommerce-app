import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Alert, Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel,
} from '@mui/material';
import {
  DEFAULT_PRODUCT_SIZES,
  PRODUCT_SIZES,
  type Product,
  type ProductSize,
} from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Product>) => Promise<void>;
  initialData?: Product | null;
  loading?: boolean;
}

const empty = {
  name: '',
  description: '',
  price: '',
  category: '',
  stock: '',
  image: '',
  sizes: DEFAULT_PRODUCT_SIZES,
};

export const ProductFormDialog = ({
  open, onClose, onSubmit, initialData, loading,
}: Props) => {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        description: initialData.description,
        price: String(initialData.price),
        category: initialData.category,
        stock: String(initialData.stock),
        image: initialData.image,
        sizes: initialData.sizes?.length ? initialData.sizes : DEFAULT_PRODUCT_SIZES,
      });
    } else {
      setForm(empty);
    }
    setError('');
  }, [initialData, open]);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.category.trim()) {
      setError('Ad və kateqoriya mütləqdir');
      return;
    }
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!Number.isFinite(price) || price < 0 || !Number.isFinite(stock) || stock < 0) {
      setError('Qiymət və stok mənfi ola bilməz');
      return;
    }
    if (form.sizes.length === 0) {
      setError('Ən azı bir ölçü seçin');
      return;
    }
    try {
      setError('');
      await onSubmit({ ...form, price, stock });
    } catch (err: any) {
      setError(err?.data?.message || 'Xəta baş verdi');
    }
  };

  const toggleSize = (size: ProductSize) => {
    setForm((current) => ({
      ...current,
      sizes: current.sizes.includes(size)
        ? current.sizes.filter((selectedSize) => selectedSize !== size)
        : [...current.sizes, size],
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? 'Məhsulu redaktə et' : 'Yeni məhsul'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Ad"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
          />
          <TextField
            label="Təsvir"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            label="Qiymət"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            onWheel={(e) => (e.target as HTMLElement).blur()}
            onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
            fullWidth
          />
          <TextField
            label="Kateqoriya"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            fullWidth
          />
          <TextField
            label="Stok"
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            onWheel={(e) => (e.target as HTMLElement).blur()}
            onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
            fullWidth
          />
          <FormControl component="fieldset">
            <FormLabel component="legend">Mövcud ölçülər</FormLabel>
            <FormGroup row>
              {PRODUCT_SIZES.map((size) => (
                <FormControlLabel
                  key={size}
                  control={
                    <Checkbox
                      checked={form.sizes.includes(size)}
                      onChange={() => toggleSize(size)}
                    />
                  }
                  label={size}
                />
              ))}
            </FormGroup>
          </FormControl>
          <TextField
            label="Şəkil URL-si"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Ləğv et</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {initialData ? 'Yadda saxla' : 'Əlavə et'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};