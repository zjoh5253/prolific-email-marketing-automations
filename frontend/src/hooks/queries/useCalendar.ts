import { useQuery } from '@tanstack/react-query';
import { calendarApi, CalendarParams } from '@/api/calendar';

export const calendarKeys = {
  all: ['calendar'] as const,
  events: (params: CalendarParams) => [...calendarKeys.all, 'events', params] as const,
  conflicts: (params: CalendarParams) => [...calendarKeys.all, 'conflicts', params] as const,
};

export function useCalendarEvents(params: CalendarParams) {
  return useQuery({
    queryKey: calendarKeys.events(params),
    queryFn: () => calendarApi.getEvents(params),
    enabled: !!params.startDate && !!params.endDate,
  });
}

export function useCalendarConflicts(params: CalendarParams) {
  return useQuery({
    queryKey: calendarKeys.conflicts(params),
    queryFn: () => calendarApi.getConflicts(params),
    enabled: !!params.startDate && !!params.endDate,
  });
}
