import React from 'react';
import { AppProps } from 'next/app';
import '@/styles/globals.css';
import { AuthProvider } from '@/utils/AuthContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;