import { Inbox, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({ icon: Icon = Inbox, title, description, action, actionLabel }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
      <Icon size={28} className="text-slate-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">{title}</h3>
    {description && (
      <p className="text-sm text-slate-500 dark:text-slate-500 max-w-xs">{description}</p>
    )}
    {action && actionLabel && (
      <div className="mt-4">
        <Button onClick={action} size="sm">{actionLabel}</Button>
      </div>
    )}
  </div>
);

export const ErrorState = ({ message = 'Something went wrong', onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
    <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
      <AlertTriangle size={28} className="text-red-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">Oops!</h3>
    <p className="text-sm text-slate-500 dark:text-slate-500 max-w-xs">{message}</p>
    {onRetry && (
      <div className="mt-4">
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw size={14} />
          Try Again
        </Button>
      </div>
    )}
  </div>
);
