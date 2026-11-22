import { AppRouter } from './routes/AppRouter';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

export const App = () => (
  <>
    <Navbar />
    <AppRouter />
    <Footer />
  </>
);