import { apiClient, ApiResponse } from './client';
import { CalendarEvent, Campaign } from '@/types';

export interface CalendarParams {
  startDate: string;
  endDate: string;
  clientIds?: string[];
}

export interface CalendarConflict {
  campaign1: {
    id: string;
    name: string;
    scheduledAt: string;
    clientId: string;
    client: { name: string };
  };
  campaign2: {
    id: string;
    name: string;
    scheduledAt: string;
    clientId: string;
    client: { name: string };
  };
  hoursDifference: number;
}

export const calendarApi = {
  getEvents: async (params: CalendarParams): Promise<CalendarEvent[]> => {
    const response = await apiClient.get<ApiResponse<CalendarEvent[]>>('/calendar', {
      params: {
        ...params,
        clientIds: params.clientIds?.join(','),
      },
    });

    // Convert date strings to Date objects
    return response.data.data.map((event) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    }));
  },

  getConflicts: async (params: CalendarParams): Promise<CalendarConflict[]> => {
    const response = await apiClient.get<ApiResponse<CalendarConflict[]>>('/calendar/conflicts', {
      params: {
        ...params,
        clientIds: params.clientIds?.join(','),
      },
    });
    return response.data.data;
  },
};
