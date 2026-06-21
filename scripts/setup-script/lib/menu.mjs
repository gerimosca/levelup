/**
 * Interactive menu system
 */

import readline from 'readline';
import {
  clearConsole,
  print,
  printBox,
  printSeparator,
  colors,
  getStatusIcon,
  getStatusColor,
  getPriorityIcon,
  formatProgressBar,
  pad,
  openUrl,
  confirm,
  prompt,
} from './utils.mjs';
import { getCategoryProgress, getOverallProgress, getStepStatus } from './state.mjs';
import { verifyStep } from './verification.mjs';

/**
 * Show main menu
 */
export async function showMainMenu(categories, state) {
  clearConsole();

  const lines = [];
  lines.push(`${colors.bright}🚀 SaaS Boilerplate - Interactive Setup${colors.reset}`);
  lines.push('');

  // Show each category
  categories.forEach((category, index) => {
    const progress = getCategoryProgress(state, category.id);
    const categoryState = state.categories[category.id];
    const completed = categoryState?.completedSteps || 0;
    const total = category.steps.length;

    let status = 'not-started';
    if (categoryState) {
      if (completed === total) status = 'completed';
      else if (completed > 0) status = 'partial';
      else status = 'pending';
    }

    const icon = getStatusIcon(status);
    const statusColor = getStatusColor(status);
    const priorityIcon = getPriorityIcon(category.priority);

    lines.push(
      `${colors.bright}${index + 1}. ${icon} ${category.name}${colors.reset}     ${statusColor}[${completed}/${total}]${colors.reset} ${priorityIcon}`
    );
    lines.push(`   ${colors.gray}${category.description}${colors.reset}`);
    lines.push('');
  });

  // Overall progress
  const overallProgress = getOverallProgress(state);
  lines.push('');
  lines.push(
    `${colors.bright}Overall Progress:${colors.reset} ${formatProgressBar(overallProgress)}`
  );
  lines.push('');
  printSeparator('─', 62);
  lines.push('');
  lines.push(`${colors.cyan}[v]${colors.reset} Verify & Diagnose    ${colors.cyan}[r]${colors.reset} Run Full Wizard`);
  lines.push(`${colors.cyan}[e]${colors.reset} Export Report         ${colors.cyan}[q]${colors.reset} Quit`);
  lines.push('');

  printBox(lines, 62);

  // Prompt
  const answer = await prompt('Select category (1-6) or action (v/r/e/q)');
  return answer.toLowerCase();
}

/**
 * Show category menu
 */
export async function showCategoryMenu(category, state) {
  clearConsole();

  const lines = [];
  const priorityIcon = getPriorityIcon(category.priority);

  lines.push(
    `${colors.bright}${priorityIcon} ${category.name}${colors.reset}`
  );
  lines.push(`${colors.gray}${category.description}${colors.reset}`);
  lines.push('');

  printSeparator('─', 62);

  // Show each step
  category.steps.forEach((step, index) => {
    const status = getStepStatus(state, category.id, step.id);
    const icon = getStatusIcon(status);
    const statusColor = getStatusColor(status);

    let typeTag = '';
    if (step.type === 'manual-pause') {
      typeTag = `${colors.yellow}[Pause Required]${colors.reset}`;
    } else if (step.type === 'manual') {
      typeTag = `${colors.yellow}[Manual]${colors.reset}`;
    }

    const aiTag = step.aiAssisted ? `${colors.magenta}[AI]${colors.reset}` : '';
    const requiredTag = step.required
      ? `${colors.red}[Required]${colors.reset}`
      : `${colors.gray}[Optional]${colors.reset}`;

    lines.push('');
    lines.push(
      `${colors.bright}${index + 1}. ${icon} ${step.name}${colors.reset} ${typeTag} ${aiTag}`
    );
    lines.push(`   ${colors.gray}${step.description}${colors.reset}`);
    lines.push(`   ${requiredTag} ${statusColor}Status: ${status}${colors.reset}`);
  });

  lines.push('');
  printSeparator('─', 62);
  lines.push('');
  lines.push(`${colors.cyan}[a]${colors.reset} Run all pending steps`);
  lines.push(`${colors.cyan}[v]${colors.reset} Verify all steps`);
  lines.push(`${colors.cyan}[b]${colors.reset} Back to main menu`);
  lines.push('');

  printBox(lines, 62);

  const answer = await prompt(`Select step (1-${category.steps.length}) or action (a/v/b)`);
  return answer.toLowerCase();
}

/**
 * Show step detail menu
 */
