import React, { useState, useRef, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MonthlyIncome {
  month: string;
  total: number;
}

interface IncomeChartProps {
  data: MonthlyIncome[];
  currency?: string;
}

const IncomeChart: React.FC<IncomeChartProps> = ({ data, currency = 'USD' }) => {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const months = data.map(item => item.month);
  const amounts = data.map(item => item.total);
  const [growth, setGrowth] = useState<number>(0);
  
  // Calculate growth percentage, avoid division by zero
  useEffect(() => {
    if (amounts.length >= 2) {
      const oldest = amounts[0];
      const newest = amounts[amounts.length - 1];

      if (oldest === 0) {
        // When the initial value is 0, growth is undefined
        setGrowth(0);
      } else {
        const growthPercent = ((newest - oldest) / oldest) * 100;
        setGrowth(growthPercent);
      }
    } else {
      // Not enough data points, assume no growth
      setGrowth(0);
    }
  }, [amounts]);

  // Create nice gradient fill
  const getGradient = (ctx: CanvasRenderingContext2D) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    
    // Use different colors based on growth trend
    if (growth > 0) {
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.6)'); // Green/positive
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)');
    } else if (growth < 0) {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.6)'); // Red/negative
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
    } else {
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.6)'); // Blue/neutral
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
    }
    
    return gradient;
  };
  
  // Get line color based on growth trend
  const getLineColor = () => {
    if (growth > 0) return 'rgba(16, 185, 129, 1)'; // Green/positive
    if (growth < 0) return 'rgba(239, 68, 68, 1)'; // Red/negative
    return 'rgba(59, 130, 246, 1)'; // Blue/neutral
  };

  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'Monthly Income',
        data: amounts,
        fill: true,
        backgroundColor: function(context: any) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) {
            // This can happen when the chart is not ready yet
            return 'rgba(59, 130, 246, 0.2)';
          }
          return getGradient(ctx);
        },
        borderColor: getLineColor(),
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: (context: any) => {
          const index = context.dataIndex;
          return index === activePoint ? getLineColor() : 'white';
        },
        pointBorderColor: getLineColor(),
        pointBorderWidth: 2,
        pointRadius: (context: any) => {
          const index = context.dataIndex;
          return index === activePoint ? 8 : 5;
        },
        pointHoverRadius: 8,
        pointHoverBackgroundColor: getLineColor(),
        pointHoverBorderColor: 'white',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        display: false, // Hide legend since we have title in parent component
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#111827',
        bodyColor: '#111827',
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 14,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return `${currency} ${value.toFixed(2)}`;
          },
          // Add a second line to the tooltip showing change from previous month
          afterLabel: (context) => {
            const index = context.dataIndex;
            if (index === 0) return "";
            
            const currentValue = context.parsed.y;
            const previousValue = amounts[index - 1];
            const change = currentValue - previousValue;
            const percentChange = (change / previousValue) * 100;
            
            const changeText = change >= 0 ? 
              `↑ +${currency} ${change.toFixed(2)} (+${percentChange.toFixed(1)}%)` : 
              `↓ ${currency} ${change.toFixed(2)} (${percentChange.toFixed(1)}%)`;
              
            return changeText;
          }
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: '#6B7280',
        },
      },
      y: {
        beginAtZero: true,
        border: {
          dash: [5, 5],
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 12,
          },
          color: '#6B7280',
          padding: 10,
          callback: (value) => `${currency} ${value}`,
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'nearest',
      intersect: true,
    },
    onHover: (event, elements) => {
      if (elements && elements.length > 0) {
        setActivePoint(elements[0].index);
      } else {
        setActivePoint(null);
      }
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center space-x-2">
          <div className={`h-3 w-3 rounded-full ${growth > 0 ? 'bg-green-500' : growth < 0 ? 'bg-red-500' : 'bg-blue-500'}`}></div>
          <span className="text-sm font-medium text-gray-600">
            {growth > 0 ? 
              `Growing: +${growth.toFixed(1)}% in 6 months` : 
              growth < 0 ? 
              `Declining: ${growth.toFixed(1)}% in 6 months` : 
              'Stable'
            }
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Updated: {format(new Date(), 'MMM d, yyyy')}
        </div>
      </div>
      
      <div className="h-80 transition-all duration-300 ease-in-out">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
        <div className="text-gray-500">
          <div className="font-medium mb-1">Lowest</div>
          <div className="text-sm">{currency} {Math.min(...amounts).toFixed(2)}</div>
        </div>
        <div className="text-gray-500">
          <div className="font-medium mb-1">Average</div>
          <div className="text-sm">{currency} {(amounts.reduce((a, b) => a + b, 0) / amounts.length).toFixed(2)}</div>
        </div>
        <div className="text-gray-500">
          <div className="font-medium mb-1">Highest</div>
          <div className="text-sm">{currency} {Math.max(...amounts).toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

export default IncomeChart;