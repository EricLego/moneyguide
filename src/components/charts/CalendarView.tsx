import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from 'date-fns';

interface IncomeEvent {
  id: string;
  title: string;
  amount: number;
  currency: string;
  date: string | Date;
  frequency: string;
}

interface CalendarViewProps {
  events: IncomeEvent[];
  onEventSelect?: (event: IncomeEvent) => void;
  onDateChange?: (year: number, month: number) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  events, 
  onEventSelect,
  onDateChange
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  useEffect(() => {
    const firstDay = startOfMonth(currentDate);
    const lastDay = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: firstDay, end: lastDay });
    setCalendarDays(days);

    if (onDateChange) {
      onDateChange(currentDate.getFullYear(), currentDate.getMonth() + 1);
    }
  }, [currentDate, onDateChange]);

  const goToPreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, day);
    });
  };

  // Get the day of the week of the first day of the month (0-6)
  const firstDayOfMonth = startOfMonth(currentDate);
  const startingDayOfWeek = getDay(firstDayOfMonth); // 0 for Sunday, 1 for Monday, etc.

  // Generate blank spaces for days before the first day of the month
  const blankDays = Array.from({ length: startingDayOfWeek }, (_, i) => (
    <div key={`blank-${i}`} className="h-28 border border-gray-200 p-1"></div>
  ));

  const renderDay = (day: Date) => {
    const dayEvents = getEventsForDay(day);
    const isToday = isSameDay(day, new Date());
    
    return (
      <div 
        key={day.toISOString()} 
        className={`h-28 border border-gray-200 p-1 ${isToday ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'} transition-colors`}
      >
        <div className="font-medium text-sm mb-1">
          {format(day, 'd')}
        </div>
        <div className="overflow-y-auto max-h-20">
          {dayEvents.map(event => {
            // Determine background color based on frequency
            const bgColorClass = event.frequency === 'monthly' || 
                                event.frequency === 'quarterly' || 
                                event.frequency === 'annually' 
                                ? 'bg-secondary' : 'bg-primary';
            
            return (
              <div 
                key={event.id} 
                className={`text-xs p-1 mb-1 rounded ${bgColorClass} text-white truncate cursor-pointer hover:opacity-90 transition-opacity`}
                onClick={() => onEventSelect && onEventSelect(event)}
                title={`${event.title}: ${event.currency} ${event.amount}`}
              >
                {event.title}: {event.currency} {event.amount}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      <div className="flex justify-between items-center mb-4 px-4">
        <h2 className="text-xl font-semibold flex items-center">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex">
          <button 
            onClick={goToPreviousMonth} 
            className="p-2 rounded-md hover:bg-gray-100 text-gray-700 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Prev</span>
          </button>
          <button 
            onClick={goToCurrentMonth} 
            className="p-2 mx-1 rounded-md hover:bg-blue-50 text-primary font-medium transition-colors"
          >
            Today
          </button>
          <button 
            onClick={goToNextMonth} 
            className="p-2 rounded-md hover:bg-gray-100 text-gray-700 transition-colors flex items-center"
          >
            <span className="hidden sm:inline">Next</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-medium py-2 bg-gray-50 text-gray-700 text-sm">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px">
        {blankDays}
        {calendarDays.map(renderDay)}
      </div>
    </div>
  );
};

export default CalendarView;