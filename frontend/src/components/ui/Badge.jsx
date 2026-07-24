import { getStatusConfig } from '../../utils/statusColors';

export const StatusBadge = ({ status }) => {
  const config = getStatusConfig(status);
  return (
    <span className={`badge gap-1.5 ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const color =
    role === 'Admin'
      ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  return <span className={`badge ${color}`}>{role}</span>;
};
