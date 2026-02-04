#!/usr/bin/env node

/**
 * Generate Fix Plan Script
 * 
 * Converts the review analysis into an executable fix plan
 */

const fs = require('fs');
const path = require('path');

const ANALYSIS_FILE = 'scripts/pr-autofix/review-analysis.json';
const OUTPUT_FILE = 'scripts/pr-autofix/fix-plan.json';

/**
 * Main function
 */
function main() {
  console.log('=== Generate Fix Plan ===\n');
  
  try {
    // Read analysis
    if (!fs.existsSync(ANALYSIS_FILE)) {
      throw new Error(`Analysis file not found: ${ANALYSIS_FILE}`);
    }
    
    const analysis = JSON.parse(fs.readFileSync(ANALYSIS_FILE, 'utf-8'));
    
    // Generate fix plan
    const fixPlan = {
      items: [],
      totalItems: 0,
      parallelFiles: [],
      sequentialFiles: { before: [], after: [] },
      metadata: {
        prNumber: analysis.prNumber,
        generatedAt: new Date().toISOString(),
        tools: analysis.summary.byTool,
        types: analysis.summary.byType,
        priorities: analysis.summary.byPriority
      }
    };
    
    // Convert grouped comments to fix items
    for (const [file, comments] of Object.entries(analysis.groupedByFile)) {
      for (const comment of comments) {
        if (comment.isSuggestion || comment.suggestion) {
          fixPlan.items.push({
            file,
            line: comment.line,
            type: comment.type,
            priority: comment.priority,
            suggestion: comment.suggestion,
            originalComment: comment.originalComment.substring(0, 200),
            tool: comment.tool
          });
        }
      }
    }
    
    fixPlan.totalItems = fixPlan.items.length;
    fixPlan.parallelFiles = analysis.executionOrder.parallel;
    fixPlan.sequentialFiles = analysis.executionOrder.sequential;
    
    // Write plan
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(fixPlan, null, 2));
    
    console.log(`Fix plan generated: ${OUTPUT_FILE}`);
    console.log(`Total fix items: ${fixPlan.totalItems}`);
    console.log(`Parallel files: ${fixPlan.parallelFiles.length}`);
    console.log(`Sequential (before): ${fixPlan.sequentialFiles.before.length}`);
    console.log(`Sequential (after): ${fixPlan.sequentialFiles.after.length}`);
    
    console.log('\n✅ Fix plan generated successfully!');
    
  } catch (error) {
    console.error('Error generating fix plan:', error);
    process.exit(1);
  }
}

main();
