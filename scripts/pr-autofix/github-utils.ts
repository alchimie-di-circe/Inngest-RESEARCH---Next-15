/**
 * GitHub API Utilities for PR Auto-Fix Handler
 * 
 * Provides utilities for interacting with GitHub CLI (gh) and parsing
 * review comments from various code review tools.
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface GhPrInfo {
  title: string;
  body: string;
  author: string;
  baseRefName: string;
  headRefName: string;
  state: string;
  isDraft: boolean;
}

export interface GhReviewComment {
  id: number;
  body: string;
  author: string;
  path?: string;
  line?: number;
  side?: string;
  createdAt: string;
}

export interface GhReview {
  body: string;
  state: string;
  comments: GhReviewComment[];
}

export interface ReviewTool {
  name: string;
  patterns: {
    comment: RegExp;
    suggestion: RegExp;
  };
}

/**
 * Review tool patterns for identifying different code review tools
 */
export const REVIEW_TOOLS: ReviewTool[] = [
  {
    name: 'qodo',
    patterns: {
      comment: /@qodo|Qodo|qodo/i,
      suggestion: /suggestion:|fix:|improvement:/i,
    },
  },
  {
    name: 'coderabbit',
    patterns: {
      comment: /@coderabbit|Coderabbit|coderabbit/i,
      suggestion: /suggestion:|request change:|comment:/i,
    },
  },
  {
    name: 'greptile',
    patterns: {
      comment: /@greptile|Greptile|greptile/i,
      suggestion: /issue:|suggestion:|recommendation:/i,
    },
  },
  {
    name: 'sentry',
    patterns: {
      comment: /@sentry|Sentry|sentry/i,
      suggestion: /issue:|error:|warning:/i,
    },
  },
  {
    name: 'gemini',
    patterns: {
      comment: /@gemini|Gemini Code Assist|gemini/i,
      suggestion: /suggested change:|recommendation:|try:/i,
    },
  },
  {
    name: 'kilo',
    patterns: {
      comment: /@kilo|Kilo|kilo/i,
      suggestion: /fix:|suggestion:|improvement:/i,
    },
  },
];

/**
 * Execute a GitHub CLI command and return the result
 */
export function ghExec(args: string[], options?: { cwd?: string }): string {
  try {
    const result = execSync(`gh ${args.join(' ')}`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
      cwd: options?.cwd,
    });
    return result.trim();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`GitHub CLI error: ${message}`);
  }
}

/**
 * Get PR information
 */
export function getPrInfo(prNumber: number, repo?: string): GhPrInfo {
  const repoFlag = repo ? `--repo ${repo}` : '';
  const json = ghExec(['pr', 'view', String(prNumber), '--json', 'title,body,author,baseRefName,headRefName,state,isDraft', repoFlag]);
  return JSON.parse(json) as GhPrInfo;
}

/**
 * Get all PR review comments
 */
export function getPrReviewComments(prNumber: number, repo?: string): GhReviewComment[] {
  const repoFlag = repo ? `--repo ${repo}` : '';
  const json = ghExec(['pr', 'comments', String(prNumber), '--json', 'body,author,createdAt,path,line,side', repoFlag]);
  return JSON.parse(json) as GhReviewComment[];
}

/**
 * Get PR reviews
 */
export function getPrReviews(prNumber: number, repo?: string): GhReview[] {
  const repoFlag = repo ? `--repo ${repo}` : '';
  const json = ghExec(['pr', 'review', String(prNumber), '--json', 'body,state,comments', repoFlag]);
  return JSON.parse(json) as GhReview[];
}

/**
 * Identify review tool from comment body
 */
export function identifyReviewTool(commentBody: string): string {
  for (const tool of REVIEW_TOOLS) {
    if (tool.patterns.comment.test(commentBody)) {
      return tool.name;
    }
  }
  return 'unknown';
}

/**
 * Parse a code review comment and extract structured information
 */
export interface ParsedComment {
  id?: number;
  tool: string;
  type: 'bug' | 'security' | 'performance' | 'quality' | 'style' | 'best-practice' | 'general';
  priority: 'critical' | 'high' | 'medium' | 'low';
  file?: string;
  line?: number;
  suggestion?: string;
  originalComment: string;
  isSuggestion: boolean;
}

export function parseComment(comment: GhReviewComment): ParsedComment {
  const tool = identifyReviewTool(comment.body);
  const isSuggestion = REVIEW_TOOLS.some(t => t.patterns.suggestion.test(comment.body));
  
  return {
    id: comment.id,
    tool,
    type: classifyCommentType(comment.body),
    priority: determinePriority(comment.body),
    file: comment.path,
    line: comment.line,
    suggestion: isSuggestion ? extractSuggestion(comment.body) : undefined,
    originalComment: comment.body,
    isSuggestion,
  };
}

/**
 * Classify comment type based on content
 */
export function classifyCommentType(commentBody: string): ParsedComment['type'] {
  const body = commentBody.toLowerCase();
  
  if (/\b(security|vulnerability|security|threat|attack|injection|xss|csrf)\b/.test(body)) {
    return 'security';
  }
  if (/\b(bug|fix|error|wrong|broken|crash|fail|exception)\b/.test(body)) {
    return 'bug';
  }
  if (/\b(performance|slow|memory|optimize|latency|benchmark)\b/.test(body)) {
    return 'performance';
  }
  if (/\b(style|formatting|indentation|whitespace|naming|convention)\b/.test(body)) {
    return 'style';
  }
  if (/\b(best practice|recommended|should|must|avoid|consider)\b/.test(body)) {
    return 'best-practice';
  }
  return 'quality';
}

