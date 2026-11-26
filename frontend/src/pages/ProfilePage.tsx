import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useUpdateProfileMutation } from '../features/api/authApi';
import { useGetFavoritesQuery } from '../features/api/favoritesApi';
import { setCredentials } from '../features/auth/authSlice';

export const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const { data: favorites, isError: favoritesError } = useGetFavoritesQuery();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    name: user?.name ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
  });

  if (!user) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Sessiya bitib. Yenidən daxil olun.');
      return;
    }

    try {
      const updatedUser = await updateProfile(form).unwrap();
      setForm({
        name: updatedUser.name,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address ?? '',
      });
      dispatch(setCredentials({
        token,
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          address: updatedUser.address ?? user.address,
          termsAccepted: updatedUser.termsAccepted,
          role: updatedUser.role,
        },
      }));
      setIsEditing(false);
      setSuccess('Profil məlumatları yeniləndi.');
    } catch (requestError) {
      const data =
        typeof requestError === 'object' && requestError !== null && 'data' in requestError
          ? (requestError as { data?: { message?: string } }).data
          : undefined;
      setError(data?.message || 'Profil yenilənərkən xəta baş verdi.');
    }
  };

  const handleCancel = () => {
    setForm({
      name: user.name,
      lastName: user.lastName ?? '',
      email: user.email,
      phone: user.phone ?? '',
      address: user.address ?? '',
    });
    setIsEditing(false);
    setError('');
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 76px)', bgcolor: 'background.default', py: { xs: 5, md: 8 } }}>
      <Container maxWidth="md">
        <Typography component="h1" variant="h3" color="primary.main" sx={{ mb: 3 }}>
          Profilim
        </Typography>
        <Paper
          elevation={0}
          sx={{ p: { xs: 3, sm: 5 }, border: '1px solid', borderColor: 'divider' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 4 }}>
            <Avatar
              aria-label={`${user.name} profil şəkli`}
              sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: 28 }}
            >
              {user.name.charAt(0).toLocaleUpperCase()}
            </Avatar>
            <Box>
              <Typography component="h2" variant="h5" sx={{ fontWeight: 700 }}>
                {[user.name, user.lastName].filter(Boolean).join(' ')}
              </Typography>
              <Typography color="text.secondary">
                {user.role === 'admin' ? 'İdarəçi' : 'Müştəri hesabı'}
              </Typography>
            </Box>
            {!isEditing && (
              <Tooltip title="Profili redaktə et">
                <IconButton
                  aria-label="Profili redaktə et"
                  onClick={() => {
                    setError('');
                    setSuccess('');
                    setIsEditing(true);
                  }}
                  sx={{
                    ml: 'auto',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <EditOutlinedIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {favoritesError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Sevimli məhsulları yükləmək mümkün olmadı.
            </Alert>
          )}

          {isEditing ? (
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
            >
              <TextField
                label="Ad"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
                fullWidth
                autoComplete="given-name"
              />
              <TextField
                label="Soyad"
                value={form.lastName}
                onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                required
                fullWidth
                autoComplete="family-name"
              />
              <TextField
                label="E-poçt"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
                fullWidth
                autoComplete="email"
              />
              <TextField
                label="Telefon nömrəsi"
                type="tel"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                required
                fullWidth
                autoComplete="tel"
              />
              <TextField
                label="Ünvan"
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
                fullWidth
                multiline
                minRows={2}
                autoComplete="street-address"
              />
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button type="submit" variant="contained" disabled={isLoading}>
                  {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Yadda saxla'}
                </Button>
                <Button onClick={handleCancel} disabled={isLoading}>Ləğv et</Button>
              </Box>
            </Box>
          ) : (
            <>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="overline" color="text.secondary">Ad</Typography>
                  <Typography>{user.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="overline" color="text.secondary">Soyad</Typography>
                  <Typography>{user.lastName || '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="overline" color="text.secondary">E-poçt</Typography>
                  <Typography>{user.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="overline" color="text.secondary">Telefon nömrəsi</Typography>
                  <Typography>{user.phone || '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="overline" color="text.secondary">Ünvan</Typography>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>{user.address || '—'}</Typography>
                </Box>
                <Box>
                  <Typography variant="overline" color="text.secondary">Hesab növü</Typography>
                  <Typography>{user.role === 'admin' ? 'İdarəçi' : 'Müştəri'}</Typography>
                </Box>
                <FormControlLabel
                  control={<Checkbox checked={Boolean(user.termsAccepted)} disabled />}
                  label="İstifadəçi Şərtləri və Məxfilik Siyasəti qəbul edilib"
                />
              </Stack>
            </>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
                gap: 1.5,
              }}
            >
              <Button
                component={Link}
                to="/favorites"
                variant="outlined"
                startIcon={<FavoriteBorderIcon />}
                fullWidth
                sx={{ minHeight: 48 }}
              >
                Sevimlilərim ({favorites?.length ?? 0})
              </Button>
              <Button
                component={Link}
                to="/my-orders"
                variant="outlined"
                startIcon={<ReceiptLongOutlinedIcon />}
                fullWidth
                sx={{ minHeight: 48 }}
              >
                Sifarişlərim
              </Button>
              <Button
                component={Link}
                to="/products"
                variant="outlined"
                startIcon={<ShoppingBagOutlinedIcon />}
                fullWidth
                sx={{ minHeight: 48 }}
              >
                Alış-verişə davam et
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
