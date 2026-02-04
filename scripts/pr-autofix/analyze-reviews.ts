#!/usr/bin/env tsx

/**
 * PR Review Analyzer Script
 * 
 * Parses PR review comments and suggestions from various code review tools
 * (Qodo, Coderabbit, Greptile, Sentry, Gemini Code Assist) and generates
 * a structured analysis of fixes needed.
 */

import { 
  getPrReviewComments, 
  getPrReviews,
  parseComment,
  groupCommentsByFile,
  determineExecutionOrder,
  writeFile,
  fileExists,
  GhReviewComment,
  ParsedComment
} from './github-utils';
import { ArgumentParser } from 'argparse';

export interface ReviewAnalysis {
  prNumber: number;
  totalComments: number;
  parsedComments: ParsedComment[];
  groupedByFile: Record<string, ParsedComment[]>;
  executionOrder: {
    parallel: string[];
    sequential: { before: string[]; after: string[] };
  };
  summary: {
    byTool: Record<string, number>;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  };
  recommendations: string[];
}

export interface FixPlanItem {
  file: string;
  line?: number;
  type: string;
  priority: string;
  suggestion?: string;
  originalComment: string;
  tool: string;
}

export interface FixPlan {
  items: FixPlanItem[];
  totalItems: number;
  parallelFiles: string[];
  sequentialFiles: { before: string[]; after: string[] };
}

/**
 * Parse command line arguments
 */
function parseArgs(): { 
  prNumber: number; 
  output: string; 
  repo?: string;
  skipApply?: boolean;
} {
  const parser = new ArgumentParser({
    prog: 'analyze-reviews',
    description: 'Analyze PR review comments and generate fix plan'
  });

  parser.add_argument('-n', '--pr-number', {
    help: 'PR number to analyze',
    required: true,
    type: 'int'
  });

  parser.add_argument('-o', '--output', {
    help: 'Output file path for analysis (default: review-analysis.json)',
    default: 'review-analysis.json',
    type: 'string'
  });

  parser.add_argument('-r', '--repo', {
    help: 'Repository in format owner/repo',
    type: 'string'
  });

  parser.add_argument('--skip-apply', {
    help: 'Skip generating apply-ready output',
    action: 'store_true'
  });

  const args = parser.parse_args();
  return {
    prNumber: args.pr_number,
    output: args.output,
    repo: args.repo,
    skipApply: args.skip_apply
  };
}

/**
 * Analyze all PR reviews and comments
 */
export function analyzeReviews(prNumber: number, repo?: string): ReviewAnalysis {
  console.log(`Fetching reviews for PR #${prNumber}...`);
  
  // Get all review comments
  const reviewComments = getPrReviewComments(prNumber, repo);
  const reviews = getPrReviews(prNumber, repo);
  
  console.log(`Found ${reviewComments.length} review comments`);
  console.log(`Found ${reviews.length} reviews`);
  
  // Parse all comments
  const allComments: GhReviewComment[] = [
    ...reviewComments,
    ...reviews.flatMap(r => r.comments)
  ];
  
  const parsedComments = allComments.map(parseComment);
  
  // Group by file
  const groupedByFileMap = groupCommentsByFile(parsedComments);
  const groupedByFile: Record<string, ParsedComment[]> = {};
  for (const [file, comments] of Array.from(groupedByFileMap.entries())) {
    groupedByFile[file] = comments;
  }
  
  // Determine execution order
  const executionOrder = determineExecutionOrder(groupedByFileMap);
  
  // Generate summary
  const summary = generateSummary(parsedComments);
  
  // Generate recommendations
  const recommendations = generateRecommendations(parsedComments, groupedByFile);
  
  return {
    prNumber,
    totalComments: allComments.length,
    parsedComments,
    groupedByFile,
    executionOrder,
    summary,
    recommendations
  };
}

/**
 * Generate summary statistics
 */
