/**
 * Categories loader
 * Imports and exports all category definitions
 */

import infrastructure from '../categories/infrastructure.mjs';
import database from '../categories/database.mjs';
import branding from '../categories/branding.mjs';
import content from '../categories/content.mjs';
import integrations from '../categories/integrations.mjs';
import compliance from '../categories/compliance.mjs';

/**
 * All available categories in order
 */
export const categories = [
  infrastructure,
  database,
  branding,
  content,
  integrations,
  compliance,
];

/**
 * Get category by ID
 */
export function getCategoryById(id) {
  return categories.find((cat) => cat.id === id);
}

/**
 * Get step by category and step ID
 */
export function getStepById(categoryId, stepId) {
  const category = getCategoryById(categoryId);
  if (!category) return null;
  return category.steps.find((step) => step.id === stepId);
}

/**
 * Get all steps across all categories
 */
export function getAllSteps() {
  const steps = [];
  categories.forEach((category) => {
    category.steps.forEach((step) => {
      steps.push({
        ...step,
        categoryId: category.id,
        categoryName: category.name,
      });
    });
  });
  return steps;
}

/**
 * Get critical steps (required for production)
 */
export function getCriticalSteps() {
  return getAllSteps().filter(
    (step) => step.required || step.priority === 'critical' || step.priority === 'critical-for-production'
  );
}

/**
 * Get manual steps
 */
export function getManualSteps() {
  return getAllSteps().filter((step) => step.type === 'manual');
}

/**
 * Get automated steps
 */
export function getAutomatedSteps() {
  return getAllSteps().filter((step) => step.type === 'automated');
}
