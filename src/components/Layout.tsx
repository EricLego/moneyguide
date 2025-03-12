import React, { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/utils/AuthContext';

type LayoutProps = {
  children: ReactNode;
  title?: string;
};

const Layout: React.FC<LayoutProps> = ({ children, title = 'MoneyGuide' }) => {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const isActive = (path: string) => router.pathname === path || router.pathname.startsWith(`${path}/`);
  const isHome = router.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Financial dashboard for tracking income, expenses, and investments" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <header className={`${isHome ? 'bg-transparent' : 'bg-white'} border-b border-gray-200 sticky top-0 z-10 shadow-sm transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-xl font-bold text-primary hover:text-primary-dark transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-1zm5-1a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1v-1a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                MoneyGuide
              </Link>
            </div>

            <nav className="flex items-center space-x-2 sm:space-x-4">
              {!loading && (
                <>
                  {user ? (
                    <>
                      <Link href="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive('/dashboard') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:text-primary hover:bg-gray-50'}`}>
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="hidden sm:inline">Dashboard</span>
                        </span>
                      </Link>
                      <Link href="/income" className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive('/income') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:text-primary hover:bg-gray-50'}`}>
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="hidden sm:inline">Income</span>
                        </span>
                      </Link>
                      <div className="relative ml-2 group">
                        <button 
                          className="flex items-center px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-700 hidden sm:block mr-1">
                            {user.name.split(' ')[0]}
                          </span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                          <div className="px-4 py-3">
                            <p className="text-sm">Signed in as</p>
                            <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                          </div>
                          <div className="py-1">
                            <button 
                              onClick={() => logout()} 
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Sign out
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/login') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:text-primary'}`}>
                        Login
                      </Link>
                      <Link href="/signup" className="btn-primary transition-all hover:scale-105">
                        Sign Up Free
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {!isHome && (
        <footer className="bg-white border-t border-gray-200 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="flex items-center mb-4 sm:mb-0">
                <span className="text-primary font-bold text-lg mr-2">MoneyGuide</span>
                <span className="text-gray-500 text-sm">
                  © {new Date().getFullYear()} All rights reserved
                </span>
              </div>
              <div className="flex space-x-6">
                <Link href="/privacy" className="text-gray-500 hover:text-primary transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="text-gray-500 hover:text-primary transition-colors">
                  Terms
                </Link>
                <Link href="/support" className="text-gray-500 hover:text-primary transition-colors">
                  Support
                </Link>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;