import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const COLORS = ['#3b82f6', '#eab308', '#a855f7', '#f97316', '#22c55e', '#ef4444'];

export const StatusDistributionChart = ({ stats }) => {
  if (!stats) return null;

  const data = [
    { name: 'New', value: stats.new || 0 },
    { name: 'Contacted', value: stats.contacted || 0 },
    { name: 'Qualified', value: stats.qualified || 0 },
    { name: 'Proposal Sent', value: stats.proposalSent || 0 },
    { name: 'Won', value: stats.won || 0 },
    { name: 'Lost', value: stats.lost || 0 },
  ].filter((item) => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-slate-400">
        No lead status data available
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PipelineBarChart = ({ stats }) => {
  if (!stats) return null;

  const data = [
    { stage: 'New', count: stats.new || 0 },
    { stage: 'Contacted', count: stats.contacted || 0 },
    { stage: 'Qualified', count: stats.qualified || 0 },
    { stage: 'Proposal', count: stats.proposalSent || 0 },
    { stage: 'Won', count: stats.won || 0 },
    { stage: 'Lost', count: stats.lost || 0 },
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415520" />
          <XAxis dataKey="stage" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