export async function showStepMenu(category, step, state) {
  clearConsole();

  const lines = [];
  const status = getStepStatus(state, category.id, step.id);
  const icon = getStatusIcon(status);
  const statusColor = getStatusColor(status);

  // Title
  let typeLabel;
  if (step.type === 'manual-pause') {
    typeLabel = `${colors.yellow}[Pause Required]${colors.reset}`;
  } else if (step.type === 'manual') {
    typeLabel = `${colors.yellow}[Manual Step]${colors.reset}`;
  } else {
    typeLabel = `${colors.green}[Automated Step]${colors.reset}`;
  }
  lines.push(`${icon} ${colors.bright}${step.name}${colors.reset} ${typeLabel}`);
  lines.push('');

  printSeparator('─', 62);

  // Status
  lines.push('');
  lines.push(`${colors.bright}Status:${colors.reset} ${statusColor}${status}${colors.reset}`);

  // Priority
  if (step.priority) {
    const priorityIcon = getPriorityIcon(step.priority);
    lines.push(`${colors.bright}Priority:${colors.reset} ${priorityIcon} ${step.priority}`);
  }

  // Type
  lines.push(`${colors.bright}Type:${colors.reset} ${step.type}`);

  if (step.aiAssisted) {
    lines.push(`${colors.magenta}✨ AI-Assisted${colors.reset}`);
  }

  lines.push('');
  lines.push(`${colors.bright}Description:${colors.reset}`);
  lines.push(`${colors.gray}${step.description}${colors.reset}`);
  lines.push('');

  // Instructions for manual and manual-pause steps
  if ((step.type === 'manual' || step.type === 'manual-pause') && step.instructions) {
    printSeparator('─', 62);
    lines.push('');
    lines.push(`${colors.bright}Instructions:${colors.reset}`);
    lines.push('');
    step.instructions.forEach((instruction) => {
      lines.push(`${colors.gray}${instruction}${colors.reset}`);
    });
    lines.push('');
  }

  // Links
  if (step.links && step.links.length > 0) {
    printSeparator('─', 62);
    lines.push('');
    lines.push(`${colors.bright}Quick Actions:${colors.reset}`);
    lines.push('');
    step.links.forEach((link, i) => {
      lines.push(`${colors.cyan}[${i + 1}]${colors.reset} ${link.label}`);
    });
    lines.push('');
  }

  printSeparator('─', 62);
  lines.push('');

  // Actions based on type and status
  if (step.type === 'automated') {
    if (status === 'completed') {
      lines.push(`${colors.cyan}[r]${colors.reset} Re-run this step`);
      lines.push(`${colors.cyan}[v]${colors.reset} Verify again`);
    } else {
      lines.push(`${colors.cyan}[x]${colors.reset} Execute this step`);
      lines.push(`${colors.cyan}[v]${colors.reset} Verify status`);
      lines.push(`${colors.cyan}[s]${colors.reset} Skip this step`);
    }
  } else if (step.type === 'manual-pause' || step.type === 'manual') {
    // Manual or manual-pause step
    if (status === 'completed') {
      lines.push(`${colors.cyan}[u]${colors.reset} Unmark as completed`);
      if (step.verification) {
        lines.push(`${colors.cyan}[v]${colors.reset} Verify status`);
      }
    } else {
      lines.push(`${colors.cyan}[c]${colors.reset} Mark as completed`);
      if (step.verification) {
        lines.push(`${colors.cyan}[v]${colors.reset} Verify status`);
      }
      lines.push(`${colors.cyan}[s]${colors.reset} Skip this step`);
    }
  }

  lines.push(`${colors.cyan}[b]${colors.reset} Back to category`);
  lines.push('');

  printBox(lines, 62);

  let options = 'b';
  if (step.type === 'automated') {
    options = status === 'completed' ? 'r/v/b' : 'x/v/s/b';
  } else if (step.type === 'manual-pause' || step.type === 'manual') {
    if (status === 'completed') {
      options = step.verification ? 'u/v/b' : 'u/b';
    } else {
      options = step.verification ? 'c/v/s/b' : 'c/s/b';
    }
  }

  // Add link numbers if available
  if (step.links && step.links.length > 0) {
    const linkNums = step.links.map((_, i) => i + 1).join('/');
    options = `${linkNums}/${options}`;
  }

  const answer = await prompt(`Select action (${options})`);
  return answer.toLowerCase();
}

/**
 * Execute step action
 */
export async function executeStep(category, step) {
  print(`\n${colors.bright}Executing: ${step.name}${colors.reset}\n`, '');

  if (!step.action) {
    print('No action defined for this step', colors.red);
    await prompt('Press Enter to continue');
    return { success: false, message: 'No action defined' };
  }

  try {
    const result = await step.action();
    return result;
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error,
    };
  }
}

/**
 * Show verification report
 */
