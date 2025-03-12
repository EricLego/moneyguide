import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import Layout from '@/components/Layout';
import { useAuth } from '@/utils/AuthContext';
import IncomeForm, { IncomeFormData } from '@/components/forms/IncomeForm';

interface Income {
  _id: string;
  source: string;
  amount: number;
  currency: string;
  frequency: string;
  date: string;
  description?: string;
}

const IncomeEditPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  
  const [income, setIncome] = useState<Income | null>(null);
  const [loadingIncome, setLoadingIncome] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch income data
  useEffect(() => {
    const fetchIncome = async () => {
      if (!user || !id) return;
      
      try {
        const response = await fetch(`/api/income/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch income data');
        }
        
        const result = await response.json();
        
        if (result.success) {
          setIncome(result.data);
        } else {
          throw new Error(result.message || 'Error fetching income data');
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching income:', err);
      } finally {
        setLoadingIncome(false);
      }
    };

    fetchIncome();
  }, [user, id]);

  const handleUpdateIncome = async (data: IncomeFormData) => {
    if (!id) return;
    
    try {
      const response = await fetch(`/api/income/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update income');
      }
      
      // Navigate back to income list
      router.push('/income');
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this income record?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/income/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete income');
      }
      
      // Navigate back to income list
      router.push('/income');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading || (!user && !loading)) {
    return null; // Don't render anything while checking auth or if not logged in
  }

  return (
    <Layout title="Edit Income - MoneyGuide">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Edit Income</h1>
          <p className="text-gray-600">
            Update your income source details.
          </p>
        </div>
        <button 
          onClick={() => router.push('/income')} 
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Back to List
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="card">
        {loadingIncome ? (
          <p>Loading income data...</p>
        ) : income ? (
          <>
            <IncomeForm 
              initialData={{
                source: income.source,
                amount: income.amount,
                currency: income.currency,
                frequency: income.frequency,
                date: format(new Date(income.date), 'yyyy-MM-dd'),
                description: income.description,
              }}
              onSubmit={handleUpdateIncome}
              onCancel={() => router.push('/income')}
              isEdit={true}
            />
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Delete this income source
              </button>
            </div>
          </>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
            <p>Income source not found or you don't have permission to view it.</p>
            <button 
              onClick={() => router.push('/income')} 
              className="mt-4 btn-primary"
            >
              Back to Income List
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default IncomeEditPage;