
export interface JobResult {
  summary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface ContentMetadata {
  version: number;
  author: string;
  lastUpdated: string;
}

export interface AuditDetails {
  timestamp: string;
  ipAddress: string;
  user: string;
}

export type {
  ResearchContext,
  AgentRun,
  ResearchJob,
  BrandConfig,
  ContentItem,
  PublishingQueue,
  AgentAuditLog,
  JobStatus,
  TabType,
  ContentStatus as DBContentStatus,
  Platform as DBPlatform
} from '@prisma/client';
