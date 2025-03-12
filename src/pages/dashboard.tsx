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
        <div className="relative overflow-hidden bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl shadow-sm border border-gray-100 p-8 mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
            <div>
              <h1 className="mb-3 flex items-center">
                <span className="bg-primary/10 text-primary p-1.5 rounded-md mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
                Passive Income Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Welcome back, <span className="font-medium">{user?.name}</span>! 
                Here's your financial overview for <span className="font-medium">{format(new Date(), 'MMMM yyyy')}</span>.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="btn-outline flex items-center px-4 py-2 text-sm border-gray-200 hover:bg-white/80 transition-all shadow-sm hover:shadow">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Export Data
              </button>
              <Link href="/income" className="btn-primary flex items-center px-4 py-2 text-sm shadow-md hover:shadow-lg">
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

      <div className="grid md:grid-cols-3 gap-8 mb-14 relative">
        {/* Subtle divider */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-[95%] h-px bg-gray-100 -bottom-7"></div>
        <div className="stat-card col-span-2 group hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between">
            <div>
              <div className="data-label mb-3 flex items-center">
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
                  
                  {/* Previous month comparison */}
                  <div className="mt-1 text-sm flex items-center">
                    <span className="text-gray-600">Your previous: </span>
                    <span className="font-medium ml-1">${(displayIncome * 0.95).toFixed(2)}</span>
                    <div className="flex items-center ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      <span className="text-xs font-medium">+5%</span>
                    </div>
                    <div className="ml-2 text-xs text-gray-500">
                      +${(displayIncome - displayIncome * 0.95).toFixed(2)}
                    </div>
                  </div>
                  
                  {/* Yearly projection info */}
                  <div className="mt-3 text-sm text-gray-600 flex items-center">
                    <span className="font-medium mr-1">Yearly projection:</span>
                    <span className="text-primary font-semibold">${(displayIncome * 12).toFixed(2)}</span>
                    
                    <div className="group relative ml-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="absolute bottom-full left-0 mb-2 w-56 bg-white shadow-lg rounded-md p-3 text-sm text-gray-600 
                                    opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        Simple projection based on your current monthly income.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100">
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
              <div className="data-label mb-3 flex items-center">
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
              
              {/* Source breakdown */}
              <div className="mt-3 text-sm">
                <div className="flex justify-between text-gray-600 mb-1">
                  <span>Active</span>
                  <span className="font-medium">{sampleData ? 2 : 1}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Pending</span>
                  <span className="font-medium">{sampleData ? 1 : 0}</span>
                </div>
              </div>
            </div>
            
            <div className="h-20 w-20 rounded-full bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link href="/income" className="text-secondary hover:text-secondary/80 text-sm font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              View all sources
            </Link>
          </div>
        </div>
      </div>

      <div className="card mb-14 p-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Income Trends</h2>
            <p className="text-gray-600 mt-1">See how your passive income has grown over time</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Last 6 months
            </div>
            <select className="bg-white border border-gray-300 text-gray-700 text-sm px-3 py-1.5 rounded-md shadow-sm">
              <option>Monthly View</option>
              <option>Quarterly View</option>
              <option>Yearly View</option>
            </select>
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
          <div className="bg-white p-4 rounded-lg border border-gray-100">
            <div className="relative">
              <IncomeChart data={stats.monthlyStats} currency="USD" />
              
              {/* Tooltip example - would be placed dynamically based on data points */}
              <div className="absolute top-1/3 left-2/3 bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
                <div className="font-semibold mb-1">November 2023</div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Income:</span>
                  <span className="font-medium">${(displayIncome * 0.9).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">vs. Previous:</span>
                  <span className="text-green-600">+4.2%</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between text-sm text-gray-600 gap-4">
              <div className="flex items-center">
                <span className="font-medium mr-2">Average monthly income:</span> 
                <span className="bg-gray-100 px-2 py-1 rounded-md">${(displayIncome * 0.85).toFixed(2)}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">Growth rate:</span> 
                <div className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>+15.2% in 6 months</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {sampleData ? (
              <div className="relative">
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="relative">
                    <IncomeChart data={sampleMonthlyStats} currency="USD" />
                    
                    {/* Tooltip example - would be placed dynamically based on data points */}
                    <div className="absolute top-1/3 left-2/3 bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
                      <div className="font-semibold mb-1">December 2023</div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Income:</span>
                        <span className="font-medium">$1,175.45</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">vs. Previous:</span>
                        <span className="text-green-600">+5.2%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between text-sm text-gray-600 gap-4">
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Average monthly income:</span> 
                      <span className="bg-gray-100 px-2 py-1 rounded-md">$1,087.88</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Growth rate:</span> 
                      <div className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span>+31.6% in 6 months</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-0 right-0 left-0 bottom-0 bg-white/50 flex items-center justify-center pointer-events-none">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 shadow-sm">
                    <p className="text-sm font-medium text-blue-700">Sample data shown</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-10 text-center text-gray-500">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="font-medium text-xl mb-2">No income data available</p>
                <p className="text-lg mb-6">Add your first income source to start tracking your financial progress.</p>
                <Link href="/income" className="btn-primary inline-block px-6 py-3 text-lg shadow-md hover:shadow-lg transition-all">
                  Add Income Source
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      <div className="card p-10 mb-16 relative">
        {/* Top accent border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-t-lg"></div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-semibold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Income Calendar
            </h2>
            <p className="text-gray-600 mt-1">Schedule and track your upcoming payments</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Monthly View
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
              
              {/* Dropdown menu */}
              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg 
                              opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <div className="py-1">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Daily View</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 bg-blue-50">Monthly View</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Yearly View</a>
                </div>
              </div>
            </div>
            
            <Link href="/income" className="text-primary hover:text-primary-dark text-sm font-medium flex items-center group transition-colors">
              View all sources
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
        
        {loadingEvents ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded grid grid-cols-7"></div>
            <div className="h-80 bg-gray-200 rounded-lg"></div>
          </div>
        ) : sampleData || events.length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <div className="relative">
              <CalendarView 
                events={events.length > 0 ? events : [
                  { id: 'sample-1', title: 'Dividend Income', amount: 125.50, currency: 'USD', date: new Date(), frequency: 'monthly' },
                  { id: 'sample-2', title: 'Rental Income', amount: 875.00, currency: 'USD', date: new Date(), frequency: 'monthly' },
                  { id: 'sample-3', title: 'Side Project', amount: 250.25, currency: 'USD', date: new Date(), frequency: 'monthly' }
                ]} 
                onEventSelect={handleEventSelect}
                onDateChange={fetchCalendarEvents}
              />
              
              {/* Tooltip example for calendar events */}
              <div className="absolute bottom-20 right-32 bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm max-w-xs z-10">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Rental Income</span>
                  <span className="bg-secondary/20 text-secondary text-xs px-1.5 py-0.5 rounded">Recurring</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">$875.00</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Date:</span>
                  <span>{format(new Date(), 'MMM d, yyyy')}</span>
                </div>
                <button className="text-xs text-primary font-medium hover:underline w-full text-center">
                  Click to view details
                </button>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 mx-4 flex flex-col sm:flex-row justify-between text-sm text-gray-600 pb-2">
              <div className="mb-2 sm:mb-0 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Tip:</span> Click on any event to view details
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-primary mr-1.5"></div>
                  <span>One-time</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-secondary mr-1.5"></div>
                  <span>Recurring</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-10 text-center text-gray-500">
            <div className="rounded-full bg-gray-100 w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-medium text-xl mb-2">No calendar events this month</p>
            <p className="text-lg mb-6">Add income sources with specific dates to see them in the calendar.</p>
            
            <Link href="/income" className="btn-primary inline-block px-6 py-2 mb-8 shadow-md hover:shadow-lg transition-all">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Income Source
              </span>
            </Link>
            
            <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-lg p-5 shadow-sm text-left">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-gray-700">Quick Tip</span>
              </div>
              <p className="text-gray-600">When adding income, set the date to when you expect to receive the payment to help with cash flow planning and get notified when payments are due.</p>
            </div>
            
            <div className="mt-6 w-full p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-500">
                Click or tap on any date to quickly add an income entry
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;