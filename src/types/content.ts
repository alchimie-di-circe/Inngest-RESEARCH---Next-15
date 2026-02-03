import { z } from 'zod';

export enum ContentType {
  ARTICLE = 'article',
  SOCIAL = 'social',
  NEWSLETTER = 'newsletter',
  REPORT = 'report',
  BRIEF = 'brief',
}

export enum Platform {
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
  MEDIUM = 'medium',
  SUBSTACK = 'substack',
  WEBSITE = 'website',
}

export enum ContentStatus {
  DRAFT = 'draft',
  REVIEWING = 'reviewing',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export const ContentDraftSchema = z.object({
  id: z.string(),
  researchId: z.string(),
  type: z.nativeEnum(ContentType),
  platform: z.nativeEnum(Platform),
  title: z.string().min(5).max(500),
  body: z.string().min(10),
  excerpt: z.string().optional(),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.DRAFT),
  tags: z.array(z.string()),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().optional(),
});

export type ContentDraft = z.infer<typeof ContentDraftSchema>;
