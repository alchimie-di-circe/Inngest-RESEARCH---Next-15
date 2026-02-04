#!/usr/bin/env tsx

/**
 * PR Auto-Fix Applier Script
 * 
 * Applies fixes systematically to files based on the fix plan generated
 * by analyze-reviews.ts. Handles different file types and preserves
 * existing code style.
 */

import {
  readFile,
  writeFile,
  fileExists,
  getGitDiff,
  getGitDiffStat,
  stageAllChanges,
  commitChanges,
  pushChanges,
  GhPrInfo,
  getPrInfo
} from './github-utils';
import { ArgumentParser } from 'argparse';

export interface FixItem {
  file: string;
  line?: number;
  type: string;
  priority: string;
  suggestion?: string;
  originalComment: string;
  tool: string;
}

export interface FixPlan {
  items: FixItem[];
  totalItems: number;
  parallelFiles: string[];
  sequentialFiles: { before: string[]; after: string[] };
}

export interface FixResult {
  file: string;
  success: boolean;
  changes: string;
  error?: string;
}

/**
 * File type handlers
 */
interface FileHandler {
  extensions: string[];
  applyFix(content: string, fix: FixItem): string;
  validateFix(content: string, fix: FixItem): boolean;
}

/**
 * TypeScript/JavaScript file handler
 */
const typescriptHandler: FileHandler = {
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  
  applyFix(content: string, fix: FixItem): string {
    if (!fix.suggestion) return content;
    
    // Handle code block suggestions
    if (fix.suggestion.includes('\n')) {
      return applyBlockFix(content, fix);
    }
    
    // Handle line-based fixes
    if (fix.line) {
      return applyLineFix(content, fix);
    }
    
    return content;
  },
  
  validateFix(content: string, fix: FixItem): boolean {
    if (!fix.suggestion) return true;
    
    // Check for syntax errors
    try {
      // Basic validation - check for balanced braces
      const hasBalancedBraces = (content.match(/{/g)?.length || 0) === (content.match(/}/g)?.length || 0);
      const hasBalancedParens = (content.match(/\(/g)?.length || 0) === (content.match(/\)/g)?.length || 0);
      
      return hasBalancedBraces && hasBalancedParens;
    } catch {
      return false;
    }
  }
};

/**
 * CSS file handler
 */
const cssHandler: FileHandler = {
  extensions: ['.css', '.scss', '.sass', '.less'],
  
  applyFix(content: string, fix: FixItem): string {
    if (!fix.suggestion) return content;
    
    if (fix.suggestion.includes('{') && fix.suggestion.includes('}')) {
      return applyBlockFix(content, fix);
    }
    
    return content;
  },
  
  validateFix(content: string, fix: FixItem): boolean {
    if (!fix.suggestion) return true;
    
    // Check for balanced braces in CSS
    const hasBalancedBraces = (content.match(/{/g)?.length || 0) === (content.match(/}/g)?.length || 0);
    return hasBalancedBraces;
  }
};

/**
 * JSON file handler
 */
