import { Activity as ActivityIcon, User, Clock } from 'lucide-react';
import { timeAgo, formatDateTime } from '../../utils/formatDate';

export const ActivityTimeline = ({ activities = [] }) => {
  if (!activities.length) {
    return (
      <div className="py-8 text-center text-sm text-slate-400">
        No activity recorded yet.
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((act, idx) => (
          <li key={act._id || idx}>
            <div className="relative pb-8">
              {idx !== activities.length - 1 && (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-800"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3 items-start">
                <div>
                  <span className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center ring-4 ring-white dark:ring-slate-900">
                    <ActivityIcon size={14} />
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {act.action}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                    {act.performedBy && (
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {act.performedBy.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1" title={formatDateTime(act.createdAt)}>
                      <Clock size={12} />
                      {timeAgo(act.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
