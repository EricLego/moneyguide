import React from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useAuth } from '@/utils/AuthContext';

const Home: React.FC = () => {
  const { user, loading } = useAuth();

  return (
    <Layout title="MoneyGuide - Track Your Financial Journey">
      <div className="flex flex-col items-center text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Take Control of Your Financial Future
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mb-8">
          MoneyGuide helps you track your passive income, expenses, investments, and net worth in one place.
        </p>

        {!loading && (
          <div className="space-x-4">
            {user ? (
              <Link href="/dashboard" className="btn-primary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/signup" className="btn-primary">
                  Get Started
                </Link>
                <Link href="/login" className="inline-block px-4 py-2 text-primary font-medium">
                  Login
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-16">
        <div className="card">
          <h2 className="text-xl font-semibold mb-3">Track Passive Income</h2>
          <p className="text-gray-600">
            Monitor all your income streams in one place. See your total monthly
            income and track changes over time.
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-3">Visualize Your Progress</h2>
          <p className="text-gray-600">
            Interactive charts and calendar views help you understand your
            financial trends at a glance.
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-3">Plan Your Future</h2>
          <p className="text-gray-600">
            Set goals, track your progress, and make informed decisions about
            your financial future.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Home;