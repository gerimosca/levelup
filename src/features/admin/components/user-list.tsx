'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Search, UserPlus, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { UserRoleBadge } from './user-role-badge';
import { makeUserAdminAction, removeUserAdminAction } from '../admin.actions';
import type { AdminUser } from '../types';

interface UserListProps {
  initialUsers: AdminUser[];
  currentUserId: string;
}

export function UserList({ initialUsers, currentUserId }: UserListProps) {
  const t = useTranslations('admin.users');
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admins' | 'users'>('all');
  const [isPending, startTransition] = useTransition();

  // Filter users based on search and role
  const filteredUsers = users.filter((user) => {
    // Search filter
    const matchesSearch = user.full_name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Role filter
    if (roleFilter === 'admins') {
      return (
        user.user_flags?.includes('admin') ||
        user.user_flags?.includes('super_admin')
      );
    } else if (roleFilter === 'users') {
      return (
        !user.user_flags?.includes('admin') &&
        !user.user_flags?.includes('super_admin')
      );
    }

    return true;
  });

  const handlePromoteToAdmin = async (userId: string) => {
    startTransition(async () => {
      // Optimistic update
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, user_flags: [...(u.user_flags || []), 'admin'] }
            : u
        )
      );

      const result = await makeUserAdminAction(userId);

      if (result.success) {
        toast.success(t('promoted'));
      } else {
        // Revert on error
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  user_flags: (u.user_flags || []).filter((f) => f !== 'admin'),
                }
              : u
          )
        );
        toast.error(result.error || t('promoteFailed'));
      }
    });
  };

  const handleDemoteFromAdmin = async (userId: string) => {
    startTransition(async () => {
      // Optimistic update
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                user_flags: (u.user_flags || []).filter((f) => f !== 'admin'),
              }
            : u
        )
      );

      const result = await removeUserAdminAction(userId);

      if (result.success) {
        toast.success(t('demoted'));
      } else {
        // Revert on error
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, user_flags: [...(u.user_flags || []), 'admin'] }
              : u
          )
        );
        toast.error(result.error || t('demoteFailed'));
      }
    });
  };

  const isAdmin = (user: AdminUser) => {
    return (
      user.user_flags?.includes('admin') ||
      user.user_flags?.includes('super_admin')
    );
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={roleFilter}
          onValueChange={(value) =>
            setRoleFilter(value as 'all' | 'admins' | 'users')
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.all')}</SelectItem>
            <SelectItem value="admins">{t('filters.admins')}</SelectItem>
            <SelectItem value="users">{t('filters.users')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.user')}</TableHead>
              <TableHead>{t('table.role')}</TableHead>
              <TableHead>{t('table.subscription')}</TableHead>
              <TableHead className="text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  {searchQuery ? t('noResults') : t('noUsers')}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name || 'Unknown'}</p>
                        {user.id === currentUserId && (
                          <p className="text-xs text-muted-foreground">{t('you')}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <UserRoleBadge userFlags={user.user_flags} />
                  </TableCell>
                  <TableCell>
                    {user.subscription_status ? (
                      <Badge
                        variant={
                          user.subscription_status === 'active'
                            ? 'default'
                            : user.subscription_status === 'trialing'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {user.subscription_status}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {t('noSubscription')}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.id !== currentUserId && (
                      <>
                        {isAdmin(user) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDemoteFromAdmin(user.id)}
                            disabled={isPending || user.user_flags?.includes('super_admin')}
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            {t('demote')}
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handlePromoteToAdmin(user.id)}
                            disabled={isPending}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            {t('promote')}
                          </Button>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Stats */}
      <p className="text-sm text-muted-foreground">
        {t('showing', {
          count: filteredUsers.length,
          total: users.length,
        })}
      </p>
    </div>
  );
}
