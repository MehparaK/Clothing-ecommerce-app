import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Link as MuiLink,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../app/hooks';
import { useLoginMutation } from '../features/api/authApi';
import { setCredentials } from '../features/auth/authSlice';

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const nextErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      nextErrors.email = 'Email tələb olunur.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Düzgün email formatı daxil edin.';
    }

    if (!password) {
      nextErrors.password = 'Şifrə tələb olunur.';
    } else if (password.length < 6) {
      nextErrors.password = 'Şifrə ən azı 6 simvol olmalıdır.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError('');

    if (!validate()) return;

    try {
      const response = await login({ email: email.trim(), password }).unwrap();
      dispatch(
        setCredentials({
          token: response.token,
          user: {
            id: response._id,
            name: response.name,
            email: response.email,
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
      setServerError(data?.message || 'Giriş zamanı xəta baş verdi.');
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 76px)', py: { xs: 6, md: 10 } }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, border: '1px solid', borderColor: 'divider' }}>
          <Typography component="h1" variant="h3" color="primary.main" align="center" sx={{ mb: 1 }}>
            Giriş
          </Typography>
          <Typography color="text.secondary" align="center" sx={{ mb: 4 }}>
            Hesabınıza daxil olun
          </Typography>

          {serverError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {serverError}
            </Alert>
          )}

          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={Boolean(errors.email)}
              helperText={errors.email}
              fullWidth
              autoComplete="email"
            />
            <TextField
              label="Şifrə"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={Boolean(errors.password)}
              helperText={errors.password}
              fullWidth
              autoComplete="current-password"
            />
            <Button type="submit" variant="contained" size="large" disabled={isLoading} sx={{ py: 1.5 }}>
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Daxil ol'}
            </Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 3 }}>
            Hesabınız yoxdur?{' '}
            <MuiLink
              component={Link}
              to="/register"
              underline="hover"
              sx={{ fontWeight: 700 }}
            >
              Qeydiyyat
            </MuiLink>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};
