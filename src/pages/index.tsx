import React, { useEffect } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useAuth } from '@/utils/AuthContext';

const Home: React.FC = () => {
  const { user, loading } = useAuth();

  // Add fade-in animation effect on load
  useEffect(() => {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    fadeElements.forEach((element, index) => {
      setTimeout(() => {
        (element as HTMLElement).style.opacity = '1';
        (element as HTMLElement).style.transform = 'translateY(0)';
      }, 100 * index);
    });
  }, []);

  return (
    <Layout title="MoneyGuide - Track Your Financial Journey">
      <div className="flex flex-col items-center text-center py-12 mb-8">
        <div className="fade-in opacity-0 transform translate-y-4 transition duration-700 ease-out">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Take Control of Your Financial Future
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mb-10 leading-relaxed">
            MoneyGuide helps you track your income, spending, investments, and net worth in one place.
            <span className="font-medium">Get started in under 2 minutes.</span>
          </p>

          {!loading && (
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 mt-8 flex flex-col sm:flex-row justify-center items-center">
              {user ? (
                <Link href="/dashboard" className="btn-primary text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/signup" className="btn-primary text-lg px-8 py-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all w-full sm:w-auto">
                    Sign Up Free
                  </Link>
                  <Link href="/login" className="inline-block px-6 py-3 text-primary font-medium hover:text-primary-dark transition-colors">
                    Login
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        <div className="absolute left-0 right-0 -z-10 overflow-hidden">
          <div className="w-full h-[500px] bg-gradient-to-b from-blue-50 to-transparent opacity-50"></div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 my-16 px-4">
        <div className="card feature-card hover:shadow-lg fade-in opacity-0 transform translate-y-4 transition duration-700 ease-out">
          <div className="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-3 text-center">Track Income & Spending</h2>
          <p className="text-gray-600 text-center">
            Monitor all your cash flow in one place. Get real-time updates on earnings and expenses without the hassle.
          </p>
        </div>

        <div className="card feature-card hover:shadow-lg fade-in opacity-0 transform translate-y-4 transition duration-700 ease-out">
          <div className="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-3 text-center">Visualize Your Progress</h2>
          <p className="text-gray-600 text-center">
            Interactive charts and calendar views help you understand your financial trends at a glance, making it easier to plan ahead.
          </p>
        </div>

        <div className="card feature-card hover:shadow-lg fade-in opacity-0 transform translate-y-4 transition duration-700 ease-out">
          <div className="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-3 text-center">Plan Your Future</h2>
          <p className="text-gray-600 text-center">
            Set personalized financial goals, track your progress in real-time, and make informed decisions about your financial future.
          </p>
        </div>
      </div>

      <div className="mt-24 py-12 bg-gray-50 rounded-lg fade-in opacity-0 transform translate-y-4 transition duration-700 ease-out">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            Join over 10,000+ users who are taking control of their finances with MoneyGuide.
          </p>
          {!loading && !user && (
            <Link href="/signup" className="btn-primary text-lg px-8 py-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              Sign Up Now — It's Free
            </Link>
          )}
        </div>
      </div>

      <footer className="mt-24 pt-8 pb-16 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <p className="text-gray-500 text-sm">© {new Date().getFullYear()} MoneyGuide. All rights reserved.</p>
            </div>
            <div className="flex space-x-8">
              <Link href="/privacy" className="text-gray-500 hover:text-gray-700 text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-gray-700 text-sm">
                Terms of Service
              </Link>
              <Link href="/support" className="text-gray-500 hover:text-gray-700 text-sm">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

export default Home;