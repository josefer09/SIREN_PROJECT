import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
    <Icon className="w-12 h-12 text-text-muted mb-4" />
    <h3 className="text-lg font-medium text-text mb-1">{title}</h3>
    <p className="text-text-secondary text-sm mb-4">{description}</p>
    {action}
  </div>
);
