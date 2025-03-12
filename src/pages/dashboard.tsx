import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { format } from 'date-fns';
import Layout from '@/components/Layout';
import { useAuth } from '@/utils/AuthContext';
import IncomeChart from '@/components/charts/IncomeChart';
import CalendarView from '@/components/charts/CalendarView';

interface MonthlyIncome {
  month: string;
  total: number;
}

interface IncomeEvent {
  id: string;
  title: string;
  amount: number;
  currency: string;
  date: string | Date;
  frequency: string;
}

interface StatsData {
  totalMonthlyIncome: number;
  monthlyStats: MonthlyIncome[];
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [events, setEvents] = useState<IncomeEvent[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch stats data
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/income/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch stats data');
        }
        
        const result = await response.json();
        
        if (result.success) {
          setStats(result.data);
        } else {
          throw new Error(result.message || 'Error fetching stats');
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [user]);

  // Fetch calendar events for current month
  const fetchCalendarEvents = async (year: number, month: number) => {
    if (!user) return;
    
    setLoadingEvents(true);
    
    try {
      const response = await fetch(`/api/income/calendar?year=${year}&month=${month}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch calendar data');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setEvents(result.data);
      } else {
        throw new Error(result.message || 'Error fetching calendar data');
      }
    } catch (err: any) {
      console.error('Error fetching calendar events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Handle event selection
  const handleEventSelect = (event: IncomeEvent) => {
    router.push(`/income/${event.id}`);
  };

  if (loading || (!user && !loading)) {
    return null; // Don't render anything while checking auth or if not logged in
  }

  // Calculate sample data for demo if no real data exists
  const sampleData = !stats || stats.totalMonthlyIncome === 0;
  const displayIncome = sampleData ? 1250.75 : stats?.totalMonthlyIncome || 0;
  
  // Sample monthly stats if needed
  const sampleMonthlyStats = [
    { month: 'Aug 2023', total: 950.25 },
    { month: 'Sep 2023', total: 975.50 },
    { month: 'Oct 2023', total: 1050.00 },
    { month: 'Nov 2023', total: 1125.30 },
    { month: 'Dec 2023', total: 1175.45 },
    { month: 'Jan 2024', total: 1250.75 }
  ];

  return (
    <Layout title="Dashboard - MoneyGuide">
      <div className="section-spacing">
        <div className="relative overflow-hidden bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
            <div>
              <h1 className="mb-2 flex items-center">
                <span className="bg-primary/10 text-primary p-1 rounded-md mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
                Passive Income Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, <span className="font-medium">{user?.name}</span>! 
                Here's your financial overview for <span className="font-medium">{format(new Date(), 'MMMM yyyy')}</span>.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="btn-outline flex items-center px-3 py-1.5 text-sm border-gray-200 hover:bg-white/80">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Export
              </button>
              <Link href="/income" className="btn-primary flex items-center px-3 py-1.5 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Income
              </Link>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute -right-16 -bottom-12 text-primary/5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-48 w-48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm" role="alert">
            <div className="flex">
              <svg className="h-5 w-5 text-red-500 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-medium">There was an error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {sampleData && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 mb-6 rounded-md shadow-sm flex items-start" role="alert">
            <div className="p-1 bg-blue-100 rounded-md mr-3">
              <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Demo Mode</p>
              <p className="text-sm">Sample data is being displayed. Add your first income source to see your actual data.</p>
              <Link href="/income" className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800 mt-1">
                <span className="underline">Add your first income source</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <button className="ml-auto text-blue-500 hover:text-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 section-spacing">
        <div className="stat-card col-span-2 group hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between">
            <div>
              <div className="data-label mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Total Monthly Income
              </div>
              {loadingStats ? (
                <div className="animate-pulse h-10 bg-gray-200 rounded w-1/2"></div>
              ) : (
                <div className="relative">
                  <div className="data-value group-hover:scale-105 origin-left transition-transform">
                    ${displayIncome.toFixed(2)}
                    <span className="text-sm text-gray-500 font-normal ml-2">per month</span>
                  </div>
                  
                  {/* Yearly projection info */}
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <span className="text-xs font-medium text-gray-700 mr-1">Yearly projection:</span>
                    ${(displayIncome * 12).toFixed(2)}
                    
                    <div className="group relative ml-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="absolute bottom-full left-0 mb-2 w-48 bg-white shadow-lg rounded-md p-2 text-xs text-gray-600 
                                    opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        Simple projection based on your current monthly income.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link href="/income" className="text-primary hover:text-primary/80 text-sm font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add new income source
            </Link>
          </div>
        </div>
        
        <div className="stat-card border-secondary group hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between">
            <div>
              <div className="data-label mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Income Sources
              </div>
              {loadingStats ? (
                <div className="animate-pulse h-10 bg-gray-200 rounded w-1/2"></div>
              ) : (
                <div className="data-value text-secondary group-hover:scale-105 origin-left transition-transform">
                  {sampleData ? 3 : stats?.monthlyStats?.length || 0}
                  <span className="text-sm text-gray-500 font-normal ml-2">sources</span>
                </div>
              )}
            </div>
            
            <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link href="/income" className="text-secondary hover:text-secondary/80 text-sm font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              View all sources
            </Link>
          </div>
        </div>
      </div>

      <div className="card section-spacing">
        <div className="flex justify-between items-center mb-4">
          <h2>Income Trends</h2>
          <div className="text-sm text-gray-500 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Last 6 months
          </div>
        </div>
        
        {loadingStats ? (
          <div className="animate-pulse space-y-4">
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/5"></div>
            </div>
            <div className="h-80 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : stats?.monthlyStats?.length ? (
          <IncomeChart data={stats.monthlyStats} currency="USD" />
        ) : (
          <>
            {sampleData ? (
              <div className="relative">
                <IncomeChart data={sampleMonthlyStats} currency="USD" />
                <div className="absolute top-0 right-0 left-0 bottom-0 bg-white/50 flex items-center justify-center pointer-events-none">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 shadow-sm">
                    <p className="text-sm font-medium text-blue-700">Sample data shown</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="font-medium">No income data available</p>
                <p className="mt-1">Add your first income source to start tracking your financial progress.</p>
                <Link href="/income" className="btn-primary inline-block mt-4">
                  Add Income Source
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      <div className="card section-spacing">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <h2>Income Calendar</h2>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Monthly View
            </span>
          </div>
          <Link href="/income" className="text-primary hover:underline text-sm font-medium flex items-center group">
            View all sources
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        {loadingEvents ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded grid grid-cols-7"></div>
            <div className="h-80 bg-gray-200 rounded-lg"></div>
          </div>
        ) : sampleData || events.length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <CalendarView 
              events={events.length > 0 ? events : [
                { id: 'sample-1', title: 'Dividend Income', amount: 125.50, currency: 'USD', date: new Date(), frequency: 'monthly' },
                { id: 'sample-2', title: 'Rental Income', amount: 875.00, currency: 'USD', date: new Date(), frequency: 'monthly' },
                { id: 'sample-3', title: 'Side Project', amount: 250.25, currency: 'USD', date: new Date(), frequency: 'monthly' }
              ]} 
              onEventSelect={handleEventSelect}
              onDateChange={fetchCalendarEvents}
            />
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
            <div className="rounded-full bg-gray-100 w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-medium mb-1">No calendar events this month</p>
            <p className="mb-4">Add income sources with specific dates to see them in the calendar.</p>
            <div className="inline-flex flex-col items-start text-left bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <span className="text-xs text-gray-500 mb-1">Quick Tip</span>
              <p className="text-sm text-gray-700">When adding income, set the date to when you expect to receive the payment to help with cash flow planning.</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;