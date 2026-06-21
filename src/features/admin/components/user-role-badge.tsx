import { Badge } from '@/shared/components/ui/badge';
import { Shield, Star, User } from 'lucide-react';

interface UserRoleBadgeProps {
  userFlags: string[] | null;
}

export function UserRoleBadge({ userFlags }: UserRoleBadgeProps) {
  const flags = userFlags || [];

  // Check for roles
  const isSuperAdmin = flags.includes('super_admin');
  const isAdmin = flags.includes('admin');

  if (isSuperAdmin) {
    return (
      <Badge variant="default" className="gap-1">
        <Star className="h-3 w-3" />
        Super Admin
      </Badge>
    );
  }

  if (isAdmin) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Shield className="h-3 w-3" />
        Admin
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1">
      <User className="h-3 w-3" />
      User
    </Badge>
  );
}
