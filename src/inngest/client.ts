import { Inngest, EventSchemas as InngestEventSchemas } from 'inngest';
import { realtimeMiddleware } from '@inngest/realtime/middleware';
import { EventSchemas } from '../types/events';

export const inngest = new Inngest({
  id: 'research-suite',
  middleware: [realtimeMiddleware()],
  schemas: new InngestEventSchemas().fromZod(EventSchemas),
});
