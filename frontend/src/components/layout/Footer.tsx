import { Box, Typography, Container } from '@mui/material';

export const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#111',
        color: '#fff',
        py: 4,
        mt: 8,
      }}
    >
      <Container>
        <Typography variant="body2" align="center">
          © 2026 CLOTHING. Bütün hüquqlar qorunur.
        </Typography>
      </Container>
    </Box>
  );
};