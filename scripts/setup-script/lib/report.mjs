/**
 * Report generation system
 */

import fs from 'fs';
import path from 'path';
import { PROJECT_ROOT, formatTimestamp } from './utils.mjs';
import { getOverallProgress, getCategoryProgress, getStepStatus } from './state.mjs';

/**
 * Generate markdown report
 */
export function generateMarkdownReport(categories, state) {
  const lines = [];

  // Header
  lines.push('# SaaS Boilerplate Setup Report\n');
  lines.push(`**Generated:** ${formatTimestamp(new Date().toISOString())}\n`);
  lines.push(`**Environment:** ${state.environment}\n`);
  lines.push(`**Ready for Production:** ${state.readyForProduction ? '✅ Yes' : '❌ No'}\n`);

  // Overall Progress
  const overallProgress = getOverallProgress(state);
  lines.push('---\n');
  lines.push('## Overall Progress\n');
  lines.push(`**Completion:** ${overallProgress}% (${state.progress.completed}/${state.progress.total} steps)\n`);
  lines.push(`- ✅ Completed: ${state.progress.completed}`);
  lines.push(`- ⏸️ Pending: ${state.progress.pending}`);
  lines.push(`- ⏭️ Skipped: ${state.progress.skipped}`);
  lines.push(`- ❌ Failed: ${state.progress.failed}\n`);

  // Critical Missing
  if (state.criticalMissing.length > 0) {
    lines.push('---\n');
    lines.push('## ❌ Critical Missing (Production Blockers)\n');
    state.criticalMissing.forEach((item) => {
      lines.push(`- ${item}`);
    });
    lines.push('');
  }

  // Recommendations
  if (state.recommendations.length > 0) {
    lines.push('---\n');
    lines.push('## ⚠️ Recommendations\n');
    state.recommendations.forEach((rec) => {
      lines.push(`- ${rec}`);
    });
    lines.push('');
  }

  // Categories breakdown
  lines.push('---\n');
  lines.push('## Categories Breakdown\n');

  categories.forEach((category) => {
    const progress = getCategoryProgress(state, category.id);
    const categoryState = state.categories[category.id];
    const completed = categoryState?.completedSteps || 0;
    const total = category.steps.length;

    lines.push(`### ${category.name}\n`);
    lines.push(`**Progress:** ${progress}% (${completed}/${total})\n`);
    lines.push(`**Priority:** ${category.priority}\n`);
    lines.push(`**Description:** ${category.description}\n`);

    // Steps
    lines.push('#### Steps\n');
    category.steps.forEach((step) => {
      const status = getStepStatus(state, category.id, step.id);
      const icon = getStatusIcon(status);

      lines.push(`${icon} **${step.name}** - ${status}`);
      lines.push(`   - Type: ${step.type}`);
      lines.push(`   - Required: ${step.required ? 'Yes' : 'No'}`);

      if (step.aiAssisted) {
        lines.push('   - ✨ AI-Assisted');
      }

      if (status === 'completed' && categoryState?.steps[step.id]?.timestamp) {
        lines.push(`   - Completed: ${formatTimestamp(categoryState.steps[step.id].timestamp)}`);
      }

      if (status === 'failed' && categoryState?.steps[step.id]?.error) {
        lines.push(`   - Error: ${categoryState.steps[step.id].error}`);
      }

      if (status === 'skipped' && categoryState?.steps[step.id]?.reason) {
        lines.push(`   - Reason: ${categoryState.steps[step.id].reason}`);
      }

      lines.push('');
    });
  });

  // Next steps
  lines.push('---\n');
  lines.push('## Next Steps\n');

  const pendingCritical = [];
  const pendingRecommended = [];

  categories.forEach((category) => {
    category.steps.forEach((step) => {
      const status = getStepStatus(state, category.id, step.id);

      if (status !== 'completed' && status !== 'skipped') {
        const item = `**${step.name}** (${category.name})`;

        if (step.required || step.priority === 'critical') {
          pendingCritical.push(item);
        } else if (step.priority === 'recommended' || step.priority === 'critical-for-production') {
          pendingRecommended.push(item);
        }
      }
    });
  });

  if (pendingCritical.length > 0) {
    lines.push('### 🔴 Critical (Do Now)\n');
    pendingCritical.forEach((item) => lines.push(`- ${item}`));
    lines.push('');
  }

  if (pendingRecommended.length > 0) {
    lines.push('### 🟡 Recommended (Before Production)\n');
    pendingRecommended.forEach((item) => lines.push(`- ${item}`));
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Get status icon for markdown
 */
function getStatusIcon(status) {
  const icons = {
    completed: '✅',
    pending: '⏸️',
    partial: '⚠️',
    failed: '❌',
    skipped: '⏭️',
  };
  return icons[status] || '⚪';
}

/**
 * Export report to file
 */
export function exportReport(categories, state, filename = 'setup-report.md') {
  const report = generateMarkdownReport(categories, state);
  const filepath = path.join(PROJECT_ROOT, filename);

  try {
    fs.writeFileSync(filepath, report, 'utf-8');
    return { success: true, filepath };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate JSON export
 */
export function exportJSON(state, filename = 'setup-export.json') {
  const filepath = path.join(PROJECT_ROOT, filename);

  try {
    fs.writeFileSync(filepath, JSON.stringify(state, null, 2), 'utf-8');
    return { success: true, filepath };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
