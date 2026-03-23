interface BadgeProps {
  label: string;
  className?: string;
}

export const Badge = ({ label, className = '' }: BadgeProps) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
  >
    {label}
  </span>
);
