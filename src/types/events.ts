import { z } from 'zod';
import { DeepResearchReportSchema } from './research';
import { ContextBriefSchema } from './research';
import { ContentDraftSchema } from './content';

// Deep Research Events
export const DeepResearchStartedSchema = z.object({
  researchId: z.string(),
  query: z.string(),
  timestamp: z.date(),
});

export const DeepResearchCompletedSchema = z.object({
  researchId: z.string(),
  report: DeepResearchReportSchema,
  timestamp: z.date(),
});

// Context Research Events
export const ContextResearchStartedSchema = z.object({
  researchId: z.string(),
  timestamp: z.date(),
});

export const ContextResearchCompletedSchema = z.object({
  researchId: z.string(),
  brief: ContextBriefSchema,
  timestamp: z.date(),
});

// Content Generation Events
export const ContentGenerationStartedSchema = z.object({
  researchId: z.string(),
  contentType: z.string(),
  timestamp: z.date(),
});

export const ContentGenerationCompletedSchema = z.object({
  researchId: z.string(),
  content: ContentDraftSchema,
  timestamp: z.date(),
});

// Content Publishing Events
export const ContentPublishingStartedSchema = z.object({
  contentId: z.string(),
  timestamp: z.date(),
});

export const ContentPublishingCompletedSchema = z.object({
  contentId: z.string(),
  publishedUrl: z.string().url().optional(),
  platform: z.string(),
  timestamp: z.date(),
});

// All event schemas
export const EventSchemas = {
  'deep.research.started': DeepResearchStartedSchema,
  'deep.research.completed': DeepResearchCompletedSchema,
  'context.research.started': ContextResearchStartedSchema,
  'context.research.completed': ContextResearchCompletedSchema,
  'content.generation.started': ContentGenerationStartedSchema,
  'content.generation.completed': ContentGenerationCompletedSchema,
  'content.publishing.started': ContentPublishingStartedSchema,
  'content.publishing.completed': ContentPublishingCompletedSchema,
} as const;
