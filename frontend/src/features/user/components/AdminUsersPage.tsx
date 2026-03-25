import { Loader2, ShieldBan, ShieldCheck, Users } from 'lucide-react';

import { useGetUsers, useBlockUser } from '../hooks';
import { ROLE_LABELS } from '../const/user.translation';
import { ROLE_CLASSES, STATUS_CLASSES } from '../const/user.styles';
import { EmptyState } from '@/components/ui/EmptyState';
import type { User } from '@/types';

const getInitials = (name: string): string =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const UserRow = ({
  user,
  onBlock,
  onUnblock,
  isPending,
}: {
  user: User;
  onBlock: (id: string) => void;
  onUnblock: (id: string) => void;
  isPending: boolean;
}) => {
  const status = user.isActive ? 'active' : 'blocked';

  return (
    <tr className="border-b border-border hover:bg-card-hover transition-colors">
      <td className="px-4 py-3">
        {user.avatar ? (
          <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
            {getInitials(user.fullName)}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-sm font-medium">{user.fullName}</td>
      <td className="px-4 py-3 text-sm text-text-secondary">{user.email}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {user.roles.map((role) => (
            <span
              key={role.id}
              className={`text-xs px-2 py-0.5 rounded-full ${ROLE_CLASSES[role.name] || 'bg-bg-secondary text-text-muted'}`}
            >
              {ROLE_LABELS[role.name] || role.name}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_CLASSES[status]}`}>
          {status === 'active' ? 'Active' : 'Blocked'}
        </span>
      </td>
      <td className="px-4 py-3">
        {user.isActive ? (
          <button
            onClick={() => {
              if (confirm('Are you sure you want to block this user?')) {
                onBlock(user.id);
              }
            }}
            disabled={isPending}
            className="p-1.5 rounded hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
            title="Block user"
          >
            <ShieldBan className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              if (confirm('Do you want to unblock this user?')) {
                onUnblock(user.id);
              }
            }}
            disabled={isPending}
            className="p-1.5 rounded hover:bg-accent/10 text-text-muted hover:text-accent transition-colors"
            title="Unblock user"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        )}
      </td>
    </tr>
  );
};

export const AdminUsersPage = () => {
  const { getUsersQuery } = useGetUsers();
  const { blockMutation, unblockMutation } = useBlockUser();

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display">Users</h1>
        <p className="text-text-secondary text-sm mt-1">
          User administration panel
        </p>
      </div>

      {getUsersQuery.isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {getUsersQuery.data && getUsersQuery.data.length === 0 && (
        <EmptyState
          icon={Users}
          title="No users found"
          description="There are no registered users yet"
        />
      )}

      {getUsersQuery.data && getUsersQuery.data.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-secondary/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider w-12" />
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider w-16">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {getUsersQuery.data.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onBlock={(id) => blockMutation.mutate(id)}
                    onUnblock={(id) => unblockMutation.mutate(id)}
                    isPending={blockMutation.isPending || unblockMutation.isPending}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
