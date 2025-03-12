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

const IncomePage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loadingIncomes, setLoadingIncomes] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch income data
  useEffect(() => {
    const fetchIncomes = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/income');
        
        if (!response.ok) {
          throw new Error('Failed to fetch income data');
        }
        
        const result = await response.json();
        
        if (result.success) {
          setIncomes(result.data);
        } else {
          throw new Error(result.message || 'Error fetching income data');
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching incomes:', err);
      } finally {
        setLoadingIncomes(false);
      }
    };

    fetchIncomes();
  }, [user]);

  const handleAddIncome = async (data: IncomeFormData) => {
    try {
      const response = await fetch('/api/income', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add income');
      }
      
      const result = await response.json();
      
      // Add the new income to state
      setIncomes([result.data, ...incomes]);
      setShowForm(false);
      
      // Show success message
      setError(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const handleDeleteIncome = async (id: string) => {
    if (!confirm('Are you sure you want to delete this income record?')) {
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
      
      // Remove the deleted income from state
      setIncomes(incomes.filter(income => income._id !== id));
      
      // Show success message
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatFrequency = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Bi-Weekly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'annually': return 'Annually';
      default: return frequency;
    }
  };

  if (loading || (!user && !loading)) {
    return null; // Don't render anything while checking auth or if not logged in
  }

  return (
    <Layout title="Passive Income - MoneyGuide">
      <div className="section-spacing">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 bg-gradient-to-r from-primary/5 to-secondary/5 p-8 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-3 flex items-center text-gray-800">
              <span className="bg-primary/10 text-primary p-1.5 rounded-md mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              Passive Income
            </h1>
            <p className="text-gray-600 text-lg">
              Manage all your passive income sources and track your financial growth over time.
            </p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className={`${showForm ? 'btn-outline' : 'btn-primary'} flex items-center self-start sm:self-center px-6 py-3 shadow-md hover:shadow-lg transition-all`}
          >
            {showForm ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Income Source
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm" role="alert">
          <div className="flex">
            <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="card mb-10 border-t-4 border-primary p-8 shadow-md hover:shadow-lg transition-all">
          <h2 className="text-2xl font-bold mb-6">Add New Income Source</h2>
          <IncomeForm 
            onSubmit={handleAddIncome}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="card p-8 shadow-md">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-semibold">Your Income Sources</h2>
            <p className="text-gray-600 mt-1">Track and manage all your passive income streams</p>
          </div>
          <div className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {incomes.length} {incomes.length === 1 ? 'source' : 'sources'}
          </div>
        </div>
        
        {loadingIncomes ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-16 bg-gray-200 rounded w-full"></div>
            <div className="h-16 bg-gray-200 rounded w-full"></div>
            <div className="h-16 bg-gray-200 rounded w-full"></div>
          </div>
        ) : incomes.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incomes.map((income) => (
                  <tr key={income._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{income.source}</div>
                      {income.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{income.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 font-medium">
                        {income.currency} {income.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {formatFrequency(income.frequency)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-500">
                        {format(new Date(income.date), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/income/${income._id}`)}
                        className="inline-flex items-center text-primary hover:text-primary-dark transition-colors mr-4"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteIncome(income._id)}
                        className="inline-flex items-center text-red-600 hover:text-red-800 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div>
                  Showing {incomes.length} {incomes.length === 1 ? 'record' : 'records'}
                </div>
                <div className="flex items-center">
                  <button className="px-2 py-1 border border-gray-300 rounded-md mr-2 hover:bg-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="mx-2">Page 1</span>
                  <button className="px-2 py-1 border border-gray-300 rounded-md ml-2 hover:bg-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-12 text-center text-gray-500">
            <div className="rounded-full bg-gray-100 w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-medium text-xl mb-2">No income sources found</p> 
            <p className="text-lg mb-8">Add your first income source to start tracking your passive income progress.</p>
            {!showForm && (
              <button 
                onClick={() => setShowForm(true)} 
                className="btn-primary inline-flex items-center px-6 py-3 shadow-md hover:shadow-lg transition-all text-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Your First Income Source
              </button>
            )}
            
            <div className="mt-10 max-w-md mx-auto bg-white border border-gray-200 rounded-lg p-5 shadow-sm text-left">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-gray-700">Why track passive income?</span>
              </div>
              <p className="text-gray-600">Passive income sources provide financial security and freedom over time. By tracking your progress here, you can visualize growth and make informed decisions about your financial future.</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default IncomePage;