function generateSummary(comments: ParsedComment[]): ReviewAnalysis['summary'] {
  const byTool: Record<string, number> = {};
  const byType: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  
  for (const comment of comments) {
    byTool[comment.tool] = (byTool[comment.tool] || 0) + 1;
    byType[comment.type] = (byType[comment.type] || 0) + 1;
    byPriority[comment.priority] = (byPriority[comment.priority] || 0) + 1;
  }
  
  return { byTool, byType, byPriority };
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(
  comments: ParsedComment[],
  groupedByFile: Record<string, ParsedComment[]>
): string[] {
  const recommendations: string[] = [];
  
  // Critical/high priority issues
  const criticalIssues = comments.filter(c => c.priority === 'critical');
  if (criticalIssues.length > 0) {
    recommendations.push(`⚠️  Found ${criticalIssues.length} critical issues that need immediate attention`);
  }
  
  // Security issues
  const securityIssues = comments.filter(c => c.type === 'security');
  if (securityIssues.length > 0) {
    recommendations.push(`🔒 Found ${securityIssues.length} security-related issues`);
  }
  
  // Files with most issues
  const fileCounts = Object.entries(groupedByFile)
    .map(([file, comments]) => ({ file, count: comments.length }))
    .sort((a, b) => b.count - a.count);
  
  if (fileCounts.length > 0) {
    const topFile = fileCounts[0];
    recommendations.push(`📁 File "${topFile.file}" has the most issues (${topFile.count})`);
  }
  
  // Suggest parallel execution
  const parallelFiles = Object.keys(groupedByFile).filter(file => {
    const comments = groupedByFile[file];
    return !comments.some(c => c.priority === 'critical' || c.type === 'security');
  });
  
  if (parallelFiles.length > 2) {
    recommendations.push(`🚀 ${parallelFiles.length} files can be fixed in parallel`);
  }
  
  return recommendations;
}

/**
 * Generate fix plan from analysis
 */
export function generateFixPlan(analysis: ReviewAnalysis): FixPlan {
  const items: FixPlanItem[] = [];
  
  for (const [file, comments] of Object.entries(analysis.groupedByFile)) {
    for (const comment of comments) {
      if (comment.isSuggestion || comment.suggestion) {
        items.push({
          file,
          line: comment.line,
          type: comment.type,
          priority: comment.priority,
          suggestion: comment.suggestion,
          originalComment: comment.originalComment,
          tool: comment.tool
        });
      }
    }
  }
  
  return {
    items,
    totalItems: items.length,
    parallelFiles: analysis.executionOrder.parallel,
    sequentialFiles: analysis.executionOrder.sequential
  };
}

/**
 * Main function
 */
function main(): void {
  const args = parseArgs();
  
  console.log(`Analyzing PR #${args.prNumber}...`);
  
  try {
    const analysis = analyzeReviews(args.prNumber, args.repo);
    
    // Output analysis
    console.log('\n=== Analysis Results ===');
    console.log(`Total comments: ${analysis.totalComments}`);
    console.log('\nBy Tool:');
    for (const [tool, count] of Object.entries(analysis.summary.byTool)) {
      console.log(`  ${tool}: ${count}`);
    }
    console.log('\nBy Type:');
    for (const [type, count] of Object.entries(analysis.summary.byType)) {
      console.log(`  ${type}: ${count}`);
    }
    console.log('\nBy Priority:');
    for (const [priority, count] of Object.entries(analysis.summary.byPriority)) {
      console.log(`  ${priority}: ${count}`);
    }
    console.log('\nRecommendations:');
    for (const rec of analysis.recommendations) {
      console.log(`  ${rec}`);
    }
    
    // Write analysis to file
    writeFile(args.output, JSON.stringify(analysis, null, 2));
    console.log(`\nAnalysis written to: ${args.output}`);
    
    // Generate and write fix plan if not skipped
    if (!args.skipApply) {
      const fixPlan = generateFixPlan(analysis);
      const planOutput = args.output.replace('.json', '-plan.json');
      writeFile(planOutput, JSON.stringify(fixPlan, null, 2));
      console.log(`Fix plan written to: ${planOutput}`);
      console.log(`Total fix items: ${fixPlan.totalItems}`);
    }
    
    console.log('\n✅ Analysis complete!');
    
  } catch (error) {
    console.error('Error analyzing reviews:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
