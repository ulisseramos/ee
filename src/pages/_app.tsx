import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { Inter } from 'next/font/google';
import MainLayout from '../components/MainLayout';
import { useRouter } from 'next/router';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const noLayoutRoutes = ['/login', '/register', '/forgot-password', '/checkout/[id]', '/obrigado', '/rubi'];

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