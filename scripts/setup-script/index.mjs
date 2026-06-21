#!/usr/bin/env node

/**
 * Interactive Setup Script
 * Main entry point for the new setup system
 */

import { categories, getCategoryById, getStepById } from './lib/categories.mjs';
import {
  loadState,
  saveState,
  updateStepStatus,
  markManualStepComplete,
  skipStep,
  resetStep,
  initializeStateFromCategories,
  resetState,
  pauseSetup,
  resumeSetup,
  isPaused,
  getPausedLocation,
} from './lib/state.mjs';
import {
  showMainMenu,
  showCategoryMenu,
  showStepMenu,
  executeStep,
  showVerificationReport,
  runFullWizard,
} from './lib/menu.mjs';
import { runFullVerification, verifyStep } from './lib/verification.mjs';
import { exportReport, exportJSON } from './lib/report.mjs';
import { print, colors, confirm, openUrl } from './lib/utils.mjs';

/**
 * Main application
 */
async function main() {
  // Parse CLI arguments
  const args = process.argv.slice(2);
  const isVerify = args.includes('--verify');
  const isExport = args.includes('--export');
  const isReset = args.includes('--reset');
  const isResume = args.includes('--resume');

  // Initialize state from categories
  let state = initializeStateFromCategories(categories);

  // Run verification to auto-detect completed steps
  state = runFullVerification(categories, state);
  saveState(state);

  // Handle CLI modes
  if (isReset) {
    const shouldReset = await confirm(
      'Are you sure you want to reset all setup progress?',
      false
    );
    if (shouldReset) {
      state = resetState();
      print('✅ Setup state reset successfully', colors.green);
    }
    process.exit(0);
  }

  if (isExport) {
    const result = exportReport(categories, state);
    if (result.success) {
      print(`✅ Report exported to: ${result.filepath}`, colors.green);
    } else {
      print(`❌ Failed to export report: ${result.error}`, colors.red);
    }
    process.exit(0);
  }

  if (isVerify) {
    await showVerificationReport(categories, state);
    process.exit(0);
  }

  // Handle resume mode
  if (isResume || isPaused(state)) {
    if (!isPaused(state)) {
      print('\n⚠️  No paused setup found. Starting interactive mode.\n', colors.yellow);
      await runInteractiveMode(state);
      return;
    }

    print('\n🔄 Resuming setup wizard...\n', colors.cyan);
    const { state: resumedState, pausedAt } = resumeSetup(state);
    state = resumedState;

    // Resume from where we left off
    await resumeFromPausedStep(state, pausedAt);
    return;
  }

  // Interactive mode
  await runInteractiveMode(state);
}

/**
 * Resume from paused step and continue wizard
 */
async function resumeFromPausedStep(state, pausedAt) {
  const { categoryId, stepId } = pausedAt;

  print(`Resuming from: ${colors.bright}${stepId}${colors.reset} in ${colors.bright}${categoryId}${colors.reset}\n`, '');

  // First verify if the paused step is now complete
  const step = getStepById(categoryId, stepId);
  const category = getCategoryById(categoryId);

  if (!step || !category) {
    print('❌ Could not find paused step. Starting interactive mode.\n', colors.red);
    await runInteractiveMode(state);
    return;
  }

  if (step.verification) {
    const verifyResult = verifyStep(stepId);
    if (verifyResult.passed) {
      print(`✅ ${step.name} verified as complete!\n`, colors.green);
      state = updateStepStatus(state, categoryId, stepId, 'completed', {
        autoDetected: true,
      });
      saveState(state);
    } else {
      print(`⚠️  ${step.name} not yet complete. Please complete it before resuming.\n`, colors.yellow);
      print(`Reason: ${verifyResult.message}\n`, colors.gray);

      const tryAgain = await confirm('Mark as complete manually?', false);
      if (tryAgain) {
        state = markManualStepComplete(state, categoryId, stepId);
        saveState(state);
        print('✅ Marked as complete.\n', colors.green);
      } else {
        print('Setup paused. Run npm run setup:resume when ready.\n', colors.cyan);
        process.exit(0);
      }
    }
  } else {
    // No verification, ask user to confirm
    const isComplete = await confirm('Have you completed this step?', true);
    if (isComplete) {
      state = markManualStepComplete(state, categoryId, stepId);
      saveState(state);
      print('✅ Marked as complete.\n', colors.green);
    } else {
      print('Setup paused. Run npm run setup:resume when ready.\n', colors.cyan);
      process.exit(0);
    }
  }

  // Continue the wizard from the next step
  print('\nContinuing wizard from next step...\n', colors.cyan);

  const result = await runFullWizard(categories, state, (catId, stId, status, metadata) => {
    state = updateStepStatus(state, catId, stId, status, metadata);
    saveState(state);
  });

  if (result.paused) {
    state = pauseSetup(state, result.pausedAt.categoryId, result.pausedAt.stepId, {
      reason: 'Wizard paused for manual step',
    });
  }
}

