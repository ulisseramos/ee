import type { AppProps } from 'next/app';
import '../styles/globals.css';
import '../styles/modal-integracao.css';
import '../styles/dashboard-mobile.css';
import { Inter } from 'next/font/google';
import MainLayout from '../components/MainLayout';
import { useRouter } from 'next/router';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Importa o CSS da página de login apenas quando necessário
  if (typeof window !== 'undefined' && router.pathname === '/login') {
    require('../styles/login.css');
  }
  // Importa o CSS da página de checkout apenas quando necessário
  if (typeof window !== 'undefined' && router.pathname.startsWith('/checkout')) {
    require('../styles/checkout.css');
  }
  // Importa o CSS da página de integrações apenas quando necessário
  if (typeof window !== 'undefined' && router.pathname === '/integracao') {
    // require('../styles/integracao.css');
  }
  // Importa o CSS da página de cadastro apenas quando necessário
  if (typeof window !== 'undefined' && router.pathname === '/register') {
    require('../styles/register.css');
  }

  const noLayoutRoutes = ['/login', '/register', '/forgot-password', '/checkout/[id]', '/obrigado'];

  const useLayout = !noLayoutRoutes.some(route => {
    if (route.includes('[id]')) {
      const baseRoute = route.substring(0, route.indexOf('['));
      return router.pathname.startsWith(baseRoute);
    }
    return router.pathname === route;
  });

  return (
    <AuthProvider>
      <main className={inter.className}>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 5000,
          }}
        />
        {useLayout ? (
          <MainLayout>
            <Component {...pageProps} />
          </MainLayout>
        ) : (
          <Component {...pageProps} />
        )}
      </main>
    </AuthProvider>
  );
}

export default MyApp;