export async function showVerificationReport(categories, state) {
  clearConsole();

  const lines = [];
  lines.push(`${colors.bright}🔍 Setup Verification & Diagnostic Report${colors.reset}`);
  lines.push('');

  printSeparator('─', 62);

  const overallProgress = getOverallProgress(state);
  lines.push('');
  lines.push(
    `${colors.bright}Overall Status:${colors.reset} ${formatProgressBar(overallProgress)}`
  );
  lines.push('');

  printSeparator('─', 62);

  // Check critical missing
  const criticalMissing = [];
  const recommended = [];

  categories.forEach((category) => {
    category.steps.forEach((step) => {
      const status = getStepStatus(state, category.id, step.id);

      if (status !== 'completed' && status !== 'skipped') {
        if (step.required || step.priority === 'critical') {
          criticalMissing.push({
            category: category.name,
            step: step.name,
            description: step.description,
          });
        } else if (step.priority === 'recommended' || step.priority === 'critical-for-production') {
          recommended.push({
            category: category.name,
            step: step.name,
            description: step.description,
          });
        }
      }
    });
  });

  // Critical missing
  if (criticalMissing.length > 0) {
    lines.push('');
    lines.push(`${colors.red}${colors.bright}❌ Critical Missing (Production Blockers):${colors.reset}`);
    lines.push('');
    criticalMissing.forEach((item) => {
      lines.push(`${colors.red}  • ${item.step}${colors.reset}`);
      lines.push(`    ${colors.gray}${item.description}${colors.reset}`);
      lines.push(`    ${colors.gray}Category: ${item.category}${colors.reset}`);
      lines.push('');
    });
  } else {
    lines.push('');
    lines.push(`${colors.green}✅ All critical steps completed${colors.reset}`);
    lines.push('');
  }

  // Recommended
  if (recommended.length > 0) {
    printSeparator('─', 62);
    lines.push('');
    lines.push(`${colors.yellow}${colors.bright}⚠️  Recommended for Production:${colors.reset}`);
    lines.push('');
    recommended.forEach((item) => {
      lines.push(`${colors.yellow}  • ${item.step}${colors.reset}`);
      lines.push(`    ${colors.gray}${item.description}${colors.reset}`);
      lines.push('');
    });
  }

  printSeparator('─', 62);
  lines.push('');
  lines.push(`${colors.bright}Production Ready:${colors.reset} ${state.readyForProduction ? `${colors.green}Yes ✓${colors.reset}` : `${colors.red}No${colors.reset}`}`);
  lines.push('');

  printBox(lines, 62);

  print('\nPress Enter to return to main menu', colors.gray);
  await prompt('');
}

/**
 * Run full wizard (all pending steps)
 * Returns { paused: boolean, pausedAt: { categoryId, stepId } | null }
 */
export async function runFullWizard(categories, state, updateStateFn) {
  clearConsole();

  print(`\n${colors.bright}🧙 Running Full Setup Wizard${colors.reset}\n`, '');
  print(`${colors.cyan}Si tienes las cuentas listas (Supabase, Stripe), en 5 minutos${colors.reset}`, '');
  print(`${colors.cyan}tienes todo lo que necesitas para un SaaS production-ready.${colors.reset}\n`, '');
  print(`${colors.gray}Tú te enfocas en construir tu value prop, nosotros nos${colors.reset}`, '');
  print(`${colors.gray}encargamos del resto: auth, payments, i18n, SEO, etc.${colors.reset}\n`, '');

  const shouldContinue = await confirm('Continue?', true);
  if (!shouldContinue) return { paused: false, pausedAt: null };

  for (const category of categories) {
    print(`\n${colors.bright}${category.name}${colors.reset}`, '');

    for (const step of category.steps) {
      const status = getStepStatus(state, category.id, step.id);

      // Handle manual-pause steps
      if (status !== 'completed' && step.type === 'manual-pause') {
        print(`\n  ${colors.yellow}⏸  Pausing at: ${step.name}${colors.reset}`, '');
        print('', '');

        if (step.instructions) {
          print(`  ${colors.bright}Instructions:${colors.reset}`, '');
          step.instructions.forEach((instruction) => {
            print(`  ${colors.gray}${instruction}${colors.reset}`, '');
          });
        }

        print('', '');
        print(`  ${colors.bright}Setup wizard paused.${colors.reset}`, '');
        print(`  Run ${colors.cyan}npm run setup:resume${colors.reset} after completing the above step.`, '');
        print('', '');

        await prompt('Press Enter to exit');
        return { paused: true, pausedAt: { categoryId: category.id, stepId: step.id } };
      }

      // Execute automated steps
      if (status !== 'completed' && step.type === 'automated') {
        print(`\n  Executing: ${step.name}...`, colors.cyan);

        const result = await executeStep(category, step);

        if (result.success) {
          print(`  ✓ ${result.message}`, colors.green);
          updateStateFn(category.id, step.id, 'completed');
        } else {
          print(`  ✗ ${result.message}`, colors.red);
          updateStateFn(category.id, step.id, 'failed', { error: result.message });
        }
      }
    }
  }

  print('\n\n✅ Wizard completed!', colors.green);
  await prompt('Press Enter to continue');
  return { paused: false, pausedAt: null };
}