/**
 * Run interactive menu system
 */
async function runInteractiveMode(state) {
  let running = true;
  let currentView = 'main';
  let currentCategory = null;
  let currentStep = null;

  while (running) {
    if (currentView === 'main') {
      const answer = await showMainMenu(categories, state);

      // Category selection (1-6)
      const categoryIndex = parseInt(answer, 10) - 1;
      if (categoryIndex >= 0 && categoryIndex < categories.length) {
        currentCategory = categories[categoryIndex];
        currentView = 'category';
        continue;
      }

      // Actions
      if (answer === 'v') {
        await showVerificationReport(categories, state);
        continue;
      }

      if (answer === 'r') {
        const result = await runFullWizard(categories, state, (catId, stepId, status, metadata) => {
          state = updateStepStatus(state, catId, stepId, status, metadata);
          saveState(state);
        });

        // Handle pause
        if (result.paused) {
          state = pauseSetup(state, result.pausedAt.categoryId, result.pausedAt.stepId, {
            reason: 'Wizard paused for manual step',
          });
          running = false; // Exit interactive mode
        }
        continue;
      }

      if (answer === 'e') {
        const result = exportReport(categories, state);
        if (result.success) {
          print(`\n✅ Report exported to: ${result.filepath}`, colors.green);
        } else {
          print(`\n❌ Failed to export: ${result.error}`, colors.red);
        }
        await confirm('Press Enter to continue');
        continue;
      }

      if (answer === 'q') {
        running = false;
        print('\n👋 Goodbye!\n', colors.cyan);
        continue;
      }
    } else if (currentView === 'category' && currentCategory) {
      const answer = await showCategoryMenu(currentCategory, state);

      // Step selection
      const stepIndex = parseInt(answer, 10) - 1;
      if (stepIndex >= 0 && stepIndex < currentCategory.steps.length) {
        currentStep = currentCategory.steps[stepIndex];
        currentView = 'step';
        continue;
      }

      // Actions
      if (answer === 'a') {
        // Run all pending in this category
        for (const step of currentCategory.steps) {
          const status = state.categories[currentCategory.id]?.steps[step.id]?.status;

          if (status !== 'completed' && step.type === 'automated') {
            print(`\nExecuting: ${step.name}...`, colors.cyan);

            const result = await executeStep(currentCategory, step);

            if (result.success) {
              print(`✓ ${result.message}`, colors.green);
              state = updateStepStatus(state, currentCategory.id, step.id, 'completed');
              saveState(state);
            } else {
              print(`✗ ${result.message}`, colors.red);
              state = updateStepStatus(state, currentCategory.id, step.id, 'failed', {
                error: result.message,
              });
              saveState(state);
            }
          }
        }

        await confirm('\nPress Enter to continue');
        continue;
      }

      if (answer === 'v') {
        // Verify all steps in category
        print('\nVerifying steps...', colors.cyan);

        currentCategory.steps.forEach((step) => {
          if (step.verification) {
            const result = verifyStep(step.id);
            const icon = result.passed ? '✅' : '❌';
            print(`${icon} ${step.name}: ${result.message}`, '');

            if (result.passed) {
              state = updateStepStatus(state, currentCategory.id, step.id, 'completed', {
                autoDetected: true,
              });
            }
          }
        });

        saveState(state);
        await confirm('\nPress Enter to continue');
        continue;
      }

      if (answer === 'b') {
        currentView = 'main';
        currentCategory = null;
        continue;
      }
    } else if (currentView === 'step' && currentCategory && currentStep) {
      const answer = await showStepMenu(currentCategory, currentStep, state);

      // Handle link clicks (numbers)
      const linkIndex = parseInt(answer, 10) - 1;
      if (
        currentStep.links &&
        linkIndex >= 0 &&
        linkIndex < currentStep.links.length
      ) {
        const link = currentStep.links[linkIndex];

        if (link.url) {
          print(`\nOpening: ${link.url}`, colors.cyan);
          openUrl(link.url);
        } else if (link.action) {
          const result = link.action();
          if (result?.type === 'open-folder') {
            print(`\nOpen folder: ${result.path}`, colors.cyan);
          } else if (result?.type === 'open-supabase') {
            print('\nOpen Supabase Dashboard and navigate to Auth → Templates', colors.cyan);
          }
        }

        await confirm('Press Enter to continue');
        continue;
      }

      // Execute automated step
      if (answer === 'x' && currentStep.type === 'automated') {
        const result = await executeStep(currentCategory, currentStep);

        if (result.success) {
          print(`\n✅ ${result.message}`, colors.green);
          state = updateStepStatus(state, currentCategory.id, currentStep.id, 'completed');
          saveState(state);
        } else {
          print(`\n❌ ${result.message}`, colors.red);
          state = updateStepStatus(state, currentCategory.id, currentStep.id, 'failed', {
            error: result.message,
          });
          saveState(state);
        }

        await confirm('Press Enter to continue');
        continue;
      }

      // Re-run
      if (answer === 'r' && currentStep.type === 'automated') {
        const shouldRerun = await confirm('Re-run this step?', true);

        if (shouldRerun) {
          state = resetStep(state, currentCategory.id, currentStep.id);
          saveState(state);

          const result = await executeStep(currentCategory, currentStep);

          if (result.success) {
            print(`\n✅ ${result.message}`, colors.green);
            state = updateStepStatus(state, currentCategory.id, currentStep.id, 'completed');
          } else {
            print(`\n❌ ${result.message}`, colors.red);
            state = updateStepStatus(state, currentCategory.id, currentStep.id, 'failed', {
              error: result.message,
            });
          }

          saveState(state);
          await confirm('Press Enter to continue');
        }
        continue;
      }

      // Verify
      if (answer === 'v') {
        if (currentStep.verification) {
          const result = verifyStep(currentStep.id);
          const icon = result.passed ? '✅' : '❌';
          print(`\n${icon} ${result.message}`, '');

          if (result.passed) {
            state = updateStepStatus(state, currentCategory.id, currentStep.id, 'completed', {
              autoDetected: true,
            });
            saveState(state);
          }
        } else {
          print('\nNo verification available for this step', colors.gray);
        }

        await confirm('Press Enter to continue');
        continue;
      }

      // Mark manual step as complete
      if (answer === 'c' && currentStep.type === 'manual') {
        state = markManualStepComplete(state, currentCategory.id, currentStep.id);
        saveState(state);
        print('\n✅ Step marked as completed', colors.green);
        await confirm('Press Enter to continue');
        continue;
      }

      // Unmark manual step
      if (answer === 'u' && currentStep.type === 'manual') {
        state = resetStep(state, currentCategory.id, currentStep.id);
        saveState(state);
        print('\n↩️  Step unmarked', colors.yellow);
        await confirm('Press Enter to continue');
        continue;
      }

      // Skip step
      if (answer === 's') {
        const reason = await confirm('Add reason for skipping? (optional)');
        state = skipStep(state, currentCategory.id, currentStep.id, reason || 'User skipped');
        saveState(state);
        print('\n⏭️  Step skipped', colors.blue);
        await confirm('Press Enter to continue');
        continue;
      }

      // Back
      if (answer === 'b') {
        currentView = 'category';
        currentStep = null;
        continue;
      }
    }
  }
}

// Run main
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
