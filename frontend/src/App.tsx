import { Alert, Box, CircularProgress } from '@mui/material';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { AppRouter } from './routes/AppRouter';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { baseApi } from './features/api/baseApi';
import { useGetCurrentUserQuery } from './features/api/authApi';
import { logout, setCredentials } from './features/auth/authSlice';
import type { User } from './types';

export const App = () => {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin');
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const {
    data: currentUser,
    error: currentUserError,
  } = useGetCurrentUserQuery(undefined, { skip: !token });

  useEffect(() => {
    if (!token) {
      return;
    }

    if (currentUser) {
      const user: User = {
        id: currentUser._id,
        name: currentUser.name,
        lastName: currentUser.lastName,
        email: currentUser.email,
        phone: currentUser.phone,
        address: currentUser.address,
        termsAccepted: currentUser.termsAccepted,
        role: currentUser.role,
      };
      dispatch(setCredentials({ token, user }));
      return;
    }

    if (currentUserError) {
      if (
        typeof currentUserError === 'object' &&
        currentUserError !== null &&
        'status' in currentUserError &&
        currentUserError.status === 401
      ) {
        dispatch(logout());
        dispatch(baseApi.util.resetApiState());
      }
    }
  }, [currentUser, currentUserError, dispatch, token]);

  const isAuthRefreshing =
    token &&
    !currentUserError &&
    (!currentUser ||
      user?.id !== currentUser._id ||
      user?.name !== currentUser.name ||
      user?.lastName !== currentUser.lastName ||
      user?.role !== currentUser.role ||
      user?.email !== currentUser.email ||
      user?.phone !== currentUser.phone ||
      user?.address !== currentUser.address ||
      user?.termsAccepted !== currentUser.termsAccepted);

  if (isAuthRefreshing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (token && currentUserError && !currentUser) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Hesab məlumatlarını yeniləmək mümkün olmadı. Səhifəni yeniləyib yenidən cəhd edin.
        </Alert>
      </Box>
    );
  }

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <AppRouter />
      {!isAdminRoute && <Footer />}
    </>
  );
};