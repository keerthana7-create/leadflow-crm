export const Skeleton = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg ${className}`}
        />
      ))}
    </>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="space-y-0">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="table-row flex items-center gap-4 px-4 py-3">
        {Array.from({ length: cols }).map((_, j) => (
          <div
            key={j}
            className="flex-1 h-4 animate-pulse bg-slate-200 dark:bg-slate-700 rounded"
          />
        ))}
      </div>
    ))}
  </div>
);

export const StatCardSkeleton = () => (
  <div className="stat-card animate-pulse">
    <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
    </div>
  </div>
);