const jsonHandler: FileHandler = {
  extensions: ['.json'],
  
  applyFix(content: string, fix: FixItem): string {
    if (!fix.suggestion) return content;
    
    try {
      const json = JSON.parse(content);
      
      // Handle simple key-value fixes
      const keyValueMatch = fix.suggestion.match(/"([^"]+)"\s*:\s*"([^"]+)"/);
      if (keyValueMatch) {
        const [, key, value] = keyValueMatch;
        json[key] = value;
        return JSON.stringify(json, null, 2);
      }
      
      return content;
    } catch {
      return content;
    }
  },
  
  validateFix(content: string): boolean {
    try {
      JSON.parse(content);
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Generic file handler for unknown types
 */
const genericHandler: FileHandler = {
  extensions: ['.*'],
  
  applyFix(content: string, fix: FixItem): string {
    // For generic files, try to apply simple text replacements
    if (fix.suggestion && fix.line) {
      const lines = content.split('\n');
      if (fix.line <= lines.length) {
        lines[fix.line - 1] = fix.suggestion;
        return lines.join('\n');
      }
    }
    return content;
  },
  
  validateFix(): boolean {
    return true;
  }
};

/**
 * Get appropriate handler for a file
 */
function getHandler(filePath: string): FileHandler {
  const ext = filePath.substring(filePath.lastIndexOf('.'));
  
  if (typescriptHandler.extensions.includes(ext)) return typescriptHandler;
  if (cssHandler.extensions.includes(ext)) return cssHandler;
  if (jsonHandler.extensions.includes(ext)) return jsonHandler;
  
  return genericHandler;
}

/**
 * Apply a block fix (code block or CSS rule)
 */
function applyBlockFix(content: string, fix: FixItem): string {
  if (!fix.line || !fix.suggestion) return content;
  
  const lines = content.split('\n');
  const lineIndex = fix.line - 1;
  
  // Find a good insertion point
  const insertionPoint = findInsertionPoint(lines, lineIndex);
  
  if (insertionPoint !== -1) {
    const before = lines.slice(0, insertionPoint);
    const after = lines.slice(insertionPoint);
    
    // Clean up the suggestion
    const cleanedSuggestion = fix.suggestion
      .replace(/```\w?\n?/g, '')
      .trim();
    
    lines.splice(insertionPoint, 0, cleanedSuggestion);
  }
  
  return lines.join('\n');
}

/**
 * Find a good insertion point for a fix
 */
function findInsertionPoint(lines: string[], targetLine: number): number {
  // Look for surrounding context
  for (let i = targetLine; i >= 0; i--) {
    const line = lines[i];
    
    // Insert before function/class declarations
    if (/^(export\s+)?(async\s+)?(function|class|interface|type|const|let|var)/.test(line)) {
      return i;
    }
    
    // Insert before closing braces
    if (/^}/.test(line) && i > 0) {
      const prevLine = lines[i - 1];
      if (!/[{},]/.test(prevLine)) {
        return i;
      }
    }
  }
  
  return targetLine;
}

/**
 * Apply a line-based fix
 */
function applyLineFix(content: string, fix: FixItem): string {
  const lines = content.split('\n');
  
  if (!fix.line || fix.line > lines.length) return content;
  
  const lineIndex = fix.line - 1;
  const originalLine = lines[lineIndex];
  
  if (!fix.suggestion) return content;
  
  // Try to preserve indentation
  const indentation = originalLine.match(/^\s*/)?.[0] || '';
  const suggestion = fix.suggestion.replace(/\n/g, '\n' + indentation);
  
  lines[lineIndex] = indentation + suggestion;
  
  return lines.join('\n');
}

/**
 * Parse command line arguments
 */
function parseArgs(): {
  plan: string;
  repo?: string;
  dryRun?: boolean;
  commit?: boolean;
} {
  const parser = new ArgumentParser({
    prog: 'apply-fixes',
    description: 'Apply fixes to files based on fix plan'
  });

  parser.add_argument('-p', '--plan', {
    help: 'Path to fix plan JSON file',
    required: true,
    type: 'string'
  });

  parser.add_argument('-r', '--repo', {
    help: 'Repository in format owner/repo',
    type: 'string'
  });

  parser.add_argument('--dry-run', {
    help: 'Show what would be changed without making changes',
    action: 'store_true'
  });

  parser.add_argument('--commit', {
    help: 'Commit changes after applying fixes',
    action: 'store_true'
  });

  const args = parser.parse_args();
  return {
    plan: args.plan,
    repo: args.repo,
    dryRun: args.dry_run,
    commit: args.commit
  };
}

/**
 * Apply fixes from a plan
 */
export function applyFixes(planPath: string, options?: {
  dryRun?: boolean;
  onProgress?: (progress: number, total: number) => void;
}): FixResult[] {
  const results: FixResult[] = [];
  
  // Read plan
  if (!fileExists(planPath)) {
    throw new Error(`Fix plan not found: ${planPath}`);
  }
  
  const planContent = readFile(planPath);
  const plan: FixPlan = JSON.parse(planContent);
  
  console.log(`Applying ${plan.totalItems} fixes from plan...`);
  
  // Group fixes by file
  const fixesByFile = new Map<string, FixItem[]>();
  for (const item of plan.items) {
    const existing = fixesByFile.get(item.file) || [];
    existing.push(item);
    fixesByFile.set(item.file, existing);
  }
  
  let applied = 0;
  const total = fixesByFile.size;
  
  // Apply fixes in order: sequential (before) -> parallel -> sequential (after)
  const fileOrder = [
    ...plan.sequentialFiles.before,
    ...plan.parallelFiles,
    ...plan.sequentialFiles.after
  ];
  
  for (const file of fileOrder) {
    const fixes = fixesByFile.get(file) || [];
    
    if (fixes.length === 0) continue;
    
    console.log(`\n📄 Processing ${file} (${fixes.length} fixes)...`);
    
    try {
      // Read current file content
      if (!fileExists(file)) {
        results.push({
          file,
          success: false,
          changes: '',
          error: 'File not found'
        });
        continue;
      }
      
      let content = readFile(file);
      const handler = getHandler(file);
      
      // Apply all fixes for this file
      for (const fix of fixes) {
        const originalContent = content;
        content = handler.applyFix(content, fix);
        
        if (content !== originalContent) {
          console.log(`  ✅ Applied ${fix.type} fix (${fix.priority})`);
        }
      }
      
      // Validate fixes
      const isValid = fixes.every(fix => handler.validateFix(content, fix));
      
      if (!isValid) {
        console.log(`  ⚠️  Validation failed for ${file}`);
        results.push({
          file,
          success: false,
          changes: '',
          error: 'Validation failed'
        });
        continue;
      }
      
      // Apply changes
      if (!options?.dryRun) {
        writeFile(file, content);
        console.log(`  ✅ Changes written to ${file}`);
      } else {
        console.log(`  📝 Would write changes to ${file}`);
      }
      
      results.push({
        file,
        success: true,
        changes: getGitDiff()
      });
      
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`  ❌ Error processing ${file}: ${message}`);
      results.push({
        file,
        success: false,
        changes: '',
        error: message
      });
    }
    
    applied++;
    options?.onProgress?.(applied, total);
  }
  
  return results;
}

/**
 * Main function
 */
function main(): void {
  const args = parseArgs();
  
  console.log('=== PR Auto-Fix Applier ===\n');
  
  try {
    // Apply fixes
    const results = applyFixes(args.plan, {
      dryRun: args.dryRun,
      onProgress: (current, total) => {
        console.log(`Progress: ${current}/${total}`);
      }
    });
    
    // Summary
    console.log('\n=== Fix Summary ===');
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    
    if (failCount > 0) {
      console.log('\nFailed files:');
      for (const result of results.filter(r => !r.success)) {
        console.log(`  - ${result.file}: ${result.error}`);
      }
    }
    
    // Show diff if not dry run
    if (!args.dryRun) {
      console.log('\n=== Changes ===');
      const diff = getGitDiff();
      const diffStat = getGitDiffStat();
      
      if (diff) {
        console.log(diffStat);
        console.log('\nDiff preview:');
        console.log(diff.substring(0, 1000));
      } else {
        console.log('No changes made');
      }
      
      // Commit if requested
      if (args.commit && successCount > 0) {
        console.log('\n=== Committing Changes ===');
        
        stageAllChanges();
        const commitMessage = `fix: Apply auto-fixes from review comments

Auto-generated by @kilo-autofix`;
        
        commitChanges(commitMessage);
        
        console.log('Changes committed');
        
        // Push changes
        console.log('\n=== Pushing Changes ===');
        pushChanges('HEAD');
        console.log('Changes pushed');
      }
    }
    
    console.log('\n✅ Fix application complete!');
    
  } catch (error) {
    console.error('Error applying fixes:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
