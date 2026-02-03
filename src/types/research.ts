import { z } from 'zod';

// Deep Research Report Schema
export const DeepResearchReportSchema = z.object({
  query: z.string().min(1),
  sources: z.array(z.object({
    url: z.string().url(),
    title: z.string(),
    summary: z.string(),
    credibility: z.number().min(0).max(1),
  })),
  keyFindings: z.array(z.string()),
  synthesis: z.string(),
  limitations: z.array(z.string()).optional(),
  timestamp: z.date(),
});

export type DeepResearchReport = z.infer<typeof DeepResearchReportSchema>;

// Context Brief Schema
export const ContextBriefSchema = z.object({
  researchId: z.string(),
  mainTopics: z.array(z.string()),
  relatedConcepts: z.array(z.string()),
  historicalContext: z.string().optional(),
  stakeholders: z.array(z.string()).optional(),
  recommendations: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  timestamp: z.date(),
});

export type ContextBrief = z.infer<typeof ContextBriefSchema>;
