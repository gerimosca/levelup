export type OrganizationRole = 'owner' | 'admin' | 'member';

export type Organization = {
  id: string;
  name: string;
  slug: string | null;
  is_personal: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type OrganizationMember = {
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  joined_at: string;
};

export type OrganizationWithRole = Organization & {
  role: OrganizationRole;
};
