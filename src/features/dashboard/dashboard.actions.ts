'use server';

import { handleGetDashboardData } from './dashboard.handler';

export async function getDashboardDataAction() {
  return handleGetDashboardData();
}
