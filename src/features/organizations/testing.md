# Testing: Organizations Feature

## Test Cases

### Auto-creation on Signup

#### TC-001: Personal org created on signup
- **Given**: New user registers
- **When**: Registration completes
- **Then**: Personal organization is created with `is_personal = true`

#### TC-002: User is owner of personal org
- **Given**: New user registers
- **When**: Checking organization_members
- **Then**: User has role 'owner' in their personal org

#### TC-003: current_organization_id is set
- **Given**: New user registers
- **When**: Checking profile
- **Then**: `current_organization_id` points to personal org

### Get Organizations

#### TC-004: Get user organizations
- **Given**: User is member of 2 organizations
- **When**: Calling getUserOrganizations()
- **Then**: Returns both orgs with correct roles

#### TC-005: Get current organization
- **Given**: User has current_organization_id set
- **When**: Calling getCurrentOrganization()
- **Then**: Returns that organization with role

#### TC-006: Fallback to personal org
- **Given**: User's current_organization_id is null
- **When**: Calling getCurrentOrganization()
- **Then**: Returns personal organization

### RLS Policies

#### TC-007: Cannot view other user's orgs
- **Given**: User A tries to query User B's organizations
- **When**: Query executed
- **Then**: Returns empty results (RLS blocks)

#### TC-008: Members can view org
- **Given**: User is member of an org
- **When**: Querying organizations
- **Then**: Can see org details

#### TC-009: Non-members cannot view org
- **Given**: User is not member of an org
- **When**: Querying that org
- **Then**: Returns empty (RLS blocks)

#### TC-010: Only owner can update org
- **Given**: User is admin (not owner) of org
- **When**: Trying to update org name
- **Then**: Operation fails (RLS blocks)

#### TC-011: Cannot delete personal org
- **Given**: User tries to delete their personal org
- **When**: DELETE executed
- **Then**: Operation fails (RLS blocks)

### Edge Cases

#### TC-012: User without any org
- **Given**: Bug causes user to have no org
- **When**: Calling getCurrentOrganization()
- **Then**: Returns error 'No organization found'

#### TC-013: Multiple personal orgs (invalid state)
- **Given**: Bug causes multiple personal orgs
- **When**: Getting organizations
- **Then**: Should not happen, but handle gracefully

## Database Migration Testing

### Pre-migration

- [ ] Existing users have no profile (expected)
- [ ] Existing subscriptions have user_id

### Post-migration

- [ ] All existing users have profiles created
- [ ] All existing users have personal orgs
- [ ] Subscriptions migrated to organization_id
- [ ] RLS policies working correctly

## Manual Testing Checklist

- [ ] New user signup creates profile
- [ ] New user signup creates personal org
- [ ] User is owner of personal org
- [ ] current_organization_id is set correctly
- [ ] getUserOrganizations returns correct data
- [ ] getCurrentOrganization returns correct data
- [ ] Cannot view other users' organizations
- [ ] Cannot update org if not owner
- [ ] Cannot delete personal org
- [ ] Subscriptions link to organization