/**
 * Determine priority based on comment content
 */
export function determinePriority(commentBody: string): ParsedComment['priority'] {
  const body = commentBody.toLowerCase();
  
  if (/\b(critical|urgent|emergency|must fix|security vulnerability|blocker)\b/.test(body)) {
    return 'critical';
  }
  if (/\b(high|important|significant|major|serious)\b/.test(body)) {
    return 'high';
  }
  if (/\b(medium|moderate|normal)\b/.test(body)) {
    return 'medium';
  }
  return 'low';
}

/**
 * Extract suggested fix from comment
 */
export function extractSuggestion(commentBody: string): string | undefined {
  // Try to extract code blocks
  const codeBlockMatch = commentBody.match(/```[\s\S]*?```/g);
  if (codeBlockMatch) {
    return codeBlockMatch[codeBlockMatch.length - 1].replace(/```\w?\n?/g, '').trim();
  }
  
  // Try to extract lines starting with - or *
  const lines = commentBody.split('\n').filter(line => 
    /^\s*[-*]\s+(suggestion|try|change|fix|use|replace|update)/i.test(line)
  );
  
  if (lines.length > 0) {
    return lines[0].replace(/^\s*[-*]\s+/i, '').trim();
  }
  
  return undefined;
}

/**
 * Group parsed comments by file
 */
export function groupCommentsByFile(comments: ParsedComment[]): Map<string, ParsedComment[]> {
  const grouped = new Map<string, ParsedComment[]>();
  
  for (const comment of comments) {
    const file = comment.file || 'unknown';
    const existing = grouped.get(file) || [];
    existing.push(comment);
    grouped.set(file, existing);
  }
  
  return grouped;
}

/**
 * Determine execution order for fixes
 */
export function determineExecutionOrder(
  groupedComments: Map<string, ParsedComment[]>
): { parallel: string[]; sequential: { before: string[]; after: string[] } } {
  const parallel: string[] = [];
  const before: string[] = [];
  const after: string[] = [];
  
  for (const [file, comments] of Array.from(groupedComments.entries())) {
    const hasCritical = comments.some(c => c.priority === 'critical');
    const hasSecurity = comments.some(c => c.type === 'security');
    
    if (hasCritical || hasSecurity) {
      before.push(file);
    } else if (comments.some(c => c.priority === 'low')) {
      after.push(file);
    } else {
      parallel.push(file);
    }
  }
  
  return { parallel, sequential: { before, after } };
}

/**
 * Get PR diff for a specific file
 */
export function getPrDiff(prNumber: number, filePath: string, repo?: string): string {
  const repoFlag = repo ? `--repo ${repo}` : '';
  return ghExec(['pr', 'diff', String(prNumber), '--', filePath, repoFlag]);
}

/**
 * Create a branch for the fix if needed
 */
export function createFixBranch(prInfo: GhPrInfo): void {
  const branchName = `fix/pr-${prInfo.headRefName}-autofix`;
  
  execSync(`git checkout -b ${branchName}`, { encoding: 'utf-8' });
}

/**
 * Push changes to PR branch
 */
export function pushChanges(branchName: string, repo?: string): void {
  const repoFlag = repo ? `--repo ${repo}` : '';
  execSync(`git push origin ${branchName} ${repoFlag}`, { encoding: 'utf-8' });
}

/**
 * Add a comment to a PR
 */
export function addPrComment(prNumber: number, body: string, repo?: string): void {
  const repoFlag = repo ? `--repo ${repo}` : '';
  ghExec(['pr', 'comment', String(prNumber), '--body', body, repoFlag]);
}

/**
 * Read a file and return its content
 */
export function readFile(filePath: string): string {
  return readFileSync(filePath, 'utf-8');
}

/**
 * Write content to a file
 */
export function writeFile(filePath: string, content: string): void {
  const dir = filePath.split('/').slice(0, -1).join('/');
  if (!existsSync(dir)) {
    execSync(`mkdir -p ${dir}`, { encoding: 'utf-8' });
  }
  writeFileSync(filePath, content);
}

/**
 * Check if a file exists
 */
export function fileExists(filePath: string): boolean {
  return existsSync(filePath);
}

/**
 * Get git diff for all changes
 */
export function getGitDiff(): string {
  return execSync('git diff', { encoding: 'utf-8' });
}

/**
 * Get git diff stat
 */
export function getGitDiffStat(): string {
  return execSync('git diff --stat', { encoding: 'utf-8' });
}

/**
 * Stage all changes
 */
export function stageAllChanges(): void {
  execSync('git add -A', { encoding: 'utf-8' });
}

/**
 * Commit changes with a message
 */
export function commitChanges(message: string): void {
  execSync(`git config user.name "github-actions[bot]"`, { encoding: 'utf-8' });
  execSync(`git config user.email "github-actions[bot]@users.noreply.github.com"`, { encoding: 'utf-8' });
  execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { encoding: 'utf-8' });
}

/**
 * Reset git changes
 */
export function resetGitChanges(): void {
  execSync('git checkout -- .', { encoding: 'utf-8' });
}
