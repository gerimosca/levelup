import { createClientServer } from '@/shared/database/supabase';
import type { OrganizationWithRole } from './types';

/**
 * Get all organizations for a user
 */
export async function getUserOrganizations(userId: string): Promise<{
  organizations: OrganizationWithRole[];
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      role,
      organizations (
        id,
        name,
        slug,
        is_personal,
        created_by,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', userId);

  if (error) {
    return { organizations: [], error: error.message };
  }

  const organizations = data.map((item) => ({
    ...(item.organizations as unknown as object),
    role: item.role,
  })) as OrganizationWithRole[];

  return { organizations, error: null };
}

/**
 * Get current/active organization for a user
 */
export async function getCurrentOrganization(userId: string): Promise<{
  organization: OrganizationWithRole | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  // First get the current_organization_id from profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('current_organization_id')
    .eq('id', userId)
    .single();

  if (profileError) {
    return { organization: null, error: profileError.message };
  }

  // If no current org set, get the personal org
  let orgId = profile?.current_organization_id;

  if (!orgId) {
    const { data: personalOrg } = await supabase
      .from('organization_members')
      .select('organization_id, organizations!inner(is_personal)')
      .eq('user_id', userId)
      .eq('organizations.is_personal', true)
      .single();

    orgId = personalOrg?.organization_id;
  }

  if (!orgId) {
    return { organization: null, error: 'No organization found' };
  }

  // Get the organization with user's role
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      role,
      organizations (
        id,
        name,
        slug,
        is_personal,
        created_by,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', userId)
    .eq('organization_id', orgId)
    .single();

  if (error) {
    return { organization: null, error: error.message };
  }

  const organization = {
    ...(data.organizations as unknown as object),
    role: data.role,
  } as OrganizationWithRole;

  return { organization, error: null };
}
