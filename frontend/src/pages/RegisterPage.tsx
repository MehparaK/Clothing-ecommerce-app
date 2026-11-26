import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useState, type FormEvent } from 'react';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../app/hooks';
import { useRegisterMutation } from '../features/api/authApi';
import { baseApi } from '../features/api/baseApi';
import { setCredentials } from '../features/auth/authSlice';

export const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    password?: string;
    confirmPassword?: string;
    termsAccepted?: string;
  }>({});
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const nextErrors: typeof errors = {};

    if (!name.trim()) {
      nextErrors.name = 'Ad tələb olunur.';
    }

    if (!lastName.trim()) {
      nextErrors.lastName = 'Soyad tələb olunur.';
    }

    if (!email.trim()) {
      nextErrors.email = 'E-poçt ünvanı tələb olunur.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Düzgün e-poçt formatı daxil edin.';
    }

    if (!phone.trim()) {
      nextErrors.phone = 'Telefon nömrəsi tələb olunur.';
    }

    if (!address.trim()) {
      nextErrors.address = 'Ünvan tələb olunur.';
    } else if (address.trim().length > 500) {
      nextErrors.address = 'Ünvan 500 simvoldan çox ola bilməz.';
    }

    if (!password) {
      nextErrors.password = 'Şifrə tələb olunur.';
    } else if (password.length < 6) {
      nextErrors.password = 'Şifrə ən azı 6 simvol olmalıdır.';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Şifrənin təkrarı tələb olunur.';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Şifrələr uyğun gəlmir.';
    }

    if (!termsAccepted) {
      nextErrors.termsAccepted = 'Davam etmək üçün şərtləri qəbul edin.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError('');

    if (!validate()) return;

    try {
      const response = await register({
        name: name.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        password,
        confirmPassword,
        termsAccepted,
      }).unwrap();
      dispatch(baseApi.util.resetApiState());
      dispatch(
        setCredentials({
          token: response.token,
          user: {
            id: response._id,
            name: response.name,
            lastName: response.lastName,
            email: response.email,
            phone: response.phone,
            address: response.address,
            termsAccepted: response.termsAccepted,
            role: response.role,
          },
        })
      );
      navigate('/', { replace: true });
    } catch (error) {
      const data =
        typeof error === 'object' && error !== null && 'data' in error
          ? (error as { data?: { message?: string } }).data
          : undefined;
      setServerError(data?.message || 'Qeydiyyat zamanı xəta baş verdi.');
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 76px)', py: { xs: 6, md: 10 } }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, border: '1px solid', borderColor: 'divider' }}>
          <Typography component="h1" variant="h3" color="primary.main" align="center" sx={{ mb: 1 }}>
            Qeydiyyat
          </Typography>
          <Typography color="text.secondary" align="center" sx={{ mb: 4 }}>
            Yeni hesab yaradın
          </Typography>

          {serverError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {serverError}
            </Alert>
          )}

          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Ad"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={Boolean(errors.name)}
              helperText={errors.name}
              fullWidth
              autoComplete="name"
            />
            <TextField
              label="Soyad"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              error={Boolean(errors.lastName)}
              helperText={errors.lastName}
              fullWidth
              autoComplete="family-name"
            />
            <TextField
              label="E-poçt"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={Boolean(errors.email)}
              helperText={errors.email}
              fullWidth
              autoComplete="email"
            />
            <TextField
              label="Telefon nömrəsi"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              error={Boolean(errors.phone)}
              helperText={errors.phone}
              fullWidth
              autoComplete="tel"
            />
            <TextField
              label="Ünvan"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              error={Boolean(errors.address)}
              helperText={errors.address}
              required
              fullWidth
              multiline
              minRows={2}
              autoComplete="street-address"
            />
            <TextField
              label="Şifrə"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={Boolean(errors.password)}
              helperText={errors.password}
              fullWidth
              autoComplete="new-password"
            />
            <TextField
              label="Şifrənin təkrarı"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword}
              fullWidth
              autoComplete="new-password"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        type="button"
                        aria-label={showConfirmPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
                        onClick={() => setShowConfirmPassword((visible) => !visible)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={termsAccepted}
                    onChange={(event) => setTermsAccepted(event.target.checked)}
                  />
                }
                label="İstifadə şərtlərini və məxfilik siyasətini qəbul edirəm"
              />
              {errors.termsAccepted && (
                <FormHelperText error>{errors.termsAccepted}</FormHelperText>
              )}
            </Box>
            <Button type="submit" variant="contained" size="large" disabled={isLoading} sx={{ py: 1.5 }}>
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Qeydiyyatdan keç'}
            </Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 3 }}>
            Artıq hesabınız var?{' '}
            <MuiLink
              component={Link}
              to="/login"
              underline="hover"
              sx={{ fontWeight: 700 }}
            >
              Daxil ol
            </MuiLink>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};
