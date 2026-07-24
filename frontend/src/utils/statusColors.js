export const STATUS_CONFIG = {
  New: {
    label: 'New',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
  Contacted: {
    label: 'Contacted',
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    dot: 'bg-yellow-500',
  },
  Qualified: {
    label: 'Qualified',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    dot: 'bg-purple-500',
  },
  'Proposal Sent': {
    label: 'Proposal Sent',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    dot: 'bg-orange-500',
  },
  Won: {
    label: 'Won',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    dot: 'bg-green-500',
  },
  Lost: {
    label: 'Lost',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    dot: 'bg-red-500',
  },
};

export const LEAD_STATUSES = Object.keys(STATUS_CONFIG);

export const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || {
    label: status,
    color: 'bg-slate-100 text-slate-600',
    dot: 'bg-slate-400',
  };
