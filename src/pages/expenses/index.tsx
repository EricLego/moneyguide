import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import Layout from '@/components/Layout';
import { useAuth } from '@/utils/AuthContext';
import ExpenseForm, { ExpenseFormData } from '@/components/forms/ExpenseForm';

interface Expense {
  _id: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  notes?: string;
}

const ExpensesPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user) return;
      try {
        const res = await fetch('/api/expenses');
        if (!res.ok) throw new Error('Failed to fetch expenses');
        const result = await res.json();
        if (result.success) setExpenses(result.data);
        else throw new Error(result.message || 'Error fetching expenses');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingExpenses(false);
      }
    };
    fetchExpenses();
  }, [user]);

  const handleAddExpense = async (data: ExpenseFormData) => {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to add expense');
      }
      const result = await res.json();
      setExpenses([result.data, ...expenses]);
      setShowForm(false);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to delete expense');
      }
      setExpenses(expenses.filter(e => e._id !== id));
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading || (!user && !loading)) {
    return null;
  }

  return (
    <Layout title="Expenses - MoneyGuide">
      <div className="section-spacing">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 bg-gradient-to-r from-secondary/10 to-primary/5 p-8 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-3 flex items-center text-gray-800">
              <span className="bg-secondary/10 text-secondary p-1.5 rounded-md mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </span>
              Expenses
            </h1>
            <p className="text-gray-600 text-lg">Track and manage your spending habits.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className={`${showForm ? 'btn-outline' : 'btn-secondary'} flex items-center self-start sm:self-center px-6 py-3 shadow-md hover:shadow-lg transition-all`}>
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
                Add Expense
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm" role="alert">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="card mb-10 border-t-4 border-secondary p-8 shadow-md hover:shadow-lg transition-all">
          <h2 className="text-2xl font-bold mb-6">Add New Expense</h2>
          <ExpenseForm onSubmit={handleAddExpense} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div className="card p-8 shadow-md">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-semibold">Your Expenses</h2>
            <p className="text-gray-600 mt-1">Keep track of all your spending</p>
          </div>
          <div className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
          </div>
        </div>

        {loadingExpenses ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-16 bg-gray-200 rounded w-full"></div>
            <div className="h-16 bg-gray-200 rounded w-full"></div>
            <div className="h-16 bg-gray-200 rounded w-full"></div>
          </div>
        ) : expenses.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map(expense => (
                  <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{expense.category}</div>
                      {expense.notes && <div className="text-sm text-gray-500 truncate max-w-xs">{expense.notes}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 font-medium">{expense.currency} {expense.amount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-500">{format(new Date(expense.date), 'MMM d, yyyy')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleDeleteExpense(expense._id)} className="inline-flex items-center text-red-600 hover:text-red-800 transition-colors">
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
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-12 text-center text-gray-500">
            <div className="rounded-full bg-gray-100 w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="font-medium text-xl mb-2">No expenses found</p>
            <p className="text-lg mb-8">Add your first expense to start tracking your spending.</p>
            {!showForm && (
              <button onClick={() => setShowForm(true)} className="btn-secondary inline-flex items-center px-6 py-3 shadow-md hover:shadow-lg transition-all text-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Your First Expense
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExpensesPage;
