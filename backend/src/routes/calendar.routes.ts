import { Router } from 'express';
import { CalendarController } from '../controllers/calendar.controller.js';
import { validateQuery } from '../middleware/validation.middleware.js';
import { z } from 'zod';

export const calendarRoutes = Router();
const controller = new CalendarController();

const calendarQuerySchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  clientIds: z.string().transform((s) => s.split(',')).optional(),
});

// GET /api/calendar
calendarRoutes.get(
  '/',
  validateQuery(calendarQuerySchema),
  controller.getEvents
);

// GET /api/calendar/conflicts
calendarRoutes.get(
  '/conflicts',
  validateQuery(calendarQuerySchema),
  controller.getConflicts
);
