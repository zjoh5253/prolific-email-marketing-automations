import { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/queries';
import { cn } from '@/lib/utils';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<typeof Views[keyof typeof Views]>(Views.MONTH);

  const startDate = startOfMonth(subMonths(currentDate, 1));
  const endDate = endOfMonth(addMonths(currentDate, 1));

  const { data: events, isLoading } = useCalendarEvents({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  const calendarEvents = useMemo(() => {
    if (!events) return [];
    return events.map((event) => ({
      ...event,
      title: `${event.clientName}: ${event.title}`,
      allDay: false,
    }));
  }, [events]);

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    if (action === 'PREV') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (action === 'NEXT') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(new Date());
    }
  };

  const eventStyleGetter = (event: any) => {
    const colors: Record<string, string> = {
      DRAFT: '#9CA3AF',
      PENDING_APPROVAL: '#F59E0B',
      APPROVED: '#3B82F6',
      SCHEDULED: '#8B5CF6',
      SENDING: '#3B82F6',
      SENT: '#10B981',
      CANCELLED: '#EF4444',
      ARCHIVED: '#6B7280',
    };

    return {
      style: {
        backgroundColor: colors[event.status] || '#6B7280',
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
      },
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">View scheduled and sent campaigns</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNavigate('PREV')}
            className="p-2 rounded-md hover:bg-accent transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleNavigate('TODAY')}
            className="px-3 py-1.5 rounded-md hover:bg-accent transition-colors text-sm font-medium"
          >
            Today
          </button>
          <button
            onClick={() => handleNavigate('NEXT')}
            className="p-2 rounded-md hover:bg-accent transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <span className="text-lg font-semibold ml-4">
            {format(currentDate, 'MMMM yyyy')}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-400" />
          <span className="text-sm">Draft</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span className="text-sm">Pending Approval</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500" />
          <span className="text-sm">Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span className="text-sm">Sent</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-card rounded-lg border p-4" style={{ height: 700 }}>
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Loading calendar...
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            date={currentDate}
            onNavigate={setCurrentDate}
            view={view}
            onView={setView}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            eventPropGetter={eventStyleGetter}
            popup
            selectable={false}
            toolbar={false}
            style={{ height: '100%' }}
          />
        )}
      </div>
    </div>
  );
}
