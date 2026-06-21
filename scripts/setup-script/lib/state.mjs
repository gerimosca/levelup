/**
 * Setup State Management
 * Manages .setup.json file with persistence
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '../../..');
const STATE_FILE = path.join(PROJECT_ROOT, '.setup.json');

/**
 * Default state structure
 */
function getDefaultState() {
  return {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    lastRun: new Date().toISOString(),
    progress: {
      total: 0,
      completed: 0,
      pending: 0,
      skipped: 0,
      failed: 0,
    },
    categories: {},
    environment: process.env.NODE_ENV || 'development',
    readyForProduction: false,
    criticalMissing: [],
    recommendations: [],
    pausedAt: null, // Tracks if setup is paused and where
  };
}

/**
 * Load state from .setup.json
 */
export function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    return getDefaultState();
  }

  try {
    const content = fs.readFileSync(STATE_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading setup state:', error.message);
    return getDefaultState();
  }
}

/**
 * Save state to .setup.json
 */
export function saveState(state) {
  try {
    state.lastRun = new Date().toISOString();
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving setup state:', error.message);
    return false;
  }
}

/**
 * Update step status
 */
export function updateStepStatus(state, categoryId, stepId, status, metadata = {}) {
  if (!state.categories[categoryId]) {
    state.categories[categoryId] = {
      status: 'pending',
      completedSteps: 0,
      totalSteps: 0,
      steps: {},
    };
  }

  const stepData = {
    status,
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  state.categories[categoryId].steps[stepId] = stepData;

  // Recalculate category status
  recalculateCategoryStatus(state, categoryId);

  // Recalculate overall progress
  recalculateProgress(state);

  return state;
}

/**
 * Mark manual step as completed
 */
export function markManualStepComplete(state, categoryId, stepId) {
  if (!state.categories[categoryId]?.steps[stepId]) {
    return state;
  }

  state.categories[categoryId].steps[stepId] = {
    ...state.categories[categoryId].steps[stepId],
    status: 'completed',
    markedComplete: true,
    timestamp: new Date().toISOString(),
  };

  recalculateCategoryStatus(state, categoryId);
  recalculateProgress(state);

  return state;
}

/**
 * Skip step
 */
export function skipStep(state, categoryId, stepId, reason = '') {
  return updateStepStatus(state, categoryId, stepId, 'skipped', { reason });
}

/**
 * Reset step
 */
export function resetStep(state, categoryId, stepId) {
  if (!state.categories[categoryId]?.steps) {
    return state;
  }

  delete state.categories[categoryId].steps[stepId];
  recalculateCategoryStatus(state, categoryId);
  recalculateProgress(state);

  return state;
}

/**
 * Recalculate category status based on steps
 */
function recalculateCategoryStatus(state, categoryId) {
  const category = state.categories[categoryId];
  if (!category) return;

  const steps = Object.values(category.steps || {});
  const completed = steps.filter((s) => s.status === 'completed').length;
  const failed = steps.filter((s) => s.status === 'failed').length;

  category.completedSteps = completed;

  if (completed === category.totalSteps) {
    category.status = 'completed';
  } else if (completed > 0) {
    category.status = 'partial';
  } else if (failed > 0) {
    category.status = 'failed';
  } else {
    category.status = 'pending';
  }
}

/**
 * Recalculate overall progress
 */
function recalculateProgress(state) {
  let total = 0;
  let completed = 0;
  let pending = 0;
  let skipped = 0;
  let failed = 0;

  Object.values(state.categories).forEach((category) => {
    const steps = Object.values(category.steps || {});
    total += category.totalSteps || 0;
    completed += steps.filter((s) => s.status === 'completed').length;
    pending += steps.filter((s) => s.status === 'pending').length;
    skipped += steps.filter((s) => s.status === 'skipped').length;
    failed += steps.filter((s) => s.status === 'failed').length;
  });

  state.progress = { total, completed, pending, skipped, failed };

  // Check if ready for production
  state.readyForProduction = state.criticalMissing.length === 0;
}

/**
 * Initialize state from categories
 */
export function initializeStateFromCategories(categories) {
  const state = loadState();

  categories.forEach((category) => {
    if (!state.categories[category.id]) {
      state.categories[category.id] = {
        status: 'pending',
        completedSteps: 0,
        totalSteps: category.steps.length,
        steps: {},
      };
    } else {
      // Update total steps count in case categories changed
      state.categories[category.id].totalSteps = category.steps.length;
    }
  });

  recalculateProgress(state);
  saveState(state);

  return state;
}

/**
 * Reset entire state
 */
export function resetState() {
  const state = getDefaultState();
  saveState(state);
  return state;
}

/**
 * Get step status
 */
export function getStepStatus(state, categoryId, stepId) {
  return state.categories[categoryId]?.steps[stepId]?.status || 'pending';
}

/**
 * Get category progress percentage
 */
export function getCategoryProgress(state, categoryId) {
  const category = state.categories[categoryId];
  if (!category || category.totalSteps === 0) return 0;
  return Math.round((category.completedSteps / category.totalSteps) * 100);
}

/**
 * Get overall progress percentage
 */
export function getOverallProgress(state) {
  if (state.progress.total === 0) return 0;
  return Math.round((state.progress.completed / state.progress.total) * 100);
}

/**
 * Pause setup at current step
 */
export function pauseSetup(state, categoryId, stepId, context = {}) {
  state.pausedAt = {
    categoryId,
    stepId,
    timestamp: new Date().toISOString(),
    context, // Additional context about why paused
  };
  saveState(state);
  return state;
}

/**
 * Resume setup from paused state
 */
export function resumeSetup(state) {
  const pausedAt = state.pausedAt;
  state.pausedAt = null;
  saveState(state);
  return { state, pausedAt };
}

/**
 * Check if setup is paused
 */
export function isPaused(state) {
  return state.pausedAt !== null;
}

/**
 * Get paused location
 */
export function getPausedLocation(state) {
  return state.pausedAt;
}
