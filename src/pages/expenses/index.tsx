import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/utils/AuthContext';

const ExpensesPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || (!user && !loading)) {
    return null;
  }

  return (
    <Layout title="Expenses - MoneyGuide">
      <div className="section-spacing">
        <h1 className="text-3xl font-bold mb-3">Expenses</h1>
        <p className="text-gray-600 mb-6">Track and manage your spending. This section is coming soon.</p>
      </div>
    </Layout>
  );
};

export default ExpensesPage;
