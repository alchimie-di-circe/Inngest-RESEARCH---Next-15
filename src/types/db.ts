
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
