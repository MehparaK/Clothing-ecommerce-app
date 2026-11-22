import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Alert,
} from '@mui/material';
import type { Product } from '../../types';

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
  price: 0,
  category: '',
  stock: 0,
  image: '',
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
        price: initialData.price,
        category: initialData.category,
        stock: initialData.stock,
        image: initialData.image,
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
    if (form.price < 0 || form.stock < 0) {
      setError('Qiymət və stok mənfi ola bilməz');
      return;
    }
    try {
      setError('');
      await onSubmit(form);
    } catch (err: any) {
      setError(err?.data?.message || 'Xəta baş verdi');
    }
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
            onChange={(e) => {
              const val = Number(e.target.value);
              setForm({ ...form, price: val < 0 ? 0 : val });
            }}
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
            onChange={(e) => {
              const val = Number(e.target.value);
              setForm({ ...form, stock: val < 0 ? 0 : val });
            }}
            onWheel={(e) => (e.target as HTMLElement).blur()}
            onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
            fullWidth
          />
          <TextField
            label="Şəkil URL"
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