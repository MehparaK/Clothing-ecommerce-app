import { useState } from 'react';
import {
  Container, Typography, Box, Button, IconButton, CircularProgress,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Edit, Delete, Add } from '@mui/icons-material';
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '../../features/api/productsApi';
import { ProductFormDialog } from '../../components/admin/ProductFormDialog';
import type { Product } from '../../types';

export const AdminProductsPage = () => {
  const { data: products = [], isLoading } = useGetProductsQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const handleOpenCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditing(product);
    setOpen(true);
  };

  const handleSubmit = async (data: Partial<Product>) => {
    if (editing) {
      await updateProduct({ id: editing._id, body: data }).unwrap();
    } else {
      await createProduct(data).unwrap();
    }
    setOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu məhsulu silmək istəyirsiniz?')) {
      try {
        await deleteProduct(id).unwrap();
      } catch {
        alert('Silmək alınmadı');
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Ad', flex: 1 },
    { field: 'category', headerName: 'Kateqoriya', width: 130 },
    {
      field: 'price',
      headerName: 'Qiymət',
      width: 110,
      valueFormatter: (value) => `${value} AZN`,
    },
    { field: 'stock', headerName: 'Stok', width: 90 },
    {
      field: 'actions',
      headerName: 'Əməliyyatlar',
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton size="small" onClick={() => handleOpenEdit(params.row)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.row._id)}
          >
            <Delete fontSize="small" />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Məhsullar</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate}>
          Yeni Məhsul
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          sx={{
            height: 600,
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 700,
            },
            '& .MuiDataGrid-columnHeader .MuiIconButton-root': {
              color: 'primary.contrastText',
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: 'rgba(166, 138, 100, 0.08)',
            },
          }}
        >
          <DataGrid
            rows={products}
            columns={columns}
            getRowId={(row) => row._id}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
          />
        </Box>
      )}

      <ProductFormDialog
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        initialData={editing}
        loading={isCreating || isUpdating}
      />
    </Container>
  );
};