import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, Award, XCircle, Percent, TrendingUp, ArrowRight } from 'lucide-react';
import { leadService } from '../../../services/leadService';
import { StatsCard } from '../../../components/charts/StatsCard';
import { StatusDistributionChart, PipelineBarChart } from '../../../components/charts/LeadCharts';
import { ActivityTimeline } from '../../../components/activity/ActivityTimeline';
import { StatCardSkeleton } from '../../../components/ui/Skeleton';
import { ErrorState } from '../../../components/ui/States';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await leadService.getDashboardStats();
      setStats(data.stats);
      setActivities(data.recentActivities || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchStats} />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Analytics Dashboard</h1>
          <p className="text-sm text-slate-500">Real-time revenue performance, conversion metrics, and activity log.</p>
        </div>
        <Link to="/dashboard/leads" className="btn-primary self-start sm:self-auto">
          Manage All Leads <ArrowRight size={16} />
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard title="Total Leads" value={stats?.total || 0} icon={Users} color="blue" />
        <StatsCard title="New Leads" value={stats?.new || 0} icon={TrendingUp} color="yellow" />
        <StatsCard title="Qualified" value={stats?.qualified || 0} icon={UserCheck} color="purple" />
        <StatsCard title="Won Deals" value={stats?.won || 0} icon={Award} color="green" />
        <StatsCard title="Lost Deals" value={stats?.lost || 0} icon={XCircle} color="red" />
        <StatsCard title="Conversion" value={`${stats?.conversionRate || 0}%`} icon={Percent} color="blue" />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
            Lead Status Distribution
          </h3>
          <StatusDistributionChart stats={stats} />
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
            Pipeline Stage Volume
          </h3>
          <PipelineBarChart stats={stats} />
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Recent System Activities
          </h3>
          <Link to="/dashboard/leads" className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">
            View Leads →
          </Link>
        </div>
        <ActivityTimeline activities={activities} />
      </div>
    </div>
  );
};
