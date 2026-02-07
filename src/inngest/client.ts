import { Inngest } from 'inngest';
import { realtimeMiddleware } from '@inngest/realtime/middleware';

// Event types for type-safe event sending
export interface Events {
  'research/query.submitted': {
    data: {
      query: string;
      sessionId: string;
      userId: string;
      jobId: string;
    };
  };
  'deep.research.started': {
    data: {
      researchId: string;
      query: string;
      timestamp: string;
    };
  };
  'deep.research.completed': {
    data: {
      researchId: string;
      report: Record<string, unknown>;
      timestamp: string;
    };
  };
  'context.research.started': {
    data: {
      researchId: string;
      timestamp: string;
    };
  };
  'context.research.completed': {
    data: {
      researchId: string;
      brief: Record<string, unknown>;
      timestamp: string;
    };
  };
  'content.generation.started': {
    data: {
      researchId: string;
      contentType: string;
      timestamp: string;
    };
  };
  'content.generation.completed': {
    data: {
      researchId: string;
      content: Record<string, unknown>;
      timestamp: string;
    };
  };
  'content.publishing.started': {
    data: {
      contentId: string;
      timestamp: string;
    };
  };
  'content.publishing.completed': {
    data: {
      contentId: string;
      publishedUrl?: string;
      platform: string;
      timestamp: string;
    };
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const inngest = new Inngest({
  id: 'research-suite',
  middleware: [realtimeMiddleware()],
}) as any;
